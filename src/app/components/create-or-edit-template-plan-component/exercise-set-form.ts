import { FormControl, FormGroup } from "@angular/forms";
import { SerieDTO } from "src/app/models/modifica-scheda/seriedto";

export interface SerieFormModel {
  identifier: FormControl<number | null>;
  idSerie: FormControl<number | null>;
  ripetizioni: FormControl<number | null>;
  carico: FormControl<number | null>;
}

export class SerieForm {
  public form: FormGroup;

  constructor(identifier: number, serieDTO?: SerieDTO) {
    this.form = new FormGroup<SerieFormModel>({
      identifier: new FormControl<number | null>(identifier),
      idSerie: new FormControl<number | null>(serieDTO?.idSerie || null),
      ripetizioni: new FormControl<number | null>(
        serieDTO?.ripetizioni || null
      ),
      carico: new FormControl<number | null>(serieDTO?.carico || null),
    });
  }

  public resetForm(): void {
    this.form.reset();
  }
}
