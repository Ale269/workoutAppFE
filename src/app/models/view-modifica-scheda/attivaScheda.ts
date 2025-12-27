import { BaseResponseModel } from "../base-response/base-response";

export interface AttivaSchedaRequestModel {
  idScheda: number;
  userId: number;
}

export interface AttivaSchedaResponseModel extends BaseResponseModel {}
