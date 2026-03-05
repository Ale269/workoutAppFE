import { FormControl, FormGroup, Validators } from "@angular/forms";
import { SerieDTO } from "src/app/models/create-or-edit-template-or-entity-form-dto/seriedto";

export interface SerieFormModel {
  identifier: FormControl<number | null>;
  id: FormControl<number | null>;
  idTemplate: FormControl<number | null>;
  ordinamento: FormControl<number | null>; // NUOVO CAMPO
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

  // Flag per tracciare se il valore è stato impostato dall'auto-propagazione.
  // Se true, il campo può essere sovrascritto dalla propagazione automatica.
  // Se false, il campo è stato editato manualmente dall'utente o caricato dal server.
  public autoFilledRipetizioni: boolean = false;
  public autoFilledCarico: boolean = false;

  constructor(identifier: number, serieDTO?: SerieDTO) {
    this.form = new FormGroup<SerieFormModel>({
      identifier: new FormControl<number | null>(identifier),
      id: new FormControl<number | null>(serieDTO?.id || null),
      idTemplate: new FormControl<number | null>(serieDTO?.idTemplate || null),
      ordinamento: new FormControl<number | null>(
        serieDTO?.ordinamento || null
      ), // NUOVO CAMPO
      ripetizioni: new FormControl<number | null>(
        serieDTO?.ripetizioni || null,
        [positiveIntegerValidator()]
      ),
      carico: new FormControl<number | null>(serieDTO?.carico || null, [
        positiveIntegerValidator(),
      ]),
    });
    // I dati dal server/DTO mantengono autoFilled = false (non sovrascrivibili)
  }

  getDatiSerieDaSalvare(): SerieDTO {
    try {
      return {
        id: this.form.controls["id"].value ? this.form.controls["id"].value : 0,
        idTemplate: this.form.controls["idTemplate"].value ? this.form.controls["idTemplate"].value : 0,
        carico: this.form.controls["carico"].value
          ? this.form.controls["carico"].value
          : 0,
        ordinamento: this.form.controls["ordinamento"].value
          ? this.form.controls["ordinamento"].value
          : 0,
        ripetizioni: this.form.controls["ripetizioni"].value
          ? this.form.controls["ripetizioni"].value
          : 0,
      };
    } catch (error) {
      throw new Error("SchedaForm.getDatiSerieDaSalvare: " + error);
    }
  }

  public resetForm(): void {
    this.form.reset();
  }
}
