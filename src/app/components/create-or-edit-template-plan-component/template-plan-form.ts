import { FormArray, FormControl, FormGroup } from "@angular/forms";

interface SchedaFormModel {
  nomeScheda: FormControl<string | null>;
  listaEsercizi: FormArray<FormGroup<EsercizioFormModel>>;
}

interface EsercizioFormModel {
  idEsercizio: FormControl<number>;
  nomeEsercizio: FormControl<string>;
  nomeIcona: FormControl<string>;
  listaSerie: FormArray<FormGroup<SerieFormModel>>;
  ListaSpecifiche: FormArray<FormGroup<SpecificaFormModel>>;
}

interface SerieFormModel {
  idSerie: FormControl<number>;
  ripetizioni: FormControl<number>;
  carico: FormControl<number>;
}

interface SpecificaFormModel {
  idSpecifica: FormControl<number>;
  descrizione: FormControl<string>;
}

export class SchedaForm {
  public form: FormGroup;

  constructor() {
    this.form = new FormGroup<SchedaFormModel>({
      nomeScheda: new FormControl<string | null>(null),
      listaEsercizi: new FormArray<FormGroup<EsercizioFormModel>>([]),
    });
  }

  // Un altro metodo per resettare il form
  public resetForm(): void {
    this.form.reset();
  }
}
