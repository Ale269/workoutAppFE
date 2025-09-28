import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import {
  Observable,
  BehaviorSubject,
  throwError,
} from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { environment } from "../../../environments/environment";
import { ApiCatalog } from "src/app/models/api-catalog/api-catalog.model";
import { ErrorHandlerService } from "./error-handler.service";

@Injectable({
  providedIn: "root",
})
export class ApiCatalogService {
  private apiCatalogSubject = new BehaviorSubject<ApiCatalog | null>(null);
  public apiCatalog$ = this.apiCatalogSubject.asObservable();
  public baseUrl: string = "";

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  /**
   * Metodo chiamato da APP_INITIALIZER per caricare il catalogo all'avvio
   */
  public loadApiCatalog(): Observable<ApiCatalog> {
    const catalogPath = environment.apiCatalogPath;
    console.log(`🚀 Caricamento API Catalog da: ${catalogPath}`);

    return this.http.get<ApiCatalog>(catalogPath).pipe(
      tap((catalog) => {
        this.apiCatalogSubject.next(catalog);
        this.initializeBaseUrl(catalog);
        console.log("✅ API Catalog caricato - BaseUrl:", this.baseUrl);
      }),
      catchError((error) => {
        console.error(`❌ Errore caricamento API Catalog da ${catalogPath}:`, error);
        
        // ERRORE CRITICO: app non può funzionare senza catalog
        this.errorHandler.pushCriticalError(
          error, 
          'API Catalog Initialization Failed',
          { catalogPath, errorType: 'InitializationFailure' }
        );

        this.apiCatalogSubject.next(null);
        
        return throwError(() => new Error(`Impossibile caricare il catalogo API da ${catalogPath}`));
      })
    );
  }

  /**
   * Ottiene il catalogo API caricato
   */
  public getApiCatalog(): ApiCatalog | null {
    const catalog = this.apiCatalogSubject.value;
    
    if (!catalog) {
      this.errorHandler.pushError(
        new Error('API Catalog non inizializzato'),
        { 
          type: 'Runtime', 
          context: 'getApiCatalog',
          isCritical: true  // Critico perché senza catalog non funziona nulla
        }
      );
    }
    
    return catalog;
  }

  getEndpoint(catalog: any, apiName: string, nameKey: string): any {
    const apiCall = catalog?.apis?.[apiName];
    
    if (!apiCall) {
      this.errorHandler.pushError(
        new Error(`API '${apiName}' non trovata nel catalogo`),
        {
          type: 'Runtime',
          context: 'getEndpoint',
          isCritical: false, // Non critico, solo API specifica mancante
          metadata: { apiName, nameKey }
        }
      );
      return undefined;
    }

    const endpoint = apiCall.find((x: { name: string }) => x.name === nameKey);
    
    if (!endpoint) {
      this.errorHandler.pushError(
        new Error(`Endpoint '${nameKey}' non trovato in API '${apiName}'`),
        {
          type: 'Runtime', 
          context: 'getEndpoint',
          isCritical: false,
          metadata: { apiName, nameKey }
        }
      );
    }

    return endpoint;
  }

  private initializeBaseUrl(catalog: ApiCatalog) {
    try {
      if (!catalog?.defaults?.protocol || !catalog?.defaults?.host) {
        throw new Error('Configurazione defaults incompleta nel catalogo API');
      }

      this.baseUrl = catalog.defaults.protocol + "://" + catalog.defaults.host + (catalog.defaults.baseUrl || '');
      console.log("✅ Base URL inizializzato:", this.baseUrl);
      
    } catch (error) {
      // CRITICO: senza base URL non possiamo fare chiamate
      this.errorHandler.pushCriticalError(
        error,
        'BaseURL Initialization Failed',
        { catalog: !!catalog, defaults: catalog?.defaults }
      );
      
      this.baseUrl = "";
      throw error;
    }
  }

  /**
   * Esegue una chiamata API
   */
  executeApiCall<T>(
    apiName: string,
    nameKey: string,
    pathParams?: { [key: string]: any },
    body?: any
  ): Observable<T> {
    
    const catalog = this.getApiCatalog();
    if (!catalog) {
      return throwError(() => new Error('API Catalog non disponibile'));
    }

    if (!this.baseUrl) {
      this.errorHandler.pushCriticalError(
        new Error('Base URL non valorizzato'),
        'executeApiCall'
      );
      return throwError(() => new Error('Base URL non disponibile'));
    }

    const endpointObject = this.getEndpoint(catalog, apiName, nameKey);
    if (!endpointObject) {
      return throwError(() => new Error(`Endpoint '${nameKey}' non trovato`));
    }

    // Chiamata mockata o reale
    if (endpointObject.isMocked && !environment.production) {
      return this.handleMockedCall<T>(apiName, nameKey, pathParams, endpointObject);
    } else {
      return this.handleRealApiCall<T>(endpointObject, pathParams, body, apiName, nameKey);
    }
  }

  private handleMockedCall<T>(
    apiName: string,
    nameKey: string,
    pathParams: { [key: string]: any } | undefined,
    endpointObject: any
  ): Observable<T> {
    
    let mockPath = `/assets/recollect/mock/${apiName}/${nameKey}/${endpointObject.method}.json`;
    
    // Gestione parametri per mock
    if (pathParams && Object.keys(pathParams).length > 0) {
      const paramValue = Object.values(pathParams)[0];
      mockPath = `/assets/recollect/mock/${apiName}/${nameKey}/${paramValue}/${endpointObject.method}.json`;
    }
    
    return this.http.get<T>(mockPath).pipe(
      catchError((error) => {
        this.errorHandler.pushError(error, {
          type: 'Http',
          context: 'MockedApiCall',
          isCritical: false, // Mock fallito non è critico
          metadata: { mockPath, apiName, nameKey }
        });
        return throwError(() => new Error(`File mock non trovato: ${mockPath}`));
      })
    );
  }

  private handleRealApiCall<T>(
    endpointObject: any,
    pathParams: { [key: string]: any } | undefined,
    body: any,
    apiName: string,
    nameKey: string
  ): Observable<T> {
    
    let fullUrl = this.baseUrl + endpointObject.endpoint;
    
    // Sostituisci parametri nell'URL
    if (pathParams) {
      for (const [key, value] of Object.entries(pathParams)) {
        fullUrl = fullUrl.replace(`:${key}`, String(value));
      }
    }
    
    return this.http.request<T>(endpointObject.method, fullUrl, { body }).pipe(
      catchError((error) => {
        
        // Determina se l'errore HTTP è critico
        const isCritical = error.status === 0 || error.status >= 500;
        
        this.errorHandler.pushError(error, {
          type: 'Http',
          context: 'RealApiCall',
          isCritical: isCritical,
          metadata: {
            url: fullUrl,
            method: endpointObject.method,
            status: error.status,
            apiName,
            nameKey
          }
        });
        
        const message = error.status 
          ? `HTTP ${error.status}: ${error.statusText || error.message}`
          : `Errore di rete: ${error.message}`;
          
        return throwError(() => new Error(message));
      })
    );
  }
}