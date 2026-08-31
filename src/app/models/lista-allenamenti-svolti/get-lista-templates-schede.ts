import { BaseResponseModel } from "../base-response/base-response";
import { AllenamentoSvoltoListaDTO } from "./allenamentosvoltolistadto";
import { PaginazioneDTO } from "../paginazione/paginazione";

export interface GetListaAllenamentiSvoltiRequestModel {
  userId: number;
}

export interface GetListaAllenamentiSvoltiResponseModel extends BaseResponseModel {
  listaAllenamentiDTO: AllenamentoSvoltoListaDTO[];
  /** Presente solo sulla variante paginata dell'endpoint. */
  paginazione?: PaginazioneDTO;
}

export interface GetListaAllenamentiSvoltiPaginataRequestModel {
  userId: number;
  page: number;
  size: number;
}
