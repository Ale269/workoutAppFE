import { SerieDTO } from "./seriedto";

export interface EsercizioDTO {
  id: number;
  idTipoEsercizio: number;
  idIconaEsercizio: number;
  idMetodologia: number;
  listaSerie: SerieDTO[];
  ordinamento: number;
}
