import { Component, OnInit, ViewChild, ElementRef, inject } from "@angular/core";
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

  @ViewChild('printOnlyContainer') printOnlyContainer!: ElementRef<HTMLElement>;

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

  async stampa(): Promise<void> {
    const spinnerId = this.spinnerService.showWithResult('Generazione PDF', {
      successMessage: 'PDF pronto',
      errorMessage: 'Errore generazione PDF',
      resultDuration: 1500,
      minSpinnerDuration: 300,
    });

    try {
      const [{ jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas'),
      ]);

      const container = this.printOnlyContainer.nativeElement;

      Object.assign(container.style, {
        display: 'block',
        position: 'fixed',
        left: '-9999px',
        top: '0',
        width: '1400px',
        zIndex: '-1',
      });

      // Force layout
      container.getBoundingClientRect();

      const sections = Array.from(
        container.querySelectorAll<HTMLElement>('.print-day-section')
      );

      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const margin = 10;
      const usableW = pdf.internal.pageSize.getWidth() - margin * 2;
      const usableH = pdf.internal.pageSize.getHeight() - margin * 2;

      for (let i = 0; i < sections.length; i++) {
        const canvas = await html2canvas(sections[i], {
          scale: 2,
          backgroundColor: '#ffffff',
          useCORS: true,
          logging: false,
          onclone: (_clonedDoc: Document, clonedEl: HTMLElement) => {
            const style = clonedEl.ownerDocument.createElement('style');
            style.textContent = `
              * { color: #000 !important; background: transparent !important; }
              table th, table td {
                border: 1px solid #ccc !important;
                padding: 6px 8px !important;
                font-size: 11px !important;
                background: transparent !important;
              }
              thead th { background: #f0f0f0 !important; }
              .progress-table-container {
                overflow: visible !important;
                border: 1px solid #ddd !important;
                border-radius: 0 !important;
                background: #fff !important;
              }
              .exercise-col { position: static !important; background: #fff !important; }
              thead .exercise-col { background: #f0f0f0 !important; }
              .week-number { color: #000 !important; font-weight: 700 !important; }
              .week-date { color: #555 !important; }
              .print-day-title { color: #000 !important; border-bottom: 2px solid #000 !important; }
            `;
            clonedEl.ownerDocument.head.appendChild(style);
          },
        });

        const ratio = canvas.width / canvas.height;
        let imgW = usableW;
        let imgH = imgW / ratio;

        if (imgH > usableH) {
          imgH = usableH;
          imgW = imgH * ratio;
        }

        if (i > 0) pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', margin, margin, imgW, imgH);
      }

      // Restore visibility
      Object.assign(container.style, {
        display: '',
        position: '',
        left: '',
        top: '',
        width: '',
        zIndex: '',
      });

      const fileName = this.progressData?.workoutName
        ? `${this.progressData.workoutName.replace(/[^a-z0-9]/gi, '_')}.pdf`
        : 'progressione_scheda.pdf';

      pdf.save(fileName);
      this.spinnerService.setSuccess(spinnerId);
    } catch (error) {
      this.errorHandlerService.logError(error, 'ProgressioneScheda.stampa');
      this.spinnerService.setError(spinnerId);
    }
  }
}
