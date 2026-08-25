export type TipoGruppo = "SUPERSET" | "CIRCUIT";

/**
 * Gruppo di esercizi (superset / circuito).
 * EsercizioDTO.idGruppo referenzia il campo "progressivo" (ordinale locale al
 * payload), mai un id DB.
 */
export interface GruppoDTO {
  id: number;
  idTemplate: number;
  tipoGruppo: TipoGruppo;
  tempoRecupero: number | null; // secondi
  numeroGiri: number | null; // solo circuito, null per superset
  progressivo: number;
}
