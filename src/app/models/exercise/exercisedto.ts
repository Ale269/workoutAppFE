export interface ExerciseTypeDTO {
  idTipoEsercizio: number;
  nomeTipoEsercizio: string;
  idMuscoli: number[];
  idIcona: number;
}

export interface MuscleGroupDTO {
  idMuscolo: number;
  nomeMuscolo: string;
}

export interface IconExerciseDTO {
  idIcona: number;
  nomeIcona: string;
  coloreIcona: string; // Es: "#EF4444"
}
