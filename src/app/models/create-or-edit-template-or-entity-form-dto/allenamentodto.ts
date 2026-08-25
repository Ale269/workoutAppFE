import { EsercizioDTO } from "./eserciziodto";
import { GruppoDTO } from "./gruppodto";

export interface AllenamentoDTO {
  id: number;
  idTemplate: number;
  dataEsecuzione: Date | null;
  nomeAllenamento: string;
  description: string;
  ordinamento: number;
  listaEsercizi: EsercizioDTO[];
  listaGruppi?: GruppoDTO[];
}