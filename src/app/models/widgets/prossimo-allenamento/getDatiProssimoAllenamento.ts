import { BaseResponseModel } from "../../base-response/base-response";

export interface GetDatiProssimoAllenamentoRequestModel {
  idUser: number;
}

export interface GetDatiProssimoAllenamentoResponseModel extends BaseResponseModel {
  numeroGiornoAllenamentoCorrente: number;
  numeroGiornoAllenamentiTotali: number;
  descrizioneAllenamentoCorrente: string;
}
