import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { forkJoin } from "rxjs";
import { Chart, registerables } from "chart.js";
import { MenuConfigService } from "src/app/core/services/menu-config.service";
import { SpinnerService } from "src/app/core/services/spinner.service";
import { AuthService } from "src/app/core/services/auth.service";
import { ErrorHandlerService } from "src/app/core/services/error-handler.service";
import { StatisticsService } from "src/app/core/services/statistics.service";
import { WorkoutService } from "src/app/core/services/workout.service";
import {
  ExerciseService,
  ExerciseViewModel,
} from "src/app/core/services/exercise.service";
import { BottomSheetService } from "../shared/bottom-sheet/bottom-sheet-service";
import { WorkoutListSelector } from "../shared/workout-list-selector/workout-list-selector";
import {
  RiepilogoResponse,
  FrequenzaData,
  VolumeDataPoint,
  DistribuzioneMuscoloItem,
  RecordPersonaleItem,
  ProgressioneData,
} from "src/app/models/statistics/statistics-models";
import { RiepilogoGenerale } from "./riepilogo-generale/riepilogo-generale";
import { FrequenzaAllenamenti } from "./frequenza-allenamenti/frequenza-allenamenti";
import { VolumeNelTempo } from "./volume-nel-tempo/volume-nel-tempo";
import { ProgressioneEsercizio } from "./progressione-esercizio/progressione-esercizio";
import { DistribuzioneMuscoli } from "./distribuzione-muscoli/distribuzione-muscoli";
import { RecordPersonali } from "./record-personali/record-personali";

// Registra tutti i componenti di Chart.js
Chart.register(...registerables);

@Component({
  selector: "app-statistiche",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RiepilogoGenerale,
    FrequenzaAllenamenti,
    VolumeNelTempo,
    ProgressioneEsercizio,
    DistribuzioneMuscoli,
    RecordPersonali,
  ],
  templateUrl: "./statistiche.html",
  styleUrls: ["./statistiche.scss"],
})
export class StatisticheComponent implements OnInit {
  private menuConfigService = inject(MenuConfigService);
  private spinnerService = inject(SpinnerService);
  private authService = inject(AuthService);
  private errorHandlerService = inject(ErrorHandlerService);
  private statisticsService = inject(StatisticsService);
  private workoutService = inject(WorkoutService);
  private exerciseService = inject(ExerciseService);
  private bottomSheetService = inject(BottomSheetService);

  // Dati sezioni
  riepilogo: RiepilogoResponse | null = null;
  frequenzaDati: FrequenzaData[] = [];
  volumeDati: VolumeDataPoint[] = [];
  distribuzioneDati: DistribuzioneMuscoloItem[] = [];
  recordDati: RecordPersonaleItem[] = [];
  progressioneDati: ProgressioneData | null = null;

  // Toggle e selezione
  frequenzaPeriodo: "settimana" | "mese" = "settimana";
  volumePeriodo: "settimana" | "mese" = "settimana";
  esercizioSelezionato: ExerciseViewModel | null = null;
  exerciseControl = new FormControl<number | null>(null);

  ngOnInit(): void {
    this.menuConfigService.setConfig({ leftButton: "none" });
    this.caricaDati();
  }

  async caricaDati(): Promise<void> {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    const userId = user.userId;
    const spinnerId = this.spinnerService.showWithResult("Caricamento statistiche", {
      successMessage: "Dati caricati",
      errorMessage: "Errore nel caricamento",
      resultDuration: 300,
      minSpinnerDuration: 300,
    });

    try {
      const [riepilogo, volume, distribuzione, records, allenamenti] =
        await Promise.allSettled([
          this.statisticsService.getRiepilogo(userId).toPromise(),
          this.statisticsService
            .getVolume(userId, this.volumePeriodo)
            .toPromise(),
          this.statisticsService
            .getDistribuzioneMuscoli(userId, 90)
            .toPromise(),
          this.statisticsService.getRecordPersonali(userId).toPromise(),
          this.workoutService
            .getListaAllenamentiSvolti({ userId })
            .toPromise(),
        ]);

      if (riepilogo.status === "fulfilled" && riepilogo.value) {
        this.riepilogo = riepilogo.value;
      }

      if (volume.status === "fulfilled" && volume.value) {
        this.volumeDati = volume.value.datiVolume;
      }

      if (distribuzione.status === "fulfilled" && distribuzione.value) {
        this.distribuzioneDati = distribuzione.value.distribuzione;
      }

      if (records.status === "fulfilled" && records.value) {
        this.recordDati = records.value.records;
      }

      if (allenamenti.status === "fulfilled" && allenamenti.value) {
        this.frequenzaDati = this.statisticsService.calcolaFrequenzaPerPeriodo(
          allenamenti.value.listaAllenamentiDTO,
          this.frequenzaPeriodo
        );
      }

      this.spinnerService.setSuccess(spinnerId);
    } catch (error) {
      this.errorHandlerService.logError(error, "StatisticheComponent.caricaDati");
      this.spinnerService.setError(spinnerId);
    }
  }

  toggleFrequenzaPeriodo(): void {
    this.frequenzaPeriodo =
      this.frequenzaPeriodo === "settimana" ? "mese" : "settimana";
    this.ricalcolaFrequenza();
  }

  toggleVolumePeriodo(): void {
    this.volumePeriodo =
      this.volumePeriodo === "settimana" ? "mese" : "settimana";
    this.ricaricaVolume();
  }

  async apriSelettoreEsercizio(): Promise<void> {
    try {
      const exercises = this.exerciseService.getExercisesWithIcons();
      const ref = await this.bottomSheetService.open<any, ExerciseViewModel>({
        component: WorkoutListSelector,
        data: {
          items: exercises,
          title: "Seleziona esercizio",
        },
      });

      const result = await ref.onDidDismiss();
      if (result.data) {
        this.esercizioSelezionato = result.data;
        this.caricaProgressione(result.data.id);
      }
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "StatisticheComponent.apriSelettoreEsercizio"
      );
    }
  }

  private async caricaProgressione(exerciseId: number): Promise<void> {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    try {
      const response = await this.workoutService
        .getLastNTrainingsForExercise(user.userId, exerciseId, 20)
        .toPromise();

      if (response?.esercizi) {
        this.progressioneDati =
          this.statisticsService.calcolaProgressioneEsercizio(
            response.esercizi
          );
      }
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "StatisticheComponent.caricaProgressione"
      );
    }
  }

  private async ricalcolaFrequenza(): Promise<void> {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    try {
      const response = await this.workoutService
        .getListaAllenamentiSvolti({ userId: user.userId })
        .toPromise();

      if (response?.listaAllenamentiDTO) {
        this.frequenzaDati = this.statisticsService.calcolaFrequenzaPerPeriodo(
          response.listaAllenamentiDTO,
          this.frequenzaPeriodo
        );
      }
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "StatisticheComponent.ricalcolaFrequenza"
      );
    }
  }

  private async ricaricaVolume(): Promise<void> {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    try {
      const response = await this.statisticsService
        .getVolume(user.userId, this.volumePeriodo)
        .toPromise();

      if (response?.datiVolume) {
        this.volumeDati = response.datiVolume;
      }
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "StatisticheComponent.ricaricaVolume"
      );
    }
  }
}
