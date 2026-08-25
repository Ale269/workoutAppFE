import { SerieDTO } from "./seriedto";

export interface EsercizioDTO {
  id: number;
  idTipoEsercizio: number;
  description: string;
  idIconaEsercizio: number;
  idMetodologia: number;
  listaSerie: SerieDTO[];
  ordinamento: number;
  idGruppo?: number | null; // progressivo del gruppo di appartenenza (null = nessun gruppo)
}
