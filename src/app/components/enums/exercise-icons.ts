
export const DEFAULT_ICON_COLOR = '#fff'; // Grigio neutro

// exercise-icons.enum.ts
export const ExerciseIconPaths: Record<number, string> = {
  0: 'assets/recollect/images/default-icon.png', // Default/Fallback
  1: 'assets/recollect/images/petto-icon.png',
  2: 'assets/recollect/images/bicipite-icon.png',
  3: 'assets/recollect/images/dorsali-icon.png',
  4: 'assets/recollect/images/spalle-icon.png',
  5: 'assets/recollect/images/tricipiti-icon.png',
  6: 'assets/recollect/images/quadricipiti-icon.png',
  7: 'assets/recollect/images/femorali-icon.png',
  8: 'assets/recollect/images/glutei-icon.png',
  9: 'assets/recollect/images/core-icon.png',
  10: 'assets/recollect/images/cardio-icon.png',
  11: 'assets/recollect/images/default-icon.png', 
  // Aggiungi altri mapping se aggiungi icone nel DB e carichi i file in assets
}; 

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function getIconPathById(iconId: number | undefined | null): string {
  if (iconId === undefined || iconId === null) {
    return ExerciseIconPaths[0];
  }
  return ExerciseIconPaths[iconId] || ExerciseIconPaths[0];
}