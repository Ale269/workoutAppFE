// spinner.component.ts
import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { gsap } from 'gsap';

export type SpinnerResult = 'success' | 'error' | null;

@Component({
  selector: 'app-spinner',
  imports: [CommonModule],
 templateUrl: "./spinner.html",
  styleUrl: "./spinner.scss",
})
export class SpinnerComponent implements OnChanges, AfterViewInit {
  @ViewChild('spinnerElement', { static: false }) spinnerElement?: ElementRef;
  @ViewChild('resultElement', { static: false }) resultElement?: ElementRef;
  @ViewChild('messageElement', { static: false }) messageElement?: ElementRef;
  @ViewChild('spinnerOverlay', { static: false }) spinnerOverlay?: ElementRef;

  @Input() isActive: boolean = false;
  @Input() message: string = '';
  @Input() result: SpinnerResult = null;
  @Input() successMessage: string = 'Operazione completata con successo';
  @Input() errorMessage: string = 'Operazione fallita';
  @Input() showFinalResult: boolean = false; // Se true, mostra il risultato finale
  @Input() resultDuration: number = 2000; // Durata del risultato finale in ms

  @Output() completed = new EventEmitter<void>();

  public showResult = false;
  public finalResult: SpinnerResult = null;
  private isInitialized = false;
  private resultTimer?: any;

  ngAfterViewInit() {
    this.isInitialized = true;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.isInitialized) return;

    // Gestisce il cambio di result
    if (changes['result'] && this.result !== null && this.showFinalResult) {
      this.showFinalResultAnimation();
    }
    
    // Gestisce l'attivazione/disattivazione dello spinner
    if (changes['isActive']) {
      if (this.isActive) {
        this.resetAndShow();
      }
    }
  }

  private resetAndShow() {
    this.showResult = false;
    this.finalResult = null;
    
    // Anima l'ingresso del messaggio se presente
    setTimeout(() => {
      if (this.messageElement && this.message) {
        gsap.fromTo(this.messageElement.nativeElement, 
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.3 }
        );
      }
    }, 100);
  }

  private showFinalResultAnimation() {
    if (!this.spinnerElement || !this.resultElement) return;

    this.finalResult = this.result;
    
    // Timeline per la transizione
    const tl = gsap.timeline({
      onComplete: () => {
        // Auto-nascondi dopo la durata specificata
        this.resultTimer = window.setTimeout(() => {
          this.hideSpinner();
        }, this.resultDuration);
      }
    });

    // Fase 1: Anima via lo spinner
    tl.to(this.spinnerElement.nativeElement, {
      scale: 0,
      opacity: 0,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => {
        this.showResult = true;
      }
    });

    // Fase 2: Anima il nuovo messaggio (se cambia)
    if (this.messageElement) {
      tl.to(this.messageElement.nativeElement, {
        opacity: 0,
        y: -10,
        duration: 0.2
      }, 0);
    }

    // Fase 3: Dopo un breve delay, anima l'icona del risultato
    tl.call(() => {
      setTimeout(() => {
        if (this.resultElement) {
          gsap.fromTo(this.resultElement.nativeElement,
            { opacity: 0, scale: 0.5 },
            { 
              opacity: 1, 
              scale: 1, 
              duration: 0.5, 
              ease: 'back.out(1.7)',
              onComplete: () => {
                // Anima il nuovo messaggio
                if (this.messageElement) {
                  gsap.fromTo(this.messageElement.nativeElement,
                    { opacity: 0, y: 10 },
                    { opacity: 1, y: 0, duration: 0.3 }
                  );
                }
              }
            }
          );
        }
      }, 100);
    });
  }

  private hideSpinner() {
    if (!this.spinnerOverlay) return;

    gsap.to(this.spinnerOverlay.nativeElement, {
      opacity: 0,
      duration: 0.3,
      onComplete: () => {
        this.isActive = false;
        this.showResult = false;
        this.finalResult = null;
        this.completed.emit();
        
        // Clear timer
        if (this.resultTimer) {
          window.clearTimeout(this.resultTimer);
        }
      }
    });
  }

  getCurrentMessage(): string {
    if (this.showResult && this.finalResult) {
      return this.finalResult === 'success' ? this.successMessage : this.errorMessage;
    }
    return this.message;
  }

  getResultIcon(): string {
    return this.finalResult === 'success' ? '✓' : '✕';
  }

  // Metodo pubblico per nascondere manualmente
  public hide() {
    if (this.resultTimer) {
      window.clearTimeout(this.resultTimer);
    }
    this.hideSpinner();
  }
}