import { FormControl, FormGroup } from "@angular/forms";

export interface FormFiltriModel {
  descrizione: FormControl<string | null>;
}

export class FormFiltri {
  public form: FormGroup;

  constructor() {
    this.form = new FormGroup<FormFiltriModel>({
      descrizione: new FormControl<string | null>(null),
    });
  }

  public resetForm(): void {
    this.form.reset();
  }
}
