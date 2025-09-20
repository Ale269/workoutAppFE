import { BaseResponseModel } from "../../base-response/base-response";
import { ultimiAllenamentiSvoltiDTO } from "./allenamentiSvolti";

export interface GetDatiUltimiAllenamentiSvoltiRequestModel {
  idUser: number;
}

export interface GetDatiUltimiAllenamentiSvoltiResponseModel
  extends BaseResponseModel {
 ultimiAllenamentiSvoltiDTO : ultimiAllenamentiSvoltiDTO[];
}
