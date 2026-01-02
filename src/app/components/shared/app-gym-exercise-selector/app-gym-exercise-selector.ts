import { Component, Input, OnInit, inject } from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { ErrorHandlerService } from "src/app/core/services/error-handler.service";
import { BottomSheetService } from "../../shared/bottom-sheet/bottom-sheet-service";
import { WorkoutListSelector } from "../workout-list-selector/workout-list-selector";
import { CommonModule } from "@angular/common";
import {
  ExerciseService,
  ExerciseViewModel,
} from "src/app/core/services/exercise.service";

@Component({
  selector: "app-gym-exercise-selector",
  templateUrl: "./app-gym-exercise-selector.html",
  imports: [
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    CommonModule,
  ],
  styleUrls: ["./app-gym-exercise-selector.scss"],
})
export class GymExerciseSelectorComponent implements OnInit {
  @Input() control!: FormControl<number | null>;
  @Input() label: string = "Seleziona Esercizio";
  @Input() appearance: "fill" | "outline" | "legacy" | "standard" = "outline";
  @Input() width: string = "100%";
  @Input() hint: string = "";

  exercises: ExerciseViewModel[] = [];
  displayValue: string = "";

  private errorHandlerService = inject(ErrorHandlerService);
  private bottomSheetService = inject(BottomSheetService);
  private exerciseService = inject(ExerciseService);

  ngOnInit(): void {
    try {
      // Carica la lista degli esercizi
      this.exercises = this.exerciseService.getExercisesWithIcons();

      // Imposta il valore iniziale se presente
      this.updateDisplayValue();

      // Ascolta i cambiamenti del control per aggiornare il display
      this.control.valueChanges.subscribe(() => {
        this.updateDisplayValue();
      });
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "GymExerciseSelectorComponent.ngOnInit"
      );
    }
  }

  private updateDisplayValue(): void {
    const selectedId = this.control.value;
    if (selectedId) {
      const exercise = this.exercises.find((ex) => ex.id === selectedId);
      this.displayValue = exercise ? exercise.label : "";
    } else {
      this.displayValue = "";
    }
  }

  async openSheet(event: Event): Promise<void> {
    // Previeni il comportamento di default
    event.preventDefault();
    event.stopPropagation();

    try {
      const ref = await this.bottomSheetService.open<any, ExerciseViewModel>({
        component: WorkoutListSelector,
        data: {},
      });

      // Ascolta quando il bottom sheet viene chiuso
      ref.onDidDismiss().then((result) => {
        if (result.role === "selected" && result.data) {
          this.handleExerciseSelected(result.data);
        }
      });
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "GymExerciseSelectorComponent.openSheet"
      );
    }
  }

  private handleExerciseSelected(exercise: ExerciseViewModel): void {
    console.log(`Hai selezionato: ${exercise.label} (ID: ${exercise.id})`);

    // Aggiorna il FormControl con l'ID dell'esercizio selezionato
    this.control.patchValue(exercise.id);
    this.control.markAsTouched();
  }

  getErrorMessage(): string {
    if (this.control.hasError("required")) {
      return `${this.label} è obbligatorio`;
    }
    return "Campo non valido";
  }
}
