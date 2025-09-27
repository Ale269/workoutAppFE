// spinner.component.ts - Versione con timing configurabili
import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { gsap } from "gsap";
import { SpinnerConfig, SpinnerResult, SpinnerService } from "src/app/core/services/spinner.service";

@Component({
  selector: "app-spinner",
  imports: [CommonModule],
  templateUrl: "./spinner.html",
  styleUrls: ['./spinner.scss']
})
export class SpinnerComponent implements OnChanges, AfterViewInit {
  @ViewChild("spinnerElement", { static: false }) spinnerElement?: ElementRef;
  @ViewChild("resultElement", { static: false }) resultElement?: ElementRef;
  @ViewChild("messageElement", { static: false }) messageElement?: ElementRef;
  @ViewChild("spinnerOverlay", { static: false }) spinnerOverlay?: ElementRef;

  @Input() config!: SpinnerConfig;
  @Output() completed = new EventEmitter<string>();

  public showResult = false;
  public finalResult: SpinnerResult | null | undefined = null;
  private isInitialized = false;
  private resultTimer?: any;
  private spinnerStartTime?: number;
  private pendingResult: SpinnerResult | null | undefined = null;
  private isSpinnerVisible = false;

  constructor(private spinnerService: SpinnerService) {}

  ngAfterViewInit() {
    this.isInitialized = true;
    this.resetAndShow();
    
    // Se c'è già un risultato in attesa, gestiscilo
    if (this.config.result != null && this.config.showFinalResult) {
      this.handlePendingResult();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    // Se c'è un risultato ma non siamo ancora inizializzati, salvalo per dopo
    if (!this.isInitialized && changes['config'] && this.config.result != null && this.config.showFinalResult) {
      this.pendingResult = this.config.result;
      return;
    }

    if (!this.isInitialized) {
      return;
    }

    if (changes['config'] && this.config.result != null && this.config.showFinalResult) {
      if (!this.isSpinnerVisible) {
        this.pendingResult = this.config.result;
      } else {
        this.handleResultChange();
      }
    }
  }

  private resetAndShow() {
    this.showResult = false;
    this.finalResult = null;
    // NON resettare pendingResult - potrebbe essere già stato impostato
    this.spinnerStartTime = Date.now();
    
    // Calcola il delay di visibilità basato sulla configurazione
    // Usa il 10% del minSpinnerDuration, con un minimo di 50ms e massimo di 200ms
    const minDuration = this.config.minSpinnerDuration || 800;
    const visibilityDelay = Math.max(50, Math.min(200, minDuration * 0.1));

    // Imposta subito lo spinner come visibile se il delay è molto piccolo
    if (visibilityDelay <= 100) {
      this.isSpinnerVisible = true;
      
      // Se c'è un risultato in attesa, gestiscilo subito
      if (this.pendingResult != null) {
        this.handlePendingResult();
      }

      this.animateMessageEntry();
    } else {
      // Per delay più lunghi, usa il timeout
      this.isSpinnerVisible = false;
      setTimeout(() => {
        this.isSpinnerVisible = true;
        
        if (this.pendingResult != null) {
          this.handlePendingResult();
        }

        this.animateMessageEntry();
      }, visibilityDelay);
    }
  }

  private animateMessageEntry() {
    if (this.messageElement && this.config.message) {
      // Durata animazione proporzionale alla configurazione
      const animationDuration = Math.max(0.2, Math.min(0.5, (this.config.minSpinnerDuration || 800) / 1600));
      
      gsap.fromTo(
        this.messageElement.nativeElement,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: animationDuration }
      );
    }
  }

  private handlePendingResult() {
    if (this.pendingResult == null) return;
    
    this.handleResultChange();
    this.pendingResult = null;
  }

  private handleResultChange() {
    const elapsedTime = this.spinnerStartTime ? Date.now() - this.spinnerStartTime : 0;
    const minDuration = this.config.minSpinnerDuration || 800;
    const remainingTime = Math.max(0, minDuration - elapsedTime);

    if (remainingTime > 0) {
      setTimeout(() => {
        this.showFinalResultAnimation();
      }, remainingTime);
    } else {
      this.showFinalResultAnimation();
    }
  }

  private showFinalResultAnimation() {
    if (!this.spinnerElement || !this.resultElement || !this.messageElement) {
      return;
    }

    // Durate delle animazioni proporzionali alla configurazione
    const minDuration = this.config.minSpinnerDuration || 800;
    const baseAnimationSpeed = Math.max(0.2, Math.min(0.4, minDuration / 2000)); // Più veloce per spinner brevi
    
    const tl = gsap.timeline({
      onComplete: () => {
        const duration = this.config.resultDuration || 2000;
        this.resultTimer = window.setTimeout(() => {
          this.hideSpinner();
        }, duration);
      },
    });

    // Fase 1: Anima l'uscita dello spinner (più veloce per timing brevi)
    tl.to(this.spinnerElement.nativeElement, {
      scale: 0,
      opacity: 0,
      duration: baseAnimationSpeed,
      ease: "power2.in",
    }).to(
      this.messageElement.nativeElement,
      {
        opacity: 0,
        y: -10,
        duration: baseAnimationSpeed * 0.7,
      },
      "<"
    );

    // Fase 2: Cambia lo stato
    tl.call(() => {
      this.showResult = true;
      this.finalResult = this.config.result;
    });

    // Fase 3: Anima l'entrata del risultato (più veloce per timing brevi)
    tl.fromTo(
      this.resultElement.nativeElement,
      { opacity: 0, scale: 0.5 },
      {
        opacity: 1,
        scale: 1,
        duration: baseAnimationSpeed * 1.5,
        ease: "back.out(1.7)",
      }
    );

    // Fase 4: Anima l'entrata del messaggio
    tl.fromTo(
      this.messageElement.nativeElement,
      { opacity: 0, y: 10 },
      {
        opacity: 1,
        y: 0,
        duration: baseAnimationSpeed,
      },
      "-=0.3"
    );
  }

  private hideSpinner() {
    if (!this.spinnerOverlay) return;

    // Animazione di uscita più veloce per timing brevi
    const minDuration = this.config.minSpinnerDuration || 800;
    const exitDuration = Math.max(0.2, Math.min(0.4, minDuration / 2000));

    gsap.to(this.spinnerOverlay.nativeElement, {
      opacity: 0,
      duration: exitDuration,
      onComplete: () => {
        this.showResult = false;
        this.finalResult = null;
        this.isSpinnerVisible = false;
        this.spinnerStartTime = undefined;
        
        // Rimuovi lo spinner dal servizio
        this.spinnerService.hide(this.config.id);
        
        // Emetti l'evento di completamento
        this.completed.emit(this.config.id);

        if (this.resultTimer) {
          window.clearTimeout(this.resultTimer);
        }
      },
    });
  }

  getCurrentMessage(): string {
    if (this.showResult && this.finalResult) {
      switch (this.finalResult) {
        case SpinnerResult.SUCCESS:
          return this.config.successMessage || "Operazione completata con successo";
        case SpinnerResult.ERROR:
          return this.config.errorMessage || "Operazione fallita";
        case SpinnerResult.WARNING:
          return this.config.warningMessage || "Attenzione: operazione completata con avvisi";
        case SpinnerResult.INFO:
          return this.config.infoMessage || "Informazione: operazione completata";
        default:
          return this.config.message;
      }
    }
    return this.config.message;
  }

  getResultIcon(): string {
    const resultToCheck = this.finalResult || this.config.result;
    switch (resultToCheck) {
      case SpinnerResult.SUCCESS:
        return "assets/recollect/svg/google-check.svg";
      case SpinnerResult.ERROR:
        return "assets/recollect/svg/google-close-icon.svg";
      case SpinnerResult.WARNING:
        return "assets/recollect/svg/google-warning.svg";
      case SpinnerResult.INFO:
        return "assets/recollect/svg/google-info.svg";
      default:
        return "?";
    }
  }

  public hide() {
    if (this.resultTimer) {
      window.clearTimeout(this.resultTimer);
    }
    this.hideSpinner();
  }
}