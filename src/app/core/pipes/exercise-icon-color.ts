// exercise-icon-color.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { getExerciseIconColor } from 'src/app/components/enums/exercise-icons';

@Pipe({
  name: 'exerciseIconColor',
  standalone: true
})
export class ExerciseIconColorPipe implements PipeTransform {
  transform(iconId: number | null | undefined): string {
    return getExerciseIconColor(iconId);
  }
}