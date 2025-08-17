// gym-exercise-selector.component.ts
import { Component, Input, OnInit } from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { getGymExercisesArray } from "../../enums/gym-exercises";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { ErrorHandlerService } from "src/app/core/services/error-handler.service";

@Component({
  selector: "app-gym-exercise-selector",
  templateUrl: "./app-gym-exercise-selector.html",
  imports: [MatFormFieldModule, ReactiveFormsModule, MatSelectModule],
  styleUrls: ["./app-gym-exercise-selector.scss"],
})
export class GymExerciseSelectorComponent implements OnInit {
  @Input() control!: FormControl<number | null>;
  @Input() label: string = "Seleziona Esercizio";
  @Input() appearance: "fill" | "outline" | "legacy" | "standard" = "outline";
  @Input() width: string = "100%";
  @Input() hint: string = "";
  @Input() multiple: boolean = false;

  exercises = getGymExercisesArray();

  constructor(private errorHandlerService: ErrorHandlerService) {}
  ngOnInit(): void {
    try {
      console.log(this.control);
    } catch (error) {
      this.errorHandlerService.handleError(
        error,
        "WorkoutComponent.ifEmptySetPlaceholder"
      );
    } 
  }

  getErrorMessage(): string {
    if (this.control.hasError("required")) {
      return `${this.label} è obbligatorio`;
    }
    return "Campo non valido";
  }
}
