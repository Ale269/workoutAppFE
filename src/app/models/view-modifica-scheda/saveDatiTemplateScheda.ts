import { BaseResponseModel } from "../base-response/base-response";
import { SchedaDTO } from "./schedadto";

export interface SaveDatiTemplateSchedaRequestModel {
  userId: number;
  schedaDTO: SchedaDTO;
}

export interface SaveDatiTemplateSchedaResponseModel extends BaseResponseModel {
  datiScheda: SchedaDTO;
}
