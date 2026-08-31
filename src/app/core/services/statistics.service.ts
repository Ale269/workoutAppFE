import { Injectable, inject } from "@angular/core";
import { Observable, of } from "rxjs";
import { delay } from "rxjs/operators";
import { ApiCatalogService } from "./api-catalog.service";
import {
  RiepilogoResponse,
  VolumeResponse,
  DistribuzioneResponse,
  RecordResponse,
  FrequenzaData,
  ProgressioneData,
} from "src/app/models/statistics/statistics-models";
import {
  SnapshotWorkoutsListResponse,
  WorkoutProgressResponse,
} from "src/app/models/statistics/workout-progress-models";
import { AllenamentoSvoltoListaDTO } from "src/app/models/lista-allenamenti-svolti/allenamentosvoltolistadto";
import { LastTrainingExerciseData } from "src/app/models/history/last-training-exercise";
import {
  StatisticheOverviewResponse,
  StatistichePeriodo,
} from "src/app/models/statistics/statistiche-overview-models";
import { getMockOverview } from "./mocks/statistiche-overview.mock";
import { DettaglioSessioneResponse } from "src/app/models/statistics/statistiche-sessione-models";
import { getMockDettaglioSessione } from "./mocks/statistiche-sessione.mock";
import { DettaglioEsercizioResponse } from "src/app/models/statistics/statistiche-esercizio-models";
import { getMockDettaglioEsercizio } from "./mocks/statistiche-esercizio.mock";
import { ForzaCompletaResponse } from "src/app/models/statistics/statistiche-overview-models";
import { getMockForzaCompleta } from "./mocks/statistiche-forza.mock";

@Injectable({
  providedIn: "root",
})
export class StatisticsService {
  private apiCatalogService = inject(ApiCatalogService);

  /**
   * Panoramica del nuovo flusso Statistiche (L1): una sola chiamata per tutte
   * le card del periodo selezionato.
   *
   * Finché il backend non espone stats/overview, restituisce dati finti.
   * Per passare al reale: USE_MOCK_OVERVIEW = false ed eliminare
   * ./mocks/statistiche-overview.mock. La firma non cambia.
   */
  private readonly USE_MOCK_OVERVIEW = true;

  getStatisticheOverview(
    userId: number,
    periodo: StatistichePeriodo,
  ): Observable<StatisticheOverviewResponse> {
    if (this.USE_MOCK_OVERVIEW) {
      return of(getMockOverview(periodo)).pipe(delay(150));
    }

    return this.apiCatalogService.executeApiCall(
      "stats",
      "overview",
      { userId },
      null,
      { periodo },
    );
  }

  /**
   * Dettaglio di una sessione svolta (drill-down dalla card "Ultima sessione").
   * Stesso flag del resto delle statistiche: finche' e' acceso, dati finti.
   */
  getDettaglioSessione(
    idAllenamentoSvolto: number,
  ): Observable<DettaglioSessioneResponse> {
    if (this.USE_MOCK_OVERVIEW) {
      return of(getMockDettaglioSessione(idAllenamentoSvolto)).pipe(delay(150));
    }

    return this.apiCatalogService.executeApiCall(
      "stats",
      "sessionDetail",
      { idAllenamentoSvolto },
      null,
    );
  }

  /**
   * Dettaglio statistico di un esercizio. Stesso flag del resto: finche' e'
   * acceso, dati finti.
   */
  getDettaglioEsercizio(
    idTipoEsercizio: number,
  ): Observable<DettaglioEsercizioResponse> {
    if (this.USE_MOCK_OVERVIEW) {
      return of(getMockDettaglioEsercizio(idTipoEsercizio)).pipe(delay(150));
    }

    return this.apiCatalogService.executeApiCall(
      "stats",
      "exerciseDetail",
      { idTipoEsercizio },
      null,
    );
  }

  /** Lista completa degli esercizi con trend ("Vedi tutti" della card Forza). */
  getForzaCompleta(
    userId: number,
    periodo: StatistichePeriodo,
  ): Observable<ForzaCompletaResponse> {
    if (this.USE_MOCK_OVERVIEW) {
      return of(getMockForzaCompleta()).pipe(delay(150));
    }

    return this.apiCatalogService.executeApiCall(
      "stats",
      "strengthAll",
      { userId },
      null,
      { periodo },
    );
  }

  getRiepilogo(userId: number): Observable<RiepilogoResponse> {
    return this.apiCatalogService.executeApiCall(
      "stats",
      "summary",
      { userId },
      null
    );
  }

  getVolume(userId: number, periodo: string): Observable<VolumeResponse> {
    return this.apiCatalogService.executeApiCall(
      "stats",
      "volume",
      { userId },
      null,
      { periodo }
    );
  }

  getDistribuzioneMuscoli(
    userId: number,
    days: number
  ): Observable<DistribuzioneResponse> {
    return this.apiCatalogService.executeApiCall(
      "stats",
      "muscleDistribution",
      { userId },
      null,
      { days }
    );
  }

  getRecordPersonali(userId: number): Observable<RecordResponse> {
    return this.apiCatalogService.executeApiCall(
      "stats",
      "personalRecords",
      { userId },
      null
    );
  }

  getSnapshotWorkouts(userId: number): Observable<SnapshotWorkoutsListResponse> {
    return this.apiCatalogService.executeApiCall(
      "stats",
      "snapshotWorkouts",
      { userId },
      null
    );
  }

  getWorkoutProgress(snapshotWorkoutId: number): Observable<WorkoutProgressResponse> {
    return this.apiCatalogService.executeApiCall(
      "stats",
      "workoutProgress",
      { snapshotWorkoutId },
      null
    );
  }

  calcolaFrequenzaPerPeriodo(
    allenamenti: AllenamentoSvoltoListaDTO[],
    periodo: "settimana" | "mese"
  ): FrequenzaData[] {
    if (!allenamenti || allenamenti.length === 0) return [];

    const grouped = new Map<string, number>();

    allenamenti.forEach((a) => {
      const data = new Date(a.dataEsecuzione);
      let key: string;

      if (periodo === "settimana") {
        const year = data.getFullYear();
        const weekNum = this.getWeekNumber(data);
        key = `${year}-W${weekNum.toString().padStart(2, "0")}`;
      } else {
        const year = data.getFullYear();
        const month = (data.getMonth() + 1).toString().padStart(2, "0");
        key = `${year}-${month}`;
      }

      grouped.set(key, (grouped.get(key) || 0) + 1);
    });

    const sorted = Array.from(grouped.entries()).sort((a, b) =>
      a[0].localeCompare(b[0])
    );

    // Limita a ultime 12 entries
    const limited = sorted.slice(-12);

    return limited.map(([label, count]) => ({
      label: this.formatPeriodoLabel(label, periodo),
      count,
    }));
  }

  calcolaProgressioneEsercizio(
    dati: LastTrainingExerciseData[]
  ): ProgressioneData {
    if (!dati || dati.length === 0) {
      return { labels: [], maxCarico: [], volume: [] };
    }

    // Ordina per data crescente
    const ordinati = [...dati].sort(
      (a, b) =>
        new Date(a.dataEsecuzione).getTime() -
        new Date(b.dataEsecuzione).getTime()
    );

    const labels: string[] = [];
    const maxCarico: number[] = [];
    const volume: number[] = [];

    ordinati.forEach((sessione) => {
      const data = new Date(sessione.dataEsecuzione);
      labels.push(
        data.toLocaleDateString("it-IT", { day: "2-digit", month: "short" })
      );

      let maxC = 0;
      let vol = 0;
      sessione.listaSerie.forEach((serie) => {
        if (serie.carico > maxC) maxC = serie.carico;
        vol += serie.ripetizioni * serie.carico;
      });

      maxCarico.push(maxC);
      volume.push(vol);
    });

    return { labels, maxCarico, volume };
  }

  private getWeekNumber(d: Date): number {
    const date = new Date(
      Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())
    );
    date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil(
      ((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
    );
  }

  private formatPeriodoLabel(
    key: string,
    periodo: "settimana" | "mese"
  ): string {
    if (periodo === "settimana") {
      // "2026-W10" → "W10"
      return key.split("-")[1];
    } else {
      // "2026-03" → "Mar 26"
      const [year, month] = key.split("-");
      const mesi = [
        "Gen",
        "Feb",
        "Mar",
        "Apr",
        "Mag",
        "Giu",
        "Lug",
        "Ago",
        "Set",
        "Ott",
        "Nov",
        "Dic",
      ];
      return `${mesi[parseInt(month) - 1]} ${year.slice(2)}`;
    }
  }
}
