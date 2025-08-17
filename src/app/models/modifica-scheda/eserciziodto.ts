import { SerieDTO } from "./seriedto";

export interface EsercizioDTO {
  id: number;
  idEsercizio: number;
  idTipoEsercizio: number;
  idIconaEsercizio: number;
  listaSerie: SerieDTO[];
  ordinamento: number;
}
