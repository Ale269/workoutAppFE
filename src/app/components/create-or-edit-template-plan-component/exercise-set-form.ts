import { FormControl, FormGroup, Validators } from "@angular/forms";
import { SerieDTO } from "src/app/models/modifica-scheda/seriedto";

export interface SerieFormModel {
  identifier: FormControl<number | null>;
  idSerie: FormControl<number | null>;
  ordinamentoSerie: FormControl<number | null>; // NUOVO CAMPO
  ripetizioni: FormControl<number | null>;
  carico: FormControl<number | null>;
}

// Custom validator per numeri interi positivi
export function positiveIntegerValidator() {
  return (control: any) => {
    if (!control.value) return null;
    
    const value = parseInt(control.value, 10);
    
    if (isNaN(value) || value <= 0 || !Number.isInteger(value)) {
      return { positiveInteger: true };
    }
    
    return null;
  };
}

export class SerieForm {
  public form: FormGroup;

  constructor(identifier: number, serieDTO?: SerieDTO) {
    this.form = new FormGroup<SerieFormModel>({
      identifier: new FormControl<number | null>(identifier),
      idSerie: new FormControl<number | null>(serieDTO?.idSerie || null),
      ordinamentoSerie: new FormControl<number | null>(
        serieDTO?.ordinamento || null
      ), // NUOVO CAMPO
      ripetizioni: new FormControl<number | null>(
        serieDTO?.ripetizioni || null,
        [Validators.required, positiveIntegerValidator()]
      ),
      carico: new FormControl<number | null>(
        serieDTO?.carico || null,
        [Validators.required, positiveIntegerValidator()]
      ),
    });
  }

  public resetForm(): void {
    this.form.reset();
  }
}