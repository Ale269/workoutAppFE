export type TipoGruppo = "SUPERSET" | "CIRCUIT";

/**
 * Gruppo di esercizi (superset / circuito).
 * Il linkage esercizio->gruppo avviene SEMPRE tramite "progressivo"
 * (ordinale locale al payload, 1..N nell'allenamento), mai tramite id DB:
 * EsercizioDTO.idGruppo referenzia questo campo.
 */
export interface GruppoDTO {
  id: number;
  idTemplate: number;
  tipoGruppo: TipoGruppo;
  tempoRecupero: number | null; // secondi
  numeroGiri: number | null; // solo circuito, null per superset
  progressivo: number;
}
