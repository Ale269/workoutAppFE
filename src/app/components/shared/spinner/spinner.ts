// spinner.component.ts - Versione pulita con animazione opzionale
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
  private initialDelayTimer?: any;
  private resultTimer?: any;
  private spinnerStartTime?: number;
  private pendingResult: SpinnerResult | null | undefined = null;

  private readonly INITIAL_DELAY = 250; // Tempo di attesa prima di mostrare lo spinner
  private readonly OVERLAY_ANIMATION_DURATION = 150;

  constructor(
    private spinnerService: SpinnerService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngAfterViewInit() {
    this.isInitialized = true;
    this.startInitialDelay();
  }

  ngOnChanges(changes: SimpleChanges) {
    // Gestisci rimozione config
    if (changes["config"] && !this.config?.id) {
      this.cleanup();
      return;
    }

    // Se non inizializzato, salva risultato per dopo
    if (!this.isInitialized && changes["config"] && this.config.result != null) {
      this.pendingResult = this.config.result;
      return;
    }

    if (!this.isInitialized) return;

    // Gestisci arrivo risultato
    if (changes["config"] && this.config.result != null && this.config.showFinalResult) {
      this.handleResultReceived(this.config.result);
    }
  }

  ngOnDestroy() {
    this.cleanup();
  }

  private startInitialDelay() {
    this.initialDelayTimer = setTimeout(() => {
      // Se c'è già un risultato, verifica se devi animare
      if (this.pendingResult != null) {
        this.handleFastResult(this.pendingResult);
      } else {
        // Nessun risultato ancora, mostra lo spinner
        this.showSpinnerAnimation();
      }
    }, this.INITIAL_DELAY);
  }

  private handleResultReceived(result: SpinnerResult) {
    // Se lo spinner non è ancora apparso, salva per dopo
    if (!this.shouldShowSpinner) {
      this.pendingResult = result;
    } else {
      // Spinner già visibile, transizione a risultato
      this.transitionToResult(result);
    }
  }

  private handleFastResult(result: SpinnerResult) {
    // Risultato arrivato prima del delay - decidi se animare
    const shouldAnimate = this.shouldAnimateFastResult(result);

    if (shouldAnimate) {
      // Mostra overlay + risultato diretto (senza spinner)
      this.showResultDirectly(result);
    } else {
      // SUCCESS veloce senza forceShow - salta tutto
      this.skipAnimation();
    }
  }

  private shouldAnimateFastResult(result: SpinnerResult): boolean {
    // Anima se:
    // 1. forceShow è true, oppure
    // 2. Il risultato NON è SUCCESS (quindi ERROR/WARNING/INFO)
    return this.config.forceShow || result !== SpinnerResult.SUCCESS;
  }

  private skipAnimation() {
    // Chiudi immediatamente senza mostrare NULLA (no overlay, no spinner, no result)
    // Non impostiamo shouldShowSpinner a true, quindi il template non renderizza nulla
    this.ngZone.run(() => {
      this.cleanup();
      this.spinnerService.hide(this.config.id);
      this.completed.emit(this.config.id);
    });
  }

  private showResultDirectly(result: SpinnerResult) {
    // Mostra overlay + risultato finale direttamente (senza passare da spinner)
    this.ngZone.run(() => {
      this.shouldShowSpinner = true;
      this.showResult = true;
      this.finalResult = result;
      this.cdr.detectChanges();

      // Anima entrata overlay
      setTimeout(() => {
        this.animateOverlayIn(() => {
          // Dopo overlay, anima risultato
          this.animateResultIn();
          
          // Programma chiusura
          const duration = this.config.resultDuration || 2000;
          this.resultTimer = setTimeout(() => {
            this.hideEverything();
          }, duration);
        });
      }, 0);
    });
  }

  private showSpinnerAnimation() {
    // Mostra overlay + spinner con animazione
    this.ngZone.run(() => {
      this.shouldShowSpinner = true;
      this.spinnerStartTime = Date.now();
      this.cdr.detectChanges();

      setTimeout(() => {
        this.animateOverlayIn(() => {
          // Dopo overlay, anima messaggio
          this.animateMessageIn();

          // Se c'è già un risultato pending, gestiscilo
          if (this.pendingResult != null) {
            const result = this.pendingResult;
            this.pendingResult = null;
            this.transitionToResult(result);
          }
        });
      }, 0);
    });
  }

  private transitionToResult(result: SpinnerResult) {
    // Calcola tempo minimo spinner
    const elapsedTime = this.spinnerStartTime ? Date.now() - this.spinnerStartTime : 0;
    const minDuration = this.config.minSpinnerDuration || 800;
    const remainingTime = Math.max(0, minDuration - elapsedTime);

    setTimeout(() => {
      this.animateSpinnerToResult(result);
    }, remainingTime);
  }

  private animateSpinnerToResult(result: SpinnerResult) {
    if (!this.spinnerElement || !this.messageElement) return;

    const minDuration = this.config.minSpinnerDuration || 800;
    const speed = Math.max(0.2, Math.min(0.4, minDuration / 2000));

    const tl = gsap.timeline({
      onComplete: () => {
        const duration = this.config.resultDuration || 2000;
        this.resultTimer = setTimeout(() => {
          this.hideEverything();
        }, duration);
      },
    });

    // Nascondi spinner
    tl.to(this.spinnerElement.nativeElement, {
      scale: 0,
      opacity: 0,
      duration: speed,
      ease: "power2.in",
    }).to(
      this.messageElement.nativeElement,
      {
        opacity: 0,
        y: -10,
        duration: speed * 0.7,
      },
      "<"
    );

    // Cambia stato
    tl.call(() => {
      this.ngZone.run(() => {
        this.showResult = true;
        this.finalResult = result;
        this.cdr.detectChanges();
      });
    });

    // Mostra risultato
    tl.to({}, {
      duration: speed * 0.2,
      onComplete: () => {
        this.animateResultIn(speed);
      },
    });
  }

  private animateOverlayIn(onComplete?: () => void) {
    if (!this.spinnerOverlay) {
      onComplete?.();
      return;
    }

    gsap.fromTo(
      this.spinnerOverlay.nativeElement,
      { opacity: 0 },
      { 
        opacity: 1, 
        duration: this.OVERLAY_ANIMATION_DURATION / 1000,
        ease: "power2.out",
        onComplete: () => {
          onComplete?.();
        }
      }
    );
  }

  private animateMessageIn() {
    if (!this.messageElement || !this.config.message) return;

    const duration = Math.max(0.2, Math.min(0.5, (this.config.minSpinnerDuration || 800) / 1600));

    gsap.fromTo(
      this.messageElement.nativeElement,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration, ease: "power2.out" }
    );
  }

  private animateResultIn(speed?: number) {
    const baseSpeed = speed || Math.max(0.2, Math.min(0.4, (this.config.minSpinnerDuration || 800) / 2000));

    if (this.resultElement) {
      gsap.fromTo(
        this.resultElement.nativeElement,
        { opacity: 0, scale: 0.5 },
        {
          opacity: 1,
          scale: 1,
          duration: baseSpeed * 1.5,
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
          duration: baseSpeed,
          delay: baseSpeed * 0.3,
        }
      );
    }
  }

  private hideEverything() {
    if (!this.spinnerOverlay) return;

    const minDuration = this.config.minSpinnerDuration || 800;
    const exitDuration = Math.max(0.2, Math.min(0.4, minDuration / 2000));

    gsap.to(this.spinnerOverlay.nativeElement, {
      opacity: 0,
      duration: exitDuration,
      ease: "power2.in",
      onComplete: () => {
        this.ngZone.run(() => {
          this.cleanup();
          this.spinnerService.hide(this.config.id);
          this.completed.emit(this.config.id);
        });
      },
    });
  }

  private cleanup() {
    if (this.initialDelayTimer) {
      clearTimeout(this.initialDelayTimer);
      this.initialDelayTimer = undefined;
    }

    if (this.resultTimer) {
      clearTimeout(this.resultTimer);
      this.resultTimer = undefined;
    }

    this.shouldShowSpinner = false;
    this.showResult = false;
    this.finalResult = null;
    this.spinnerStartTime = undefined;
    this.pendingResult = null;
    this.isInitialized = false;
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
        return "";
    }
  }

  public hide() {
    if (this.resultTimer) {
      clearTimeout(this.resultTimer);
    }
    this.hideEverything();
  }
}