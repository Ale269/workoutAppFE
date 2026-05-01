import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { CommonModule } from "@angular/common";
import {
  AppError,
  ErrorHandlerService,
} from "src/app/core/services/error-handler.service";

@Component({
  selector: "app-error-page",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./error-page.html",
  styleUrls: ["./error-page.scss"],
})
export class ErrorPage implements OnInit {
  criticalErrors: AppError[] = [];
  showDetails: boolean = false;
  detailsExpanded: boolean = false;
  lastErrorId: string = "";

  private tapCount = 0;
  private tapTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly TAP_THRESHOLD = 5;
  private readonly TAP_TIMEOUT_MS = 2000;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private errorHandler: ErrorHandlerService
  ) {}

  ngOnInit(): void {
    this.showDetails = this.isDevelopment();
    this.loadErrors();
  }

  private loadErrors(): void {
    this.criticalErrors = this.errorHandler.getCriticalErrors();
    this.lastErrorId = this.criticalErrors[0]?.id || "";
  }

  getMainMessage(): string {
    if (this.criticalErrors.length === 0) {
      return "L'applicazione ha riscontrato un errore imprevisto.";
    }

    const hasApiCatalogError = this.criticalErrors.some(
      (e) =>
        e.context?.includes("API Catalog") ||
        e.context?.includes("Initialization")
    );

    if (hasApiCatalogError) {
      return "L'applicazione non è riuscita ad inizializzarsi correttamente.";
    }

    return "L'applicazione ha riscontrato un errore critico e non può continuare.";
  }

  getSubMessage(): string {
    const hasApiCatalogError = this.criticalErrors.some(
      (e) =>
        e.context?.includes("API Catalog") ||
        e.context?.includes("Initialization")
    );

    if (hasApiCatalogError) {
      return "I servizi necessari non sono disponibili. Verifica la connessione e riprova.";
    }

    return "Ti consigliamo di ricaricare l'applicazione o contattare il supporto.";
  }

  trackByErrorId(index: number, error: AppError): string {
    return error.id;
  }

  onInfoTap(): void {
    this.tapCount++;

    if (this.tapTimer) {
      clearTimeout(this.tapTimer);
    }

    if (this.tapCount >= this.TAP_THRESHOLD) {
      this.tapCount = 0;
      this.showDetails = true;
      this.detailsExpanded = true;
      return;
    }

    this.tapTimer = setTimeout(() => {
      this.tapCount = 0;
    }, this.TAP_TIMEOUT_MS);
  }

  closeDetails(): void {
    this.detailsExpanded = false;
    if (!this.isDevelopment()) {
      this.showDetails = false;
    }
  }

  reloadApp(): void {
    this.errorHandler.clearErrors();
    this.router.navigate(["/home"]);
  }

  exportErrors(): void {
    try {
      const errorData = {
        timestamp: new Date().toISOString(),
        criticalErrors: this.criticalErrors,
        allErrors: this.errorHandler.getErrors(),
      };

      const dataStr = JSON.stringify(errorData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(dataBlob);
      link.download = `error-log-${Date.now()}.json`;
      link.click();

      URL.revokeObjectURL(link.href);
    } catch (e) {
      console.error("Impossibile esportare errori:", e);
    }
  }

  private isDevelopment(): boolean {
    return (
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname.includes("dev")
    );
  }
}
