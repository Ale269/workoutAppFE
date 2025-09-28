import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import {
  Observable,
  BehaviorSubject,
  throwError,
  of
} from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { environment } from "../../../environments/environment";
import { ApiCatalog } from "src/app/models/api-catalog/api-catalog.model";

@Injectable({
  providedIn: "root",
})
export class ApiCatalogService {
  private apiCatalogSubject = new BehaviorSubject<ApiCatalog | null>(null);
  public apiCatalog$ = this.apiCatalogSubject.asObservable();
  public baseUrl: string = "";

  constructor(private http: HttpClient) {
    // L'inizializzazione ora avviene tramite APP_INITIALIZER
  }

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
        console.log("✅ LOADAPICATALOG - Inizializzato BaseUrl:", this.baseUrl);
      }),
      catchError((error) => {
        console.error(`❌ Errore durante il caricamento dell'API Catalog da ${catalogPath}:`, error);
        this.apiCatalogSubject.next(null);
        return throwError(() => new Error("Impossibile caricare il catalogo API."));
      })
    );
  }

  /**
   * Ottiene il catalogo API caricato (sincrono)
   */
  public getApiCatalog(): ApiCatalog | null {
    return this.apiCatalogSubject.value;
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
  }

  /**
   * Esegue una chiamata API utilizzando il catalogo già caricato
   */
  executeApiCall<T>(
    apiName: string,
    nameKey: string,
    pathParams?: { [key: string]: any },
    body?: any
  ): Observable<T> {
    const catalog = this.getApiCatalog();

    if (!catalog) {
      return throwError(() => new Error('API Catalog non ancora inizializzato'));
    }

    if (this.baseUrl === "") {
      return throwError(() => new Error('Base URL non valorizzato. Impossibile procedere.'));
    }

    const endpointObject = this.getEndpoint(catalog, apiName, nameKey);

    if (!endpointObject) {
      return throwError(() => new Error(`Endpoint non trovato per '${nameKey}'`));
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
      return this.http.get<T>(fullMockPath);
    } else {
      // Chiamata API reale
      if (pathParams) {
        for (const key in pathParams) {
          if (pathParams.hasOwnProperty(key)) {
            console.log("PATH PARAM {KEY: {0}, VALUE: {1}}", key, pathParams[key]);
            fullUrl = fullUrl.replace(`:${key}`, pathParams[key]);
          }
        }
      }

      console.log("ENDPOINT FINALE: ", endpointObject);
      console.log("BODY FINALE: ", body);
      console.log(`FACCIO CHIAMATA VERA per ${fullUrl}`);

      const request = this.http.request<T>(endpointObject.method, fullUrl, { body: body });
      return request;
    }
  }
}