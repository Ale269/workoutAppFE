import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MenuConfigService } from "src/app/core/services/menu-config.service";
import { SpinnerService } from "src/app/core/services/spinner.service";
import { AuthService } from "src/app/core/services/auth.service";
import { ErrorHandlerService } from "src/app/core/services/error-handler.service";
import { StatisticsService } from "src/app/core/services/statistics.service";
import { CustomTabContainerComponent } from "../shared/tabs/custom-tab-container/custom-tab-container";
import { CustomTabComponent } from "../shared/tabs/custom-tab-components/custom-tab-components";
import { ProgressTableComponent } from "./progress-table/progress-table";
import {
  WorkoutProgressResponse,
  TrainingDayProgress,
  SnapshotWorkoutItem,
} from "src/app/models/statistics/workout-progress-models";

@Component({
  selector: "app-progressione-scheda",
  standalone: true,
  imports: [
    CommonModule,
    CustomTabContainerComponent,
    CustomTabComponent,
    ProgressTableComponent,
  ],
  templateUrl: "./progressione-scheda.html",
  styleUrls: ["./progressione-scheda.scss"],
})
export class ProgressioneSchedaComponent implements OnInit {
  private menuConfigService = inject(MenuConfigService);
  private spinnerService = inject(SpinnerService);
  private authService = inject(AuthService);
  private errorHandlerService = inject(ErrorHandlerService);
  private statisticsService = inject(StatisticsService);

  snapshotWorkouts: SnapshotWorkoutItem[] = [];
  selectedSnapshot: SnapshotWorkoutItem | null = null;
  progressData: WorkoutProgressResponse | null = null;
  activeTabId = "";

  ngOnInit(): void {
    this.menuConfigService.setConfig({ leftButton: "none" });
    this.caricaSchede();
  }

  async caricaSchede(): Promise<void> {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    try {
      const response = await this.statisticsService
        .getSnapshotWorkouts(user.userId)
        .toPromise();

      if (response?.workouts) {
        this.snapshotWorkouts = response.workouts;
        if (this.snapshotWorkouts.length > 0) {
          const active = this.snapshotWorkouts.find((s) => s.active);
          this.selezionaScheda(active || this.snapshotWorkouts[0]);
        }
      }
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "ProgressioneScheda.caricaSchede"
      );
    }
  }

  async selezionaScheda(snapshot: SnapshotWorkoutItem): Promise<void> {
    this.selectedSnapshot = snapshot;

    const spinnerId = this.spinnerService.showWithResult(
      "Caricamento progressione",
      {
        successMessage: "Dati caricati",
        errorMessage: "Errore nel caricamento",
        resultDuration: 300,
        minSpinnerDuration: 300,
      }
    );

    try {
      const response = await this.statisticsService
        .getWorkoutProgress(snapshot.id)
        .toPromise();

      if (response) {
        this.progressData = response;
        if (response.trainingDays?.length > 0) {
          this.activeTabId = response.trainingDays[0].dayName;
        }
      }
      this.spinnerService.setSuccess(spinnerId);
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "ProgressioneScheda.selezionaScheda"
      );
      this.spinnerService.setError(spinnerId);
    }
  }

  formatDateRange(snapshot: SnapshotWorkoutItem): string {
    const start = snapshot.activationDate
      ? new Date(snapshot.activationDate).toLocaleDateString("it-IT", {
          day: "2-digit",
          month: "short",
          year: "2-digit",
        })
      : "";
    const end = snapshot.deactivationDate
      ? new Date(snapshot.deactivationDate).toLocaleDateString("it-IT", {
          day: "2-digit",
          month: "short",
          year: "2-digit",
        })
      : "in corso";
    return `${start} — ${end}`;
  }

  stampa(): void {
    window.print();
  }
}
