import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import {
  Observable,
  BehaviorSubject,
  throwError,
  filter,
  take,
  switchMap,
} from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { environment } from "../../../environments/environment"; // Importa l'oggetto environment
import { ApiCatalog } from "src/app/models/api-catalog/api-catalog.model";

@Injectable({
  providedIn: "root",
})
export class ApiCatalogService {
  private apiCatalogSubject = new BehaviorSubject<ApiCatalog | null>(null);
  public apiCatalog$ = this.apiCatalogSubject.asObservable(); // Observable pubblico per accedere al catalogo
  public baseUrl: string = "";

  // Aggiungiamo un BehaviorSubject per segnalare quando il ProductService è pronto ad eseguire chiamate
  public isReadySubject = new BehaviorSubject<boolean>(false);
  public isReady$ = this.isReadySubject.asObservable(); // Observable pubblico

  constructor(private http: HttpClient) {
    this.loadApiCatalog(); // Carica il catalogo all'inizializzazione del servizio
  }

  private loadApiCatalog(): void {
    const catalogPath = environment.apiCatalogPath; // Ottieni il percorso dall'ambiente corrente
    console.log(`LOADAPI - Caricamento API Catalog da: ${catalogPath}`);

    this.http
      .get<ApiCatalog>(catalogPath)
      .pipe(
        tap((catalog) => {
          this.apiCatalogSubject.next(catalog);
          console.log("LOADAPI - Catalog caricato con successo:", catalog);
          this.getDefaults(catalog);
        }),
        catchError((error) => {
          console.error(
            `Errore durante il caricamento dell'API Catalog da ${catalogPath}:`,
            error
          );
          this.apiCatalogSubject.next(null); // Imposta a null in caso di errore
          return throwError(
            () => new Error("Impossibile caricare il catalogo API.")
          );
        })
      )
      .subscribe();
  }

  // Metodo per ottenere un endpoint specifico (opzionale, ma utile)
  getEndpoint(catalog: any, apiName: string, nameKey: string): any {
    //const catalog: any = this.apiCatalogSubject.getValue();


    const apiCall = catalog.apis[apiName];
    if (!apiCall) {
      return undefined;
    }
    for (const apiObject of apiCall) {
      if (apiObject.name === nameKey) {
        return apiObject;
      }
    }
    return undefined;
  }

  getDefaults(catalog: ApiCatalog) {
    let url =
      catalog.defaults.protocol +
      "://" +
      catalog.defaults.host +
      catalog.defaults.baseUrl;
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
   * Esegue una chiamata API, gestendo automaticamente i mock se configurati.
   * @param endpointKey La chiave dell'endpoint nel catalogo (es. 'products.allUserWorkout').
   * @param pathParams Parametri dinamici per l'URL (es. { id: 123 } per products.getById).
   * @param body Il corpo della richiesta per POST/PUT.
   * @returns Un Observable con la risposta dell'API o del mock.
   */
  executeWhenReady(
    apiName: string,
    nameKey: string,
    pathParams?: { [key: string]: any },
    body?: any
  ): Observable<any> {

    return this.apiCatalog$.pipe(
        filter(catalog => !!catalog),
        take(1),

        switchMap(catalog => {

          //const endpointObject = this.getEndpointFromCatalog(catalog, apiName, nameKey);
          const endpointObject = this.getEndpoint(catalog, apiName, nameKey);

          //console.log("PARAMS: ", apiName,nameKey,pathParams,body)
          //console.log("ENDPOINT ", endpointObject);

          if (!endpointObject) {
            return throwError(() => new Error(`Endpoint non trovato per '${nameKey}'`));
          }

          let baseUrl = this.baseUrl + endpointObject?.endpoint;
          //TODO
          //da fixare - la baseUrl viene caricata piu tardi, e la url finale viene composta male
          //forzato per ora con host statico
          let baseUrl2 = "http://localhost:8080/api" + endpointObject?.endpoint;

          console.log("BASEURL ENDPOINT: ", baseUrl2);

          // Se l'endpoint è mockato e siamo in un ambiente di sviluppo/test
          if (endpointObject.isMocked && !environment.production) {
            // Assicurati di mockare solo fuori dalla produzione

            // Ricorda che 'assets' è la radice quando Angular serve i file
            var fullMockPath = `/assets/recollect/mock/${apiName}/`; // '/assets/recollect' + '/api-mock/products/get-all.json'

            // Gestione dei parametri dinamici per URL mockati (es. products/get-by-id/:id)
            if (pathParams && Object.keys(pathParams).length > 0) {
              for (const key in pathParams) {
                if (pathParams.hasOwnProperty(key)) {
                  // Esempio semplice: aggiungi l'ID alla fine del percorso base
                  fullMockPath = `${fullMockPath}${nameKey}/${pathParams[key]}/${endpointObject.method}.json`;
                }
              }
            } else if (!pathParams) {
              //non contengo parametri opzionali, vado di url diretta
              fullMockPath = `${fullMockPath}${nameKey}/${endpointObject.method}.json`;
            } else if (nameKey.includes("/id") && !pathParams) {
              // Fallback per getById se non viene fornito un ID, potremmo usare un mock di default
              //mockUrl = `${mockUrl}default.json`;
              console.warn("NON HAI PASSATO I PARAMETRI");
            } else {
              console.warn("ERRORE SCONOSCIUTO");
            }
            console.log(`MOCKED URL FINAL: ${fullMockPath}`);
            return this.http.get(fullMockPath);
          } else {
            // Altrimenti, esegui la vera chiamata API

            // Sostituzione dei parametri nell'URL reale (es. /products/:id)
            if (pathParams) {
              for (const key in pathParams) {
                if (pathParams.hasOwnProperty(key)) {
                  //prende l oggetto tipo api/workout/:{workoutId} nel file api.json e lo sostituisce
                  // con pathprams vero -> api/workout/1
                  baseUrl2 = baseUrl2.replace(`:${key}`, pathParams[key]);
                }
              }
            }
            console.log("ENDPOINT FINALE: ",endpointObject)
            console.log("BODY FINALE: ",body)
            console.log(`FACCIO CHIAMATA VERA per ${baseUrl2}`);
            var request = this.http.request(endpointObject.method, baseUrl2, {body: body});
            //var request = this.http.post(baseUrl2, body);
            console.log("REQUEST: ", request);
            return request;
          }
        })
    );
  }
}
