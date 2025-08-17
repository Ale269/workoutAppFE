// gym-exercises.enum.ts
export enum GymExercises {
  SQUAT = 1,
  DEADLIFT = 2,
  BENCH_PRESS = 3,
  OVERHEAD_PRESS = 4,
  BARBELL_ROW = 5,
  PULL_UP = 6,
  CHIN_UP = 7,
  DIPS = 8,
  LUNGES = 9,
  BULGARIAN_SPLIT_SQUAT = 10,
  BICEP_CURLS = 11,
  TRICEP_EXTENSIONS = 12,
  LATERAL_RAISES = 13,
  FACE_PULLS = 14,
  PLANK = 15,
  RUSSIAN_TWISTS = 16,
  MOUNTAIN_CLIMBERS = 17,
  BURPEES = 18,
  JUMPING_JACKS = 19,
  HIGH_KNEES = 20
}

// Mappa per i nomi visualizzati
export const GymExerciseLabels: Record<GymExercises, string> = {
  [GymExercises.SQUAT]: 'Squat',
  [GymExercises.DEADLIFT]: 'Stacco da Terra',
  [GymExercises.BENCH_PRESS]: 'Panca Piana',
  [GymExercises.OVERHEAD_PRESS]: 'Military Press',
  [GymExercises.BARBELL_ROW]: 'Rematore con Bilanciere',
  [GymExercises.PULL_UP]: 'Trazioni',
  [GymExercises.CHIN_UP]: 'Trazioni Supine',
  [GymExercises.DIPS]: 'Dips',
  [GymExercises.LUNGES]: 'Affondi',
  [GymExercises.BULGARIAN_SPLIT_SQUAT]: 'Squat Bulgaro',
  [GymExercises.BICEP_CURLS]: 'Curl Bicipiti',
  [GymExercises.TRICEP_EXTENSIONS]: 'Estensioni Tricipiti',
  [GymExercises.LATERAL_RAISES]: 'Alzate Laterali',
  [GymExercises.FACE_PULLS]: 'Face Pull',
  [GymExercises.PLANK]: 'Plank',
  [GymExercises.RUSSIAN_TWISTS]: 'Russian Twist',
  [GymExercises.MOUNTAIN_CLIMBERS]: 'Mountain Climber',
  [GymExercises.BURPEES]: 'Burpees',
  [GymExercises.JUMPING_JACKS]: 'Jumping Jack',
  [GymExercises.HIGH_KNEES]: 'Ginocchia al Petto'
};

// Utility per convertire l'enum in array
export function getGymExercisesArray(): { id: number; label: string }[] {
  return Object.values(GymExercises)
    .filter(value => typeof value === 'number') // Filtra solo i valori numerici
    .map(id => ({
      id: id as number,
      label: GymExerciseLabels[id as GymExercises]
    }));
}