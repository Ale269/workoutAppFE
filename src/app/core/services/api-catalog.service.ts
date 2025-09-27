import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import {
  Observable,
  BehaviorSubject,
  throwError,
  filter,
  take,
  switchMap,
  of,
  EMPTY
} from "rxjs";
import { catchError, tap, shareReplay } from "rxjs/operators";
import { environment } from "../../../environments/environment";
import { ApiCatalog } from "src/app/models/api-catalog/api-catalog.model";

@Injectable({
  providedIn: "root",
})
export class ApiCatalogService {
  private apiCatalogSubject = new BehaviorSubject<ApiCatalog | null>(null);
  public apiCatalog$ = this.apiCatalogSubject.asObservable();
  public baseUrl: string = "";
  private isInitialized: boolean = false;
  
  // Observable che rappresenta lo stato di inizializzazione
  private initializationPromise: Observable<ApiCatalog> | null = null;

  constructor(private http: HttpClient) {
    //loadApiCatalog sarà chiamato on-demand
  }

  
  private ensureInitialized(): Observable<ApiCatalog> {
    // Se già inizializzato, restituisci il catalog corrente
    if (this.isInitialized && this.apiCatalogSubject.value) {
      return of(this.apiCatalogSubject.value);
    }

    // Se l'inizializzazione è già in corso, restituisci la stessa Promise
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    // Avvia l'inizializzazione
    console.log(`🚀 Avvio inizializzazione ApiCatalogService...`);
    
    const catalogPath = environment.apiCatalogPath;
    console.log(`LOADAPI - Caricamento API Catalog da: ${catalogPath}`);

    this.initializationPromise = this.http.get<ApiCatalog>(catalogPath).pipe(
      tap((catalog) => {
        console.log("✅ LOADAPICATALOG - Catalog caricato con successo:", catalog);
        this.apiCatalogSubject.next(catalog);
        this.initializeBaseUrl(catalog);
        this.isInitialized = true;
        console.log("✅ LOADAPICATALOG - Inizializzato BaseUrl:", this.baseUrl);
      }),
      catchError((error) => {
        console.error(`❌ Errore durante il caricamento dell'API Catalog da ${catalogPath}:`, error);
        this.apiCatalogSubject.next(null);
        this.initializationPromise = null; // Reset per permettere retry
        this.isInitialized = false;
        return throwError(() => new Error("Impossibile caricare il catalogo API."));
      }),
      shareReplay(1) // Cache il risultato per chiamate multiple simultanee
    );

    return this.initializationPromise;
  }

  /**
   * Metodo pubblico per forzare l'inizializzazione
   * Utile per pre-caricare il servizio
   */
  public initialize(): Observable<ApiCatalog> {
    return this.ensureInitialized();
  }

  getEndpoint(catalog: any, apiName: string, nameKey: string): any {
    const apiCall = catalog.apis[apiName];
    if (!apiCall) {
      return undefined;
    }
    return apiCall.find((x: { name: string }) => x.name === nameKey);
  }

  private initializeBaseUrl(catalog: ApiCatalog) {
    let url = catalog.defaults.protocol + "://" + catalog.defaults.host + catalog.defaults.baseUrl;
    this.baseUrl = url;
    console.log("BASEURL: ", url);
  }

  // Questo metodo è un wrapper che attende che il servizio sia pronto prima di fare la chiamata
  executeApiCall<T>(
    apiName: string,
    nameKey: string,
    pathParams?: { [key: string]: any },
    body?: any
  ): Observable<T> {
    return this.executeWhenReady(apiName, nameKey, pathParams, body);
  }

  /**
   * Esegue una chiamata API, garantendo che il servizio sia inizializzato
   */
  executeWhenReady(
    apiName: string,
    nameKey: string,
    pathParams?: { [key: string]: any },
    body?: any
  ): Observable<any> {

    // Prima assicurati che il servizio sia inizializzato
    return this.ensureInitialized().pipe(
      tap((catalog) => {
      }),
      switchMap((catalog) => {
        const endpointObject = this.getEndpoint(catalog, apiName, nameKey);

        if (!endpointObject) {
          return throwError(() => new Error(`Endpoint non trovato per '${nameKey}'`));
        }

        if (this.baseUrl === "") {
          return throwError(() => new Error(`executeWhenReady -> Base Url non valorizzato. Impossibile procedere.`));
        }

        let fullUrl = this.baseUrl + endpointObject?.endpoint;
        console.log("BASEURL ENDPOINT: ", fullUrl);

        // Se l'endpoint è mockato e siamo in un ambiente di sviluppo/test
        if (endpointObject.isMocked && !environment.production) {
          var fullMockPath = `/assets/recollect/mock/${apiName}/`;

          // Gestione dei parametri dinamici per URL mockati
          if (pathParams && Object.keys(pathParams).length > 0) {
            for (const key in pathParams) {
              if (pathParams.hasOwnProperty(key)) {
                fullMockPath = `${fullMockPath}${nameKey}/${pathParams[key]}/${endpointObject.method}.json`;
              }
            }
          } else if (!pathParams) {
            fullMockPath = `${fullMockPath}${nameKey}/${endpointObject.method}.json`;
          } else if (nameKey.includes("/id") && !pathParams) {
            console.warn("NON HAI PASSATO I PARAMETRI");
          } else {
            console.warn("ERRORE SCONOSCIUTO");
          }
          
          console.log(`MOCKED URL FINAL: ${fullMockPath}`);
          return this.http.get(fullMockPath);
        } else {
          // Chiamata API reale
          if (pathParams) {
            for (const key in pathParams) {
              if (pathParams.hasOwnProperty(key)) {
                console.log("PATH PARAM KEY: ", key);
                console.log("PATH PARAMS value: ", pathParams[key]);
                fullUrl = fullUrl.replace(`:${key}`, pathParams[key]);
              }
            }
          }
          
          console.log("ENDPOINT FINALE: ", endpointObject);
          console.log("BODY FINALE: ", body);
          console.log(`FACCIO CHIAMATA VERA per ${fullUrl}`);
          
          const request = this.http.request(endpointObject.method, fullUrl, { body: body });
          console.log("REQUEST: ", request);
          return request;
        }
      }),
      catchError((error) => {
        console.error("❌ Errore in executeWhenReady:", error);
        return throwError(() => error);
      })
    );
  }
}