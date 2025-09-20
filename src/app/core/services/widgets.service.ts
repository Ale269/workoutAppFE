import { Injectable } from "@angular/core";
import { ApiCatalogService } from "./api-catalog.service";
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { GetDatiProssimoAllenamentoRequestModel, GetDatiProssimoAllenamentoResponseModel } from "src/app/models/widgets/prossimo-allenamento/getDatiProssimoAllenamento";
import { GetDatiSchedaCorrenteRequestModel, GetDatiSchedaCorrenteResponseModel } from "src/app/models/widgets/scheda-corrente/getDatiSchedaCorrente";
import { GetDatiUltimiAllenamentiSvoltiRequestModel, GetDatiUltimiAllenamentiSvoltiResponseModel } from "src/app/models/widgets/ultimi-allenamenti-svolti/getDatiUltimiAllenamentiSvolti";

@Injectable({
  providedIn: "root",
})
export class WidgetsService {
  constructor(
    private router: Router,
    private apiCatalogService: ApiCatalogService
  ) {}

  getDatiProssimoAllenamento(
    request: GetDatiProssimoAllenamentoRequestModel
  ): Observable<GetDatiProssimoAllenamentoResponseModel> {
    return this.apiCatalogService.executeApiCall(
      "widgets",
      "prossimoAllenamento",
      request,
      null
    );
  }
  getDatiSchedaCorrente(
    request: GetDatiSchedaCorrenteRequestModel
  ): Observable<GetDatiSchedaCorrenteResponseModel> {
    return this.apiCatalogService.executeApiCall(
      "widgets",
      "schedaCorrente",
      request,
      null
    );
  }
  getDatiUltimiAllenamentiSvolti(
    request: GetDatiUltimiAllenamentiSvoltiRequestModel
  ): Observable<GetDatiUltimiAllenamentiSvoltiResponseModel> {
    return this.apiCatalogService.executeApiCall(
      "widgets",
      "ultimiAllenamentiSvolti",
      request,
      null
    );
  }
}
