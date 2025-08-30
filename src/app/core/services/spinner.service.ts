// spinner.service.ts
import { Injectable, signal } from '@angular/core';

export enum SpinnerResult {
  SUCCESS = "success",
  ERROR = "error",
  WARNING = "warning",
  INFO = "info",
}

export interface SpinnerConfig {
  id: string;
  message: string;
  result?: SpinnerResult | null;
  successMessage?: string;
  errorMessage?: string;
  warningMessage?: string;
  infoMessage?: string;
  showFinalResult?: boolean;
  resultDuration?: number;
  minSpinnerDuration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class SpinnerService {
  private _spinners = signal<SpinnerConfig[]>([]);
  
  // Getter per accedere ai spinners (readonly)
  spinners = this._spinners.asReadonly();

  private defaultConfig: Partial<SpinnerConfig> = {
    successMessage: "Operazione completata con successo",
    errorMessage: "Operazione fallita",
    warningMessage: "Attenzione: operazione completata con avvisi",
    infoMessage: "Informazione: operazione completata",
    showFinalResult: false,
    resultDuration: 2000,
    minSpinnerDuration: 800
  };

  /**
   * Mostra un nuovo spinner
   */
  show(config: Omit<SpinnerConfig, 'id'> & { id?: string }): string {
    const id = config.id || this.generateId();
    const fullConfig: SpinnerConfig = {
      ...this.defaultConfig,
      ...config,
      id
    };

    // Rimuovi eventuali spinner esistenti con lo stesso ID
    this.hide(id);
    
    // Aggiungi il nuovo spinner
    this._spinners.update(spinners => [...spinners, fullConfig]);
    
    return id;
  }

  /**
   * Aggiorna un spinner esistente
   */
  update(id: string, updates: Partial<Omit<SpinnerConfig, 'id'>>): boolean {
    const currentSpinners = this._spinners();
    const spinnerIndex = currentSpinners.findIndex(s => s.id === id);
    
    if (spinnerIndex === -1) {
      return false;
    }

    const updatedSpinners = [...currentSpinners];
    updatedSpinners[spinnerIndex] = { ...updatedSpinners[spinnerIndex], ...updates };
    
    this._spinners.set(updatedSpinners);
    return true;
  }

  /**
   * Nasconde uno spinner specifico
   */
  hide(id: string): boolean {
    const currentSpinners = this._spinners();
    const filteredSpinners = currentSpinners.filter(s => s.id !== id);
    
    if (filteredSpinners.length !== currentSpinners.length) {
      this._spinners.set(filteredSpinners);
      return true;
    }
    
    return false;
  }

  /**
   * Nasconde tutti gli spinner
   */
  hideAll(): void {
    this._spinners.set([]);
  }

  /**
   * Controlla se uno spinner specifico è attivo
   */
  isActive(id: string): boolean {
    return this._spinners().some(s => s.id === id);
  }

  /**
   * Ottiene la configurazione di uno spinner specifico
   */
  getSpinner(id: string): SpinnerConfig | undefined {
    return this._spinners().find(s => s.id === id);
  }

  /**
   * Metodi di convenienza per mostrare spinner con risultati predefiniti
   */
  showLoading(message: string, id?: string): string {
    return this.show({
      id,
      message,
      showFinalResult: false
    });
  }

  showWithResult(message: string, config?: {
    id?: string;
    successMessage?: string;
    errorMessage?: string;
    warningMessage?: string;
    infoMessage?: string;
    resultDuration?: number;
    minSpinnerDuration?: number;
  }): string {
    return this.show({
      ...config,
      message,
      showFinalResult: true
    });
  }

  /**
   * Metodi per impostare il risultato di uno spinner esistente
   */
  setResult(id: string, result: SpinnerResult): boolean {
    return this.update(id, { result });
  }

  setSuccess(id: string, message?: string): boolean {
    const updates: Partial<SpinnerConfig> = { result: SpinnerResult.SUCCESS };
    if (message) updates.successMessage = message;
    return this.update(id, updates);
  }

  setError(id: string, message?: string): boolean {
    const updates: Partial<SpinnerConfig> = { result: SpinnerResult.ERROR };
    if (message) updates.errorMessage = message;
    return this.update(id, updates);
  }

  setWarning(id: string, message?: string): boolean {
    const updates: Partial<SpinnerConfig> = { result: SpinnerResult.WARNING };
    if (message) updates.warningMessage = message;
    return this.update(id, updates);
  }

  setInfo(id: string, message?: string): boolean {
    const updates: Partial<SpinnerConfig> = { result: SpinnerResult.INFO };
    if (message) updates.infoMessage = message;
    return this.update(id, updates);
  }

  private generateId(): string {
    return `spinner-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}