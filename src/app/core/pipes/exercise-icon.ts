// exercise-icon.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { getIconPathById } from 'src/app/components/enums/exercise-icons';

@Pipe({
  name: 'exerciseIcon',
  standalone: true
})
export class ExerciseIconPipe implements PipeTransform {
  transform(iconId: number | null | undefined): string {
    return getIconPathById(iconId);
  }
}