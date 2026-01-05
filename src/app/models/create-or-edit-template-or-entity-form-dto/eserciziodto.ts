import { SerieDTO } from "./seriedto";

export interface EsercizioDTO {
  id: number;
  idTemplate: number;
  descrizioneEsercizio: string;
  idTipoEsercizio: number;
  idIconaEsercizio: number;
  idMetodologia: number;
  listaSerie: SerieDTO[];
  ordinamento: number;
}
