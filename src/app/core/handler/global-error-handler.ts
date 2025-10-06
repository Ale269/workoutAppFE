import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import {AuthService} from "../services/auth.service";

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  
  constructor(
      private injector: Injector,
      private authService: AuthService) {}

  handleError(error: any): void {
    // Ottieni il router in modo lazy per evitare dipendenze circolari
    const router = this.injector.get(Router);
    
    console.error('Errore globale catturato:', error);

    if (error instanceof HttpErrorResponse) {
      // Gestisci errori HTTP
      this.handleHttpError(error, router);
    } else {
      // Gestisci errori JavaScript/TypeScript
      // al momemento disattivato per poter catturare errori solo http (se 401 navigate to login)
      //this.handleClientError(error, router);
    }
  }

  private handleHttpError(error: HttpErrorResponse, router: Router): void {
    let errorMessage = 'Si è verificato un errore di rete';
    
    switch (error.status) {
      case 0:
        errorMessage = 'Impossibile connettersi al server. Verifica la connessione internet.';
        break;
      case 400:
        errorMessage = 'Richiesta non valida';
        break;
      case 401:
        errorMessage = 'Non autorizzato. Effettua il login.';
        this.authService.logout();
        break;
      case 403:
        errorMessage = 'Accesso negato';
        break;
      case 404:
        errorMessage = 'Risorsa non trovata';
        break;
      case 500:
        errorMessage = 'Errore interno del server';
        break;
      case 503:
        errorMessage = 'Servizio non disponibile';
        break;
      default:
        errorMessage = `Errore HTTP ${error.status}: ${error.message}`;
    }

    console.error(`Errore HTTP ${error.status}:`, errorMessage);
    
    // Qui puoi aggiungere la logica per mostrare un toast, modal, ecc.
    this.showErrorToUser(errorMessage);
    
    // Opzionalmente, invia l'errore a un servizio di logging
    // this.logErrorToService(error);
  }

  private handleClientError(error: Error, router: Router): void {
    const errorMessage = error.message || 'Si è verificato un errore imprevisto';
    
    console.error('Errore client:', errorMessage);
    console.error('Stack trace:', error.stack);
    
    // Mostra errore all'utente
    this.showErrorToUser('Si è verificato un errore imprevisto. Riprova più tardi.');
    
    // Opzionalmente, invia l'errore a un servizio di logging
    // this.logErrorToService(error);
  }

  private showErrorToUser(message: string): void {
    // Implementa la logica per mostrare l'errore all'utente
    // Esempi:
    // - Toast notification
    // - Modal dialog
    // - Snackbar (se usi Angular Material)
    // - Alert browser (temporaneo)
    
    // Esempio con alert browser (da sostituire con una soluzione migliore)
    alert(message);
    
    // Esempio con console per il debug
    console.warn('Messaggio per l\'utente:', message);
  }

  // private logErrorToService(error: any): void {
  //   // Implementa la logica per inviare l'errore a un servizio di logging
  //   // Esempi:
  //   // - Sentry
  //   // - LogRocket
  //   // - Servizio di logging personalizzato
  //   // - Google Analytics Events
    
  //   // Esempio di struttura per il logging
  //   const errorInfo = {
  //     timestamp: new Date().toISOString(),
  //     url: window.location.href,
  //     userAgent: navigator.userAgent,
  //     error: {
  //       message: error.message,
  //       stack: error.stack,
  //       name: error.name
  //     }
  //   };
    
  //   console.log('Errore da inviare al servizio di logging:', errorInfo);
    
  //   // Qui faresti una chiamata HTTP al tuo servizio di logging
  //   // this.loggingService.logError(errorInfo);
  // }
}