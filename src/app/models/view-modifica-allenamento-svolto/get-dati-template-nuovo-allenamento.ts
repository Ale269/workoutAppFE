import { BaseResponseModel } from "../base-response/base-response";
import { AllenamentoDTO } from "./allenamentodto";
import { altriAllenamentiSelectDTO } from "./altri-allenamenti-select-dto";

export interface GetDatiTemplateNuovoAllenamentoRequestModel {
  idTemplateAllenamento: number;
}

export interface GetDatiTemplateNuovoAllenamentoResponseModel extends BaseResponseModel {
  allenamentoCorrente: AllenamentoDTO;
  opzioniAltriAllenamenti: altriAllenamentiSelectDTO[];
}
