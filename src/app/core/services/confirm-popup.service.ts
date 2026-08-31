import { Injectable, inject, signal } from "@angular/core";
import { HapticService } from "./haptic.service";

export interface ConfirmPopupConfig {
  /**
   * Elemento (icona/bottone) che ha aperto il popup: ne determina l'ancoraggio.
   *
   * Omettilo quando chi apre il popup sparisce nel frattempo — e' il caso del
   * menu multi-opzione, che si richiude scegliendo la voce: non resterebbe
   * nulla a cui ancorarsi. Senza trigger il pannello si centra sullo schermo.
   */
  triggerElement?: HTMLElement;
  title: string;
  message?: string;
  cancelText?: string;
  confirmText?: string;
  /** Colore del testo di conferma (default: rosso, per azioni distruttive) */
  confirmColor?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

/**
 * Popup di conferma leggero, stile Apple: si apre esattamente ancorato
 * all'elemento che lo ha attivato (icona X, pulsante elimina, ecc.),
 * scegliendo l'angolo di ancoraggio (alto/basso + sinistra/destra) in base
 * allo spazio disponibile nel viewport, invece del modale centrato classico.
 * Sostituisce ModalService per le conferme di eliminazione/uscita senza
 * salvare — ModalService resta per i modali "classici" (info, form, ecc.).
 */
@Injectable({ providedIn: "root" })
export class ConfirmPopupService {
  public active = signal<ConfirmPopupConfig | null>(null);

  private hapticService = inject(HapticService);

  open(config: ConfirmPopupConfig): void {
    this.hapticService.trigger("warning");
    this.active.set(config);
  }

  cancel(): void {
    const config = this.active();
    this.active.set(null);
    if (config?.onCancel) {
      config.onCancel();
    }
  }

  confirm(): void {
    const config = this.active();
    this.active.set(null);
    if (config) {
      config.onConfirm();
    }
  }
}
