import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TrainingDayProgress } from "src/app/models/statistics/workout-progress-models";
import { SeriesFormatPipe } from "../series-format.pipe";

@Component({
  selector: "app-progress-table",
  standalone: true,
  imports: [CommonModule, SeriesFormatPipe],
  templateUrl: "./progress-table.html",
  styleUrls: ["./progress-table.scss"],
})
export class ProgressTableComponent {
  @Input() dayProgress!: TrainingDayProgress;

  formatDate(isoDate: string): string {
    const d = new Date(isoDate);
    return d.toLocaleDateString("it-IT", { day: "2-digit", month: "short" });
  }
}
