// spinner.service.ts - Versione con forceShow corretto
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
  startTime?: number;
  forceShow?: boolean; // Se true, garantisce visibilità minima
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
    minSpinnerDuration: 800,
    forceShow: false
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
      startTime: Date.now()
    };

    this.hide(id);
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
   * Metodi di convenienza per mostrare spinner
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
    forceShow?: boolean;
  }): string {
    return this.show({
      ...config,
      message,
      showFinalResult: true
    });
  }

  /**
   * Imposta il risultato di uno spinner esistente (versione base sincrona)
   */
  setResult(id: string, result: SpinnerResult): boolean {
    return this.update(id, { result });
  }

  // ============================================================
  // METODI PRINCIPALI - Gestiscono timing e nascondimento automatico
  // ============================================================

  /**
   * Imposta il successo con gestione completa del timing
   * @returns Promise che si risolve quando lo spinner è completamente nascosto
   */
  async setSuccess(id: string, message?: string): Promise<boolean> {
    return this.setResultWithTiming(id, SpinnerResult.SUCCESS, message);
  }

  /**
   * Imposta l'errore con gestione completa del timing
   * @returns Promise che si risolve quando lo spinner è completamente nascosto
   */
  async setError(id: string, message?: string): Promise<boolean> {
    return this.setResultWithTiming(id, SpinnerResult.ERROR, message);
  }

  /**
   * Imposta il warning con gestione completa del timing
   * @returns Promise che si risolve quando lo spinner è completamente nascosto
   */
  async setWarning(id: string, message?: string): Promise<boolean> {
    return this.setResultWithTiming(id, SpinnerResult.WARNING, message);
  }

  /**
   * Imposta l'info con gestione completa del timing
   * @returns Promise che si risolve quando lo spinner è completamente nascosto
   */
  async setInfo(id: string, message?: string): Promise<boolean> {
    return this.setResultWithTiming(id, SpinnerResult.INFO, message);
  }

  /**
   * Metodo centrale che gestisce:
   * 1. Attesa minSpinnerDuration (SE forceShow è true)
   * 2. Impostazione del risultato
   * 3. Attesa resultDuration (se showFinalResult è true)
   * 4. Nascondimento automatico dello spinner
   */
  private async setResultWithTiming(
    id: string, 
    result: SpinnerResult, 
    message?: string
  ): Promise<boolean> {
    const spinner = this.getSpinner(id);
    if (!spinner) {
      return false;
    }

    // 1. Se forceShow è true, garantisci che lo spinner sia visibile per minSpinnerDuration
    if (spinner.forceShow) {
      const elapsedTime = Date.now() - (spinner.startTime || 0);
      const minDuration = spinner.minSpinnerDuration || 800;
      const waitTime = Math.max(0, minDuration - elapsedTime);

      if (waitTime > 0) {
        await this.delay(waitTime);
      }
    }

    // 2. Imposta il risultato
    const updates: Partial<SpinnerConfig> = { result };
    
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

    const updateSuccess = this.update(id, updates);
    if (!updateSuccess) {
      return false;
    }

    // 3. Se showFinalResult è true, delega la chiusura al componente
    if (spinner.showFinalResult) {
      // Il componente gestirà la visualizzazione del risultato e la chiusura automatica
      return true;
    }

    // 4. Nascondi lo spinner immediatamente se non c'è risultato da mostrare
    this.hide(id);

    return true;
  }

  /**
   * Helper per creare delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateId(): string {
    return `spinner-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}