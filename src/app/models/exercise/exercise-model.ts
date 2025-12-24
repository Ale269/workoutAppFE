import { BaseResponseModel } from "../base-response/base-response";
import {ExerciseDTO} from "./exercisedto";

export interface ExerciseResponseModel extends BaseResponseModel {
  exercises: ExerciseDTO[];
}

