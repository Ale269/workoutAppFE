import { EsercizioDTO } from "./eserciziodto";
import { GruppoDTO } from "./gruppodto";

export interface AllenamentoDTO {
  id: number;
  nomeAllenamento: string;
  ordinamento: number;
  listaEsercizi: EsercizioDTO[];
  listaGruppi?: GruppoDTO[];
  description: string;
}