import { EsercizioDTO } from "./eserciziodto";

export interface AllenamentoDTO {
  id: number;
  idAllenamento: number;
  nomeAllenamento: string;
  ordinamento: number;
  listaEsercizi: EsercizioDTO[];
}