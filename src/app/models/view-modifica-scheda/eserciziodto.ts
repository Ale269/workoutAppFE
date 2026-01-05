import { SerieDTO } from "./seriedto";

export interface EsercizioDTO {
  id: number;
  idTipoEsercizio: number;
  descrizioneEsercizio: string;
  idIconaEsercizio: number;
  idMetodologia: number;
  listaSerie: SerieDTO[];
  ordinamento: number;
}
