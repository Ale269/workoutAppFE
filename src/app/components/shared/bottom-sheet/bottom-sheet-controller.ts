import { Injectable } from "@angular/core";
import { BottomSheetService } from "./bottom-sheet-service";

@Injectable()
export class BottomSheetController<T = any> {
  private _bottomSheetId?: string;
  private bottomSheetService = inject(BottomSheetService);

  /**
   * Imposta l'ID del Bottom Sheet (chiamato automaticamente dal wrapper)
   */
  setBottomSheetId(id: string): void {
    this._bottomSheetId = id;
  }

  /**
   * Chiude il Bottom Sheet corrente con dati opzionali
   */
  async dismiss(data?: T, role?: string): Promise<boolean> {
    if (!this._bottomSheetId) {
      console.warn('BottomSheetController: nessun ID impostato');
      return false;
    }
    return this.bottomSheetService.dismiss(this._bottomSheetId, data, role);
  }

  /**
   * Ottiene l'ID del Bottom Sheet corrente
   */
  get bottomSheetId(): string | undefined {
    return this._bottomSheetId;
  }
}

function inject(token: any): any {
  // Questo è gestito da Angular
  return undefined as any;
}
