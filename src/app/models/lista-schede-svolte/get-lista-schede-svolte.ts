import { BaseResponseModel } from "../base-response/base-response";
import { SchedaListaDTO } from "./schedalistadto";

export interface GetListaSchedeSvolteRequestModel {
  userId: number;
}

export interface GetListaSchedeSvolteResponseModel extends BaseResponseModel {
  listaSchedeDTO: SchedaListaDTO[];
}
