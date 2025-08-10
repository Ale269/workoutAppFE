import { Component, Input, input } from "@angular/core";
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

@Component({
  selector: "app-workout-component",
  imports: [
    ReactiveFormsModule,
    MatLabel,
    MatError,
    MatFormField,
    MatInput,
    ExerciseComponent,
  ],
  templateUrl: "./workout-component.html",
  styleUrl: "./workout-component.scss",
})
export class WorkoutComponent {
  @Input() formAllenamento!: AllenamentoForm;

  constructor(private errorHandlerService: ErrorHandlerService) {
  }

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
}
