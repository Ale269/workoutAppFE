// spinner.component.ts
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
    if (!this.isInitialized) return;

    if (changes['config'] && this.config.result != null && this.config.showFinalResult) {
      if (!this.isSpinnerVisible) {
        // Se lo spinner non è ancora visibile, salva il risultato per dopo
        this.pendingResult = this.config.result;
      } else {
        this.handleResultChange();
      }
    }
  }

  private resetAndShow() {
    this.showResult = false;
    this.finalResult = null;
    this.pendingResult = null;
    this.spinnerStartTime = Date.now();
    this.isSpinnerVisible = false;

    // Assicurati che lo spinner sia visibile per un tempo minimo
    setTimeout(() => {
      this.isSpinnerVisible = true;
      
      // Se c'è un risultato in attesa, gestiscilo ora
      if (this.pendingResult != null) {
        this.handlePendingResult();
      }

      if (this.messageElement && this.config.message) {
        gsap.fromTo(
          this.messageElement.nativeElement,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.3 }
        );
      }
    }, 100);
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
      // Lo spinner non è stato visibile abbastanza a lungo, aspetta
      setTimeout(() => {
        this.showFinalResultAnimation();
      }, remainingTime);
    } else {
      // È passato abbastanza tempo, mostra subito il risultato
      this.showFinalResultAnimation();
    }
  }

  private showFinalResultAnimation() {
    if (!this.spinnerElement || !this.resultElement || !this.messageElement) {
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        const duration = this.config.resultDuration || 2000;
        this.resultTimer = window.setTimeout(() => {
          this.hideSpinner();
        }, duration);
      },
    });

    // Fase 1: Anima l'uscita dello spinner e del messaggio corrente
    tl.to(this.spinnerElement.nativeElement, {
      scale: 0,
      opacity: 0,
      duration: 0.3,
      ease: "power2.in",
    }).to(
      this.messageElement.nativeElement,
      {
        opacity: 0,
        y: -10,
        duration: 0.2,
      },
      "<"
    );

    // Fase 2: Cambia lo stato dopo l'uscita
    tl.call(() => {
      this.showResult = true;
      this.finalResult = this.config.result;
    });

    // Fase 3: Anima l'entrata dell'icona del risultato
    tl.fromTo(
      this.resultElement.nativeElement,
      { opacity: 0, scale: 0.5 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.5,
        ease: "back.out(1.7)",
      }
    );

    // Fase 4: Anima l'entrata del nuovo messaggio
    tl.fromTo(
      this.messageElement.nativeElement,
      { opacity: 0, y: 10 },
      {
        opacity: 1,
        y: 0,
        duration: 0.3,
      },
      "-=0.4"
    );
  }

  private hideSpinner() {
    if (!this.spinnerOverlay) return;

    gsap.to(this.spinnerOverlay.nativeElement, {
      opacity: 0,
      duration: 0.3,
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
    // Mostra il messaggio di risultato SOLO se showResult è true (cioè dopo l'animazione)
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
    // Altrimenti mostra sempre il messaggio di caricamento
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