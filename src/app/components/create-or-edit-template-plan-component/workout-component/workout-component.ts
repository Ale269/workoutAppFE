import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  input,
  Output,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { MatIconButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import {
  MatLabel,
  MatError,
  MatFormField,
  MatInput,
  MatHint,
} from "@angular/material/input";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { AllenamentoForm } from "../workout-form";
import { ErrorHandlerService } from "src/app/core/services/error-handler.service";
import { AccordionGroupComponent } from "../../shared/accordion/accordion-group/accordion-group.component";
import { ExerciseComponent } from "./exercise-component/exercise-component";
import { AccordionComponent } from "../../shared/accordion/accordion-element/accordion.component";
import { AccordionHeaderComponent } from "../../shared/accordion/accordion-element/accordion-header/accordion-header.component";
import { AccordionBodyComponent } from "../../shared/accordion/accordion-element/accordion-body/accordion-body.component";
import { GenericModal } from "../../shared/generic-modal/generic-modal";
import { ModalService } from "src/app/core/services/modal.service";

@Component({
  selector: "app-workout-component",
  imports: [
    ReactiveFormsModule,
    MatLabel,
    MatError,
    MatFormField,
    MatInput,
    ExerciseComponent,
    GenericModal,
  ],
  templateUrl: "./workout-component.html",
  styleUrl: "./workout-component.scss",
})
export class WorkoutComponent {
  @ViewChild("headerDeleteWorkout") headerDeleteWorkout!: TemplateRef<any>;
  @ViewChild("bodyDeleteWorkout") bodyDeleteWorkout!: TemplateRef<any>;
  @ViewChild("footerCloseDeleteWorkout")
  footerCloseDeleteWorkout!: TemplateRef<any>;
  @ViewChild("footerConfirmDeleteWorkout")
  footerConfirmDeleteWorkout!: TemplateRef<any>;

  @Input() formAllenamento!: AllenamentoForm;

  @Output() onDeleteWorkout = new EventEmitter<number>();

  constructor(
    private errorHandlerService: ErrorHandlerService,
    private modalService: ModalService
  ) {}

  ifEmptySetPlaceholder(event: any) {
    try {
      if (event.target.value.trim().length === 0) {
        // Qui è vuoto o solo spazi
        this.formAllenamento.form.controls["nomeAllenamento"].setValue(
          "Giorno " + this.formAllenamento.form.controls["ordinamento"].value
        );
      }
    } catch (error) {
      this.errorHandlerService.handleError(
        error,
        "WorkoutComponent.ifEmptySetPlaceholder"
      );
    }
  }

  deleteEexercise(identifier: number) {
    try {
      this.formAllenamento.deleteEsercizio(identifier);
    } catch (error) {
      this.errorHandlerService.handleError(
        error,
        "WorkoutComponent.deleteEexercise"
      );
    }
  }
  // openDeleteWorkout() {
  //   this.modalService.open({
  //     title: "Attenzione",
  //     warning: true,
  //     content: this.templateDeleteWorkout,
  //     showConfirmButton: true,
  //     onConfirm: () => this.deleteWorkout(),
  //   });
  // }

  openDeleteWorkout() {
    try {
      this.modalService.open({
        warning: true,
        headerTemplate: this.headerDeleteWorkout,
        bodyTemplate: this.bodyDeleteWorkout,
        footerCloseTemplate: this.footerCloseDeleteWorkout,
        footerConfirmTemplate: this.footerConfirmDeleteWorkout,
        onConfirm: () => this.deleteWorkout(),
        onClose: () => console.log("Modal closed"),
      });
    } catch (error) {
      this.errorHandlerService.handleError(
        error,
        "WorkoutComponent.DeleteExercise"
      );
    }
  }


  deleteWorkout() {
    try {
      this.onDeleteWorkout.emit(
        this.formAllenamento.form.controls["identifier"].value
      );
    } catch (error) {
      this.errorHandlerService.handleError(
        error,
        "WorkoutComponent.DeleteExercise"
      );
    }
  }
}
