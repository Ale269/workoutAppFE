import { AllenamentoDTO } from "./allenamentodto";

export interface SchedaDTO {
  id: number;
  nomeScheda: string;
  listaAllenamenti: AllenamentoDTO[];
}