import { BaseResponseModel } from "../base-response/base-response";
import { SchedaListaDTO } from "./schedalistadto";
import { PaginazioneDTO } from "../paginazione/paginazione";

export interface GetListaTemplatesSchedaRequestModel {
  userId: number;
}

export interface GetListaTemplatesSchedaResponseModel extends BaseResponseModel {
  listaSchedeDTO: SchedaListaDTO[];
  /** Presente solo sulla variante paginata dell'endpoint. */
  paginazione?: PaginazioneDTO;
}

export interface GetListaTemplatesSchedaPaginataRequestModel {
  userId: number;
  page: number;
  size: number;
}
