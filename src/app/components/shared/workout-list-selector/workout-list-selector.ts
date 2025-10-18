import { Component, inject, OnInit } from "@angular/core";
import { getGymExercisesArray } from "../../enums/gym-exercises";
import { ErrorHandlerService } from "src/app/core/services/error-handler.service";
import { getExerciseIconPathByExerciseId } from "../../enums/exercise-icons";
import { ExerciseIconColorPipe } from "../../../core/pipes/exercise-icon-color";
import { BottomSheetController } from "src/app/components/shared/bottom-sheet/bottom-sheet-controller";
import { ReactiveFormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { FormFiltri } from "./form-filtri";
import { MatInputModule } from "@angular/material/input";

@Component({
  selector: "app-workout-list-selector",
  imports: [
    ExerciseIconColorPipe, 
    ReactiveFormsModule, 
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: "./workout-list-selector.html",
  styleUrl: "./workout-list-selector.scss",
})
export class WorkoutListSelector implements OnInit {
  exercises = getGymExercisesArray();
  public exercisesView: ExerciseViewModel[] = [];
  public filteredExercises: ExerciseViewModel[] = [];

  private errorHandlerService = inject(ErrorHandlerService);
  private bottomSheetController = inject(BottomSheetController<ExerciseViewModel>);

  public formFiltri!: FormFiltri;

  ngOnInit(): void {
    try {
      this.createFormFiltri();
      
      this.exercises.forEach((el) => {
        this.exercisesView.push({
          id: el.id,
          label: el.label,
          imgPath: getExerciseIconPathByExerciseId(el.id),
        });
      });
      
      // Inizializza la lista filtrata con tutti gli esercizi
      this.filteredExercises = [...this.exercisesView];
      
      // Sottoscrivi ai cambiamenti del form per filtrare in tempo reale
      this.formFiltri.form.controls["descrizione"]?.valueChanges.subscribe(() => {
        this.filterList();
      });
      
    } catch (error) {
      this.errorHandlerService.handleError(
        error,
        "WorkoutListSelector.ngOnInit"
      );
    }
  }

  private createFormFiltri(): void {
    try {
      this.formFiltri = new FormFiltri();
    } catch (error) {
      this.errorHandlerService.handleError(
        error,
        "WorkoutListSelector.createFormFiltri"
      );
    }
  }

  filterList(): void {
    try {
      const searchText = this.formFiltri.form.controls["descrizione"]?.value;
      const normalizedSearch = searchText?.toLowerCase().trim() || '';
      
      if (!normalizedSearch) {
        // Se la ricerca è vuota, mostra tutti gli esercizi
        this.filteredExercises = [...this.exercisesView];
      } else {
        // Filtra gli esercizi che contengono il testo cercato nella descrizione
        this.filteredExercises = this.exercisesView.filter(exercise =>
          exercise.label.toLowerCase().includes(normalizedSearch)
        );
      }
      
      console.log('Filtro applicato:', normalizedSearch, 'Risultati:', this.filteredExercises.length);
    } catch (error) {
      this.errorHandlerService.handleError(
        error,
        "WorkoutListSelector.filterList"
      );
    }
  }

  async selectExercise(exercise: ExerciseViewModel): Promise<void> {
    try {
      console.log('🟢 [1] selectExercise chiamato con:', exercise);
      console.log('🟢 [2] Bottom Sheet ID:', this.bottomSheetController.bottomSheetId);
      
      // Chiude il bottom sheet e ritorna l'esercizio selezionato
      const result = await this.bottomSheetController.dismiss(exercise, 'selected');
      console.log('🟢 [3] Dismiss result:', result);
    } catch (error) {
      console.error('🔴 Errore in selectExercise:', error);
      this.errorHandlerService.handleError(
        error,
        "WorkoutListSelector.selectExercise"
      );
    }
  }

  async cancel(): Promise<void> {
    try {
      // Chiude il bottom sheet senza ritornare dati
      await this.bottomSheetController.dismiss(undefined, 'cancel');
    } catch (error) {
      this.errorHandlerService.handleError(
        error,
        "WorkoutListSelector.cancel"
      );
    }
  }
}

export interface ExerciseViewModel {
  id: number;
  label: string;
  imgPath: string;
}