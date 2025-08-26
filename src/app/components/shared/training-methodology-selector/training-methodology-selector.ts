// training-methodology-selector.component.ts
import { Component, Input, OnInit } from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { ErrorHandlerService } from "src/app/core/services/error-handler.service";
import { getTrainingMethodologiesArray } from "../../enums/training-methodology";

@Component({
  selector: "app-training-methodology-selector",
  templateUrl: "./training-methodology-selector.html",
  imports: [MatFormFieldModule, ReactiveFormsModule, MatSelectModule],
  styleUrls: ["./training-methodology-selector.scss"],
})
export class TrainingMethodologySelectorComponent implements OnInit {
  @Input() control!: FormControl<number | null>;
  @Input() label: string = "Seleziona Metodologia";
  @Input() appearance: "fill" | "outline" | "legacy" | "standard" = "outline";
  @Input() width: string = "100%";
  @Input() hint: string = "";
  @Input() multiple: boolean = false;

  methodologies = getTrainingMethodologiesArray();

  constructor(private errorHandlerService: ErrorHandlerService) {}
  
  ngOnInit(): void {
    try {
      console.log(this.control);
    } catch (error) {
      this.errorHandlerService.handleError(
        error,
        "TrainingMethodologySelectorComponent.ngOnInit"
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