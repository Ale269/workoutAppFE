/**
 * Dati finti del dettaglio esercizio. Stessa sorte degli altri mock: si
 * spengono tutti insieme con USE_MOCK_OVERVIEW.
 */
import { DettaglioEsercizioResponse } from "src/app/models/statistics/statistiche-esercizio-models";

export function getMockDettaglioEsercizio(
  idTipoEsercizio: number,
): DettaglioEsercizioResponse {
  return {
    idTipoEsercizio,
    nomeEsercizio: "Panca piana manubri",
    idIcona: 1,
    muscoli: ["Petto", "Deltoide ant.", "Tricipiti"],

    migliorSerie: { carico: 28, ripetizioni: 10 },
    unaRipetizioneMassimaStimata: 37,

    storico: [
      {
        idAllenamentoSvolto: 1,
        nomeGiorno: "Giorno 1",
        dataEsecuzione: "2026-08-24",
        serie: [
          { ripetizioni: 10, carico: 28 },
          { ripetizioni: 10, carico: 28 },
          { ripetizioni: 9, carico: 28 },
        ],
        nota: "record di carico",
      },
      {
        idAllenamentoSvolto: 2,
        nomeGiorno: "Giorno 1",
        dataEsecuzione: "2026-07-29",
        serie: [
          { ripetizioni: 10, carico: 26 },
          { ripetizioni: 10, carico: 26 },
          { ripetizioni: 10, carico: 26 },
        ],
        nota: null,
      },
      {
        idAllenamentoSvolto: 3,
        nomeGiorno: "Giorno 1",
        dataEsecuzione: "2026-07-08",
        serie: [
          { ripetizioni: 8, carico: 26 },
          { ripetizioni: 8, carico: 26 },
          { ripetizioni: 7, carico: 26 },
        ],
        nota: "−2 reps sul prescritto",
      },
      {
        idAllenamentoSvolto: 4,
        nomeGiorno: "Giorno 1",
        dataEsecuzione: "2026-06-17",
        serie: [
          { ripetizioni: 10, carico: 24 },
          { ripetizioni: 10, carico: 24 },
          { ripetizioni: 9, carico: 24 },
        ],
        nota: null,
      },
    ],

    grafici: [
      {
        titolo: "Miglior serie",
        valoreCorrente: 28,
        unita: "kg",
        delta: 4,
        punti: [
          { data: "2026-06-17", valore: 24 },
          { data: "2026-06-30", valore: 26 },
          { data: "2026-07-08", valore: 26 },
          { data: "2026-07-20", valore: 27 },
          { data: "2026-08-05", valore: 27 },
          { data: "2026-08-24", valore: 28 },
        ],
        cambiScheda: [{ data: "2026-07-12", etichetta: "Cambio scheda" }],
      },
      {
        titolo: "1RM stimato",
        valoreCorrente: 37,
        unita: "kg",
        delta: 6,
        punti: [
          { data: "2026-06-17", valore: 31 },
          { data: "2026-06-30", valore: 33 },
          { data: "2026-07-08", valore: 34 },
          { data: "2026-07-20", valore: 35 },
          { data: "2026-08-05", valore: 36 },
          { data: "2026-08-24", valore: 37 },
        ],
        cambiScheda: [{ data: "2026-07-12", etichetta: "Cambio scheda" }],
      },
      {
        titolo: "Volume per sessione",
        valoreCorrente: 812,
        unita: "kg",
        delta: 164,
        punti: [
          { data: "2026-06-17", valore: 648 },
          { data: "2026-06-30", valore: 676 },
          { data: "2026-07-08", valore: 702 },
          { data: "2026-07-20", valore: 780 },
          { data: "2026-08-05", valore: 790 },
          { data: "2026-08-24", valore: 812 },
        ],
        cambiScheda: [{ data: "2026-07-12", etichetta: "Cambio scheda" }],
      },
    ],

    record: [
      {
        titolo: "1RM stimato massimo",
        valore: 37,
        unita: "kg",
        data: "2026-08-24",
        dettaglio: "10×28",
      },
      {
        titolo: "Carico massimo",
        valore: 28,
        unita: "kg",
        data: "2026-08-24",
        dettaglio: "10 reps",
      },
      {
        titolo: "Volume massimo in una sessione",
        valore: 812,
        unita: "kg",
        data: "2026-08-24",
        dettaglio: "3 serie",
      },
    ],
  };
}
