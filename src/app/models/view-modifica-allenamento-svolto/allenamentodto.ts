import { EsercizioDTO } from "./eserciziodto";

export interface AllenamentoDTO {
  id: number;
  idTemplate: number;
  nomeAllenamento: string;
  nomeScheda: string | null;
  description: string;
  dataEsecuzione: Date | null;
  ordinamento: number;
  listaEsercizi: EsercizioDTO[];
}