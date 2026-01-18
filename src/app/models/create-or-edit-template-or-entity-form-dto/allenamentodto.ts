import { EsercizioDTO } from "./eserciziodto";

export interface AllenamentoDTO {
  id: number;
  idTemplate: number;
  dataEsecuzione: Date | null;
  nomeAllenamento: string;
  description: string;
  ordinamento: number;
  listaEsercizi: EsercizioDTO[];
}