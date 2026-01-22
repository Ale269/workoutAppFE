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
import { MatSelectModule } from "@angular/material/select";

@Component({
  selector: "app-workout-list-selector",
  imports: [
    ExerciseIconColorPipe,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
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
      this.formFiltri = new FormFiltri();

      // Caricamento dati allineati al nuovo metodo
      this.exercisesView = this.exerciseService.getExercisesWithIcons();
      this.muscleGroups = this.exerciseService.getMuscleGroups();
      this.filteredExercises = [...this.exercisesView];

      // Filtro reattivo
      this.formFiltri.form.valueChanges.subscribe(() => this.filterList());
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
    const { descrizione, idMuscle } = this.formFiltri.form.value;
    const search = descrizione?.toLowerCase().trim() || '';

    this.filteredExercises = this.exercisesView.filter(ex => {
      // Verifica nome
      const matchesSearch = !search || ex.label.toLowerCase().includes(search);
      
      // Verifica muscolo: idMuscle nel form è un numero singolo, 
      // idMuscoli nell'oggetto è un array. Usiamo .includes()
      const matchesMuscle = !idMuscle || ex.idMuscoli.includes(Number(idMuscle));

      return matchesSearch && matchesMuscle;
    });
  }

  async selectExercise(exercise: ExerciseViewModel): Promise<void> {
    try {
      // Chiude il bottom sheet e ritorna l'esercizio selezionato
      const result = await this.bottomSheetController.dismiss(
        exercise,
        "selected"
      );
      console.log("🟢 [3] Dismiss result:", result);
    } catch (error) {
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
