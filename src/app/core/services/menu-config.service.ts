// menu-config.service.ts
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

export type LeftButtonType = 'back' | 'close' | 'none';

export interface MenuConfig {
  leftButton: LeftButtonType;
  onLeftButtonClick?: () => void;
  centerText?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MenuConfigService {
  private configSubject = new BehaviorSubject<MenuConfig>({
    leftButton: 'none',
    centerText: undefined
  });

  public config$: Observable<MenuConfig> = this.configSubject.asObservable();

  constructor(private router: Router) {}

  setConfig(config: MenuConfig): void {
    this.configSubject.next(config);
  }

  reset(): void {
    this.configSubject.next({ 
      leftButton: 'none',
      centerText: undefined 
    });
  }

  // ============================================
  // HELPER METHODS PER CONFIGURAZIONE RAPIDA
  // ============================================

  /**
   * Configura il bottone per navigare a una route specifica
   * @param route - Route di navigazione (es: '/home', ['/user', '123'])
   * @param buttonType - Tipo di bottone ('back' o 'close')
   * @param centerText - Testo opzionale al centro del menu
   */
  setBackToRoute(
    route: string | any[], 
    buttonType: LeftButtonType = 'back',
    centerText?: string
  ): void {
    this.setConfig({
      leftButton: buttonType,
      centerText,
      onLeftButtonClick: () => {
        this.router.navigate(Array.isArray(route) ? route : [route]);
      }
    });
  }

  /**
   * Configura il bottone per eseguire una funzione custom
   * @param callback - Funzione da eseguire al click
   * @param buttonType - Tipo di bottone ('back' o 'close')
   * @param centerText - Testo opzionale al centro del menu
   */
  setBackWithCallback(
    callback: () => void,
    buttonType: LeftButtonType = 'back',
    centerText?: string
  ): void {
    this.setConfig({
      leftButton: buttonType,
      centerText,
      onLeftButtonClick: callback
    });
  }

  /**
   * Configura il bottone per tornare indietro nella history del browser
   * @param buttonType - Tipo di bottone ('back' o 'close')
   * @param centerText - Testo opzionale al centro del menu
   */
  setBackToPrevious(
    buttonType: LeftButtonType = 'back',
    centerText?: string
  ): void {
    this.setConfig({
      leftButton: buttonType,
      centerText,
      onLeftButtonClick: () => {
        window.history.back();
      }
    });
  }

  /**
   * Configura il bottone close per chiudere un modal/dialog
   * @param closeCallback - Funzione di chiusura del modal
   * @param centerText - Testo opzionale al centro del menu
   */
  setCloseModal(
    closeCallback: () => void,
    centerText?: string
  ): void {
    this.setConfig({
      leftButton: 'close',
      centerText,
      onLeftButtonClick: closeCallback
    });
  }
}