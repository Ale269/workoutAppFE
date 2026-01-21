/**
 * Controller per gestire un focus overlay dall'interno della componente
 */
export class FocusOverlayController {
  constructor(
    public readonly id: string,
    private dismissFn: () => void
  ) { }

  /**
   * Chiude l'overlay
   */
  dismiss(): void {
    this.dismissFn();
  }

  /**
   * Rende visibile il backdrop con animazione
   */
  showBackdrop(): void {
    if (this.showBackdropFn) {
      this.showBackdropFn();
    }
  }

  /**
   * Nasconde il backdrop con animazione
   */
  hideBackdrop(): void {
    if (this.hideBackdropFn) {
      this.hideBackdropFn();
    }
  }

  /**
   * Notifica che il posizionamento è completato
   * Chiamato dal reorder-component quando le card sono posizionate sopra le originali
   */
  notifyPositioned(): void {
    if (this.onPositionedFn) {
      this.onPositionedFn();
    }
  }

  /**
   * Richiede la posizione aggiornata del container originale
   * (utile dopo scroll per calcolare dove riposizionare durante animazione inversa)
   */
  getUpdatedContainerPosition(): { top: number; left: number; width: number; height: number } | null {
    if (this.getContainerPositionFn) {
      return this.getContainerPositionFn();
    }
    return null;
  }

  /**
   * Notifica che le card sono pronte per essere mostrate di nuovo
   * (usato durante animazione inversa)
   */
  notifyReadyToShow(): void {
    if (this.onReadyToShowFn) {
      this.onReadyToShowFn();
    }
  }

  /**
   * Avvia la sequenza di chiusura animata
   * Chiamato dal wrapper quando l'utente clicca sul content
   */
  startCloseAnimation(): void {
    if (this.startCloseAnimationFn) {
      this.startCloseAnimationFn();
    }
  }

  /**
   * Applica il nuovo ordine degli esercizi
   * @param orderedIdentifiers Array degli identifier nell'ordine desiderato
   */
  applyNewOrder(orderedIdentifiers: number[]): void {
    if (this.applyNewOrderFn) {
      this.applyNewOrderFn(orderedIdentifiers);
    }
  }

  /** @internal */
  public registerBackdropFns(showFn: () => void, hideFn: () => void): void {
    this.showBackdropFn = showFn;
    this.hideBackdropFn = hideFn;
  }

  /** @internal */
  public registerOnPositionedFn(fn: () => void): void {
    this.onPositionedFn = fn;
  }

  /** @internal */
  public registerGetContainerPositionFn(fn: () => { top: number; left: number; width: number; height: number }): void {
    this.getContainerPositionFn = fn;
  }

  /** @internal */
  public registerOnReadyToShowFn(fn: () => void): void {
    this.onReadyToShowFn = fn;
  }

  /** @internal */
  public registerStartCloseAnimationFn(fn: () => void): void {
    this.startCloseAnimationFn = fn;
  }

  /** @internal */
  public registerApplyNewOrderFn(fn: (orderedIdentifiers: number[]) => void): void {
    this.applyNewOrderFn = fn;
  }

  private showBackdropFn?: () => void;
  private hideBackdropFn?: () => void;
  private onPositionedFn?: () => void;
  private getContainerPositionFn?: () => { top: number; left: number; width: number; height: number };
  private onReadyToShowFn?: () => void;
  private startCloseAnimationFn?: () => void;
  private applyNewOrderFn?: (orderedIdentifiers: number[]) => void;
}