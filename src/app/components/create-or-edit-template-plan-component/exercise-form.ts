import { FormArray, FormControl, FormGroup } from "@angular/forms";
import { SerieForm, SerieFormModel } from "./exercise-set-form";
import { EsercizioDTO } from "src/app/models/modifica-scheda/eserciziodto";
import { SerieDTO } from "src/app/models/modifica-scheda/seriedto";

export interface EsercizioFormModel {
  identifier: FormControl<number | null>;
  idEsercizio: FormControl<number | null>;
  idTipoEsercizio: FormControl<number | null>; // NUOVO CAMPO
  idIconaEsercizio: FormControl<number | null>; // NUOVO CAMPO
  listaSerie: FormArray<FormGroup<SerieFormModel>>;
  ListaSpecifiche: FormArray<FormGroup<SpecificaFormModel>>;
  Ordinamento: FormControl<number | null>; // NUOVO CAMPO
}

interface SpecificaFormModel {
  idSpecifica: FormControl<number>;
  descrizione: FormControl<string>;
}

export class EsercizioForm {
  public form: FormGroup;
  public listaSerieForm: SerieForm[] = [];
  public identifier: number = 0;

  constructor(identifier: number, esercizioDTO?: EsercizioDTO) {
    this.form = new FormGroup<EsercizioFormModel>({
      identifier: new FormControl<number | null>(identifier),
      idEsercizio: new FormControl<number | null>(esercizioDTO?.idEsercizio || null),
      idTipoEsercizio: new FormControl<number | null>(esercizioDTO?.idTipoEsercizio || null), // NUOVO
      idIconaEsercizio: new FormControl<number | null>(esercizioDTO?.idIconaEsercizio || null), // NUOVO
      Ordinamento: new FormControl<number | null>(esercizioDTO?.ordinamento || null), // NUOVO CAMPO
      listaSerie: new FormArray<FormGroup<SerieFormModel>>([]),
      ListaSpecifiche: new FormArray<FormGroup<SpecificaFormModel>>([]),
    });

    // Se ci sono dati DTO, popola le serie
    if (esercizioDTO?.listaSerie) {
      let serieIdentifier = 0;
      esercizioDTO.listaSerie.forEach(serieDTO => {
        serieIdentifier++;
        this.addSerieForm(serieDTO, serieIdentifier);
      });
    }
  }

  addSerieForm(serieDTO?: SerieDTO, customIdentifier?: number) {
    try {
      const currentIdentifier = customIdentifier || (++this.identifier);

      const newSerieForm: SerieForm = new SerieForm(currentIdentifier, serieDTO);

      this.listaSerieForm.push(newSerieForm);

      const listaSerieFormArray = this.form.controls["listaSerie"] as FormArray;
      listaSerieFormArray.push(newSerieForm.form);
    } catch (error) {
      throw new Error("EsercizioForm.addSerieForm: " + error);
    }
  }

  public resetForm(): void {
    this.form.reset();
    this.listaSerieForm = [];
    this.identifier = 0;
  }
}