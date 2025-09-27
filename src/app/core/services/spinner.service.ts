// spinner.service.ts - Versione migliorata
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
  startTime?: number; // Nuovo campo per tracciare quando inizia
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
      id,
      startTime: Date.now() // Salva quando inizia lo spinner
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

  // NUOVI METODI CON GESTIONE AUTOMATICA DEI TIMING

  /**
   * Imposta il successo rispettando automaticamente il minSpinnerDuration
   */
  setSuccessSmart(id: string, message?: string): Promise<boolean> {
    return this.setResultSmart(id, SpinnerResult.SUCCESS, message);
  }

  /**
   * Imposta l'errore rispettando automaticamente il minSpinnerDuration
   */
  setErrorSmart(id: string, message?: string): Promise<boolean> {
    return this.setResultSmart(id, SpinnerResult.ERROR, message);
  }

  /**
   * Imposta il warning rispettando automaticamente il minSpinnerDuration
   */
  setWarningSmart(id: string, message?: string): Promise<boolean> {
    return this.setResultSmart(id, SpinnerResult.WARNING, message);
  }

  /**
   * Imposta l'info rispettando automaticamente il minSpinnerDuration
   */
  setInfoSmart(id: string, message?: string): Promise<boolean> {
    return this.setResultSmart(id, SpinnerResult.INFO, message);
  }

  /**
   * Metodo privato che gestisce il timing automaticamente
   */
  private setResultSmart(id: string, result: SpinnerResult, message?: string): Promise<boolean> {
    return new Promise((resolve) => {
      const spinner = this.getSpinner(id);
      if (!spinner) {
        resolve(false);
        return;
      }

      const elapsedTime = Date.now() - (spinner.startTime || 0);
      const minDuration = spinner.minSpinnerDuration || 800;
      const waitTime = Math.max(0, minDuration - elapsedTime);

      const updateSpinner = () => {
        const updates: Partial<SpinnerConfig> = { result };
        
        // Aggiungi il messaggio personalizzato se fornito
        switch (result) {
          case SpinnerResult.SUCCESS:
            if (message) updates.successMessage = message;
            break;
          case SpinnerResult.ERROR:
            if (message) updates.errorMessage = message;
            break;
          case SpinnerResult.WARNING:
            if (message) updates.warningMessage = message;
            break;
          case SpinnerResult.INFO:
            if (message) updates.infoMessage = message;
            break;
        }

        const success = this.update(id, updates);
        resolve(success);
      };

      if (waitTime > 0) {
        // Aspetta il tempo rimanente prima di impostare il risultato
        setTimeout(updateSpinner, waitTime);
      } else {
        // Imposta immediatamente il risultato
        updateSpinner();
      }
    });
  }

  // Metodi legacy (mantieni per retrocompatibilità)
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