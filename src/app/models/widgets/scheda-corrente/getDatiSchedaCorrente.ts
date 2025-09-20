import { BaseResponseModel } from "../../base-response/base-response";

export interface GetDatiSchedaCorrenteRequestModel {
  idUser: number;
}

export interface GetDatiSchedaCorrenteResponseModel
  extends BaseResponseModel {
  titoloScheda: string;
  descrizioneAllenamentoPrecedente: string;
  descrizioneProssimoAllenamento: string;
  dataInizio: Date;
  numeroAllenamentiEffettuati: number;
}
