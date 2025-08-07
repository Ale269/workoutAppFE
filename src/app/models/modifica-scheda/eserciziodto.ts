import { SerieDTO } from "./seriedto";

export interface EsercizioDTO {
  id: number;
  idEsercizio: number;
  nomeEsercizio: string;
  nomeIcona: string;
  idTipoEsercizio: number;
  idIconaEsercizio: number;
  listaSerie: SerieDTO[];
  ordinamento: number;
}
