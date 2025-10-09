import { Component } from "@angular/core";
import { getGymExercisesArray } from "../../enums/gym-exercises";
import { ErrorHandlerService } from "src/app/core/services/error-handler.service";
import { getExerciseIconPathByExerciseId } from "../../enums/exercise-icons";
import { ExerciseIconColorPipe } from "../../../core/pipes/exercise-icon-color";

@Component({
  selector: "app-workout-list-selector",
  imports: [ExerciseIconColorPipe],
  templateUrl: "./workout-list-selector.html",
  styleUrl: "./workout-list-selector.scss",
})
export class WorkoutListSelector {
  exercises = getGymExercisesArray();

  public exercisesView: ExerciseViewModel[] = [];

  constructor(private errorHandlerService: ErrorHandlerService) {}
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
}

export interface ExerciseViewModel {
  id: number;
  label: string;
  imgPath: string;
}
