import { CommonResponseModel } from "./common-response-status";

export interface BaseResponseModel {
  id: string;
  errore: CommonResponseModel;
}
