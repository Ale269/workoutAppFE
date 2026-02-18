import { Injectable, signal, computed, inject } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { BottomSheetConfig, BottomSheetDismissResult, BottomSheetInstance, BottomSheetRef } from './bottom-sheet-model';
import { HapticService } from 'src/app/core/services/haptic.service';

@Injectable({
  providedIn: 'root'
})
export class BottomSheetService {
  private bottomSheets = signal<BottomSheetInstance[]>([]);

  // Computed signal per accesso pubblico
  public readonly activeBottomSheets = computed(() => this.bottomSheets());

  private hapticService = inject(HapticService);

  /**
   * Apre un nuovo Bottom Sheet
   */
  async open<T = any, R = any>(config: BottomSheetConfig<T>): Promise<BottomSheetRef<R>> {
    this.hapticService.trigger('medium');
    const id = this.generateUniqueId();

    let closeResolve: ((result: BottomSheetDismissResult<R>) => void) | undefined;
    let willDismissResolve: ((result: BottomSheetDismissResult<R>) => void) | undefined;
    let didDismissResolve: ((result: BottomSheetDismissResult<R>) => void) | undefined;

    const closePromise = new Promise<void>((resolve) => {
      closeResolve = (result: BottomSheetDismissResult<R>) => {
        resolve();
      };
    });

    const willDismissPromise = new Promise<BottomSheetDismissResult<R>>((resolve) => {
      willDismissResolve = resolve;
    });

    const didDismissPromise = new Promise<BottomSheetDismissResult<R>>((resolve) => {
      didDismissResolve = resolve;
    });

    const instance: BottomSheetInstance = {
      id,
      component: config.component,
      data: {
        ...config.data,
        bottomSheetId: id
      },
      dismissible: config.dismissible ?? true,
      backdropDismiss: config.backdropDismiss ?? true,
      cssClass: config.cssClass,
      closeResolve,
      willDismissResolve,
      didDismissResolve,
      // Callback per il wrapper per gestire l'animazione
      onDismissRequested: undefined
    };

    this.bottomSheets.update(sheets => [...sheets, instance]);

    const ref: BottomSheetRef<R> = {
      id,
      close: (data?: R) => this.requestDismiss(id, data),
      onWillDismiss: () => willDismissPromise,
      onDidDismiss: () => didDismissPromise
    };

    return ref;
  }

  /**
   * Richiede la chiusura di un Bottom Sheet (con animazione)
   */
  public async requestDismiss<T = any>(id: string, data?: T, role?: string): Promise<boolean> {
    console.log('🟣 [9] Service.requestDismiss chiamato per ID:', id);

    const instance = this.bottomSheets().find(sheet => sheet.id === id);

    if (!instance) {
      console.warn('⚠️ [10] Bottom sheet NON trovato:', id);
      console.warn('⚠️ Bottom sheets disponibili:', this.bottomSheets().map(s => s.id));
      return false;
    }

    console.log('🟣 [11] Instance trovata:', instance.id);

    const result: BottomSheetDismissResult<T> = { data, role };

    // Trigger willDismiss
    if (instance.willDismissResolve) {
      console.log('🟣 [12] Triggering willDismiss');
      instance.willDismissResolve(result);
    }

    // Chiama il callback del wrapper per far partire l'animazione
    if (instance.onDismissRequested) {
      console.log('🟣 [13] Triggering onDismissRequested callback');
      instance.onDismissRequested(result);
    } else {
      console.warn('⚠️ [14] onDismissRequested callback NON definito!');
    }

    return true;
  }

  /**
   * Chiude effettivamente il Bottom Sheet (chiamato dal wrapper dopo l'animazione)
   */
  async dismiss<T = any>(id: string, data?: T, role?: string): Promise<boolean> {
    console.log('🟣 [15] Service.dismiss EFFETTIVO chiamato per ID:', id);

    const instance = this.bottomSheets().find(sheet => sheet.id === id);

    if (!instance) {
      console.warn('⚠️ [16] Instance non trovata in dismiss effettivo');
      return false;
    }

    console.log('🟣 [17] Rimuovendo bottom sheet dal DOM');

    const result: BottomSheetDismissResult<T> = { data, role };

    // Rimuovi dalla lista (questo rimuove il componente dal DOM)
    this.bottomSheets.update(sheets => sheets.filter(sheet => sheet.id !== id));

    console.log('🟣 [18] Bottom sheet rimosso, triggering didDismiss');

    // Trigger didDismiss dopo la rimozione
    if (instance.didDismissResolve) {
      instance.didDismissResolve(result);
    }

    // Trigger close
    if (instance.closeResolve) {
      instance.closeResolve(result);
    }

    console.log('🟣 [19] Dismiss completato');
    return true;
  }

  /**
   * Chiude l'ultimo Bottom Sheet aperto
   */
  async dismissTop<T = any>(data?: T, role?: string): Promise<boolean> {
    const sheets = this.bottomSheets();
    if (sheets.length === 0) {
      return false;
    }

    const topSheet = sheets[sheets.length - 1];
    return this.requestDismiss(topSheet.id, data, role);
  }

  /**
   * Chiude tutti i Bottom Sheets
   */
  async dismissAll(): Promise<void> {
    const sheets = [...this.bottomSheets()];
    for (const sheet of sheets) {
      await this.requestDismiss(sheet.id);
    }
  }

  /**
   * Verifica se un Bottom Sheet è aperto
   */
  isOpen(id: string): boolean {
    return this.bottomSheets().some(sheet => sheet.id === id);
  }

  /**
   * Ottiene un Bottom Sheet tramite ID
   */
  getById(id: string): BottomSheetInstance | undefined {
    return this.bottomSheets().find(sheet => sheet.id === id);
  }

  /**
   * Genera un ID univoco usando UUID v4
   */
  private generateUniqueId(): string {
    return `bottom-sheet-${uuidv4()}`;
  }
}