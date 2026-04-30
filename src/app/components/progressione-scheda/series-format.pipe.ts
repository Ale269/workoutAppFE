import { Pipe, PipeTransform } from "@angular/core";
import { SeriesData } from "src/app/models/statistics/workout-progress-models";

@Pipe({
  name: "seriesFormat",
  standalone: true,
})
export class SeriesFormatPipe implements PipeTransform {
  transform(series: SeriesData[] | null | undefined): string {
    if (!series || series.length === 0) return "-";

    const allSameReps = series.every((s) => s.reps === series[0].reps);
    const allSameLoad = series.every((s) => s.load === series[0].load);

    if (allSameReps && allSameLoad) {
      const loadStr = this.formatLoad(series[0].load);
      return `${series.length}×${series[0].reps}${loadStr}`;
    }

    if (allSameLoad) {
      const repsRange = series.map((s) => s.reps);
      const minReps = Math.min(...repsRange);
      const maxReps = Math.max(...repsRange);
      const loadStr = this.formatLoad(series[0].load);
      return `${series.length}×${minReps}-${maxReps}${loadStr}`;
    }

    return series
      .map((s) => `${s.reps}${this.formatLoad(s.load)}`)
      .join(", ");
  }

  private formatLoad(load: number | null): string {
    if (load === null || load === undefined || load === 0) return "";
    return `@${load % 1 === 0 ? load.toFixed(0) : load.toString()}`;
  }
}
