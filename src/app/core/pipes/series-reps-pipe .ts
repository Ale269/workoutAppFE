import { Pipe, PipeTransform } from '@angular/core';

export interface SerieDTO {
  id: number;
  ripetizioni: number;
  carico: number;
  ordinamento: number;
}

@Pipe({
  name: 'seriesReps',
  standalone: true
})
export class SeriesRepsPipe implements PipeTransform {
  transform(series: SerieDTO[] | null | undefined): string {
    if (!series || series.length === 0) {
      return '';
    }
    
    // Ordina le serie per ordinamento e crea la stringa "reps-reps-reps"
    return series
      .sort((a, b) => a.ordinamento - b.ordinamento)
      .map(serie => serie.ripetizioni.toString())
      .join('-');
  }
}