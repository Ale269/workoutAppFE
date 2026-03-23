import { Component, Input, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RecordPersonaleItem } from "src/app/models/statistics/statistics-models";
import { ExerciseService } from "src/app/core/services/exercise.service";

@Component({
  selector: "app-record-personali",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./record-personali.html",
  styleUrls: ["./record-personali.scss"],
})
export class RecordPersonali {
  @Input() records: RecordPersonaleItem[] = [];

  private exerciseService = inject(ExerciseService);

  getIconPath(idIcona: number): string {
    return this.exerciseService.getExerciseIconPathByExerciseId(
      this.getExerciseIdByIcon(idIcona)
    );
  }

  getIconColor(idTipoEsercizio: number): string {
    return this.exerciseService.getExerciseColorByExerciseId(idTipoEsercizio);
  }

  formatData(data: string): string {
    const d = new Date(data);
    return d.toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  private getExerciseIdByIcon(idIcona: number): number | null {
    const exercises = this.exerciseService.getExercises();
    if (!exercises) return null;
    const ex = exercises.find((e) => e.idIcona === idIcona);
    return ex ? ex.idTipoEsercizio : null;
  }
}
