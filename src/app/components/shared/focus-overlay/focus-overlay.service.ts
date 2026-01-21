import { Injectable, signal, Type, ViewContainerRef, ComponentRef, Injector, EnvironmentInjector, createComponent } from '@angular/core';
import { FocusOverlayController } from './focus-overlay.controller';

export interface FocusOverlayConfig<T = any> {
  component: Type<T>;
  data?: any;
  dismissOnBackdrop?: boolean;
  onDismiss?: () => void;
}

export interface FocusOverlayInstance<T = any> {
  id: string;
  config: FocusOverlayConfig<T>;
  controller: FocusOverlayController;
  componentRef?: ComponentRef<T>;
}

@Injectable({
  providedIn: 'root'
})
export class FocusOverlayService {
  private overlays = signal<FocusOverlayInstance[]>([]);
  private idCounter = 0;

  /**
   * Restituisce gli overlay attivi come signal
   */
  public activeOverlays = this.overlays.asReadonly();

  constructor(private injector: Injector) { }

  /**
   * Apre un nuovo focus overlay con la componente specificata
   */
  open<T>(config: FocusOverlayConfig<T>): FocusOverlayController {
    const id = `focus-overlay-${++this.idCounter}`;

    const controller = new FocusOverlayController(
      id,
      () => this.dismiss(id)
    );

    const instance: FocusOverlayInstance<T> = {
      id,
      config: {
        ...config,
        dismissOnBackdrop: config.dismissOnBackdrop ?? true
      },
      controller
    };

    this.overlays.update(overlays => [...overlays, instance]);

    return controller;
  }

  /**
   * Chiude un overlay specifico tramite ID
   */
  dismiss(id: string): void {
    const overlay = this.overlays().find(o => o.id === id);

    if (overlay) {
      // Chiamiamo il callback onDismiss se presente
      overlay.config.onDismiss?.();

      // Rimuoviamo l'overlay dalla lista
      this.overlays.update(overlays =>
        overlays.filter(o => o.id !== id)
      );
    }
  }

  /**
   * Chiude tutti gli overlay attivi
   */
  dismissAll(): void {
    const currentOverlays = this.overlays();

    currentOverlays.forEach(overlay => {
      overlay.config.onDismiss?.();
    });

    this.overlays.set([]);
  }

  /**
   * Verifica se ci sono overlay attivi
   */
  hasActiveOverlays(): boolean {
    return this.overlays().length > 0;
  }
}