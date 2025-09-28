import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";

export type AppError = {
  id: string;
  timestamp: string;
  type?: string; // 'Http' | 'Runtime' | 'Network'
  isCritical: boolean; // SEMPLICE: true = critico, false = normale
  context?: string;
  message: string;
  stack?: string;
  url?: string;
  userAgent?: string;
  resolved?: boolean;
  resolvedAt?: string;
  metadata?: Record<string, any>;
};

@Injectable({
  providedIn: "root",
})
export class ErrorHandlerService {
  private errors: AppError[] = [];
  private readonly maxErrors = 100;
  private errorObservers: ((error: AppError) => void)[] = [];

  constructor() {}

  // Metodo principale per aggiungere errori
  pushError(
    error: any, 
    opts?: { 
      type?: string; 
      context?: string; 
      isCritical?: boolean;
      metadata?: Record<string, any>;
    }
  ): string {
    const id = this.generateId();
    const timestamp = new Date().toISOString();
    
    const appError: AppError = {
      id,
      timestamp,
      type: opts?.type ?? "Runtime",
      isCritical: opts?.isCritical ?? this.isCriticalError(error, opts?.type),
      context: opts?.context,
      message: error?.message ?? (typeof error === "string" ? error : "Errore sconosciuto"),
      stack: error?.stack,
      url: typeof window !== "undefined" ? window.location.href : undefined,
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
      resolved: false,
      metadata: opts?.metadata,
    };

    this.errors.unshift(appError);
    
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors);
    }

    this.notifyObservers(appError);

    // if (!environment.production) {
    //   const level = appError.isCritical ? '🔥 CRITICAL' : '⚠️ ERROR';
    //   console.error(`${level}:`, appError);
    // }

    return id;
  }

  // Helper per errori critici
  pushCriticalError(error: any, context?: string, metadata?: Record<string, any>): string {
    return this.pushError(error, { 
      isCritical: true, 
      context, 
      metadata,
      type: 'Critical'
    });
  }

  // Ottieni tutti gli errori
  getErrors(): AppError[] {
    return [...this.errors];
  }

  // Ottieni solo errori critici non risolti
  getCriticalErrors(): AppError[] {
    return this.errors.filter(error => error.isCritical && !error.resolved);
  }

  // Ottieni errori normali non risolti
  getNormalErrors(): AppError[] {
    return this.errors.filter(error => !error.isCritical && !error.resolved);
  }

  // Verifica se ci sono errori critici
  hasCriticalErrors(): boolean {
    return this.getCriticalErrors().length > 0;
  }

  getLastError(): AppError | null {
    return this.errors.length ? this.errors[0] : null;
  }

  // Risolvi errore specifico
  resolveError(id: string): boolean {
    const error = this.errors.find(e => e.id === id);
    if (error && !error.resolved) {
      error.resolved = true;
      error.resolvedAt = new Date().toISOString();
      return true;
    }
    return false;
  }

  // Risolvi tutti gli errori
  resolveAllErrors(): void {
    const now = new Date().toISOString();
    this.errors.forEach(error => {
      if (!error.resolved) {
        error.resolved = true;
        error.resolvedAt = now;
      }
    });
  }

  // Pulisci tutto
  clearErrors(): void {
    this.errors = [];
  }

  // Subscribe agli errori
  onError(callback: (error: AppError) => void): () => void {
    this.errorObservers.push(callback);
    
    return () => {
      const index = this.errorObservers.indexOf(callback);
      if (index > -1) {
        this.errorObservers.splice(index, 1);
      }
    };
  }

  // Helper per logging semplice
  handleError(error: any, context?: string): void {
    this.pushError(error, { type: "Runtime", context });
    this.notifyUser(error, context);
  }

  // Determina se un errore è critico
  private isCriticalError(error: any, type?: string): boolean {
    // Errori sempre critici
    if (type === 'Critical' || type === 'Initializing') return true;
    
    // Errori di rete (status 0 = no connection)
    if (type === 'Http' && error?.status === 0) return true;
    
    // Errori 5xx del server
    if (type === 'Http' && error?.status >= 500) return true;
    
    // Basato sul messaggio
    const message = error?.message?.toLowerCase() || '';
    if (message.includes('critical') || message.includes('fatal') || 
        message.includes('initialization') || message.includes('catalog')) return true;
    
    // Default: non critico
    return false;
  }

  private notifyObservers(error: AppError): void {
    this.errorObservers.forEach(observer => {
      try {
        observer(error);
      } catch (e) {
        console.error('Error in error observer:', e);
      }
    });
  }

  private notifyUser(error: any, context?: string): void {
    if (!environment.production) {
      console.log(`[notifyUser] ${context ?? "Errore"}: ${error?.message ?? error}`);
    }
    
    // Qui puoi integrare con servizi di notifica come:
    // - Angular Material Snackbar
    // - Toast notifications  
    // - Modal dialogs per errori critici
  }

  private generateId(): string {
    return Math.random().toString(36).slice(2, 9) + "-" + Date.now().toString(36);
  }
}