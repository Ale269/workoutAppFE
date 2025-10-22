import { Injectable } from "@angular/core";
import { ApiCatalogService } from "./api-catalog.service";
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import {
  GetListaTemplatesSchedaRequestModel,
  GetListaTemplatesSchedaResponseModel,
} from "src/app/models/lista-template-schede/get-lista-templates-schede";
import {
  GetDatiTemplateSchedaRequestModel,
  GetDatiTemplateSchedaResponseModel,
} from "src/app/models/view-modifica-scheda/getDatiTemplateScheda";
import {
  SaveDatiTemplateSchedaRequestModel,
  SaveDatiTemplateSchedaResponseModel,
} from "src/app/models/view-modifica-scheda/saveDatiTemplateScheda";
import {
  DeleteDatiTemplateSchedaRequestModel,
  DeleteDatiTemplateSchedaResponseModel
} from "../../models/view-modifica-scheda/deleteDatiTemplateScheda";
import { GetListaAllenamentiSvoltiRequestModel, GetListaAllenamentiSvoltiResponseModel } from "src/app/models/lista-allenamenti-svolti/get-lista-templates-schede";
import { GetDatiAllenamentoRequestModel, GetDatiAllenamentoResponseModel } from "src/app/models/view-modifica-allenamento-svolto/get-dati-allenamento";
import { GetDatiTemplateNuovoAllenamentoRequestModel, GetDatiTemplateNuovoAllenamentoResponseModel } from "src/app/models/view-modifica-allenamento-svolto/get-dati-template-nuovo-allenamento";

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

  editTemplateScheda(
    request: SaveDatiTemplateSchedaRequestModel
  ): Observable<SaveDatiTemplateSchedaResponseModel> {
    return this.apiCatalogService.executeApiCall(
      "workout",
      "editTemplateScheda",
      undefined,
      request
    );
  }

  addTemplateScheda(
    request: SaveDatiTemplateSchedaRequestModel
  ): Observable<SaveDatiTemplateSchedaResponseModel> {
    return this.apiCatalogService.executeApiCall(
      "workout",
      "addTemplateScheda",
      undefined,
      request
    );
  }


  deleteTemplateScheda(
      request: DeleteDatiTemplateSchedaRequestModel
  ): Observable<DeleteDatiTemplateSchedaResponseModel> {

    return this.apiCatalogService.executeApiCall(
        "workout",
        "deleteTemplateScheda",
        request,
        undefined
    )
  }
  
  getDatiAllenamento(
      request: GetDatiAllenamentoRequestModel
  ): Observable<GetDatiAllenamentoResponseModel> {
    return this.apiCatalogService.executeApiCall(
        "workout",
        "getDatiAllenamento",
        request,
        null
    )
  }

  getDatiTemplateNuovoAllenamento(
      request: GetDatiTemplateNuovoAllenamentoRequestModel
  ): Observable<GetDatiTemplateNuovoAllenamentoResponseModel> {

    return this.apiCatalogService.executeApiCall(
        "workout",
        "getDatiTemplateNuovoAllenamento",
        request,
        null
    )

  }

   getListaAllenamentiSvolti(
    request: GetListaAllenamentiSvoltiRequestModel
  ): Observable<GetListaAllenamentiSvoltiResponseModel> {
    return this.apiCatalogService.executeApiCall(
      "workout",
      "getAllenamentiSvolti",
      request,
      null
    );
  }

}
