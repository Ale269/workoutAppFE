// spinner.component.ts - Versione corretta con delay e dismiss anticipato
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
  OnDestroy,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { gsap } from "gsap";
import {
  SpinnerConfig,
  SpinnerResult,
  SpinnerService,
} from "src/app/core/services/spinner.service";

@Component({
  selector: "app-spinner",
  imports: [CommonModule],
  templateUrl: "./spinner.html",
  styleUrls: ["./spinner.scss"],
})
export class SpinnerComponent implements OnChanges, AfterViewInit, OnDestroy {
  @ViewChild("spinnerElement", { static: false }) spinnerElement?: ElementRef;
  @ViewChild("resultElement", { static: false }) resultElement?: ElementRef;
  @ViewChild("messageElement", { static: false }) messageElement?: ElementRef;
  @ViewChild("spinnerOverlay", { static: false }) spinnerOverlay?: ElementRef;

  @Input() config!: SpinnerConfig;
  @Output() completed = new EventEmitter<string>();

  public showResult = false;
  public finalResult: SpinnerResult | null | undefined = null;
  public shouldShowSpinner = false;
  
  private isInitialized = false;
  private resultTimer?: any;
  private spinnerStartTime?: number;
  private pendingResult: SpinnerResult | null | undefined = null;
  private isSpinnerVisible = false;
  private initialDelayTimer?: any;
  private dismissRequested = false; // Flag per tracciare se è stato richiesto il dismiss
  private overlayAnimationComplete = false; // Flag per sapere se l'overlay è completamente visibile

  private readonly INITIAL_DELAY = 250;
  private readonly OVERLAY_ANIMATION_DURATION = 150;

  constructor(
    private spinnerService: SpinnerService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {
    console.log('[Spinner] Componente creato', { id: this.config?.id });
  }

  ngAfterViewInit() {
    console.log('[Spinner] AfterViewInit', { id: this.config.id });
    this.isInitialized = true;
    
    // Anima SEMPRE l'entrata dell'overlay
    this.animateOverlayEntry();
    
    // Avvia il delay prima di mostrare lo spinner
    this.startInitialDelay();
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('[Spinner] OnChanges', { 
      changes, 
      configId: this.config?.id,
      result: this.config?.result 
    });

    // Se il config viene rimosso, significa che dobbiamo nascondere lo spinner
    if (changes["config"] && !this.config?.id) {
      console.log('[Spinner] Config rimosso, dismissing...');
      this.handleDismiss();
      return;
    }

    // Se c'è un risultato ma non siamo ancora inizializzati, salvalo per dopo
    if (
      !this.isInitialized &&
      changes["config"] &&
      this.config.result != null &&
      this.config.showFinalResult
    ) {
      console.log('[Spinner] Risultato in attesa (non ancora inizializzato)');
      this.pendingResult = this.config.result;
      return;
    }

    if (!this.isInitialized) {
      return;
    }

    if (
      changes["config"] &&
      this.config.result != null &&
      this.config.showFinalResult
    ) {
      console.log('[Spinner] Risultato ricevuto', { 
        result: this.config.result,
        shouldShowSpinner: this.shouldShowSpinner 
      });
      
      if (!this.shouldShowSpinner) {
        console.log('[Spinner] Spinner non ancora visibile, salvo risultato');
        this.pendingResult = this.config.result;
      } else if (!this.isSpinnerVisible) {
        this.pendingResult = this.config.result;
      } else {
        this.handleResultChange();
      }
    }
  }

  ngOnDestroy() {
    console.log('[Spinner] Componente distrutto', { id: this.config?.id });
    this.cancelEverything();
  }

  private animateOverlayEntry() {
    if (!this.spinnerOverlay) return;

    console.log('[Spinner] Animazione overlay entry (sempre visibile)');
    
    // Anima l'overlay blur - SEMPRE
    gsap.fromTo(
      this.spinnerOverlay.nativeElement,
      { opacity: 0 },
      { 
        opacity: 1, 
        duration: this.OVERLAY_ANIMATION_DURATION / 1000,
        ease: "power2.out",
        onComplete: () => {
          this.overlayAnimationComplete = true;
          console.log('[Spinner] Overlay completamente visibile');
          
          // Se il dismiss è stato richiesto mentre l'overlay stava apparendo
          if (this.dismissRequested) {
            console.log('[Spinner] Dismiss era in attesa, nascondo overlay ora');
            this.hideOverlay();
          }
        }
      }
    );
  }

  private startInitialDelay() {
    console.log('[Spinner] Avvio delay iniziale di', this.INITIAL_DELAY, 'ms');
    
    this.initialDelayTimer = setTimeout(() => {
      console.log('[Spinner] Delay completato', { 
        dismissRequested: this.dismissRequested,
        pendingResult: this.pendingResult 
      });

      // Se è stato richiesto il dismiss durante il delay, NON mostrare lo spinner
      if (this.dismissRequested) {
        console.log('[Spinner] Dismiss richiesto durante delay, skip spinner');
        // L'overlay verrà nascosto da handleDismiss() o quando l'animazione dell'overlay completa
        return;
      }

      // Se c'è già un risultato pending, significa che l'operazione è completata
      // durante il delay. Decidi se mostrare il risultato o chiudere direttamente:
      // - Se forceShow è true: mostra sempre il risultato
      // - Se il risultato non è success: mostra sempre il risultato (error/warning/info)
      // - Altrimenti: chiudi direttamente
      if (this.pendingResult != null) {
        console.log('[Spinner] Risultato già disponibile durante delay', {
          result: this.pendingResult,
          forceShow: this.config.forceShow,
          showFinalResult: this.config.showFinalResult
        });
        
        const shouldShowResult = 
          this.config.forceShow || 
          (this.pendingResult !== SpinnerResult.SUCCESS && this.config.showFinalResult);
        
        if (shouldShowResult) {
          console.log('[Spinner] Mostro risultato finale (forceShow o non-success)');
          this.ngZone.run(() => {
            this.shouldShowSpinner = true; // Necessario per mostrare il messaggio
            this.showResult = true;
            this.finalResult = this.pendingResult;
            this.pendingResult = null;
            this.cdr.detectChanges();
            
            // Anima l'entrata del risultato
            setTimeout(() => {
              this.animateResultEntry();
            }, 0);
          });
        } else {
          console.log('[Spinner] Risultato success rapido, chiudo direttamente');
          this.hideOverlay();
        }
        return;
      }

      this.ngZone.run(() => {
        console.log('[Spinner] Mostro spinner');
        this.shouldShowSpinner = true;
        this.cdr.detectChanges();
        
        setTimeout(() => {
          this.resetAndShow();
        }, 0);
      });
    }, this.INITIAL_DELAY);
  }

  private handleDismiss() {
    console.log('[Spinner] HandleDismiss chiamato', {
      shouldShowSpinner: this.shouldShowSpinner,
      dismissRequested: this.dismissRequested,
      overlayAnimationComplete: this.overlayAnimationComplete
    });

    // Marca che è stato richiesto il dismiss
    this.dismissRequested = true;

    if (!this.shouldShowSpinner) {
      // Lo spinner non è ancora apparso
      console.log('[Spinner] Dismiss prima che lo spinner appaia');
      
      // Se l'animazione dell'overlay è completa, nascondi subito
      // Altrimenti aspetta che completi (verrà gestito in animateOverlayEntry)
      if (this.overlayAnimationComplete) {
        this.hideOverlay();
      }
    } else {
      // Lo spinner è già visibile, nascondi normalmente
      console.log('[Spinner] Dismiss con spinner visibile');
      this.hideSpinner();
    }
  }

  private cancelEverything() {
    console.log('[Spinner] CancelEverything');
    
    if (this.initialDelayTimer) {
      clearTimeout(this.initialDelayTimer);
      this.initialDelayTimer = undefined;
    }

    if (this.resultTimer) {
      clearTimeout(this.resultTimer);
      this.resultTimer = undefined;
    }

    this.shouldShowSpinner = false;
    this.dismissRequested = false;
    this.overlayAnimationComplete = false;
    this.showResult = false;
    this.finalResult = null;
    this.isSpinnerVisible = false;
    this.spinnerStartTime = undefined;
    this.pendingResult = null;
  }

  private hideOverlay() {
    if (!this.spinnerOverlay) return;

    console.log('[Spinner] Nascondo overlay (dismiss anticipato)');

    gsap.to(this.spinnerOverlay.nativeElement, {
      opacity: 0,
      duration: this.OVERLAY_ANIMATION_DURATION / 1000,
      ease: "power2.in",
      onComplete: () => {
        this.ngZone.run(() => {
          this.cancelEverything();
          this.spinnerService.hide(this.config.id);
          this.completed.emit(this.config.id);
          this.cdr.detectChanges();
          
          console.log('[Spinner] Overlay nascosto completamente (senza spinner)');
        });
      },
    });
  }

  private resetAndShow() {
    console.log('[Spinner] ResetAndShow');
    
    this.showResult = false;
    this.finalResult = null;
    this.spinnerStartTime = Date.now();

    const minDuration = this.config.minSpinnerDuration || 800;
    const visibilityDelay = Math.max(50, Math.min(200, minDuration * 0.1));

    if (visibilityDelay <= 100) {
      this.isSpinnerVisible = true;

      if (this.pendingResult != null) {
        console.log('[Spinner] Gestisco risultato pending');
        this.handlePendingResult();
      }

      this.animateMessageEntry();
    } else {
      this.isSpinnerVisible = false;
      setTimeout(() => {
        this.isSpinnerVisible = true;

        if (this.pendingResult != null) {
          console.log('[Spinner] Gestisco risultato pending (dopo delay)');
          this.handlePendingResult();
        }

        this.animateMessageEntry();
      }, visibilityDelay);
    }
  }

  private animateMessageEntry() {
    if (this.messageElement && this.config.message) {
      const animationDuration = Math.max(
        0.2,
        Math.min(0.5, (this.config.minSpinnerDuration || 800) / 1600)
      );

      gsap.fromTo(
        this.messageElement.nativeElement,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: animationDuration }
      );
    }
  }

  private animateResultEntry() {
    console.log('[Spinner] AnimateResultEntry (entrata diretta del risultato)');
    
    const minDuration = this.config.minSpinnerDuration || 800;
    const baseAnimationSpeed = Math.max(0.2, Math.min(0.4, minDuration / 2000));

    // Anima l'entrata del risultato e del messaggio
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

    if (this.messageElement) {
      gsap.fromTo(
        this.messageElement.nativeElement,
        { opacity: 0, y: 10 },
        {
          opacity: 1,
          y: 0,
          duration: baseAnimationSpeed,
          delay: baseAnimationSpeed * 0.3,
        }
      );
    }

    // Dopo aver mostrato il risultato, aspetta e poi nascondi
    const duration = this.config.resultDuration || 2000;
    console.log('[Spinner] Risultato mostrato, aspetto', duration, 'ms');
    this.resultTimer = window.setTimeout(() => {
      this.hideSpinner();
    }, duration);
  }

  private handlePendingResult() {
    if (this.pendingResult == null) return;

    console.log('[Spinner] HandlePendingResult', { result: this.pendingResult });
    this.handleResultChange();
    this.pendingResult = null;
  }

  private handleResultChange() {
    console.log('[Spinner] HandleResultChange');
    
    const elapsedTime = this.spinnerStartTime
      ? Date.now() - this.spinnerStartTime
      : 0;
    const minDuration = this.config.minSpinnerDuration || 800;
    const remainingTime = Math.max(0, minDuration - elapsedTime);

    console.log('[Spinner] Timing risultato', { 
      elapsedTime, 
      minDuration, 
      remainingTime 
    });

    if (remainingTime > 0) {
      setTimeout(() => {
        this.showFinalResultAnimation();
      }, remainingTime);
    } else {
      this.showFinalResultAnimation();
    }
  }

  private showFinalResultAnimation() {
    console.log('[Spinner] ShowFinalResultAnimation');
    
    if (!this.spinnerElement || !this.messageElement) {
      console.log('[Spinner] Elementi mancanti per animazione finale');
      return;
    }

    const minDuration = this.config.minSpinnerDuration || 800;
    const baseAnimationSpeed = Math.max(0.2, Math.min(0.4, minDuration / 2000));

    const tl = gsap.timeline({
      onComplete: () => {
        const duration = this.config.resultDuration || 2000;
        console.log('[Spinner] Animazione finale completata, aspetto', duration, 'ms');
        this.resultTimer = window.setTimeout(() => {
          this.hideSpinner();
        }, duration);
      },
    });

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

    tl.call(() => {
      this.ngZone.run(() => {
        console.log('[Spinner] Cambio stato a risultato finale');
        this.showResult = true;
        this.finalResult = this.config.result;
        this.cdr.detectChanges();
      });
    });

    tl.to(
      {},
      {
        duration: baseAnimationSpeed * 0.2,
        onComplete: () => {
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

          if (this.messageElement) {
            gsap.fromTo(
              this.messageElement.nativeElement,
              { opacity: 0, y: 10 },
              {
                opacity: 1,
                y: 0,
                duration: baseAnimationSpeed,
                delay: baseAnimationSpeed * 0.3,
              }
            );
          }
        },
      }
    );
  }

  private hideSpinner() {
    console.log('[Spinner] HideSpinner (dismiss normale)');
    
    if (!this.spinnerOverlay) return;

    const minDuration = this.config.minSpinnerDuration || 800;
    const exitDuration = Math.max(0.2, Math.min(0.4, minDuration / 2000));

    gsap.to(this.spinnerOverlay.nativeElement, {
      opacity: 0,
      duration: exitDuration,
      onComplete: () => {
        this.ngZone.run(() => {
          this.cancelEverything();
          this.spinnerService.hide(this.config.id);
          this.completed.emit(this.config.id);
          this.cdr.detectChanges();
          
          console.log('[Spinner] Spinner nascosto completamente');
        });
      },
    });
  }

  getCurrentMessage(): string {
    if (this.showResult && this.finalResult) {
      switch (this.finalResult) {
        case SpinnerResult.SUCCESS:
          return (
            this.config.successMessage || "Operazione completata con successo"
          );
        case SpinnerResult.ERROR:
          return this.config.errorMessage || "Operazione fallita";
        case SpinnerResult.WARNING:
          return (
            this.config.warningMessage ||
            "Attenzione: operazione completata con avvisi"
          );
        case SpinnerResult.INFO:
          return (
            this.config.infoMessage || "Informazione: operazione completata"
          );
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

    return iconPath;
  }

  public hide() {
    console.log('[Spinner] Hide chiamato pubblicamente');
    
    if (this.resultTimer) {
      window.clearTimeout(this.resultTimer);
    }
    this.handleDismiss();
  }
}