import { Injectable } from "@angular/core";
import { ApiCatalogService } from "./api-catalog.service";
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { SchedaDTO } from "../../models/view-modifica-scheda/schedadto";
import { GetListaTemplatesSchedaRequestModel, GetListaTemplatesSchedaResponseModel } from "src/app/models/lista-template-schede/get-lista-templates-schede";
import { GetDatiTemplateSchedaRequestModel, GetDatiTemplateSchedaResponseModel } from "src/app/models/view-modifica-scheda/getDatiTemplateScheda";

@Injectable({
  providedIn: "root",
})
export class WorkoutService {
  constructor(
    private router: Router,
    private apiCatalogService: ApiCatalogService
  ) {}

  getDatiTemplateScheda(
    request: GetDatiTemplateSchedaRequestModel
  ): Observable<GetDatiTemplateSchedaResponseModel> {
    return this.apiCatalogService.executeApiCall(
      "workout",
      "singleUserWorkout",
      request,
      null
    );
  }

  getListaTemplatesScheda(
    request: GetListaTemplatesSchedaRequestModel
  ): Observable<GetListaTemplatesSchedaResponseModel> {
    return this.apiCatalogService.executeApiCall(
      "workout",
      "getTemplatesSchede",
      request,
      null
    );
  }
}
