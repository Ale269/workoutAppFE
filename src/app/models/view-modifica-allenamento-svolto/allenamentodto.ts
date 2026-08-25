import { EsercizioDTO } from "./eserciziodto";
import { GruppoDTO } from "./gruppodto";

export interface AllenamentoDTO {
  id: number;
  idTemplate: number;
  nomeAllenamento: string;
  nomeScheda: string | null;
  description: string;
  dataEsecuzione: Date | null;
  ordinamento: number;
  listaEsercizi: EsercizioDTO[];
  listaGruppi?: GruppoDTO[];
}