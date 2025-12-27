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
import { DeleteDatiAllenamentoRequestModel } from "src/app/models/view-modifica-allenamento-svolto/deleteDatiAllenamentoSvolto";
import {
  RegistraAllenamentoRequestModel,
  RegistraAllenamentoResponseModel
} from "../../models/view-modifica-allenamento-svolto/registra-allenaneto";
import { AttivaSchedaRequestModel, AttivaSchedaResponseModel } from "src/app/models/view-modifica-scheda/attivaScheda";
import {DownloadSchedaRequestModel} from "../../models/view-modifica-scheda/downloadScheda";

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
        "training",
        "getDatiAllenamento",
        request,
        null
    )
  }

  getDatiTemplateNuovoAllenamento(
      request: GetDatiTemplateNuovoAllenamentoRequestModel
  ): Observable<GetDatiTemplateNuovoAllenamentoResponseModel> {

    return this.apiCatalogService.executeApiCall(
        "training",
        "getDatiTemplateNuovoAllenamento",
        request,
        null
    )

  }

   getListaAllenamentiSvolti(
    request: GetListaAllenamentiSvoltiRequestModel
  ): Observable<GetListaAllenamentiSvoltiResponseModel> {
    return this.apiCatalogService.executeApiCall(
      "training",
      "getAllenamentiSvolti",
      request,
      null
    );
  }
   deleteDatiAllenamentoSvolto(
    request: DeleteDatiAllenamentoRequestModel
  ): Observable<GetDatiAllenamentoResponseModel> {
    return this.apiCatalogService.executeApiCall(
      "training",
      "deleteDatiAllenamentoSvolto",
      request,
      undefined
    );
  }


  registraNuovoAllenamento(
      request: RegistraAllenamentoRequestModel
  ): Observable<RegistraAllenamentoResponseModel> {
    return this.apiCatalogService.executeApiCall(
        "training",
        "registraNuovoAllenamento",
        undefined,
        request
    );
  }

  
  attivaScheda(
      request: AttivaSchedaRequestModel
  ): Observable<AttivaSchedaResponseModel> {
    return this.apiCatalogService.executeApiCall(
        "workout",
        "enableWorkout",
        undefined,
        request
    );
  }

  getGuidaImport(): Observable<AttivaSchedaResponseModel> {
    return this.apiCatalogService.executeApiCall(
      "workout",
      "getImportExcelGuide",
      undefined,
      undefined
    );
  }

  importaScheda(): Observable<AttivaSchedaResponseModel> {
    return this.apiCatalogService.executeApiCall(
      "workout",
      "importWorkout",
      undefined,
      undefined
    );
  }

  esportaScheda(
    request: DownloadSchedaRequestModel
  ): Observable<any> {
    return this.apiCatalogService.executeApiCall(
      "workout",
      "exportWorkout",
      request,
      undefined
    );
  }

}
