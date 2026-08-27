import {
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

// --- Istrumentazione DIAGNOSTICA temporanea (da rimuovere a test finito) ---
// Stessa chiave/formato di HapticTapService.debugLog(): il pannello già
// presente sulla home page mostra automaticamente anche questi eventi.
// TODO: rimuovere questa funzione e le sue chiamate in animateOutAndThen().
const DEBUG_LOG_KEY = "__hapticDebugLog";
const DEBUG_LOG_MAX = 60;

function debugLog(event: string, host: HTMLElement): void {
  try {
    const raw = localStorage.getItem(DEBUG_LOG_KEY);
    const log: Array<{ t: number; event: string; el: string }> = raw
      ? JSON.parse(raw)
      : [];
    const cls = (host.className || "").toString().trim().split(/\s+/)[0];
    log.push({
      t: Math.round(performance.now()),
      event,
      el: cls || host.tagName.toLowerCase(),
    });
    while (log.length > DEBUG_LOG_MAX) {
      log.shift();
    }
    localStorage.setItem(DEBUG_LOG_KEY, JSON.stringify(log));
  } catch {
    // diagnostico, non deve mai rompere l'app
  }
}
// --- fine istrumentazione ---

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

    // --- Istrumentazione DIAGNOSTICA temporanea (da rimuovere a test finito) ---
    // TODO: rimuovere insieme a debugLog() e alle chiamate onUpdate/onInterrupt
    // qui sotto. Traccia il valore REALE di opacity/scale a ogni tick e se
    // onComplete scatta davvero, per capire se il tween di chiusura viene
    // interrotto (killato) prima di finire invece di completare normalmente.
    debugLog("close-start", panel);
    // --- fine istrumentazione ---

    this.zone.runOutsideAngular(() => {
      gsap.to(panel, {
        opacity: 0,
        scale: 0.4,
        transformOrigin: this.transformOrigin,
        duration: 0.2,
        ease: "back.in(1.4)",
        force3D: true,
        onUpdate: () => {
          debugLog(
            `close-tick op=${(gsap.getProperty(panel, "opacity") as number).toFixed(2)} sc=${(gsap.getProperty(panel, "scale") as number).toFixed(2)}`,
            panel,
          );
        },
        onInterrupt: () => {
          debugLog("close-INTERROTTO (killato prima del completamento)", panel);
        },
        onComplete: () => {
          debugLog("close-onComplete (tween arrivato in fondo)", panel);
          this.zone.run(() => {
            this.isAnimating = false;
            // Azzerato PRIMA di avvisare il service: quando l'effect rivede
            // active()===null non c'è più nulla da chiudere.
            this.activeConfig = null;
            afterClose();
            this.cdr.detectChanges();
            debugLog("close-activeConfig-azzerato (@if rimuove il pannello)", panel);
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
