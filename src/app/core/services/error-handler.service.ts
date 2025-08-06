import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class ErrorHandlerService {
  constructor() {}

  handleError(error: any, context?: string): void {
    const timestamp = new Date().toISOString();
    const errorInfo = {
      timestamp,
      context,
      message: error?.message || "Errore sconosciuto",
      stack: error?.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    // 1. Log in console (solo in development)
    if (!environment.production) {
      console.error("🚨 Error:", errorInfo);
    }

    // 2. Invia al servizio di logging (Sentry, LogRocket, etc.)
    // In futuro magari
    // this.sendToLoggingService(errorInfo);

    // 3. Notifica all'utente se necessario
    this.notifyUser(error, context);
  }

  private notifyUser(error: any, context?: string): void {
    // Mostra notifica
    console.log(error.message + "->" + context);
  }
}
