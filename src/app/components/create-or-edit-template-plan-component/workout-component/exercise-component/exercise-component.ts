import { Component, Input, OnInit } from "@angular/core";
import { EsercizioForm } from "../../exercise-form";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { GymExerciseSelectorComponent } from "src/app/components/shared/app-gym-exercise-selector/app-gym-exercise-selector";
import { ErrorHandlerService } from "src/app/core/services/error-handler.service";
import { SetComponent } from "./set-component/set-component";
import { getExerciseIconPath } from "src/app/components/enums/exercise-icons";
import { GenericModal } from "src/app/components/shared/generic-modal/generic-modal";

@Component({
  selector: "app-exercise-component",
  imports: [ReactiveFormsModule, GymExerciseSelectorComponent, SetComponent, GenericModal],
  templateUrl: "./exercise-component.html",
  styleUrl: "./exercise-component.scss",
})
export class ExerciseComponent implements OnInit {
  @Input() formEsercizio!: EsercizioForm;

  public idTipoEsercizioControl!: FormControl<number | null>;
  public exerciseIconPath!: string;
  public deleteExerciseModalVisible: boolean = false;

  constructor(private errorHandlerService: ErrorHandlerService) {}

  ngOnInit(): void {
    try {
      this.idTipoEsercizioControl = this.formEsercizio.form.controls[
        "idTipoEsercizio"
      ] as FormControl<number | null>;

      this.exerciseIconPath = getExerciseIconPath(
        this.formEsercizio.form.controls["idIconaEsercizio"].value
      );

      console.log(this.formEsercizio);
      console.log(this.exerciseIconPath);
    } catch (error) {
      this.errorHandlerService.handleError(
        error,
        "WorkoutComponent.ifEmptySetPlaceholder"
      );
    }
  }
}
