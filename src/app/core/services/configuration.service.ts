import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ExerciseService } from './exercise.service';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {

  // Observable per tracciare lo stato di caricamento
  private configLoadedSubject = new BehaviorSubject<boolean>(false);
  public configLoaded$ = this.configLoadedSubject.asObservable();

  // Flag per evitare doppie chiamate
  private isLoading = false;

  constructor(
    private exerciseService: ExerciseService
    // Futuri servizi: private muscleGroupService: MuscleGroupService, ecc.
  ) {}

  /**
   * Carica tutte le configurazioni necessarie dopo l'autenticazione.
   * Può essere chiamato più volte senza problemi (idempotente).
   */
  async loadConfigurations(): Promise<void> {
    // Se già caricato o in caricamento, ritorna subito
    if (this.configLoadedSubject.value || this.isLoading) {
      return;
    }

    this.isLoading = true;

    try {
      // Carica tutte le configurazioni in parallelo
      await Promise.all([
        this.exerciseService.initializeExercises(),
        // Futuro: this.muscleGroupService.loadMuscleGroups(),
        // Futuro: this.iconService.loadIcons(),
        // ecc.
      ]);

      // Tutte le configurazioni caricate con successo
      this.configLoadedSubject.next(true);
    } catch (error) {
      console.error('Errore caricamento configurazioni:', error);
      // Non blocchiamo l'app, ma logghiamo l'errore
      // I componenti gestiranno il fallback
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Resetta lo stato delle configurazioni (es: al logout)
   */
  resetConfigurations(): void {
    this.configLoadedSubject.next(false);
    this.isLoading = false;
  }

  /**
   * Verifica se le configurazioni sono caricate
   */
  isConfigLoaded(): boolean {
    return this.configLoadedSubject.value;
  }
}
