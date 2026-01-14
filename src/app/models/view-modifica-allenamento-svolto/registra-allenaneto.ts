import { BaseResponseModel } from "../base-response/base-response";
import { AllenamentoDTO } from "./allenamentodto";

export interface RegistraAllenamentoRequestModel {
  dataSvolgimento : Date;
  allenamentoDTO: AllenamentoDTO;
  userId: number;
}

export interface RegistraAllenamentoResponseModel extends BaseResponseModel {
  allenamentoCorrente: AllenamentoDTO;
}
