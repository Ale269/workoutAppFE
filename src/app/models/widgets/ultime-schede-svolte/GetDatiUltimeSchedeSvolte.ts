import { BaseResponseModel } from "../../base-response/base-response";
import { ultimeSchedeSvolteDTO } from "./ultimeSchedeSvolte";

export interface GetDatiUltimeSchedeSvolteRequestModel {
    userId: number;
}

export interface GetDatiUltimeSchedeSvolteResponseModel
  extends BaseResponseModel {
 ultimeSchedeSvolteDTO : ultimeSchedeSvolteDTO[];
}
