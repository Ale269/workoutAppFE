import { BaseResponseModel } from "../base-response/base-response";
import {ExerciseTypeDTO, IconExerciseDTO, MuscleGroupDTO} from "./exercisedto";

export interface GetAllExerciseTypeResponseModel extends BaseResponseModel {
  exercises: ExerciseTypeDTO[];
  muscles: MuscleGroupDTO[];
  icons: IconExerciseDTO[];
}
