import { Injectable } from "@angular/core";
import { ApiCatalogService } from "./api-catalog.service";
import { Router } from "@angular/router";
import {ExerciseDTO} from "../../models/exercise/exercisedto";
import {ExerciseResponseModel} from "../../models/exercise/exercise-model";

@Injectable({
  providedIn: "root",
})
export class ExerciseService {

  private exercises: ExerciseDTO[] | undefined;

  constructor(
    private router: Router,
    private apiCatalogService: ApiCatalogService
  ) {
  }

  getExercises(){
    return this.exercises;
  }

  getAllExercise(){
    this.apiCatalogService.executeApiCall(
      "exercise",
      "get-all",
      undefined,
      null
    ).subscribe({
        next: (value: unknown) => {
          const response = value as ExerciseResponseModel
          console.log("RESP EXERCISE: ", response);
          if (!response.errore.error){
            this.exercises = response.exercises;
          }
        },
        error: (error) => {
          console.log("ERRORE CARICAMENTO ESERCIZI: ",error);
        }
      }
    )
  }

  getGymExercisesArray(): { id: number; label: string }[] {
    // @ts-ignore
    return this.getExercises()
      .map(exercise => ({
        id: exercise.id,
        label: exercise.name
      }));
  }

}
