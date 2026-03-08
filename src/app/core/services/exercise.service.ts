import { inject, Injectable } from "@angular/core";
import { ApiCatalogService } from "./api-catalog.service";
import { Observable } from "rxjs";
import {
  ExerciseTypeDTO,
  IconExerciseDTO,
  MuscleGroupDTO,
} from "src/app/models/exercise/exercisedto";
import { getIconPathById } from "src/app/components/enums/exercise-icons";
import {
  CreateExerciseRequestModel,
  CreateExerciseResponseModel,
  DeleteExerciseResponseModel,
  ExerciseListResponseModel,
  UpdateExerciseRequestModel,
  UpdateExerciseResponseModel,
} from "src/app/models/exercise/exercise-management-models";

@Injectable({
  providedIn: "root",
})
export class ExerciseService {
  private exercises: ExerciseTypeDTO[] = [];
  private muscles: MuscleGroupDTO[] = [];
  private icons: IconExerciseDTO[] = [];
  private currentUserId: number = 0;
  private initializationPromise: Promise<void> | null = null;

  private apiCatalogService = inject(ApiCatalogService)

  constructor(
  ) {
    // initializeExercises() sarà chiamato da ConfigurationService
  }

  getExercises(): ExerciseTypeDTO[] | undefined {
    return this.exercises;
  }

  getIcons(): IconExerciseDTO[] {
    return this.icons;
  }

  initializeExercises(userId: number): Promise<void> {
    this.currentUserId = userId;

    // Se già caricati, ritorna immediatamente (idempotente)
    if (this.exercises.length > 0) {
      return Promise.resolve();
    }

    // Se c'è già una chiamata in volo, riusa la stessa promise
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = new Promise((resolve, reject) => {
      this.getVisibleExercises(userId).subscribe({
        next: (response) => {
          this.initializationPromise = null;
          if (!response.errore.error) {
            this.exercises = response.exercises;
            this.muscles = response.muscles ?? [];
            this.icons = response.icons ?? [];
            resolve();
          } else {
            reject(response.errore.error);
          }
        },
        error: (error) => {
          this.initializationPromise = null;
          reject(error);
        },
      });
    });

    return this.initializationPromise;
  }

  getExercisesByUser(userId: number): Observable<ExerciseListResponseModel> {
    return this.apiCatalogService.executeApiCall(
      "exercise",
      "getByUser",
      { userId },
      null
    );
  }

  getVisibleExercises(userId: number): Observable<ExerciseListResponseModel> {
    return this.apiCatalogService.executeApiCall(
      "exercise",
      "getVisible",
      { userId },
      null
    );
  }

  createExercise(data: CreateExerciseRequestModel): Observable<CreateExerciseResponseModel> {
    return this.apiCatalogService.executeApiCall(
      "exercise",
      "create",
      undefined,
      data
    );
  }

  updateExercise(exerciseId: number, data: UpdateExerciseRequestModel): Observable<UpdateExerciseResponseModel> {
    return this.apiCatalogService.executeApiCall(
      "exercise",
      "update",
      { exerciseId },
      data
    );
  }

  deleteExercise(exerciseId: number, userId: number): Observable<DeleteExerciseResponseModel> {
    return this.apiCatalogService.executeApiCall(
      "exercise",
      "delete",
      { exerciseId, userId },
      null
    );
  }

  canUserModifyExercise(exercise: ExerciseTypeDTO, currentUserId: number, isAdmin: boolean): boolean {
    if (exercise.isStandard) {
      return isAdmin;
    }
    return exercise.createdById === currentUserId;
  }

  reset(): void {
    this.exercises = [];
    this.muscles = [];
    this.icons = [];
    this.currentUserId = 0;
    this.initializationPromise = null;
  }

  reloadExercises(): Promise<void> {
    this.exercises = [];
    this.initializationPromise = null;
    return this.initializeExercises(this.currentUserId);
  }

  /**
   * Restituisce la lista completa degli esercizi con tutte le proprietà
   * incluso il path dell'icona mappato dall'ID esercizio
   */
  getExercisesWithIcons(): ExerciseViewModel[] {
    if (!this.exercises || this.exercises.length === 0) return [];

    return this.exercises.map((exercise) => {
      const iconDetails = this.icons.find(
        (i) => i.idIcona === exercise.idIcona
      );

      return {
        id: exercise.idTipoEsercizio,
        label: exercise.nomeTipoEsercizio,
        imgPath: getIconPathById(exercise.idIcona),
        idMuscoli: exercise.idMuscoli,
        idIcona: exercise.idIcona,
        iconColor: iconDetails ? iconDetails.coloreIcona : undefined,
        muscleNames: this.getMuscleNamesByIds(exercise.idMuscoli),
        isStandard: exercise.isStandard,
      };
    });
  }

  private getMuscleNamesByIds(ids: number[]): string {
    return ids
      .map((id) => this.muscles.find((m) => m.idMuscolo === id)?.nomeMuscolo)
      .filter((name) => !!name)
      .join(", ");
  }

  /**
   * Ottiene il path dell'icona partendo dall'ID dell'esercizio.
   * Utile quando hai solo l'ID dell'esercizio e vuoi visualizzare la sua icona.
   */
  getExerciseIconPathByExerciseId(
    exerciseId: number | null | undefined
  ): string {
    if (exerciseId == null) {
      return getIconPathById(null); // Ritorna l'icona di default
    }

    const exercise = this.exercises.find(
      (ex) => ex.idTipoEsercizio === exerciseId
    );

    // Se l'esercizio esiste, usiamo il suo idIcona, altrimenti passiamo null per il default
    return getIconPathById(exercise ? exercise.idIcona : null);
  }

  /**
   * Ottiene il colore dell'icona partendo dall'ID dell'esercizio.
   * Utile per applicare stili CSS dinamici.
   */
  getExerciseColorByExerciseId(exerciseId: number | null | undefined): string {
    if (exerciseId == null) return "#6B7280"; // Grigio default

    const exercise = this.exercises.find(
      (ex) => ex.idTipoEsercizio === exerciseId
    );
    if (!exercise) return "#6B7280";

    const icon = this.icons.find((i) => i.idIcona === exercise.idIcona);
    return icon ? icon.coloreIcona : "#6B7280";
  }

  /**
   * Restituisce la lista dei gruppi muscolari unici presenti negli esercizi
   */
  getMuscleGroups(): MuscleGroup[] {
    return this.muscles.map((m) => ({
      id: m.idMuscolo,
      name: m.nomeMuscolo,
    }));
  }

  getMuscleGroupName(idMuscle: number): string {
    const muscle = this.muscles.find((m) => m.idMuscolo === idMuscle);
    return muscle ? muscle.nomeMuscolo : `Gruppo ${idMuscle}`;
  }

  getExerciseName(exerciseId: number | null | undefined): string {
    if (exerciseId == null) {
      return "Esercizio non specificato";
    }

    if (this.exercises.length === 0) {
      // Con il nuovo pattern questo non dovrebbe succedere, ma teniamo fallback
      console.warn('ExerciseService: exercises array vuoto - configurazioni non caricate?');
      return "Caricamento...";
    }

    const exercise = this.exercises.find(
      (ex) => ex.idTipoEsercizio === exerciseId
    );
    return exercise ? exercise.nomeTipoEsercizio : "Esercizio sconosciuto";
  }
}

export interface ExerciseViewModel {
  id: number;
  label: string;
  imgPath: string;
  idMuscoli: number[]; // È un array di ID
  idIcona: number;
  iconColor?: string;
  muscleNames?: string; // Stringa concatenata (es: "Petto, Tricipiti")
  isStandard?: boolean;
}

export interface MuscleGroup {
  id: number;
  name: string;
}
