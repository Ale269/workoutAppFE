import { BaseResponseModel } from "../base-response/base-response";
import {SchedaDTO} from "./schedadto";

export interface AttivaSchedaRequestModel {
  userId: number;
  schedaDTO: SchedaDTO
}

export interface AttivaSchedaResponseModel extends BaseResponseModel {}
