import { Injectable, signal, computed } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { BottomSheetConfig, BottomSheetDismissResult, BottomSheetInstance, BottomSheetRef } from './bottom-sheet-model';

@Injectable({
  providedIn: 'root'
})
export class BottomSheetService {
  private bottomSheets = signal<BottomSheetInstance[]>([]);
  
  // Computed signal per accesso pubblico
  public readonly activeBottomSheets = computed(() => this.bottomSheets());

  /**
   * Apre un nuovo Bottom Sheet
   */
  async open<T = any, R = any>(config: BottomSheetConfig<T>): Promise<BottomSheetRef<R>> {
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
      didDismissResolve
    };

    this.bottomSheets.update(sheets => [...sheets, instance]);

    const ref: BottomSheetRef<R> = {
      id,
      close: (data?: R) => this.dismiss(id, data),
      onWillDismiss: () => willDismissPromise,
      onDidDismiss: () => didDismissPromise
    };

    return ref;
  }

  /**
   * Chiude un Bottom Sheet specifico tramite ID
   */
  async dismiss<T = any>(id: string, data?: T, role?: string): Promise<boolean> {
    const instance = this.bottomSheets().find(sheet => sheet.id === id);
    
    if (!instance) {
      return false;
    }

    const result: BottomSheetDismissResult<T> = { data, role };

    // Trigger willDismiss
    if (instance.willDismissResolve) {
      instance.willDismissResolve(result);
    }

    // Rimuovi dalla lista
    this.bottomSheets.update(sheets => sheets.filter(sheet => sheet.id !== id));

    // Trigger didDismiss dopo la rimozione
    if (instance.didDismissResolve) {
      instance.didDismissResolve(result);
    }

    // Trigger close
    if (instance.closeResolve) {
      instance.closeResolve(result);
    }

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
    return this.dismiss(topSheet.id, data, role);
  }

  /**
   * Chiude tutti i Bottom Sheets
   */
  async dismissAll(): Promise<void> {
    const sheets = [...this.bottomSheets()];
    for (const sheet of sheets) {
      await this.dismiss(sheet.id);
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