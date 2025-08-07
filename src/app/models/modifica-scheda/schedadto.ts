import { EsercizioDTO } from "./eserciziodto";

export interface SchedaDTO {
  id: number;
  nomeScheda: string;
  listaEsercizi: EsercizioDTO[];
}