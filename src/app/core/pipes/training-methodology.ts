// training-methodology.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { TrainingMethodology, TrainingMethodologyLabels } from 'src/app/components/enums/training-methodology';

@Pipe({
  name: 'trainingMethodology',
  standalone: true
})
export class TrainingMethodologyPipe implements PipeTransform {
  transform(methodologyId: number | null | undefined): string {
    if (methodologyId == null) {
      return '';
    }
    
    return TrainingMethodologyLabels[methodologyId as TrainingMethodology] || '';
  }
}