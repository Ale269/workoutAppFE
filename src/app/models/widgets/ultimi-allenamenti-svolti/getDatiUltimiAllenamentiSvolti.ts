import { BaseResponseModel } from "../../base-response/base-response";
import { ultimiAllenamentiSvoltiDTO } from "./allenamentiSvolti";

export interface GetDatiUltimiAllenamentiSvoltiRequestModel {
    userId: number;
}

export interface GetDatiUltimiAllenamentiSvoltiResponseModel
  extends BaseResponseModel {
 ultimiAllenamentiSvoltiDTO : ultimiAllenamentiSvoltiDTO[];
}
