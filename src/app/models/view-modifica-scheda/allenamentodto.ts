import { EsercizioDTO } from "./eserciziodto";

export interface AllenamentoDTO {
  id: number;
  nomeAllenamento: string;
  ordinamento: number;
  listaEsercizi: EsercizioDTO[];
  description: string;
}