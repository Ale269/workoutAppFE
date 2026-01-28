import { AllenamentoDTO } from "./allenamentodto";

export interface SchedaDTO {
  id: number;
  idTemplate: number;
  nomeScheda: string;
  description:string;
  listaAllenamenti: AllenamentoDTO[];
  schedaAttiva: boolean;
}
