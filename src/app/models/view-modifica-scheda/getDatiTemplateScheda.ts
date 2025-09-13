import { BaseResponseModel } from "../base-response/base-response";
import { SchedaDTO } from "./schedadto";

export interface GetDatiTemplateSchedaRequestModel {
  workoutId: number;
}

export interface GetDatiTemplateSchedaResponseModel extends BaseResponseModel {
  datiScheda: SchedaDTO;
}
