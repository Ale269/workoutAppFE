import { CommonResponseModel } from "../base-response/common-response-status";

export interface LastTrainingExerciseRequestModel {
  userId: number;
  exerciseId: number;
  excludeCurrent: boolean;
}

export interface LastTrainingExerciseResponseModel {
  esercizio: LastTrainingExerciseData | null;
  errore: CommonResponseModel | null;
}

export interface LastTrainingExerciseData {
  idEsercizio: number;
  icona: string;
  listaSerie: LastTrainingSerieData[];
}

export interface LastTrainingSerieData {
  id: number;
  ripetizioni: number;
  carico: number;
}
