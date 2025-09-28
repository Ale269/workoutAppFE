import { Component, OnInit, OnDestroy } from "@angular/core";
import { NavigationEnd, Router, RouterOutlet } from "@angular/router";
import { CommonModule } from "@angular/common";
import { ErrorHandlerService } from "./core/services/error-handler.service";
import { filter, Subject, takeUntil } from "rxjs";
import { MenuComponent } from "./components/shared/menu-component/menu-component";
import { GenericModal } from "./components/shared/generic-modal/generic-modal";
import { ModalService } from "./core/services/modal.service";
import { SpinnerService } from "./core/services/spinner.service";
import { SpinnerComponent } from "./components/shared/spinner/spinner";

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
  ],
})
export class AppComponent implements OnInit, OnDestroy {
  public MenuIsVisible: boolean = false;
  public hasCriticalErrors: boolean = false;
  public initializationComplete: boolean = false;

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private errorHandler: ErrorHandlerService,
    public modalService: ModalService,
    public spinnerService: SpinnerService
  ) {
    // Setup routing events
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        if (!this.hasCriticalErrors) {
          this.updateMenuVisibility(event.urlAfterRedirects);
        }
      });
  }

  ngOnInit(): void {
    console.log("🚀 AppComponent: Controllo inizializzazione...");

    // Controlla errori critici
    this.checkForCriticalErrors();

    // Monitor errori in tempo reale
    this.setupErrorMonitoring();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
}
