// gym-exercises.enum.ts
export enum GymExercises {
  // --- Petto (CHEST) ---
  BENCH_PRESS_BILANCIERE = 1,
  PANCA_INCLINATA_MANUBRI = 2,
  CROCI_CAVI = 3,
  FLESSIONI = 4,
  PANCA_DECLINATA_BILANCIERE = 5,
  CROCI_PANCA_PIANA_MANUBRI = 6,
  DISTENSIONI_MANUBRI_PANCA_PIANA = 7,
  PEC_DECK = 8,
  PUSH_UP_LARGHI = 9,
  PULLOVER_MANUBRIO = 10,

  // --- Dorso (BACK) ---
  TRAZIONI_SBARRA = 11,
  REMATORE_BILANCIERE = 12,
  LAT_MACHINE = 13,
  STACCO_DA_TERRA = 14,
  REMATORE_MANUBRIO = 15,
  PULLEY_BASSO = 16,
  IPERESTENSIONI = 17,
  GOOD_MORNING = 18,
  FARMERS_WALK = 19,

  // --- Spalle (SHOULDERS) ---
  LENTO_AVANTI = 20,
  ALZATE_LATERALI_MANUBRI = 21,
  SHOULDER_PRESS_MANUBRI = 22,
  ALZATE_FRONTALI_MANUBRI = 23,
  ARNOLD_PRESS = 24,
  TIRATE_AL_MENTO = 25,
  CROCI_INVERSE_PANCA = 26,

  // --- Bicipiti (BICEPS) ---
  CURL_BILANCIERE = 27,
  CURL_ALTERNATO_MANUBRI = 28,
  HAMMER_CURL = 29,
  CURL_CONCENTRAZIONE = 30,
  CURL_PANCA_SCOTT = 31,

  // --- Tricipiti (TRICEPS) ---
  FRENCH_PRESS_MANUBRI = 32,
  DIP_PARALLELE = 33,
  PUSHDOWN_CAVI = 34,
  KICKBACK_MANUBRIO = 35,
  SKULL_CRUSHER = 36,

  // --- Avambracci (FOREARMS) ---
  CURL_AVAMBRACCI = 37,
  REVERSE_CURL = 38,

  // --- Quadricipiti (QUADS) ---
  SQUAT_BILANCIERE = 39,
  LEG_PRESS = 40,
  LEG_EXTENSION = 41,
  HACK_SQUAT = 42,
  SQUAT_BULGARO = 43,
  PISTOL_SQUAT = 44,

  // --- Femorali e Glutei (HAMSTRINGS & GLUTES) ---
  AFFONDI = 45,
  LEG_CURL = 46,
  HIP_THRUST = 47,
  STACCO_RUMENO = 48,
  GLUTE_BRIDGE = 49,
  CABLE_PULL_THROUGH = 50,

  // --- Polpacci (CALVES) ---
  CALF_RAISE_IN_PIEDI = 51,
  CALF_RAISE_SEDUTO = 52,

  // --- Addominali (ABS) ---
  PLANK = 53,
  CRUNCH = 54,
  RUSSIAN_TWIST = 55,
  LEG_RAISE = 56,
  SIT_UP = 57,
  CRUNCH_INVERSO = 58,
  V_UP = 59,

  // --- Lombari (LOWER BACK) ---
  SUPERWOMAN = 60,

  // --- Total Body (TOTAL BODY) ---
  BURPEES = 61,
  MOUNTAIN_CLIMBERS = 62,
  KETTLEBELL_SWING = 63,
  BOX_JUMP = 64,

  // --- Cardio (CARDIO) ---
  CORSA_TAPIS_ROULANT = 65,
  CYCLETTE = 66,
  VOGATORE = 67,
  ELLITTICA = 68,
  SALTO_CORDA = 69,
  HIGH_KNEES = 70,
  JUMPING_JACKS = 71
}

export const GymExerciseLabels: Record<GymExercises, string> = {
  [GymExercises.BENCH_PRESS_BILANCIERE]: 'Panca Piana con Bilanciere',
  [GymExercises.PANCA_INCLINATA_MANUBRI]: 'Panca Inclinata con Manubri',
  [GymExercises.CROCI_CAVI]: 'Croci ai Cavi',
  [GymExercises.FLESSIONI]: 'Flessioni (Push-ups)',
  [GymExercises.PANCA_DECLINATA_BILANCIERE]: 'Panca Declinata con Bilanciere',
  [GymExercises.CROCI_PANCA_PIANA_MANUBRI]: 'Croci su Panca Piana con Manubri',
  [GymExercises.DISTENSIONI_MANUBRI_PANCA_PIANA]: 'Distensioni con Manubri su Panca Piana',
  [GymExercises.PEC_DECK]: 'Pec Deck',
  [GymExercises.PUSH_UP_LARGHI]: 'Push-up Larghi',
  [GymExercises.PULLOVER_MANUBRIO]: 'Pullover con Manubrio',

  [GymExercises.TRAZIONI_SBARRA]: 'Trazioni alla Sbarra',
  [GymExercises.REMATORE_BILANCIERE]: 'Rematore con Bilanciere',
  [GymExercises.LAT_MACHINE]: 'Lat Machine',
  [GymExercises.STACCO_DA_TERRA]: 'Stacco da Terra (Deadlift)',
  [GymExercises.REMATORE_MANUBRIO]: 'Rematore con Manubrio (Single Arm)',
  [GymExercises.PULLEY_BASSO]: 'Pulley Basso',
  [GymExercises.IPERESTENSIONI]: 'Iperestensioni (Hyperextensions)',
  [GymExercises.GOOD_MORNING]: 'Good Morning',
  [GymExercises.FARMERS_WALK]: "Farmer's Walk",

  [GymExercises.LENTO_AVANTI]: 'Lento Avanti (Overhead Press)',
  [GymExercises.ALZATE_LATERALI_MANUBRI]: 'Alzate Laterali con Manubri',
  [GymExercises.SHOULDER_PRESS_MANUBRI]: 'Shoulder Press con Manubri',
  [GymExercises.ALZATE_FRONTALI_MANUBRI]: 'Alzate Frontali con Manubri',
  [GymExercises.ARNOLD_PRESS]: 'Arnold Press',
  [GymExercises.TIRATE_AL_MENTO]: 'Tirate al Mento (Upright Row)',
  [GymExercises.CROCI_INVERSE_PANCA]: 'Croci inverse su panca',

  [GymExercises.CURL_BILANCIERE]: 'Curl con Bilanciere',
  [GymExercises.CURL_ALTERNATO_MANUBRI]: 'Curl Alternato con Manubri',
  [GymExercises.HAMMER_CURL]: 'Hammer Curl',
  [GymExercises.CURL_CONCENTRAZIONE]: 'Curl di Concentrazione',
  [GymExercises.CURL_PANCA_SCOTT]: 'Curl su panca Scott',

  [GymExercises.FRENCH_PRESS_MANUBRI]: 'French Press con Manubri',
  [GymExercises.DIP_PARALLELE]: 'Dip alle Parallele',
  [GymExercises.PUSHDOWN_CAVI]: 'Pushdown ai Cavi',
  [GymExercises.KICKBACK_MANUBRIO]: 'Kickback con Manubrio',
  [GymExercises.SKULL_CRUSHER]: 'Skull Crusher',

  [GymExercises.CURL_AVAMBRACCI]: 'Curl per Avambracci',
  [GymExercises.REVERSE_CURL]: 'Reverse Curl',

  [GymExercises.SQUAT_BILANCIERE]: 'Squat con Bilanciere',
  [GymExercises.LEG_PRESS]: 'Leg Press',
  [GymExercises.LEG_EXTENSION]: 'Leg Extension',
  [GymExercises.HACK_SQUAT]: 'Hack Squat',
  [GymExercises.SQUAT_BULGARO]: 'Squat Bulgaro (Bulgarian Split Squat)',
  [GymExercises.PISTOL_SQUAT]: 'Pistol Squat',

  [GymExercises.AFFONDI]: 'Affondi (Lunges)',
  [GymExercises.LEG_CURL]: 'Leg Curl',
  [GymExercises.HIP_THRUST]: 'Hip Thrust',
  [GymExercises.STACCO_RUMENO]: 'Stacco Rumeno (Romanian Deadlift)',
  [GymExercises.GLUTE_BRIDGE]: 'Glute Bridge',
  [GymExercises.CABLE_PULL_THROUGH]: 'Cable Pull-Through',

  [GymExercises.CALF_RAISE_IN_PIEDI]: 'Calf Raise in piedi',
  [GymExercises.CALF_RAISE_SEDUTO]: 'Calf Raise seduto',

  [GymExercises.PLANK]: 'Plank',
  [GymExercises.CRUNCH]: 'Crunch',
  [GymExercises.RUSSIAN_TWIST]: 'Russian Twist',
  [GymExercises.LEG_RAISE]: 'Leg Raise',
  [GymExercises.SIT_UP]: 'Sit-up',
  [GymExercises.CRUNCH_INVERSO]: 'Crunch Inverso',
  [GymExercises.V_UP]: 'V-Up',

  [GymExercises.SUPERWOMAN]: 'Superwoman',

  [GymExercises.BURPEES]: 'Burpees',
  [GymExercises.MOUNTAIN_CLIMBERS]: 'Mountain Climbers',
  [GymExercises.KETTLEBELL_SWING]: 'Kettlebell Swing',
  [GymExercises.BOX_JUMP]: 'Box Jump',

  [GymExercises.CORSA_TAPIS_ROULANT]: 'Corsa sul Tapis Roulant',
  [GymExercises.CYCLETTE]: 'Cyclette',
  [GymExercises.VOGATORE]: 'Vogatore (Rowing)',
  [GymExercises.ELLITTICA]: 'Ellittica',
  [GymExercises.SALTO_CORDA]: 'Salto della Corda',
  [GymExercises.HIGH_KNEES]: 'High Knees',
  [GymExercises.JUMPING_JACKS]: 'Jumping Jacks'
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