import { BaseResponseModel } from "../base-response/base-response";
import { SchedaListaDTO } from "./seriedto";

export interface GetListaTemplatesSchedaRequestModel {
  userId: number;
}

export interface GetListaTemplatesSchedaResponseModel extends BaseResponseModel {
  listaSchedeDTO: SchedaListaDTO[];
}
