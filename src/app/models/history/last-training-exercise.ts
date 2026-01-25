import { CommonResponseModel } from "../base-response/common-response-status";

export interface LastTrainingExerciseRequestModel {
  userId: number;
  exerciseId: number;
  excludeHistoryTrainingId?: number;
}

export interface LastTrainingExerciseResponseModel {
  esercizio: LastTrainingExerciseData | null;
  errore: CommonResponseModel | null;
}

export interface LastTrainingExerciseData {
  idEsercizio: number;
  icona: string;
  dataEsecuzione: Date;
  listaSerie: LastTrainingSerieData[];
}

export interface LastTrainingSerieData {
  id: number;
  ripetizioni: number;
  carico: number;
}
