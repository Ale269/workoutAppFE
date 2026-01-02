import { Pipe, PipeTransform, inject } from '@angular/core';
import { ExerciseService } from '../services/exercise.service';

@Pipe({
  name: 'exerciseName',
  standalone: true
})
export class ExerciseNamePipe implements PipeTransform {
  private exerciseService = inject(ExerciseService);

  transform(exerciseId: number | null | undefined): string {
    return this.exerciseService.getExerciseName(exerciseId);
  }
}