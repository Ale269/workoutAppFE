import { BaseResponseModel } from "../../base-response/base-response";

export interface GetDatiProssimoAllenamentoRequestModel {
  userId: number;
}

export interface GetDatiProssimoAllenamentoResponseModel extends BaseResponseModel {
  idAllenamento: number;
  numeroGiornoAllenamentoCorrente: number;
  numeroGiornoAllenamentiTotali: number;
  descrizioneAllenamentoCorrente: string;
}
