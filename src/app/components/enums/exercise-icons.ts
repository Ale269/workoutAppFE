import { GymExercises } from "./gym-exercises";

// exercise-icons.enum.ts
export enum ExerciseIcons {
  DEFAULT = 0,
  BICIPITI = 1,
  DORSALI = 2,
  PETTO = 3,
  SPALLE = 4,
  GAMBE = 5,
  CORE = 6,
  CARDIO = 7
}

// Mappa per i path delle icone
export const ExerciseIconPaths: Record<ExerciseIcons, string> = {
  [ExerciseIcons.DEFAULT]: 'assets/recollect/images/default-icon.png',
  [ExerciseIcons.BICIPITI]: 'assets/recollect/images/bicipite-icon.png',
  [ExerciseIcons.DORSALI]: 'assets/recollect/images/dorsali-icon.png',
  [ExerciseIcons.PETTO]: 'assets/recollect/images/petto-icon.png',
  [ExerciseIcons.SPALLE]: 'assets/recollect/images/spalle-icon.png',
  [ExerciseIcons.GAMBE]: 'assets/recollect/images/gambe-icon.png',
  [ExerciseIcons.CORE]: 'assets/recollect/images/core-icon.png',
  [ExerciseIcons.CARDIO]: 'assets/recollect/images/cardio-icon.png'
};

// Labels per i nomi delle icone
export const ExerciseIconLabels: Record<ExerciseIcons, string> = {
  [ExerciseIcons.DEFAULT]: 'Icona Default',
  [ExerciseIcons.BICIPITI]: 'Bicipiti',
  [ExerciseIcons.DORSALI]: 'Dorsali',
  [ExerciseIcons.PETTO]: 'Petto',
  [ExerciseIcons.SPALLE]: 'Spalle',
  [ExerciseIcons.GAMBE]: 'Gambe',
  [ExerciseIcons.CORE]: 'Core',
  [ExerciseIcons.CARDIO]: 'Cardio'
};


// *** MAPPATURA ESERCIZIO -> ICONA ***
// Questa è la mappatura che collega ogni esercizio alla sua icona
// Più esercizi possono condividere la stessa icona
export const ExerciseToIconMapping: Record<GymExercises, ExerciseIcons> = {
  // Esercizi per le gambe
  [GymExercises.SQUAT]: ExerciseIcons.GAMBE,
  [GymExercises.DEADLIFT]: ExerciseIcons.GAMBE,
  [GymExercises.LUNGES]: ExerciseIcons.GAMBE,
  [GymExercises.BULGARIAN_SPLIT_SQUAT]: ExerciseIcons.GAMBE,

  // Esercizi per il petto
  [GymExercises.BENCH_PRESS]: ExerciseIcons.PETTO,
  [GymExercises.DIPS]: ExerciseIcons.PETTO,

  // Esercizi per le spalle
  [GymExercises.OVERHEAD_PRESS]: ExerciseIcons.SPALLE,
  [GymExercises.LATERAL_RAISES]: ExerciseIcons.SPALLE,

  // Esercizi per i dorsali
  [GymExercises.BARBELL_ROW]: ExerciseIcons.DORSALI,
  [GymExercises.PULL_UP]: ExerciseIcons.DORSALI,
  [GymExercises.CHIN_UP]: ExerciseIcons.DORSALI,
  [GymExercises.FACE_PULLS]: ExerciseIcons.DORSALI,

  // Esercizi per i bicipiti
  [GymExercises.BICEP_CURLS]: ExerciseIcons.BICIPITI,

  // Esercizi per i tricipiti (potresti voler creare un'icona specifica)
  [GymExercises.TRICEP_EXTENSIONS]: ExerciseIcons.BICIPITI, // O creare ExerciseIcons.TRICIPITI

  // Esercizi per il core
  [GymExercises.PLANK]: ExerciseIcons.CORE,
  [GymExercises.RUSSIAN_TWISTS]: ExerciseIcons.CORE,

  // Esercizi cardio
  [GymExercises.MOUNTAIN_CLIMBERS]: ExerciseIcons.CARDIO,
  [GymExercises.BURPEES]: ExerciseIcons.CARDIO,
  [GymExercises.JUMPING_JACKS]: ExerciseIcons.CARDIO,
  [GymExercises.HIGH_KNEES]: ExerciseIcons.CARDIO
};

// Utility functions
export function getExerciseIconPath(iconId: number | null | undefined): string {
  if (iconId === null || iconId === undefined) {
    return ExerciseIconPaths[ExerciseIcons.DEFAULT];
  }
  
  // Verifica che l'ID esista nell'enum
  const iconExists = Object.values(ExerciseIcons).includes(iconId);
  return iconExists 
    ? ExerciseIconPaths[iconId as ExerciseIcons]
    : ExerciseIconPaths[ExerciseIcons.DEFAULT];
}

// *** NUOVA FUNZIONE PRINCIPALE ***
// Questa funzione prende l'IdTipoEsercizio e restituisce il path dell'icona
export function getExerciseIconPathByExerciseId(exerciseId: number | null | undefined): string {
  if (exerciseId === null || exerciseId === undefined) {
    return ExerciseIconPaths[ExerciseIcons.DEFAULT];
  }

  // Verifica che l'esercizio esista nella mappatura
  const exerciseExists = Object.values(GymExercises).includes(exerciseId);
  if (!exerciseExists) {
    return ExerciseIconPaths[ExerciseIcons.DEFAULT];
  }

  // Ottieni l'icona associata all'esercizio
  const iconId = ExerciseToIconMapping[exerciseId as GymExercises];
  
  // Restituisci il path dell'icona
  return ExerciseIconPaths[iconId];
}

export function getExerciseIconsArray(): { id: number; label: string; path: string }[] {
  return Object.values(ExerciseIcons)
    .filter(value => typeof value === 'number')
    .map(id => ({
      id: id as number,
      label: ExerciseIconLabels[id as ExerciseIcons],
      path: ExerciseIconPaths[id as ExerciseIcons]
    }));
}

export const ExerciseIconColors: Record<ExerciseIcons, string> = {
  [ExerciseIcons.DEFAULT]: '#6B7280',      // Grigio neutro
  [ExerciseIcons.BICIPITI]: '#EF4444',     // Rosso per braccia
  [ExerciseIcons.DORSALI]: '#10B981',      // Verde per schiena
  [ExerciseIcons.PETTO]: '#F59E0B',        // Arancione per petto
  [ExerciseIcons.SPALLE]: '#8B5CF6',       // Viola per spalle
  [ExerciseIcons.GAMBE]: '#3B82F6',        // Blu per gambe
  [ExerciseIcons.CORE]: '#F97316',         // Arancione scuro per core
  [ExerciseIcons.CARDIO]: '#EC4899'        // Rosa per cardio
};

// Funzione per ottenere il colore dell'icona
export function getExerciseIconColor(iconId: number | null | undefined): string {
  if (iconId === null || iconId === undefined) {
    return ExerciseIconColors[ExerciseIcons.DEFAULT];
  }
  
  // Verifica che l'ID esista nell'enum
  const iconExists = Object.values(ExerciseIcons).includes(iconId);
  return iconExists 
    ? ExerciseIconColors[iconId as ExerciseIcons]
    : ExerciseIconColors[ExerciseIcons.DEFAULT];
}