// exercise-icons.enum.ts
export enum ExerciseIcons {
  DEFAULT = 0,
  BICIPITI = 1,
  DORSALI = 2,
  PETTO = 3
}

// Mappa per i path delle icone
export const ExerciseIconPaths: Record<ExerciseIcons, string> = {
  [ExerciseIcons.DEFAULT]: 'assets/recollect/images/default-icon.png', // Icona di fallback
  [ExerciseIcons.BICIPITI]: 'assets/recollect/images/bicipite-icon.png',
  [ExerciseIcons.DORSALI]: 'assets/recollect/images/dorsali-icon.png',
  [ExerciseIcons.PETTO]: 'assets/recollect/images/petto-icon.png'
};

// Labels per i nomi delle icone
export const ExerciseIconLabels: Record<ExerciseIcons, string> = {
  [ExerciseIcons.DEFAULT]: 'Icona Default',
  [ExerciseIcons.BICIPITI]: 'Bicipiti',
  [ExerciseIcons.DORSALI]: 'Dorsali',
  [ExerciseIcons.PETTO]: 'Petto'
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

export function getExerciseIconsArray(): { id: number; label: string; path: string }[] {
  return Object.values(ExerciseIcons)
    .filter(value => typeof value === 'number')
    .map(id => ({
      id: id as number,
      label: ExerciseIconLabels[id as ExerciseIcons],
      path: ExerciseIconPaths[id as ExerciseIcons]
    }));
}