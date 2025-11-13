import { GymExercises } from "./gym-exercises";

// exercise-icons.enum.ts
export enum ExerciseIcons {
  DEFAULT = 0,
  BICIPITI = 1,
  DORSALI = 2,
  PETTO = 3,
  SPALLE = 4,
  QUADRICIPITI = 5,
  FEMORALI = 6,
  CORE = 8,
  CARDIO = 9
}

// Mappa per i path delle icone
export const ExerciseIconPaths: Record<ExerciseIcons, string> = {
  [ExerciseIcons.DEFAULT]: 'assets/recollect/images/default-icon.png',
  [ExerciseIcons.BICIPITI]: 'assets/recollect/images/bicipite-icon.png',
  [ExerciseIcons.DORSALI]: 'assets/recollect/images/dorsali-icon.png',
  [ExerciseIcons.PETTO]: 'assets/recollect/images/petto-icon.png',
  [ExerciseIcons.SPALLE]: 'assets/recollect/images/spalle-icon.png',
  [ExerciseIcons.QUADRICIPITI]: 'assets/recollect/images/quadricipiti-icon.png',
  [ExerciseIcons.FEMORALI]: 'assets/recollect/images/femorali-icon.png',
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
  [ExerciseIcons.QUADRICIPITI]: 'Quadricipiti',
  [ExerciseIcons.FEMORALI]: 'Femorali',
  [ExerciseIcons.CORE]: 'Core',
  [ExerciseIcons.CARDIO]: 'Cardio'
};


// *** MAPPATURA ESERCIZIO -> ICONA ***
// Questa è la mappatura che collega ogni esercizio alla sua icona
// Più esercizi possono condividere la stessa icona
export const ExerciseToIconMapping: Record<GymExercises, ExerciseIcons> = {
  // Esercizi per il petto
  [GymExercises.BENCH_PRESS_BILANCIERE]: ExerciseIcons.PETTO,
  [GymExercises.PANCA_INCLINATA_MANUBRI]: ExerciseIcons.PETTO,
  [GymExercises.CROCI_CAVI]: ExerciseIcons.PETTO,
  [GymExercises.FLESSIONI]: ExerciseIcons.PETTO,
  [GymExercises.PANCA_DECLINATA_BILANCIERE]: ExerciseIcons.PETTO,
  [GymExercises.CROCI_PANCA_PIANA_MANUBRI]: ExerciseIcons.PETTO,
  [GymExercises.DISTENSIONI_MANUBRI_PANCA_PIANA]: ExerciseIcons.PETTO,
  [GymExercises.PEC_DECK]: ExerciseIcons.PETTO,
  [GymExercises.PUSH_UP_LARGHI]: ExerciseIcons.PETTO,
  [GymExercises.PULLOVER_MANUBRIO]: ExerciseIcons.PETTO,
  [GymExercises.DIP_PARALLELE]: ExerciseIcons.PETTO,

  // Esercizi per i dorsali
  [GymExercises.TRAZIONI_SBARRA]: ExerciseIcons.DORSALI,
  [GymExercises.REMATORE_BILANCIERE]: ExerciseIcons.DORSALI,
  [GymExercises.LAT_MACHINE]: ExerciseIcons.DORSALI,
  [GymExercises.STACCO_DA_TERRA]: ExerciseIcons.DORSALI,
  [GymExercises.REMATORE_MANUBRIO]: ExerciseIcons.DORSALI,
  [GymExercises.PULLEY_BASSO]: ExerciseIcons.DORSALI,
  [GymExercises.IPERESTENSIONI]: ExerciseIcons.DORSALI,
  [GymExercises.FARMERS_WALK]: ExerciseIcons.DORSALI,

  // Esercizi per le spalle
  [GymExercises.LENTO_AVANTI]: ExerciseIcons.SPALLE,
  [GymExercises.ALZATE_LATERALI_MANUBRI]: ExerciseIcons.SPALLE,
  [GymExercises.SHOULDER_PRESS_MANUBRI]: ExerciseIcons.SPALLE,
  [GymExercises.ALZATE_FRONTALI_MANUBRI]: ExerciseIcons.SPALLE,
  [GymExercises.ARNOLD_PRESS]: ExerciseIcons.SPALLE,
  [GymExercises.TIRATE_AL_MENTO]: ExerciseIcons.SPALLE,
  [GymExercises.CROCI_INVERSE_PANCA]: ExerciseIcons.SPALLE,

  // Esercizi per i bicipiti
  [GymExercises.CURL_BILANCIERE]: ExerciseIcons.BICIPITI,
  [GymExercises.CURL_ALTERNATO_MANUBRI]: ExerciseIcons.BICIPITI,
  [GymExercises.HAMMER_CURL]: ExerciseIcons.BICIPITI,
  [GymExercises.CURL_CONCENTRAZIONE]: ExerciseIcons.BICIPITI,
  [GymExercises.CURL_PANCA_SCOTT]: ExerciseIcons.BICIPITI,

  // Esercizi per i tricipiti
  [GymExercises.FRENCH_PRESS_MANUBRI]: ExerciseIcons.BICIPITI,
  [GymExercises.PUSHDOWN_CAVI]: ExerciseIcons.BICIPITI,
  [GymExercises.KICKBACK_MANUBRIO]: ExerciseIcons.BICIPITI,
  [GymExercises.SKULL_CRUSHER]: ExerciseIcons.BICIPITI,

  // Esercizi per avambracci
  [GymExercises.CURL_AVAMBRACCI]: ExerciseIcons.BICIPITI,
  [GymExercises.REVERSE_CURL]: ExerciseIcons.BICIPITI,

  // Esercizi per i quadricipiti
  [GymExercises.SQUAT_BILANCIERE]: ExerciseIcons.QUADRICIPITI,
  [GymExercises.LEG_PRESS]: ExerciseIcons.QUADRICIPITI,
  [GymExercises.LEG_EXTENSION]: ExerciseIcons.QUADRICIPITI,
  [GymExercises.HACK_SQUAT]: ExerciseIcons.QUADRICIPITI,
  [GymExercises.SQUAT_BULGARO]: ExerciseIcons.QUADRICIPITI,
  [GymExercises.PISTOL_SQUAT]: ExerciseIcons.QUADRICIPITI,
  [GymExercises.AFFONDI]: ExerciseIcons.QUADRICIPITI,
  [GymExercises.BOX_JUMP]: ExerciseIcons.QUADRICIPITI,

  // Esercizi per i femorali
  [GymExercises.LEG_CURL]: ExerciseIcons.FEMORALI,
  [GymExercises.STACCO_RUMENO]: ExerciseIcons.FEMORALI,
  [GymExercises.GOOD_MORNING]: ExerciseIcons.FEMORALI,

  // Esercizi per glutei (mappati ai femorali essendo muscoli posteriori della gamba)
  [GymExercises.HIP_THRUST]: ExerciseIcons.FEMORALI,
  [GymExercises.GLUTE_BRIDGE]: ExerciseIcons.FEMORALI,
  [GymExercises.CABLE_PULL_THROUGH]: ExerciseIcons.FEMORALI,

  // Esercizi per polpacci (mappati ai quadricipiti essendo parte delle gambe)
  [GymExercises.CALF_RAISE_IN_PIEDI]: ExerciseIcons.QUADRICIPITI,
  [GymExercises.CALF_RAISE_SEDUTO]: ExerciseIcons.QUADRICIPITI,

  // Esercizi per il core
  [GymExercises.PLANK]: ExerciseIcons.CORE,
  [GymExercises.CRUNCH]: ExerciseIcons.CORE,
  [GymExercises.RUSSIAN_TWIST]: ExerciseIcons.CORE,
  [GymExercises.LEG_RAISE]: ExerciseIcons.CORE,
  [GymExercises.SIT_UP]: ExerciseIcons.CORE,
  [GymExercises.CRUNCH_INVERSO]: ExerciseIcons.CORE,
  [GymExercises.V_UP]: ExerciseIcons.CORE,
  [GymExercises.SUPERWOMAN]: ExerciseIcons.CORE,

  // Esercizi cardio
  [GymExercises.CORSA_TAPIS_ROULANT]: ExerciseIcons.CARDIO,
  [GymExercises.CYCLETTE]: ExerciseIcons.CARDIO,
  [GymExercises.VOGATORE]: ExerciseIcons.CARDIO,
  [GymExercises.ELLITTICA]: ExerciseIcons.CARDIO,
  [GymExercises.SALTO_CORDA]: ExerciseIcons.CARDIO,
  [GymExercises.HIGH_KNEES]: ExerciseIcons.CARDIO,
  [GymExercises.JUMPING_JACKS]: ExerciseIcons.CARDIO,
  [GymExercises.MOUNTAIN_CLIMBERS]: ExerciseIcons.CARDIO,
  [GymExercises.BURPEES]: ExerciseIcons.CARDIO,
  [GymExercises.KETTLEBELL_SWING]: ExerciseIcons.CARDIO
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
  [ExerciseIcons.DEFAULT]: '#6B7280',        // Grigio neutro
  [ExerciseIcons.BICIPITI]: '#EF4444',       // Rosso per braccia
  [ExerciseIcons.DORSALI]: '#10B981',        // Verde per schiena
  [ExerciseIcons.PETTO]: '#F59E0B',          // Arancione per petto
  [ExerciseIcons.SPALLE]: '#8B5CF6',         // Viola per spalle
  [ExerciseIcons.QUADRICIPITI]: '#3B82F6',   // Blu per quadricipiti
  [ExerciseIcons.FEMORALI]: '#06B6D4',       // Cyan per femorali
  [ExerciseIcons.CORE]: '#F97316',           // Arancione scuro per core
  [ExerciseIcons.CARDIO]: '#EC4899'          // Rosa per cardio
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