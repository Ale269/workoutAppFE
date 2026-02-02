import { BaseResponseModel } from "../../base-response/base-response";

export interface GetDatiSchedaCorrenteRequestModel {
  userId: number;
}

export interface GetDatiSchedaCorrenteResponseModel
  extends BaseResponseModel {
  idScheda: number;
  titoloScheda: string;
  descrizioneAllenamentoPrecedente: string;
  descrizioneProssimoAllenamento: string;
  descrizioneScheda: string;
  dataInizio: Date;
  numeroAllenamentiEffettuati: number;
}
