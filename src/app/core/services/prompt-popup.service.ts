import { Injectable, inject, signal } from "@angular/core";
import { HapticService } from "./haptic.service";

export interface PromptPopupConfig {
  title: string;
  inputLabel: string;
  placeholder?: string;
  hint?: string;
  initialValue?: string;
  cancelText?: string;
  confirmText?: string;
  /** Colore del testo di conferma (default: verde mare, l'accent dell'app) */
  confirmColor?: string;
  onConfirm: (value: string) => void;
  onCancel?: () => void;
}

/**
 * Popup di conferma con un campo di testo, stile Apple come app-confirm-popup
 * (stesso pannello glass, stessa riga Annulla/conferma), ma centrato sullo
 * schermo invece che ancorato a un trigger: a differenza degli altri popup,
 * questo apre la tastiera al focus del campo, e se si ancorasse al pulsante
 * che lo ha aperto rischierebbe di finire coperto dalla tastiera stessa.
 */
@Injectable({ providedIn: "root" })
export class PromptPopupService {
  public active = signal<PromptPopupConfig | null>(null);

  private hapticService = inject(HapticService);

  open(config: PromptPopupConfig): void {
    this.hapticService.trigger("light");
    this.active.set(config);
  }

  cancel(): void {
    const config = this.active();
    this.active.set(null);
    if (config?.onCancel) {
      config.onCancel();
    }
  }

  confirm(value: string): void {
    const config = this.active();
    this.active.set(null);
    if (config) {
      config.onConfirm(value);
    }
  }
}
