export interface ExerciseTypeDTO {
  idTipoEsercizio: number;
  nomeTipoEsercizio: string;
  idMuscoli: number[];
  idIcona: number;
  createdById: number | null;
  isStandard: boolean;
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
