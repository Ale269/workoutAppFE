import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  NgZone,
  ViewChild,
  effect,
  inject,
} from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import gsap from "gsap";
import {
  PromptPopupConfig,
  PromptPopupService,
} from "src/app/core/services/prompt-popup.service";
import { HapticService } from "src/app/core/services/haptic.service";

/**
 * Pannello di conferma con campo di testo: stessa ricetta glass di
 * app-confirm-popup (pannello, riga Annulla/conferma, separatore), ma
 * centrato sullo schermo invece che ancorato a un trigger — vedi il
 * commento su PromptPopupService per il perché.
 *
 * NB: il componente è SEMPRE presente nel DOM (app.component.html lo
 * renderizza senza @if): è l'@if interno sul pannello (guidato da
 * `activeConfig`) a farlo apparire/sparire. Creare/distruggere l'intero
 * componente Angular a ogni apertura, invece di un semplice toggle interno,
 * concentrerebbe la creazione della view proprio nel momento in cui
 * l'animazione (e il focus dell'input) dovrebbero partire — lo stesso
 * problema già risolto in app-confirm-popup.
 */
@Component({
  selector: "app-prompt-popup",
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  templateUrl: "./prompt-popup.html",
  styleUrl: "./prompt-popup.scss",
})
export class PromptPopup {
  @ViewChild("panel") panelRef?: ElementRef<HTMLElement>;
  @ViewChild("inputEl") inputRef?: ElementRef<HTMLInputElement>;
  @ViewChild("overlay") overlayRef?: ElementRef<HTMLElement>;

  public activeConfig: PromptPopupConfig | null = null;
  public inputControl = new FormControl<string>("", { nonNullable: true });

  private isAnimating = false;
  /** Rimuove il listener sul visual viewport, vedi seguiTastiera(). */
  private stopSegueTastiera: (() => void) | null = null;
  private zone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);
  private hapticService = inject(HapticService);
  private promptPopupService = inject(PromptPopupService);

  constructor() {
    effect(() => {
      const config = this.promptPopupService.active();
      if (config) {
        this.open(config);
      }
      // Nessun ramo per config===null: la chiusura parte sempre da uno dei
      // due handler di click qui sotto, che azzerano activeConfig in locale
      // PRIMA di notificare il service (vedi animateOutAndThen).
    });
  }

  private open(config: PromptPopupConfig): void {
    if (this.isAnimating) return;
    this.activeConfig = config;
    this.inputControl.setValue(config.initialValue ?? "");
    // Sincrono, PRIMA di ogni requestAnimationFrame: siamo ancora nello
    // stesso stack di chiamata del tap che ha aperto il popup, l'unico
    // momento in cui iOS Safari accetta un focus() programmatico come
    // "attivato dall'utente" e apre davvero la tastiera. Aspettare anche
    // un solo frame in più rischia di perdere quel contesto.
    this.cdr.detectChanges();
    this.inputRef?.nativeElement?.focus();
    this.seguiTastiera();

    this.zone.runOutsideAngular(() => {
      requestAnimationFrame(() => {
        const panel = this.panelRef?.nativeElement;
        if (!panel) return;

        gsap.fromTo(
          panel,
          { opacity: 0, scale: 0.4 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.25,
            ease: "back.out(1.4)",
            force3D: true,
          },
        );
      });
    });
  }

  /**
   * Tiene l'overlay agganciato al VISUAL viewport invece che a quello di
   * layout.
   *
   * L'overlay e' "position: fixed; inset: 0" e centra il pannello con
   * flexbox: si dimensiona quindi sul viewport di LAYOUT, che all'apertura
   * della tastiera non si accorcia (su iOS non si accorcia mai; su Android
   * dipende dalla modalita' di resize). Risultato: il pannello resta centrato
   * sullo schermo intero e la tastiera, che ne occupa la meta' inferiore, lo
   * copre — proprio mentre l'input e' gia' a fuoco e serve vederlo.
   *
   * visualViewport descrive invece l'area davvero visibile: legandoci altezza
   * e offset, il pannello si ricentra nello spazio che resta sopra la
   * tastiera. Dove l'API non c'e', si ricade sul comportamento di prima.
   */
  private seguiTastiera(): void {
    this.stopSegueTastiera?.();

    const vv = window.visualViewport;
    const overlay = this.overlayRef?.nativeElement;
    if (!vv || !overlay) return;

    const applica = () => {
      overlay.style.height = `${vv.height}px`;
      overlay.style.top = `${vv.offsetTop}px`;
      overlay.style.bottom = "auto";
    };

    this.zone.runOutsideAngular(() => {
      applica();
      vv.addEventListener("resize", applica);
      vv.addEventListener("scroll", applica);
    });

    this.stopSegueTastiera = () => {
      vv.removeEventListener("resize", applica);
      vv.removeEventListener("scroll", applica);
      overlay.style.height = "";
      overlay.style.top = "";
      overlay.style.bottom = "";
      this.stopSegueTastiera = null;
    };
  }

  private animateOutAndThen(afterClose: () => void): void {
    if (this.isAnimating) return;

    this.stopSegueTastiera?.();

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
        duration: 0.2,
        ease: "back.in(1.4)",
        force3D: true,
        onComplete: () => {
          // Vedi il commento esteso in ConfirmPopup.animateOutAndThen(): il
          // teardown costa più di un frame e questo callback gira dentro il
          // rAF di GSAP, cioè dentro il frame in cui va ancora dipinto
          // l'ultimo fotogramma dell'animazione.
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              this.zone.run(() => {
                this.isAnimating = false;
                // Azzerato PRIMA di avvisare il service: quando l'effect rivede
                // active()===null non c'è più nulla da chiudere.
                this.activeConfig = null;
                // detectChanges() prima di afterClose(): vedi ConfirmPopup —
                // smonta l'overlay prima del lavoro applicativo, che altrimenti
                // lo tiene agganciato e blocca lo scroll a popup già sparito.
                this.cdr.detectChanges();
                afterClose();
              });
            });
          });
        },
      });
    });
  }

  onOverlayClick(): void {
    this.animateOutAndThen(() => this.promptPopupService.cancel());
  }

  onCancelClick(): void {
    this.animateOutAndThen(() => this.promptPopupService.cancel());
  }

  onConfirmClick(): void {
    this.hapticService.trigger("light");
    const value = this.inputControl.value;
    this.animateOutAndThen(() => this.promptPopupService.confirm(value));
  }
}
