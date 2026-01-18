import { FormArray, FormControl, FormGroup } from "@angular/forms";
import { SerieForm, SerieFormModel } from "./exercise-set-form";
import { EsercizioDTO } from "src/app/models/create-or-edit-template-or-entity-form-dto/eserciziodto";
import { SerieDTO } from "src/app/models/create-or-edit-template-or-entity-form-dto/seriedto";

export interface EsercizioFormModel {
  identifier: FormControl<number | null>;
  id: FormControl<number | null>;
  idTemplate: FormControl<number | null>;
  description: FormControl<string | null>;
  idTipoEsercizio: FormControl<number | null>;
  idIconaEsercizio: FormControl<number | null>;
  idMetodologia: FormControl<number | null>;
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
      id: new FormControl<number | null>(
        esercizioDTO?.id || null
      ), 
      description: new FormControl<string | null>(
        esercizioDTO?.description || null
      ),
      idTemplate: new FormControl<number | null>(
        esercizioDTO?.idTemplate || null
      ),
      idTipoEsercizio: new FormControl<number | null>(
        esercizioDTO?.idTipoEsercizio || null
      ),
      idIconaEsercizio: new FormControl<number | null>(
        esercizioDTO?.idIconaEsercizio || null
      ),
      idMetodologia: new FormControl<number | null>(
        esercizioDTO?.idMetodologia || null
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

      this.sanitizeSeriesOrdering();
    }
  }

  addSerieForm(serieDTO?: SerieDTO) {
    try {
      this.identifier = this.identifier + 1;

      // Determina l'ordinamento per la nuova serie (ultima posizione)
      const nextordinamento = this.listaSerieForm.length + 1;

      const newSerieForm: SerieForm = new SerieForm(this.identifier, serieDTO);

      // Se non ha già un ordinamento (nuova serie), assegna l'ultima posizione
      if (!serieDTO?.ordinamento) {
        newSerieForm.form
          .get("ordinamento")
          ?.setValue(nextordinamento, { emitEvent: false });
      }

      this.listaSerieForm.push(newSerieForm);

      const listaSerieFormArray = this.form.controls["listaSerie"] as FormArray;
      listaSerieFormArray.push(newSerieForm.form);

      // Dopo l'aggiunta, riordina le serie per essere sicuri
      this.sanitizeSeriesOrdering();
      this.form.markAsDirty();
    
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
      this.form.markAsDirty();

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
      const ordinamentoA = a.form.get("ordinamento")?.value || 0;
      const ordinamentoB = b.form.get("ordinamento")?.value || 0;
      return ordinamentoA - ordinamentoB;
    });

    // 2. Riassegna gli ordinamenti da 1 a N per colmare i gap
    this.listaSerieForm.forEach((serie, index) => {
      const newOrdinamento = index + 1;
      serie.form
        .get("ordinamento")
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

  getDatiEsercizioDaSalvare(): EsercizioDTO {
    try {
      let esercizioDaSalvare: EsercizioDTO = {
        id: this.form.controls["id"].value ? this.form.controls["id"].value : 0,
        idTemplate: this.form.controls["idTemplate"].value ? this.form.controls["idTemplate"].value : 0,
        description: this.form.controls["description"].value ? this.form.controls["description"].value : "",
        idIconaEsercizio: this.form.controls["idIconaEsercizio"].value
          ? this.form.controls["idIconaEsercizio"].value
          : 0,
        idMetodologia: this.form.controls["idMetodologia"].value
          ? this.form.controls["idMetodologia"].value
          : 0,
        idTipoEsercizio: this.form.controls["idTipoEsercizio"].value
          ? this.form.controls["idTipoEsercizio"].value
          : 0,
        ordinamento: this.form.controls["ordinamento"].value
          ? this.form.controls["ordinamento"].value
          : 0,
        listaSerie: [],
      };

      this.listaSerieForm.forEach((serie) => {
       esercizioDaSalvare.listaSerie.push(
         serie.getDatiSerieDaSalvare()
       )
      });

      return esercizioDaSalvare;
    } catch (error) {
      throw new Error("SchedaForm.getDatiEsercizioDaSalvare: " + error);
    }
  }

  get listaSerieFormArray(): FormArray<FormGroup<SerieFormModel>> {
    return this.form.controls["listaSerie"] as FormArray<
      FormGroup<SerieFormModel>
    >;
  }
}
