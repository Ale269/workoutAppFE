import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  AfterViewInit,
  ViewChild,
} from "@angular/core";
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
  RouterOutlet,
} from "@angular/router";
import { CommonModule } from "@angular/common";
import { ErrorHandlerService } from "./core/services/error-handler.service";
import { filter, Subject, takeUntil } from "rxjs";
import { MenuComponent } from "./components/shared/menu-component/menu-component";
import { GenericModal } from "./components/shared/generic-modal/generic-modal";
import { ModalService } from "./core/services/modal.service";
import { SpinnerService } from "./core/services/spinner.service";
import { SpinnerComponent } from "./components/shared/spinner/spinner";
import { UpdateBannerComponent } from "./components/shared/update-banner/update-banner.component";
import { OfflineIndicatorComponent } from "./components/shared/offline-indicator/offline-indicator.component";
import { BottomSheetService } from "./components/shared/bottom-sheet/bottom-sheet-service";
import { BottomSheetWrapperComponent } from "./components/shared/bottom-sheet/bottom-sheet";
import { TranslateService } from "@ngx-translate/core";
import { effect } from "@angular/core";
import { gsap } from "gsap";
import { AnimationService } from "./core/services/page-animation-service";

@Component({
  selector: "app-root",
  standalone: true,
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
  imports: [
    RouterOutlet,
    MenuComponent,
    GenericModal,
    SpinnerComponent,
    CommonModule,
    UpdateBannerComponent,
    OfflineIndicatorComponent,
    BottomSheetWrapperComponent,
  ],
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {
  public MenuIsVisible: boolean = false;
  public hasCriticalErrors: boolean = false;
  public initializationComplete: boolean = false;

  @ViewChild("mainContent") mainContentRef: ElementRef | undefined;
  private mainContent: HTMLElement | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private errorHandler: ErrorHandlerService,
    public modalService: ModalService,
    public spinnerService: SpinnerService,
    public bottomSheetService: BottomSheetService,
    private translate: TranslateService,
    private animationService: AnimationService
  ) {
    // Inizializza TranslateService
    this.translate.setDefaultLang("it");

    // Setup routing events
    this.router.events
      .pipe(
        filter(
          (event) =>
            event instanceof NavigationStart ||
            event instanceof NavigationEnd ||
            event instanceof NavigationCancel ||
            event instanceof NavigationError
        ),
        takeUntil(this.destroy$)
      )
      .subscribe((event) => {
        this.animationService.playFadeIn();
      });

    // Monitor modali e bottom sheets per bloccare lo scroll
    effect(() => {
      const hasActiveModal = this.modalService.modals().length > 0;
      const hasActiveBottomSheet =
        this.bottomSheetService.activeBottomSheets().length > 0;

      this.toggleBodyScroll(hasActiveModal || hasActiveBottomSheet);
    });
  }

  ngOnInit(): void {
    console.log("🚀 AppComponent: Controllo inizializzazione...");

    // Controlla errori critici
    this.checkForCriticalErrors();

    // Monitor errori in tempo reale
    this.setupErrorMonitoring();
  }

  ngAfterViewInit(): void {
    if (this.mainContentRef) {
      this.mainContent = this.mainContentRef.nativeElement;
      this.animationService.setMainElement(this.mainContent);
      // assicurati stato iniziale
      gsap.set(this.mainContent, { autoAlpha: 1 });
    }
  }

  ngOnDestroy(): void {
    // Ripristina lo scroll quando il componente viene distrutto
    this.toggleBodyScroll(false);

    this.destroy$.next();
    this.destroy$.complete();
  }

  private toggleBodyScroll(disable: boolean): void {
    if (typeof document !== "undefined") {
      if (disable) {
        document.body.classList.add("no-scroll");
      } else {
        document.body.classList.remove("no-scroll");
      }
    }
  }

  private checkForCriticalErrors(): void {
    this.hasCriticalErrors = this.errorHandler.hasCriticalErrors();

    if (this.hasCriticalErrors) {
      console.error("🔥 Errori critici rilevati");
      this.handleCriticalErrorState();
    } else {
      this.initializationComplete = true;
      this.updateMenuVisibility(this.router.url);
      console.log("✅ Inizializzazione completata");
    }
  }

  private setupErrorMonitoring(): void {
    // Monitor nuovi errori critici
    this.errorHandler.onError((error) => {
      if (error.isCritical && !this.hasCriticalErrors) {
        console.error("🔥 Nuovo errore critico:", error);
        this.hasCriticalErrors = true;
        this.handleCriticalErrorState();
      }
    });
  }

  private handleCriticalErrorState(): void {
    console.error("🚨 Gestione errore critico...");
    this.MenuIsVisible = false;

    // Redirect alla pagina errore
    setTimeout(() => {
      this.router.navigate(["/error"], {}).catch(() => {
        this.showFallbackError();
      });
    }, 100);
  }

  private showFallbackError(): void {
    if (typeof document !== "undefined") {
      document.body.innerHTML = `
        <div style="
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: #f5f5f5;
          font-family: Arial, sans-serif;
          text-align: center;
          padding: 20px;
        ">
          <div style="
            background: white;
            border-radius: 8px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            max-width: 500px;
          ">
            <h1 style="color: #dc3545; margin-bottom: 20px;">⚠️ Errore Critico</h1>
            <p style="color: #666; margin-bottom: 20px;">
              L'applicazione ha riscontrato un errore critico.
            </p>
            <button 
              onclick="window.location.reload()" 
              style="
                background: #007bff;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 16px;
              "
            >
              Ricarica Pagina
            </button>
          </div>
        </div>
      `;
    }
  }

  private updateMenuVisibility(url: string): void {
    if (this.hasCriticalErrors) {
      this.MenuIsVisible = false;
      return;
    }

    const routesWithoutMenu = [
      "/login",
      "/signin",
      "/register",
      "/forgot-password",
      "/reset-password",
      "/error",
    ];

    this.MenuIsVisible = !routesWithoutMenu.some((route) =>
      url.toLowerCase().includes(route)
    );
  }

  onSpinnerCompleted(spinnerId: string): void {
    console.log(`Spinner ${spinnerId} completato`);
  }

  // Getter per template
  public get shouldShowApp(): boolean {
    return this.initializationComplete && !this.hasCriticalErrors;
  }

  public get isLoading(): boolean {
    return !this.initializationComplete && !this.hasCriticalErrors;
  }

  private playFadeOut(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.mainContent) {
        resolve();
        return;
      }

      const el = this.mainContentRef?.nativeElement;

      gsap.to(el, {
        autoAlpha: 0, // opacity + visibility
        ease: "power1.in",
        onComplete: () => {
          resolve();
        },
      } as gsap.TweenVars);
    });
  }

  private playFadeIn(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.mainContent) {
        resolve();
        return;
      }
      gsap.to(this.mainContent, {
        autoAlpha: 1,
        duration: 0.3,
        ease: "power1.out",
      });
    });
  }
}
