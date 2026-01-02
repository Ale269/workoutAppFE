import { Component, inject, OnInit } from "@angular/core";
import { ErrorHandlerService } from "src/app/core/services/error-handler.service";
import { ExerciseIconColorPipe } from "../../../core/pipes/exercise-icon-color";
import { BottomSheetController } from "src/app/components/shared/bottom-sheet/bottom-sheet-controller";
import { ReactiveFormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { FormFiltri } from "./form-filtri";
import { MatInputModule } from "@angular/material/input";
import {
  ExerciseService,
  ExerciseViewModel,
  MuscleGroup,
} from "src/app/core/services/exercise.service";

@Component({
  selector: "app-workout-list-selector",
  imports: [
    ExerciseIconColorPipe,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: "./workout-list-selector.html",
  styleUrl: "./workout-list-selector.scss",
})
export class WorkoutListSelector implements OnInit {
  public exercisesView: ExerciseViewModel[] = [];
  public filteredExercises: ExerciseViewModel[] = [];
  public muscleGroups: MuscleGroup[] = [];

  private errorHandlerService = inject(ErrorHandlerService);
  private bottomSheetController = inject(
    BottomSheetController<ExerciseViewModel>
  );
  private exerciseService = inject(ExerciseService);

  public formFiltri!: FormFiltri;

  ngOnInit(): void {
    try {
      this.createFormFiltri();

      // Carica lista esercizi
      this.exercisesView = this.exerciseService.getExercisesWithIcons();

      // Carica i gruppi muscolari
      this.muscleGroups = this.exerciseService.getMuscleGroups();

      // Inizializza la lista filtrata con tutti gli esercizi
      this.filteredExercises = [...this.exercisesView];

      // Sottoscrivi ai cambiamenti del form per filtrare in tempo reale
      this.formFiltri.form.controls["descrizione"]?.valueChanges.subscribe(
        () => {
          this.filterList();
        }
      );
    } catch (error) {
      this.errorHandlerService.logError(error, "WorkoutListSelector.ngOnInit");
    }
  }

  private createFormFiltri(): void {
    try {
      this.formFiltri = new FormFiltri();
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "WorkoutListSelector.createFormFiltri"
      );
    }
  }

  filterList(): void {
    try {
      const searchText = this.formFiltri.form.controls["descrizione"]?.value;
      const selectedMuscle = this.formFiltri.form.controls["idMuscle"]?.value;
      
      const normalizedSearch = searchText?.toLowerCase().trim() || '';
      
      // Applica entrambi i filtri
      this.filteredExercises = this.exercisesView.filter(exercise => {
        // Filtro per testo di ricerca
        const matchesSearch = !normalizedSearch || 
          exercise.label.toLowerCase().includes(normalizedSearch);
        
        // Filtro per gruppo muscolare
        const matchesMuscle = !selectedMuscle || 
          exercise.idMuscle === selectedMuscle;
        
        return matchesSearch && matchesMuscle;
      });
      
      console.log('Filtro applicato:', {
        search: normalizedSearch,
        muscle: selectedMuscle,
        risultati: this.filteredExercises.length
      });
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "WorkoutListSelector.filterList"
      );
    }
  }

  async selectExercise(exercise: ExerciseViewModel): Promise<void> {
    try {
      console.log("🟢 [1] selectExercise chiamato con:", exercise);
      console.log(
        "🟢 [2] Bottom Sheet ID:",
        this.bottomSheetController.bottomSheetId
      );

      // Chiude il bottom sheet e ritorna l'esercizio selezionato
      const result = await this.bottomSheetController.dismiss(
        exercise,
        "selected"
      );
      console.log("🟢 [3] Dismiss result:", result);
    } catch (error) {
      console.error("🔴 Errore in selectExercise:", error);
      this.errorHandlerService.logError(
        error,
        "WorkoutListSelector.selectExercise"
      );
    }
  }

  async cancel(): Promise<void> {
    try {
      // Chiude il bottom sheet senza ritornare dati
      await this.bottomSheetController.dismiss(undefined, "cancel");
    } catch (error) {
      this.errorHandlerService.logError(error, "WorkoutListSelector.cancel");
    }
  }
}
