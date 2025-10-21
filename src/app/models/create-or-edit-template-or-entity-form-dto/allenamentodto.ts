import { EsercizioDTO } from "./eserciziodto";

export interface AllenamentoDTO {
  id: number;
  idTemplate: number;
  nomeAllenamento: string;
  ordinamento: number;
  listaEsercizi: EsercizioDTO[];
}