import { Component, inject, OnInit } from "@angular/core";
import { getGymExercisesArray } from "../../enums/gym-exercises";
import { ErrorHandlerService } from "src/app/core/services/error-handler.service";
import { getExerciseIconPathByExerciseId } from "../../enums/exercise-icons";
import { ExerciseIconColorPipe } from "../../../core/pipes/exercise-icon-color";
import { BottomSheetController } from "src/app/components/shared/bottom-sheet/bottom-sheet-controller";

@Component({
  selector: "app-workout-list-selector",
  imports: [ExerciseIconColorPipe],
  templateUrl: "./workout-list-selector.html",
  styleUrl: "./workout-list-selector.scss",
})
export class WorkoutListSelector {
  exercises = getGymExercisesArray();
  public exercisesView: ExerciseViewModel[] = [];

  private errorHandlerService = inject(ErrorHandlerService);
  private bottomSheetController = inject(BottomSheetController<ExerciseViewModel>);

  ngOnInit(): void {
    try {
      this.exercises.forEach((el) => {
        this.exercisesView.push({
          id: el.id,
          label: el.label,
          imgPath: getExerciseIconPathByExerciseId(el.id),
        });
      });
    } catch (error) {
      this.errorHandlerService.handleError(error, "WorkoutComponent.ngOnInit");
    }
  }

  async selectExercise(exercise: ExerciseViewModel): Promise<void> {
    try {
      console.log('🟢 [1] selectExercise chiamato con:', exercise);
      console.log('🟢 [2] Bottom Sheet ID:', this.bottomSheetController.bottomSheetId);
      
      // Chiude il bottom sheet e ritorna l'esercizio selezionato
      const result = await this.bottomSheetController.dismiss(exercise, 'selected');
      console.log('🟢 [3] Dismiss result:', result);
    } catch (error) {
      console.error('🔴 Errore in selectExercise:', error);
      this.errorHandlerService.handleError(error, "WorkoutComponent.selectExercise");
    }
  }

  async cancel(): Promise<void> {
    // Chiude il bottom sheet senza ritornare dati
    await this.bottomSheetController.dismiss(undefined, 'cancel');
  }
}

export interface ExerciseViewModel {
  id: number;
  label: string;
  imgPath: string;
}