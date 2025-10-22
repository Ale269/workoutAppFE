import { BaseResponseModel } from "../base-response/base-response";
import { AllenamentoSvoltoListaDTO } from "./allenamentosvoltolistadto";

export interface GetListaAllenamentiSvoltiRequestModel {
  userId: number;
}

export interface GetListaAllenamentiSvoltiResponseModel extends BaseResponseModel {
  listaAllenamentiDTO: AllenamentoSvoltoListaDTO[];
}
