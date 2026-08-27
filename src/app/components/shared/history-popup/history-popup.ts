import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  NgZone,
  ViewChild,
  effect,
  inject,
} from "@angular/core";
import { CommonModule, DatePipe } from "@angular/common";
import gsap from "gsap";
import {
  HistoryPopupConfig,
  HistoryPopupService,
} from "src/app/core/services/history-popup.service";
import { positionPopupPanel } from "src/app/components/shared/popup-positioning";

/**
 * Popup "Ultimi N allenamenti": stessa ricetta glass + logica di
 * posizionamento di app-confirm-popup (vedi il commento su
 * HistoryPopupService per perché vive qui, alla radice dell'app, invece che
 * dentro app-exercise-component). Nessuna icona, nessun pulsante: solo
 * visualizzazione, si chiude toccando fuori.
 *
 * NB: il componente è SEMPRE presente nel DOM (app.component.html lo
 * renderizza senza @if) — è l'@if interno sul pannello (guidato da
 * `activeConfig`) a farlo apparire/sparire, esattamente come app-confirm-popup
 * e app-prompt-popup.
 */
@Component({
  selector: "app-history-popup",
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: "./history-popup.html",
  styleUrl: "./history-popup.scss",
  // OnPush: vedi il commento su ConfirmPopup. Lo stato cambia solo da
  // open(), onOverlayClick() e dallo swipe del carosello, che chiamano già
  // detectChanges() esplicitamente.
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistoryPopup {
  @ViewChild("panel") panelRef?: ElementRef<HTMLElement>;
  @ViewChild("sessionCarousel") sessionCarouselRef?: ElementRef<HTMLElement>;
  @ViewChild("sessionTrack") sessionTrackRef?: ElementRef<HTMLElement>;

  public activeConfig: HistoryPopupConfig | null = null;
  public activeSessionIndex: number = 0;

  private isAnimating = false;
  private transformOrigin: string = "bottom right";
  private carouselTouchCleanup?: () => void;
  private zone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);
  private historyPopupService = inject(HistoryPopupService);

  constructor() {
    effect(() => {
      const config = this.historyPopupService.active();
      if (config) {
        this.open(config);
      }
      // Nessun ramo per config===null: la chiusura parte sempre da
      // onOverlayClick(), che azzera activeConfig in locale PRIMA di
      // avvisare il service — quando l'effect rivede il signal a null,
      // activeConfig è già null e non c'è nulla da fare.
    });
  }

  private open(config: HistoryPopupConfig): void {
    if (this.isAnimating) return;
    this.isAnimating = true;
    this.activeConfig = config;
    this.activeSessionIndex = 0;
    this.cdr.detectChanges();

    // Fuori dalla zona Angular: il ticker di GSAP gira su requestAnimationFrame,
    // che Zone.js intercetta. Restando dentro la zona, OGNI frame del tween
    // innescherebbe un ciclo di change detection sull'intera app.
    this.zone.runOutsideAngular(() => {
      requestAnimationFrame(() => {
        this.positionAndAnimateIn();
      });
    });
  }

  private positionAndAnimateIn(): void {
    const panel = this.panelRef?.nativeElement;
    if (!panel || !this.activeConfig?.triggerElement) {
      this.isAnimating = false;
      return;
    }

    const { transformOrigin } = positionPopupPanel(panel, this.activeConfig.triggerElement);
    this.transformOrigin = transformOrigin;

    if (this.sessionCarouselRef?.nativeElement) {
      this.setupCarouselTouchHandling(this.sessionCarouselRef.nativeElement);
    }

    gsap.fromTo(
      panel,
      {
        opacity: 0,
        scale: 0.4,
        transformOrigin: this.transformOrigin,
      },
      {
        opacity: 1,
        scale: 1,
        duration: 0.25,
        ease: "back.out(1.4)",
        force3D: true,
        onComplete: () => {
          this.zone.run(() => {
            this.isAnimating = false;
          });
        },
      },
    );
  }

  /**
   * Swipe orizzontale per cambiare sessione nel popup cronologia.
   *
   * Il problema di partenza: il carosello scorreva in ORIZZONTALE e
   * .history-serie-list, al suo interno, in VERTICALE — due scroller NATIVI
   * annidati su assi diversi. Su iOS lo scroller nativo più interno tende a
   * reclamare il gesto a prescindere dalla direzione reale, e touch-action
   * non basta a governare l'handoff fra i due.
   *
   * La soluzione non è arbitrare meglio quel conflitto, ma eliminarlo: il
   * carosello non è più uno scroller (è una viewport con overflow:hidden) e
   * il cambio sessione avviene spostando .history-sessions-track con un
   * transform. Resta così UN SOLO scroller nativo, quello verticale della
   * lista, che continua a funzionare da solo con momentum e rubber-band —
   * qui non lo tocchiamo affatto.
   *
   * Di conseguenza questo handler si limita a: capire al primo movimento se
   * il gesto è orizzontale (altrimenti lascia fare al nativo), seguire il
   * dito col transform del track, e allo stacco agganciare la sessione più
   * vicina. Tutti i listener restano passive: non serve preventDefault,
   * perché touch-action:pan-y sulla lista già impedisce che uno swipe
   * orizzontale produca scroll nativo.
   */
  private setupCarouselTouchHandling(carousel: HTMLElement): void {
    // Idempotente: se venisse richiamato due volte sullo stesso pannello,
    // non accumula listener duplicati.
    this.carouselTouchCleanup?.();

    const track = this.sessionTrackRef?.nativeElement;
    if (!track) return;

    /** px di movimento prima di decidere la direzione del gesto */
    const AXIS_LOCK_THRESHOLD = 10;
    /** frazione di slide oltre la quale il rilascio cambia sessione */
    const SWIPE_COMMIT_RATIO = 0.2;
    /** quanto "frena" il trascinamento oltre la prima/ultima sessione */
    const EDGE_RESISTANCE = 0.3;

    let startX = 0;
    let startY = 0;
    let lockedAxis: "x" | "y" | null = null;
    let isTracking = false;

    gsap.set(track, { x: 0 });

    const lastIndex = () => Math.max(0, (this.activeConfig?.data.length ?? 1) - 1);

    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) return;
      startX = event.touches[0].clientX;
      startY = event.touches[0].clientY;
      lockedAxis = null;
      isTracking = true;
      gsap.killTweensOf(track);
    };

    const onTouchMove = (event: TouchEvent) => {
      if (!isTracking || event.touches.length !== 1) return;

      const dx = event.touches[0].clientX - startX;
      const dy = event.touches[0].clientY - startY;

      if (!lockedAxis) {
        if (
          Math.abs(dx) < AXIS_LOCK_THRESHOLD &&
          Math.abs(dy) < AXIS_LOCK_THRESHOLD
        ) {
          return; // troppo presto per capire la direzione
        }
        lockedAxis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      }

      // Verticale: non facciamo NULLA e non chiamiamo preventDefault — se ne
      // occupa lo scroll nativo della lista (touch-action:pan-y). È il motivo
      // per cui i listener possono restare tutti passive.
      if (lockedAxis !== "x") return;

      const width = carousel.clientWidth;
      const min = -lastIndex() * width;
      let offset = -this.activeSessionIndex * width + dx;

      // Oltre i bordi il track segue il dito smorzato, invece di staccarsi
      if (offset > 0) {
        offset *= EDGE_RESISTANCE;
      } else if (offset < min) {
        offset = min + (offset - min) * EDGE_RESISTANCE;
      }

      gsap.set(track, { x: offset });
    };

    const onTouchEnd = (event: TouchEvent) => {
      if (!isTracking) return;
      isTracking = false;

      if (lockedAxis !== "x") {
        lockedAxis = null;
        return;
      }
      lockedAxis = null;

      const width = carousel.clientWidth;
      if (width <= 0) return;

      const dx = (event.changedTouches[0]?.clientX ?? startX) - startX;
      let target = this.activeSessionIndex;
      if (Math.abs(dx) > width * SWIPE_COMMIT_RATIO) {
        target += dx < 0 ? 1 : -1;
      }
      target = Math.min(Math.max(target, 0), lastIndex());

      gsap.to(track, {
        x: -target * width,
        duration: 0.3,
        ease: "power2.out",
        force3D: true,
      });

      if (target !== this.activeSessionIndex) {
        // Rientro in zona solo qui: è l'unico punto in cui cambia uno stato
        // legato al template (i pallini indicatore).
        this.zone.run(() => {
          this.activeSessionIndex = target;
          this.cdr.detectChanges();
        });
      }
    };

    // Tutti passive: non serve preventDefault (vedi onTouchMove), e restare
    // passive evita di interferire con lo scroll nativo della lista. Fuori
    // dalla zona Angular perché touchmove spara a 60-120Hz e ogni evento in
    // zona innescherebbe un ciclo di change detection sull'intera app.
    this.zone.runOutsideAngular(() => {
      carousel.addEventListener("touchstart", onTouchStart, { passive: true });
      carousel.addEventListener("touchmove", onTouchMove, { passive: true });
      carousel.addEventListener("touchend", onTouchEnd, { passive: true });
      carousel.addEventListener("touchcancel", onTouchEnd, { passive: true });
    });

    this.carouselTouchCleanup = () => {
      carousel.removeEventListener("touchstart", onTouchStart);
      carousel.removeEventListener("touchmove", onTouchMove);
      carousel.removeEventListener("touchend", onTouchEnd);
      carousel.removeEventListener("touchcancel", onTouchEnd);
    };
  }

  onOverlayClick(): void {
    if (this.isAnimating) return;

    const panel = this.panelRef?.nativeElement;
    this.carouselTouchCleanup?.();

    if (!panel) {
      this.activeConfig = null;
      this.historyPopupService.close();
      return;
    }

    this.isAnimating = true;

    this.zone.runOutsideAngular(() => {
      gsap.to(panel, {
        opacity: 0,
        scale: 0.4,
        transformOrigin: this.transformOrigin,
        duration: 0.2,
        ease: "back.in(1.4)",
        force3D: true,
        onComplete: () => {
          // Vedi il commento esteso in ConfirmPopup.animateOutAndThen(): il
          // teardown (signal del service -> effect su AppComponent -> classe
          // di scroll-lock -> change detection sull'intero albero) costa più
          // di un frame, e questo callback gira dentro il rAF di GSAP, cioè
          // dentro il frame in cui va ancora dipinto l'ultimo fotogramma.
          // Due frame di respiro: il primo dipinge la fine dell'animazione,
          // nel secondo si smonta, quando non c'è più nulla di visibile.
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              this.zone.run(() => {
                this.isAnimating = false;
                // Azzerato PRIMA di avvisare il service: quando l'effect rivede
                // active()===null non c'è più nulla da chiudere.
                this.activeConfig = null;
                // detectChanges() prima di avvisare il service: vedi
                // ConfirmPopup — l'overlay va smontato prima del resto.
                this.cdr.detectChanges();
                this.historyPopupService.close();
              });
            });
          });
        },
      });
    });
  }
}
