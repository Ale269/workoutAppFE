import { TrendDirezione } from "./statistiche-overview-models";

/**
 * Dettaglio di una sessione svolta (drill-down L2 dalla card "Ultima
 * sessione").
 *
 * Il confronto e' con la MEDIA A 4 SETTIMANE dell'utente sugli stessi
 * esercizi: non con la sessione precedente in assoluto, che avrebbe esercizi
 * diversi e renderebbe il confronto privo di senso.
 */
export interface DettaglioSessioneResponse {
  idAllenamentoSvolto: number;
  /** "Giorno 1" */
  nomeGiorno: string;
  /** "Tipo scheda 1" — null per un allenamento libero. */
  nomeScheda: string | null;
  /** Data di ESECUZIONE dichiarata (ISO). */
  dataEsecuzione: string;

  confronto: ConfrontoSessione;
  esercizi: EsercizioSessione[];
  scostamenti: ScostamentoPiano[];
}

/** Quanti esercizi sono andati meglio, uguale o peggio della propria media. */
export interface ConfrontoSessione {
  migliorati: number;
  stabili: number;
  calati: number;
}

/** Una serie, come reps x carico. */
export interface SerieSessione {
  ripetizioni: number;
  carico: number;
}

export interface EsercizioSessione {
  idTipoEsercizio: number;
  nomeEsercizio: string;
  /** Icona e colore del cerchio si risolvono da qui, lato client. */
  idIcona: number;

  /** Serie effettivamente svolte. */
  svolto: SerieSessione[];
  /**
   * Serie prescritte dallo SNAPSHOT CONGELATO all'avvio della sessione, non
   * dall'istanza modificabile: altrimenti il confronto darebbe sempre pari.
   * Vuoto per gli esercizi aggiunti di iniziativa (e per l'allenamento libero).
   */
  previsto: SerieSessione[];

  /** Scarto rispetto alla media a 4 settimane; null se non confrontabile. */
  delta: number | null;
  /** Su cosa e' misurato lo scarto: carico o ripetizioni. */
  unitaDelta: "kg" | "rep";
  trend: TrendDirezione;
}

/**
 * Differenza tra piano e svolto. La descrizione arriva gia' composta dal
 * server perche' la forma della frase cambia troppo da un tipo all'altro
 * ("1 serie in piu' su X" / "X sostituito con Y") per valere una traduzione
 * lato client.
 */
export interface ScostamentoPiano {
  tipo: "serie-aggiunta" | "serie-tolta" | "sostituzione" | "salto";
  descrizione: string;
}
