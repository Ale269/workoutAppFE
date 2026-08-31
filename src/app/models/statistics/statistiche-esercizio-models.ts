import { SerieSessione } from "./statistiche-sessione-models";

/**
 * Dettaglio statistico di un singolo esercizio (drill-down L2).
 *
 * Ci si arriva da due strade — la card "Forza" in Statistiche e la lista
 * esercizi del dettaglio sessione — quindi chi naviga passa anche la
 * provenienza, per sapere dove riportare la freccia indietro.
 */
export interface DettaglioEsercizioResponse {
  idTipoEsercizio: number;
  nomeEsercizio: string;
  /** Icona e colore del cerchio si risolvono da qui, lato client. */
  idIcona: number;
  /** Primario e sinergici, gia' in ordine: ["Petto", "Deltoide ant.", ...]. */
  muscoli: string[];

  /** Miglior serie di sempre. Null finche' non c'e' storico. */
  migliorSerie: SerieSessione | null;
  /**
   * Stima valida solo per r <= 10, e non calcolabile a corpo libero senza il
   * peso corporeo: in quei casi null e la card non mostra il riquadro.
   */
  unaRipetizioneMassimaStimata: number | null;

  storico: SessioneStoricoEsercizio[];
  grafici: GraficoEsercizio[];
  record: RecordEsercizio[];
}

export interface SessioneStoricoEsercizio {
  idAllenamentoSvolto: number;
  /** "Giorno 1" */
  nomeGiorno: string;
  /** Data di esecuzione (ISO). In pagina si mostra CON l'anno. */
  dataEsecuzione: string;
  serie: SerieSessione[];
  /** "record di carico", "−2 reps sul prescritto". Null se non c'e' nulla da dire. */
  nota: string | null;
}

export interface PuntoGrafico {
  /** ISO date del punto. */
  data: string;
  valore: number;
}

/** Marcatore verticale: spiega gli scalini della curva. */
export interface CambioScheda {
  data: string;
  etichetta: string;
}

export interface GraficoEsercizio {
  /** "Miglior serie", "1RM stimato", "Volume per sessione". */
  titolo: string;
  valoreCorrente: number;
  unita: string;
  /** Scarto rispetto al primo punto della serie; null se non confrontabile. */
  delta: number | null;
  punti: PuntoGrafico[];
  cambiScheda: CambioScheda[];
}

export interface RecordEsercizio {
  /** "1RM stimato massimo", "Carico massimo", "Volume massimo in una sessione". */
  titolo: string;
  valore: number;
  unita: string;
  /** Quando e' stato fatto (ISO). */
  data: string;
  /** Il contorno del record: "10×28", "10 reps", "3 serie". */
  dettaglio: string;
}
