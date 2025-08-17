import { Component, Input } from "@angular/core";
import { SerieForm } from "../../../exercise-set-form";
import { ReactiveFormsModule } from "@angular/forms";
import {
  MatLabel,
  MatError,
  MatFormField,
  MatInput,
} from "@angular/material/input";

@Component({
  selector: "app-set-component",
  imports: [ReactiveFormsModule, MatLabel, MatError, MatFormField, MatInput],
  templateUrl: "./set-component.html",
  styleUrl: "./set-component.scss",
})
export class SetComponent {
  @Input() formSerie!: SerieForm;
}
