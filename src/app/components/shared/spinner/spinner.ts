// spinner.component.ts - Versione con fix per le icone
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
  ChangeDetectorRef,
  NgZone,
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

  constructor(
    private spinnerService: SpinnerService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

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
    this.spinnerStartTime = Date.now();
    
    const minDuration = this.config.minSpinnerDuration || 800;
    const visibilityDelay = Math.max(50, Math.min(200, minDuration * 0.1));

    if (visibilityDelay <= 100) {
      this.isSpinnerVisible = true;
      
      if (this.pendingResult != null) {
        this.handlePendingResult();
      }

      this.animateMessageEntry();
    } else {
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
    if (!this.spinnerElement || !this.messageElement) {
      return;
    }

    const minDuration = this.config.minSpinnerDuration || 800;
    const baseAnimationSpeed = Math.max(0.2, Math.min(0.4, minDuration / 2000));
    
    const tl = gsap.timeline({
      onComplete: () => {
        const duration = this.config.resultDuration || 2000;
        this.resultTimer = window.setTimeout(() => {
          this.hideSpinner();
        }, duration);
      },
    });

    // Fase 1: Anima l'uscita dello spinner
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

    // Fase 2: Cambia lo stato DENTRO NgZone per garantire il change detection
    tl.call(() => {
      this.ngZone.run(() => {
        this.showResult = true;
        this.finalResult = this.config.result;
        
        console.log("🔄 Cambio stato spinner:", {
          showResult: this.showResult,
          finalResult: this.finalResult,
          resultIcon: this.getResultIcon()
        });
        
        // Forza il change detection
        this.cdr.detectChanges();
      });
    });

    // Fase 3: Piccolo delay per il cambio DOM + animazione del risultato
    tl.to({}, { 
      duration: baseAnimationSpeed * 0.2,
      onComplete: () => {
        // Ora che il DOM è aggiornato, anima il risultato se l'elemento esiste
        if (this.resultElement) {
          gsap.fromTo(
            this.resultElement.nativeElement,
            { opacity: 0, scale: 0.5 },
            {
              opacity: 1,
              scale: 1,
              duration: baseAnimationSpeed * 1.5,
              ease: "back.out(1.7)",
            }
          );
        }
        
        // Anima anche il messaggio
        if (this.messageElement) {
          gsap.fromTo(
            this.messageElement.nativeElement,
            { opacity: 0, y: 10 },
            {
              opacity: 1,
              y: 0,
              duration: baseAnimationSpeed,
              delay: baseAnimationSpeed * 0.3
            }
          );
        }
      }
    });
  }

  private hideSpinner() {
    if (!this.spinnerOverlay) return;

    const minDuration = this.config.minSpinnerDuration || 800;
    const exitDuration = Math.max(0.2, Math.min(0.4, minDuration / 2000));

    gsap.to(this.spinnerOverlay.nativeElement, {
      opacity: 0,
      duration: exitDuration,
      onComplete: () => {
        this.ngZone.run(() => {
          this.showResult = false;
          this.finalResult = null;
          this.isSpinnerVisible = false;
          this.spinnerStartTime = undefined;
          
          this.spinnerService.hide(this.config.id);
          this.completed.emit(this.config.id);

          if (this.resultTimer) {
            window.clearTimeout(this.resultTimer);
          }
          
          this.cdr.detectChanges();
        });
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
    
    const iconPath = (() => {
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
          return "";
      }
    })();
    
    console.log("🎯 getResultIcon called:", {
      finalResult: this.finalResult,
      configResult: this.config.result,
      resultToCheck,
      iconPath,
      showResult: this.showResult
    });
    
    return iconPath;
  }

  public hide() {
    if (this.resultTimer) {
      window.clearTimeout(this.resultTimer);
    }
    this.hideSpinner();
  }
}