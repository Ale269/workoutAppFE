import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NavigationStateService {
  private pendingNavigationPromise: Promise<boolean> | null = null;

  /**
   * Imposta una Promise che verrà risolta quando l'utente decide
   */
  setPendingNavigation(promise: Promise<boolean>): void {
    this.pendingNavigationPromise = promise;
  }

  /**
   * Ottiene la Promise pendente (se esiste)
   */
  getPendingNavigation(): Promise<boolean> | null {
    return this.pendingNavigationPromise;
  }

  /**
   * Resetta lo stato
   */
  reset(): void {
    this.pendingNavigationPromise = null;
  }

  /**
   * Verifica se c'è una navigazione pendente
   */
  hasPendingNavigation(): boolean {
    return this.pendingNavigationPromise !== null;
  }
}