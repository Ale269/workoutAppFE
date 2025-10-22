import { EsercizioDTO } from "./eserciziodto";

export interface AllenamentoDTO {
  id: number;
  idTemplate: number;
  nomeAllenamento: string;
  nomeScheda: string | null;
  dataEsecuzione: Date | null;
  ordinamento: number;
  listaEsercizi: EsercizioDTO[];
}