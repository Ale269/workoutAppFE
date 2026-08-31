/**
 * Dati finti del dettaglio sessione.
 *
 * Stessa sorte del mock della panoramica: quando il backend espone
 * `stats/sessionDetail` basta spegnere USE_MOCK_OVERVIEW in StatisticsService
 * e cancellare questo file.
 */
import { DettaglioSessioneResponse } from "src/app/models/statistics/statistiche-sessione-models";

export function getMockDettaglioSessione(
  idAllenamentoSvolto: number,
): DettaglioSessioneResponse {
  return {
    idAllenamentoSvolto,
    nomeGiorno: "Giorno 1",
    nomeScheda: "Tipo scheda 1",
    dataEsecuzione: "2026-08-24",

    confronto: {
      migliorati: 5,
      stabili: 2,
      calati: 1,
    },

    esercizi: [
      {
        idTipoEsercizio: 1,
        nomeEsercizio: "Panca piana manubri",
        idIcona: 1,
        svolto: [
          { ripetizioni: 10, carico: 28 },
          { ripetizioni: 10, carico: 28 },
          { ripetizioni: 9, carico: 28 },
        ],
        previsto: [
          { ripetizioni: 10, carico: 26 },
          { ripetizioni: 10, carico: 26 },
          { ripetizioni: 10, carico: 26 },
        ],
        delta: 2,
        unitaDelta: "kg",
        trend: "su",
      },
      {
        idTipoEsercizio: 2,
        nomeEsercizio: "Lat machine",
        idIcona: 3,
        svolto: [
          { ripetizioni: 12, carico: 60 },
          { ripetizioni: 12, carico: 60 },
          { ripetizioni: 11, carico: 60 },
        ],
        previsto: [
          { ripetizioni: 12, carico: 60 },
          { ripetizioni: 12, carico: 60 },
          { ripetizioni: 12, carico: 60 },
        ],
        delta: 0,
        unitaDelta: "kg",
        trend: "stabile",
      },
      {
        idTipoEsercizio: 3,
        nomeEsercizio: "Curl bicipiti",
        idIcona: 2,
        svolto: [
          { ripetizioni: 10, carico: 14 },
          { ripetizioni: 9, carico: 14 },
          { ripetizioni: 8, carico: 14 },
        ],
        previsto: [
          { ripetizioni: 10, carico: 14 },
          { ripetizioni: 10, carico: 14 },
          { ripetizioni: 10, carico: 14 },
        ],
        delta: -1,
        unitaDelta: "rep",
        trend: "giu",
      },
    ],

    scostamenti: [
      { tipo: "serie-aggiunta", descrizione: "1 serie in più su Croci ai cavi" },
      { tipo: "sostituzione", descrizione: "Lat machine sostituito con Pulley" },
    ],
  };
}
