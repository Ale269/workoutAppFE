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
import gsap from "gsap";
import {
  ConfirmPopupConfig,
  ConfirmPopupService,
} from "src/app/core/services/confirm-popup.service";
import { positionPopupPanel } from "src/app/components/shared/popup-positioning";

/**
 * Pannello del popup di conferma: si posiziona in "position: fixed" ancorato
 * al triggerElement passato in config, scegliendo l'angolo (alto/basso +
 * sinistra/destra) che tiene il pannello dentro il viewport, ricalcolando
 * in base allo spazio disponibile intorno al trigger (non allo scroll: le
 * coordinate di getBoundingClientRect() sono già relative al viewport).
 * Stessa animazione/stile glass di app-popup-option-button.
 *
 * NB: il componente è SEMPRE presente nel DOM (app.component.html lo renderizza
 * senza @if) — è l'@if interno sul pannello (guidato da `activeConfig`) a farlo
 * apparire/sparire, esattamente come app-popup-option-button e il popup
 * cronologia in app-exercise-component. In precedenza il componente veniva
 * creato/distrutto da zero a ogni apertura/chiusura tramite un @if a livello
 * di app-root legato al signal del service: questo forzava una piena
 * istanziazione Angular (DI, creazione della view, ngAfterViewInit che
 * misura subito il layout) tutta dentro lo stesso ciclo sincrono del click
 * che l'ha aperto — lavoro concentrato esattamente nel momento in cui
 * l'animazione dovrebbe partire. Con il componente già vivo, aprire/chiudere
 * costa solo il toggle di un @if interno, come per gli altri due popup.
 */
@Component({
  selector: "app-confirm-popup",
  templateUrl: "./confirm-popup.html",
  styleUrl: "./confirm-popup.scss",
  // OnPush: il popup vive alla radice dell'app, quindi ogni tick applicativo
  // (ce n'è uno per ogni tap in zona, ovunque nell'app) attraverserebbe
  // anche questa view. Lo stato qui cambia solo da open()/animateOutAndThen(),
  // che chiamano già detectChanges() esplicitamente.
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmPopup {
  @ViewChild("panel") panelRef?: ElementRef<HTMLElement>;

  public activeConfig: ConfirmPopupConfig | null = null;
  public transformOrigin: string = "bottom right";

  private isAnimating = false;
  private zone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);
  private confirmPopupService = inject(ConfirmPopupService);

  constructor() {
    effect(() => {
      const config = this.confirmPopupService.active();
      if (config) {
        this.open(config);
      }
      // Nessun ramo per config===null: la chiusura parte SEMPRE da uno dei
      // tre handler di click qui sotto, che azzerano activeConfig in locale
      // PRIMA di notificare il service — quando l'effect rivede il signal
      // a null, activeConfig è già null e non c'è nulla da fare.
    });
  }

  private open(config: ConfirmPopupConfig): void {
    if (this.isAnimating) return;
    // Lock per tutta la durata dell'apertura (mancava: senza, non c'era un
    // vero blocco contro un secondo open() concorrente durante l'animazione
    // di entrata, a differenza della chiusura che invece lo fa già).
    this.isAnimating = true;
    this.activeConfig = config;
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

  private animateOutAndThen(afterClose: () => void): void {
    if (this.isAnimating) return;

    const panel = this.panelRef?.nativeElement;
    if (!panel) {
      this.activeConfig = null;
      afterClose();
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
          // Il teardown NON va eseguito qui. Questo callback gira dentro il
          // rAF del ticker GSAP, cioè dentro il budget del frame in cui il
          // browser deve ancora dipingere l'ULTIMO fotogramma dell'animazione.
          // Il teardown costa parecchio più di un frame:
          //   1. afterClose() scrive il signal del service, che ha come
          //      consumer un effect su AppComponent (il componente ROOT):
          //      Angular pianifica quindi una change detection sull'intero
          //      albero, non solo su questa view;
          //   2. quell'effect tocca la classe di scroll-lock sul body;
          //   3. la CD successiva rilegge il layout appena invalidato.
          // Risultato: il frame finale non viene mai dipinto, il pannello
          // resta immobile a scale ~0.4 e poi sparisce di scatto quando il
          // main thread si libera — esattamente il sintomo riportato.
          // Due frame di respiro: il primo dipinge la fine dell'animazione,
          // nel secondo si smonta tutto, quando non c'è più nulla di visibile.
          // (Il pannello resta nel DOM ~33ms in più a opacity 0: innocuo,
          // il guard isAnimating ignora già i tap in questa finestra.)
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              this.zone.run(() => {
                this.isAnimating = false;
                // Azzerato PRIMA di avvisare il service: quando l'effect rivede
                // active()===null non c'è più nulla da chiudere.
                this.activeConfig = null;
                afterClose();
                this.cdr.detectChanges();
              });
            });
          });
        },
      });
    });
  }

  onOverlayClick(): void {
    this.animateOutAndThen(() => this.confirmPopupService.cancel());
  }

  onCancelClick(): void {
    this.animateOutAndThen(() => this.confirmPopupService.cancel());
  }

  onConfirmClick(): void {
    this.animateOutAndThen(() => this.confirmPopupService.confirm());
  }
}
