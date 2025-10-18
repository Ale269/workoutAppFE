import { Injectable } from "@angular/core";
import { BottomSheetService } from "./bottom-sheet-service";

@Injectable()
export class BottomSheetController<T = any> {
  private _bottomSheetId?: string;
  private _bottomSheetService?: BottomSheetService;

  /**
   * Imposta l'ID del Bottom Sheet e il service (chiamato automaticamente dal wrapper)
   */
  setBottomSheetId(id: string): void {
    this._bottomSheetId = id;
  }

  /**
   * Imposta il BottomSheetService (chiamato automaticamente dal wrapper)
   */
  setBottomSheetService(service: BottomSheetService): void {
    this._bottomSheetService = service;
  }

  /**
   * Chiude il Bottom Sheet corrente con dati opzionali
   */
  async dismiss(data?: T, role?: string): Promise<boolean> {
    if (!this._bottomSheetId) {
      console.warn('⚠️ BottomSheetController: nessun ID impostato');
      return false;
    }

    if (!this._bottomSheetService) {
      console.error('🔴 BottomSheetController: BottomSheetService non impostato');
      return false;
    }
    
    console.log('🔵 Controller dismiss called:', this._bottomSheetId, 'data:', data, 'role:', role);
    
    // Ritorna immediatamente true, il service si occuperà del resto
    // Non aspettiamo il dismiss perché deve finire l'animazione prima
    this._bottomSheetService.requestDismiss(this._bottomSheetId, data, role);
    return true;
  }

  /**
   * Ottiene l'ID del Bottom Sheet corrente
   */
  get bottomSheetId(): string | undefined {
    return this._bottomSheetId;
  }
}