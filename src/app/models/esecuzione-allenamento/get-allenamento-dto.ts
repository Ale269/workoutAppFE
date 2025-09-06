import { AllenamentoDTO } from "./allenamentodto";
import { altriAllenamentiSelectDTO } from "./altri-allenamenti-select-dto";

export interface InitializeWorkoutResponse {
  allenamentoCorrente: AllenamentoDTO;
  opzioniAltriAllenamenti: altriAllenamentiSelectDTO[];
}
