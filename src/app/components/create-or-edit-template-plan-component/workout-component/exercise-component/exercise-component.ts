import { Component, Input } from "@angular/core";
import { EsercizioForm } from "../../exercise-form";
import { ReactiveFormsModule } from "@angular/forms";
import { MatLabel, MatError, MatFormField, MatInput } from "@angular/material/input";

@Component({
  selector: "app-exercise-component",
  imports: [ReactiveFormsModule, MatLabel, MatError, MatFormField, MatInput],
  templateUrl: "./exercise-component.html",
  styleUrl: "./exercise-component.scss",
})
export class ExerciseComponent {
  @Input() formEsercizio!: EsercizioForm;

  constructor() {}
}
