import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from "@angular/core";
import { EsercizioForm } from "../../exercise-form";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { GymExerciseSelectorComponent } from "src/app/components/shared/app-gym-exercise-selector/app-gym-exercise-selector";
import { ErrorHandlerService } from "src/app/core/services/error-handler.service";
import { SetComponent } from "./set-component/set-component";
import { getExerciseIconPath } from "src/app/components/enums/exercise-icons";
import { GenericModal } from "src/app/components/shared/generic-modal/generic-modal";
import { ModalService } from "src/app/core/services/modal.service";

@Component({
  selector: "app-exercise-component",
  imports: [
    ReactiveFormsModule,
    GymExerciseSelectorComponent,
    SetComponent,
    GenericModal,
  ],
  templateUrl: "./exercise-component.html",
  styleUrl: "./exercise-component.scss",
})
export class ExerciseComponent implements OnInit {
  @Input() formEsercizio!: EsercizioForm;

  @ViewChild("headerDeleteWorkout") headerDeleteWorkout!: TemplateRef<any>;
  @ViewChild("bodyDeleteWorkout") bodyDeleteWorkout!: TemplateRef<any>;
  @ViewChild("footerCloseDeleteWorkout")
  footerCloseDeleteWorkout!: TemplateRef<any>;
  @ViewChild("footerConfirmDeleteWorkout")
  footerConfirmDeleteWorkout!: TemplateRef<any>;

  @Output() onDeleteExercise = new EventEmitter<number>();

  public idTipoEsercizioControl!: FormControl<number | null>;
  public exerciseIconPath!: string;

  constructor(private errorHandlerService: ErrorHandlerService, private modalService: ModalService) {}

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

  openDeleteModal() {
    try {
      this.modalService.open({
        warning: true,
        headerTemplate: this.headerDeleteWorkout,
        bodyTemplate: this.bodyDeleteWorkout,
        footerCloseTemplate: this.footerCloseDeleteWorkout,
        footerConfirmTemplate: this.footerConfirmDeleteWorkout,
        onConfirm: () => this.deleteExercise(),
        onClose: () => console.log("Modal closed"),
      });
    } catch (error) {
      this.errorHandlerService.handleError(
        error,
        "WorkoutComponent.DeleteExercise"
      );
    }
  }

  deleteExercise() {
    try {
      this.onDeleteExercise.emit(
        this.formEsercizio.form.controls["identifier"].value
      );
    } catch (error) {
      this.errorHandlerService.handleError(
        error,
        "WorkoutComponent.DeleteExercise"
      );
    }
  }
}
