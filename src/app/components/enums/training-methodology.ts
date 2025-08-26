// training-methodology.enum.ts
export enum TrainingMethodology {
  POSTURALE = 1,
  MECCANICO = 2,
  METABOLICO = 3,
  FUNZIONALE = 4,
  IPERTROFIA = 5,
  FORZA = 6,
  RESISTENZA = 7,
  ESPLOSIVO = 8,
  ISOMETRICO = 9,
  CARDIO = 10,
  HIIT = 11,
  PILATES = 12,
  YOGA = 13,
  CROSSFIT = 14,
  CALISTHENIC = 15
}

// Mappa per i nomi visualizzati
export const TrainingMethodologyLabels: Record<TrainingMethodology, string> = {
  [TrainingMethodology.POSTURALE]: 'Posturale',
  [TrainingMethodology.MECCANICO]: 'Meccanico',
  [TrainingMethodology.METABOLICO]: 'Metabolico',
  [TrainingMethodology.FUNZIONALE]: 'Funzionale',
  [TrainingMethodology.IPERTROFIA]: 'Ipertrofia',
  [TrainingMethodology.FORZA]: 'Forza',
  [TrainingMethodology.RESISTENZA]: 'Resistenza',
  [TrainingMethodology.ESPLOSIVO]: 'Esplosivo',
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