export interface WorkoutProgressResponse {
  workoutName: string;
  trainingDays: TrainingDayProgress[];
}

export interface TrainingDayProgress {
  dayName: string;
  weeks: WeekColumn[];
  exercises: ExerciseRow[];
}

export interface WeekColumn {
  weekNumber: number;
  executedAt: string;
}

export interface ExerciseRow {
  exerciseId: number;
  exerciseName: string;
  ordering: number;
  cells: (CellData | null)[];
}

export interface CellData {
  weekNumber: number;
  series: SeriesData[];
}

export interface SeriesData {
  reps: number;
  load: number | null;
}

export interface SnapshotWorkoutsListResponse {
  workouts: SnapshotWorkoutItem[];
}

export interface SnapshotWorkoutItem {
  id: number;
  name: string;
  activationDate: string;
  deactivationDate: string | null;
  active: boolean;
}
