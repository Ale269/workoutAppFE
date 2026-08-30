/**
 * Dati finti della panoramica Statistiche.
 *
 * File volutamente isolato: quando il backend espone `stats/overview` basta
 * mettere `USE_MOCK_OVERVIEW = false` in StatisticsService e cancellare
 * questo file, senza toccare né i componenti né i modelli.
 */
import {
  StatisticheOverviewResponse,
  StatistichePeriodo,
} from "src/app/models/statistics/statistiche-overview-models";

/** Istogramma costanza: ultime 12 settimane, dalla più vecchia alla più recente. */
function costruisciSettimane(allenamenti: number[]): {
  inizioSettimana: string;
  allenamenti: number;
}[] {
  const oggi = new Date();
  const lunediCorrente = new Date(oggi);
  const giornoSettimana = (oggi.getDay() + 6) % 7; // 0 = lunedì
  lunediCorrente.setDate(oggi.getDate() - giornoSettimana);

  return allenamenti.map((count, i) => {
    const inizio = new Date(lunediCorrente);
    inizio.setDate(lunediCorrente.getDate() - (allenamenti.length - 1 - i) * 7);
    return {
      inizioSettimana: inizio.toISOString().slice(0, 10),
      allenamenti: count,
    };
  });
}

const BASE: StatisticheOverviewResponse = {
  periodo: "scheda-attiva",
  dataInizio: "2026-06-01",
  dataFine: "2026-08-30",
  sessioniNelPeriodo: 29,

  ultimaSessione: {
    idAllenamentoSvolto: 1,
    nomeGiorno: "Giorno 1",
    nomeScheda: "Tipo scheda 1",
    dataEsecuzione: "2026-08-24",
    eserciziSvolti: 8,
    eserciziPrevisti: 8,
    numeroRecord: 2,
    numeroSerie: 24,
  },

  costanza: {
    allenamentiPerSettimana: 2.4,
    settimane: costruisciSettimane([1, 3, 3, 1, 2, 3, 3, 2, 1, 3, 3, 2]),
    mediaQuattroSettimane: 2.0,
    durataCiclo: {
      giorniUltimoCiclo: 11,
      giorniCicloPrecedente: 8,
    },
  },

  forza: {
    totaleEsercizi: 12,
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
    ],
  },

  volume: {
    totaleDistretti: 9,
    distretti: [
      {
        idMuscolo: 1,
        nomeMuscolo: "Petto",
        serie: 10,
        mediaQuattroSettimane: 8,
        deltaSerie: 2,
        trend: "su",
      },
      {
        idMuscolo: 3,
        nomeMuscolo: "Dorso",
        serie: 7,
        mediaQuattroSettimane: 7,
        deltaSerie: 0,
        trend: "stabile",
      },
      {
        idMuscolo: 6,
        nomeMuscolo: "Gambe",
        serie: 6,
        mediaQuattroSettimane: 9,
        deltaSerie: -3,
        trend: "giu",
      },
    ],
  },

  aderenza: {
    percentualeSerieCompletate: 87,
    giornoMenoEseguito: {
      nomeGiorno: "Giorno 3",
      esecuzioni: 1,
      occasioni: 6,
    },
    sostituzioneFrequente: {
      nomeEsercizioPrescritto: "Croci ai cavi",
      nomeEsercizioSostituto: "Croci ai manubri",
      occorrenze: 4,
      occasioni: 6,
    },
  },
};

/** Variazioni per periodo, così le tab cambiano visibilmente i dati. */
const PER_PERIODO: Record<StatistichePeriodo, Partial<StatisticheOverviewResponse>> = {
  "scheda-attiva": {},
  "tre-mesi": {
    dataInizio: "2026-05-30",
    sessioniNelPeriodo: 31,
    costanza: {
      allenamentiPerSettimana: 2.6,
      settimane: costruisciSettimane([2, 3, 3, 2, 2, 3, 3, 3, 1, 3, 3, 3]),
      mediaQuattroSettimane: 2.5,
      durataCiclo: { giorniUltimoCiclo: 11, giorniCicloPrecedente: 9 },
    },
  },
  tutto: {
    dataInizio: "2025-11-04",
    sessioniNelPeriodo: 118,
    costanza: {
      allenamentiPerSettimana: 2.1,
      settimane: costruisciSettimane([2, 2, 1, 3, 2, 2, 3, 2, 1, 3, 2, 2]),
      mediaQuattroSettimane: 2.0,
      durataCiclo: { giorniUltimoCiclo: 11, giorniCicloPrecedente: 8 },
    },
  },
};

export function getMockOverview(
  periodo: StatistichePeriodo,
): StatisticheOverviewResponse {
  return { ...BASE, ...PER_PERIODO[periodo], periodo };
}
