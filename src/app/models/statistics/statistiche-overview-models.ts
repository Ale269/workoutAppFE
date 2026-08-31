/**
 * Modelli del nuovo flusso "Statistiche" (panoramica L1).
 *
 * Il contratto è UNICO: una sola chiamata restituisce tutte le card della
 * panoramica per il periodo selezionato. Ogni card è nullable: quando i dati
 * non bastano a calcolarla (vedi stati vuoti, §4.7 del documento UX) il
 * backend restituisce `null` e la card sparisce dall'interfaccia. Mai zeri,
 * mai stime silenziose, mai placeholder.
 */

// ============================================
// PERIODO (le 3 tab in cima alla pagina)
// ============================================

export type StatistichePeriodo = "scheda-attiva" | "tre-mesi" | "tutto";

export interface StatistichePeriodoTab {
  id: StatistichePeriodo;
  label: string;
}

export const STATISTICHE_PERIODI: StatistichePeriodoTab[] = [
  { id: "scheda-attiva", label: "Scheda attiva" },
  { id: "tre-mesi", label: "3 mesi" },
  { id: "tutto", label: "Tutto" },
];

// ============================================
// RISPOSTA PANORAMICA
// ============================================

export interface StatisticheOverviewResponse {
  periodo: StatistichePeriodo;
  /** Estremi effettivi del periodo risolto dal backend (ISO date). */
  dataInizio: string | null;
  dataFine: string | null;
  /** Numero di sessioni che entrano nel calcolo: serve alle soglie minime. */
  sessioniNelPeriodo: number;

  ultimaSessione: UltimaSessioneCard | null;
  costanza: CostanzaCard | null;
  forza: ForzaCard | null;
  volume: VolumeMuscoloCard | null;
  // Non ancora renderizzata: il contratto è già qui perché il backend la
  // espone nella stessa risposta.
  aderenza: AderenzaCard | null;
}

// ============================================
// CARD "ULTIMA SESSIONE"
// ============================================

export interface UltimaSessioneCard {
  idAllenamentoSvolto: number;
  /** "Giorno 1" */
  nomeGiorno: string;
  /** "Tipo scheda 1" */
  nomeScheda: string;
  /** Data di ESECUZIONE dichiarata, mai quella di inserimento (ISO). */
  dataEsecuzione: string;
  eserciziSvolti: number;
  eserciziPrevisti: number;
  numeroRecord: number;
  numeroSerie: number;
}

// ============================================
// CARD "COSTANZA"
// ============================================

export interface CostanzaSettimana {
  /** Lunedì della settimana, ISO date. */
  inizioSettimana: string;
  allenamenti: number;
}

export interface DurataCiclo {
  /** Giorni impiegati a completare l'ultimo giro completo della scheda. */
  giorniUltimoCiclo: number;
  /** Media dei cicli precedenti, se ce ne sono abbastanza. */
  giorniCicloPrecedente: number | null;
}

export interface CostanzaCard {
  /** Media allenamenti/settimana nel periodo selezionato (es. 2.4). */
  allenamentiPerSettimana: number;
  /** Istogramma: ultime N settimane, dalla più vecchia alla più recente. */
  settimane: CostanzaSettimana[];
  /** Confronto dell'utente con se stesso. Null sotto le 4 settimane di storico. */
  mediaQuattroSettimane: number | null;
  /** Null se la scheda non ha ancora chiuso un ciclo completo. */
  durataCiclo: DurataCiclo | null;
}

// ============================================
// CARD "FORZA"
// ============================================

export type TrendDirezione = "su" | "stabile" | "giu";

export interface ForzaEsercizioItem {
  idTipoEsercizio: number;
  nomeEsercizio: string;
  /** Serve a ricavare icona e colore del cerchio dal catalogo lato client. */
  idIcona: number;
  /** Carico della miglior serie nel periodo. */
  caricoMigliorSerie: number;
  /**
   * Stima valida solo per r <= 10: sopra, la formula sbaglia in silenzio.
   * Null anche per il corpo libero, dove senza peso corporeo non e' calcolabile.
   */
  unaRipetizioneMassimaStimata: number | null;
  /** Delta rispetto all'occorrenza precedente; null se non confrontabile. */
  deltaCarico: number | null;
  trend: TrendDirezione;
}

/**
 * Lista completa degli esercizi con trend, dietro "Tutti" nella card Forza.
 * Stessa forma delle voci in anteprima: la pagina riusa lo stesso componente.
 */
export interface ForzaCompletaResponse {
  esercizi: ForzaEsercizioItem[];
  /**
   * Sotto questa soglia di esecuzioni un trend e' rumore, quindi l'esercizio
   * non entra in lista: il numero serve a dirlo in chiaro all'utente.
   */
  esecuzioniMinime: number;
}

export interface ForzaCard {
  esercizi: ForzaEsercizioItem[];
  /** Totale esercizi disponibili nel drill-down ("Vedi tutti (12)"). */
  totaleEsercizi: number;
}

// ============================================
// CARD "VOLUME PER MUSCOLO"
// ============================================

export interface VolumeMuscoloItem {
  idMuscolo: number;
  nomeMuscolo: string;
  /** Serie della settimana corrente, pesate col coefficiente di ruolo. */
  serie: number;
  /** Riferimento con cui si confronta: la media dell'utente a 4 settimane. */
  mediaQuattroSettimane: number | null;
  /** Null se non confrontabile (meno di una settimana piena di storico). */
  deltaSerie: number | null;
  trend: TrendDirezione;
}

export interface VolumeMuscoloCard {
  distretti: VolumeMuscoloItem[];
  totaleDistretti: number;
}

// ============================================
// CARD "ADERENZA ALLA SCHEDA"
// ============================================

export interface GiornoMenoEseguito {
  /** "Giorno 3" */
  nomeGiorno: string;
  esecuzioni: number;
  /** Quante volte quel giorno sarebbe toccato nel periodo. */
  occasioni: number;
}

export interface SostituzioneFrequente {
  nomeEsercizioPrescritto: string;
  nomeEsercizioSostituto: string;
  occorrenze: number;
  /** Quante volte l'esercizio prescritto e' comparso in scheda nel periodo. */
  occasioni: number;
}

export interface AderenzaCard {
  /**
   * Serie completate sul prescritto. Il prescritto e' lo SNAPSHOT CONGELATO
   * all'avvio della sessione: confrontarlo con l'istanza modificabile darebbe
   * sempre 100% e la metrica non varrebbe niente.
   */
  percentualeSerieCompletate: number;
  giornoMenoEseguito: GiornoMenoEseguito | null;
  /** Euristica descrittiva, mai una metrica su cui prendere decisioni. */
  sostituzioneFrequente: SostituzioneFrequente | null;
}
