import { SerieDTO } from "./seriedto";

export interface EsercizioDTO {
  id: number;
  idTemplate: number;
  description: string;
  idTipoEsercizio: number;
  idIconaEsercizio: number;
  idMetodologia: number;
  listaSerie: SerieDTO[];
  ordinamento: number;
  idGruppo?: number | null; // progressivo del gruppo di appartenenza (null = nessun gruppo)
}
