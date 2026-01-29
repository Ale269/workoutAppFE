import { ExerciseTypeDTO } from './exercisedto';
import { BaseResponseModel } from '../base-response/base-response';

// Request per creazione esercizio
export interface CreateExerciseRequestModel {
  name: string;
  description?: string;
  iconId: number;
  muscleIds: number[];
  userId: number;
  isStandard: boolean;
}

// Request per aggiornamento esercizio
export interface UpdateExerciseRequestModel {
  name?: string;
  description?: string;
  iconId?: number;
  muscleIds?: number[];
  userId: number;
  isStandard: boolean;
}

// Response per lista esercizi
export interface ExerciseListResponseModel extends BaseResponseModel {
  exercises: ExerciseTypeDTO[];
}

// Response per singolo esercizio
export interface ExerciseDetailResponseModel extends BaseResponseModel {
  exercise: ExerciseTypeDTO;
}

// Response per creazione esercizio
export interface CreateExerciseResponseModel extends BaseResponseModel {
  exercise: ExerciseTypeDTO;
}

// Response per aggiornamento esercizio
export interface UpdateExerciseResponseModel extends BaseResponseModel {
  exercise: ExerciseTypeDTO;
}

// Response per eliminazione esercizio
export interface DeleteExerciseResponseModel extends BaseResponseModel {
  message?: string;
}
