import { BaseResponseModel } from "../../base-response/base-response";

export interface GetDatiProssimoAllenamentoRequestModel {
  userId: number;
}

export interface GetDatiProssimoAllenamentoResponseModel extends BaseResponseModel {
  idAllenamento: number;
  numeroGiornoAllenamentoCorrente: number;
  numeroGiornoAllenamentiTotali: number;
  descrizioneAllenamentoCorrente: string;
  /** Id icona degli esercizi previsti, nell'ordine di esecuzione. */
  idIcone: number[];
}
