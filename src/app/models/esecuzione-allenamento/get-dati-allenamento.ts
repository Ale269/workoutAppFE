import { BaseResponseModel } from "../base-response/base-response";
import { AllenamentoDTO } from "./allenamentodto";

export interface GetDatiAllenamentoRequestModel {
  idAllenamento: number;
}

export interface GetDatiAllenamentoResponseModel extends BaseResponseModel {
  allenamentoCorrente: AllenamentoDTO;
}
