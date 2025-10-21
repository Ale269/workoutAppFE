import { BaseResponseModel } from "../base-response/base-response";
import { AllenamentoDTO } from "./allenamentodto";

export interface RegistraAllenamentoRequestModel {
  AllenamentoDTO: AllenamentoDTO;
}

export interface RegistraAllenamentoResponseModel extends BaseResponseModel {
  allenamentoCorrente: AllenamentoDTO;
}
