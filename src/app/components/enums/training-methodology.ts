// training-methodology.enum.ts
export enum TrainingMethodology {
  // Metodologie basate sul BE, in ordine di apparizione
  POSTURALE = 1,
  FORZA = 2,
  IPERTROFIA = 3,
  RESISTENZA = 4,
  ESPLOSIVO = 5,
  ECCENTRICA = 6,
  CIRCUIT_TRAINING = 7,
  DROP_SET = 8,
  SUPER_SET = 9,
  MECCANICO = 10,
  METABOLICO = 11,
  FUNZIONALE = 12,
  ISOMETRICO = 13,
  CARDIO = 14,
  HIIT = 15,
  PILATES = 16,
  YOGA = 17,
  CROSSFIT = 18,
  CALISTHENIC = 19
}

export const TrainingMethodologyLabels: Record<TrainingMethodology, string> = {
  [TrainingMethodology.POSTURALE]: 'Posturale',
  [TrainingMethodology.FORZA]: 'Forza',
  [TrainingMethodology.IPERTROFIA]: 'Ipertrofia',
  [TrainingMethodology.RESISTENZA]: 'Resistenza',
  [TrainingMethodology.ESPLOSIVO]: 'Esplosivo',
  [TrainingMethodology.ECCENTRICA]: 'Eccentrica',
  [TrainingMethodology.CIRCUIT_TRAINING]: 'Circuit Training',
  [TrainingMethodology.DROP_SET]: 'Drop Set',
  [TrainingMethodology.SUPER_SET]: 'Super Set',
  [TrainingMethodology.MECCANICO]: 'Meccanico',
  [TrainingMethodology.METABOLICO]: 'Metabolico',
  [TrainingMethodology.FUNZIONALE]: 'Funzionale',
  [TrainingMethodology.ISOMETRICO]: 'Isometrico',
  [TrainingMethodology.CARDIO]: 'Cardio',
  [TrainingMethodology.HIIT]: 'HIIT',
  [TrainingMethodology.PILATES]: 'Pilates',
  [TrainingMethodology.YOGA]: 'Yoga',
  [TrainingMethodology.CROSSFIT]: 'CrossFit',
  [TrainingMethodology.CALISTHENIC]: 'Calisthenics'
};

// Utility per convertire l'enum in array
export function getTrainingMethodologiesArray(): { id: number; label: string }[] {
  return Object.values(TrainingMethodology)
    .filter(value => typeof value === 'number') // Filtra solo i valori numerici
    .map(id => ({
      id: id as number,
      label: TrainingMethodologyLabels[id as TrainingMethodology]
    }));
}