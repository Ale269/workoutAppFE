// exercise-name.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { GymExerciseLabels, GymExercises } from 'src/app/components/enums/gym-exercises';

@Pipe({
  name: 'exerciseName',
  standalone: true
})
export class ExerciseNamePipe implements PipeTransform {
  transform(exerciseId: number | null | undefined): string {
    if (exerciseId == null) {
      return 'Esercizio non specificato';
    }
    
    return GymExerciseLabels[exerciseId as GymExercises] || 'Esercizio sconosciuto';
  }
}