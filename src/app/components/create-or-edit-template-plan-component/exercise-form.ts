import { FormArray, FormControl, FormGroup } from "@angular/forms";
import { SerieForm, SerieFormModel } from "./exercise-set-form";
import { EsercizioDTO } from "src/app/models/modifica-scheda/eserciziodto";
import { SerieDTO } from "src/app/models/modifica-scheda/seriedto";

export interface EsercizioFormModel {
  identifier: FormControl<number | null>;
  idEsercizio: FormControl<number | null>;
  idTipoEsercizio: FormControl<number | null>;
  idIconaEsercizio: FormControl<number | null>;
  listaSerie: FormArray<FormGroup<SerieFormModel>>;
  ListaSpecifiche: FormArray<FormGroup<SpecificaFormModel>>;
  ordinamento: FormControl<number | null>;
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
      idEsercizio: new FormControl<number | null>(
        esercizioDTO?.idEsercizio || null
      ),
      idTipoEsercizio: new FormControl<number | null>(
        esercizioDTO?.idTipoEsercizio || null
      ),
      idIconaEsercizio: new FormControl<number | null>(
        esercizioDTO?.idIconaEsercizio || null
      ),
      ordinamento: new FormControl<number | null>(
        esercizioDTO?.ordinamento || null
      ),
      listaSerie: new FormArray<FormGroup<SerieFormModel>>([]),
      ListaSpecifiche: new FormArray<FormGroup<SpecificaFormModel>>([]),
    });

    // Se ci sono dati DTO, popola le serie
    if (esercizioDTO?.listaSerie) {
      esercizioDTO.listaSerie.forEach((serieDTO) => {
        this.addSerieForm(serieDTO);
      });
    }
  }

  addSerieForm(serieDTO?: SerieDTO) {
    try {
      this.identifier = this.identifier + 1;

      // Determina l'ordinamento per la nuova serie (ultima posizione)
      const nextOrdinamentoSerie = this.listaSerieForm.length + 1;

      const newSerieForm: SerieForm = new SerieForm(this.identifier, serieDTO);

      // Se non ha già un ordinamento (nuova serie), assegna l'ultima posizione
      if (!serieDTO?.ordinamento) {
        newSerieForm.form
          .get("ordinamentoSerie")
          ?.setValue(nextOrdinamentoSerie, { emitEvent: false });
      }

      this.listaSerieForm.push(newSerieForm);

      const listaSerieFormArray = this.form.controls["listaSerie"] as FormArray;
      listaSerieFormArray.push(newSerieForm.form);

      // Dopo l'aggiunta, riordina le serie per essere sicuri
      this.sanitizeSeriesOrdering();
    } catch (error) {
      throw new Error("EsercizioForm.addSerieForm: " + error);
    }
  }

  deleteSerie(identifier: number): boolean {
    try {
      // Trova l'indice della serie da eliminare
      const serieIndex = this.listaSerieForm.findIndex(
        (serie) => serie.form.get("identifier")?.value === identifier
      );

      if (serieIndex === -1) {
        throw new Error(`Serie con identifier ${identifier} non trovata`);
      }

      // Rimuovi dall'array di SerieForm
      this.listaSerieForm.splice(serieIndex, 1);

      // Rimuovi dal FormArray
      const listaSerieFormArray = this.form.controls["listaSerie"] as FormArray;
      listaSerieFormArray.removeAt(serieIndex);

      // Riassegna gli ordinamenti dopo l'eliminazione
      this.sanitizeSeriesOrdering();

      return true;
    } catch (error) {
      throw new Error("EsercizioForm.deleteSerie: " + error);
    }
  }

  findSerieByIdentifier(identifier: number): SerieForm | null {
    return (
      this.listaSerieForm.find(
        (serie) => serie.form.get("identifier")?.value === identifier
      ) || null
    );
  }

  private sanitizeSeriesOrdering(): void {
    if (!this.listaSerieForm || this.listaSerieForm.length === 0) {
      return;
    }

    // 1. Ordina le serie per ordinamento corrente
    this.listaSerieForm.sort((a, b) => {
      const ordinamentoA = a.form.get("ordinamentoSerie")?.value || 0;
      const ordinamentoB = b.form.get("ordinamentoSerie")?.value || 0;
      return ordinamentoA - ordinamentoB;
    });

    // 2. Riassegna gli ordinamenti da 1 a N per colmare i gap
    this.listaSerieForm.forEach((serie, index) => {
      const newOrdinamento = index + 1;
      serie.form
        .get("ordinamentoSerie")
        ?.setValue(newOrdinamento, { emitEvent: false });
    });

    // 3. Ricostruisci il FormArray nell'ordine corretto
    this.rebuildSeriesFormArray();
  }

  private rebuildSeriesFormArray(): void {
    const listaSerieFormArray = this.form.controls["listaSerie"] as FormArray;

    // Pulisce il FormArray senza emettere eventi per evitare loop infiniti
    while (listaSerieFormArray.length !== 0) {
      listaSerieFormArray.removeAt(0, { emitEvent: false });
    }

    // Riaggiunge al FormArray nell'ordine corretto
    this.listaSerieForm.forEach((serie) => {
      listaSerieFormArray.push(serie.form, { emitEvent: false });
    });
  }

  public resetForm(): void {
    this.form.reset();
    this.listaSerieForm = [];
    this.identifier = 0;
  }

  get listaSerieFormArray(): FormArray<FormGroup<SerieFormModel>> {
    return this.form.controls["listaSerie"] as FormArray<FormGroup<SerieFormModel>>;
  }
}