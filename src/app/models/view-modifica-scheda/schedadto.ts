import { AllenamentoDTO } from "./allenamentodto";

export interface SchedaDTO {
  id: number;
  nomeScheda: string;
  idTemplate: number;
  listaAllenamenti: AllenamentoDTO[];
  schedaAttiva: boolean;
  description: string;
}