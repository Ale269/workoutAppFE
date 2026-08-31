/**
 * Elenco completo degli esercizi con trend. Stessa sorte degli altri mock:
 * si spengono tutti insieme con USE_MOCK_OVERVIEW.
 */
import { ForzaCompletaResponse } from "src/app/models/statistics/statistiche-overview-models";

export function getMockForzaCompleta(): ForzaCompletaResponse {
  return {
    esecuzioniMinime: 3,
    esercizi: [
      {
        idTipoEsercizio: 1,
        nomeEsercizio: "Panca piana manubri",
        idIcona: 1,
        caricoMigliorSerie: 28,
        unaRipetizioneMassimaStimata: 37,
        deltaCarico: 4,
        trend: "su",
      },
      {
        idTipoEsercizio: 2,
        nomeEsercizio: "Lat machine",
        idIcona: 3,
        caricoMigliorSerie: 60,
        unaRipetizioneMassimaStimata: 76,
        deltaCarico: 0,
        trend: "stabile",
      },
      {
        idTipoEsercizio: 3,
        nomeEsercizio: "Squat",
        idIcona: 6,
        caricoMigliorSerie: 80,
        unaRipetizioneMassimaStimata: 98,
        deltaCarico: 5,
        trend: "su",
      },
      {
        idTipoEsercizio: 5,
        nomeEsercizio: "Stacco rumeno",
        idIcona: 7,
        caricoMigliorSerie: 70,
        unaRipetizioneMassimaStimata: 88,
        deltaCarico: 2.5,
        trend: "su",
      },
      {
        idTipoEsercizio: 6,
        nomeEsercizio: "Chest press",
        idIcona: 1,
        caricoMigliorSerie: 50,
        unaRipetizioneMassimaStimata: 62,
        deltaCarico: 0,
        trend: "stabile",
      },
      {
        idTipoEsercizio: 4,
        nomeEsercizio: "Curl bicipiti",
        idIcona: 2,
        caricoMigliorSerie: 14,
        unaRipetizioneMassimaStimata: 18,
        deltaCarico: -1,
        trend: "giu",
      },
      {
        idTipoEsercizio: 7,
        nomeEsercizio: "Leg extension",
        idIcona: 6,
        caricoMigliorSerie: 60,
        unaRipetizioneMassimaStimata: 74,
        deltaCarico: 5,
        trend: "su",
      },
      {
        idTipoEsercizio: 8,
        nomeEsercizio: "Pulley basso",
        idIcona: 3,
        caricoMigliorSerie: 55,
        unaRipetizioneMassimaStimata: 70,
        deltaCarico: 0,
        trend: "stabile",
      },
    ],
  };
}
