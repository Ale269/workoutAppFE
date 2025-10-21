import { FormArray, FormControl, FormGroup } from "@angular/forms";
import { EsercizioForm, EsercizioFormModel } from "./exercise-form";
import { AllenamentoDTO } from "src/app/models/create-or-edit-template-or-entity-form-dto/allenamentodto";
import { EsercizioDTO } from "src/app/models/create-or-edit-template-or-entity-form-dto/eserciziodto";

export interface AllenamentoFormModel {
  identifier: FormControl<number | null>;
  id: FormControl<number | null>;
  idTemplate: FormControl<number | null>;
  dataEsecuzione : FormControl<Date | null>;
  nomeAllenamento: FormControl<string | null>;
  ordinamento: FormControl<number | null>;
  listaEsercizi: FormArray<FormGroup<EsercizioFormModel>>;
}

export class AllenamentoForm {
  public listaEserciziForm: EsercizioForm[] = [];
  public identifier: number = 0;
  public form: FormGroup;

  public availableExercisePositions: number[] = [];

  constructor(identifier: number, allenamentoDTO?: AllenamentoDTO) {
    this.form = new FormGroup<AllenamentoFormModel>({
      identifier: new FormControl<number | null>(identifier),
      id: new FormControl<number | null>(allenamentoDTO?.id || null),
      idTemplate: new FormControl<number | null>(allenamentoDTO?.idTemplate || null),
      dataEsecuzione: new FormControl<Date | null>(allenamentoDTO?.dataEsecuzione || null),

      nomeAllenamento: new FormControl<string | null>(
        allenamentoDTO?.nomeAllenamento || null
      ),
      ordinamento: new FormControl<number | null>(
        allenamentoDTO?.ordinamento || null
      ),
      listaEsercizi: new FormArray<FormGroup<EsercizioFormModel>>([]),
    });

    // this.form.controls["listaEsercizi"].valueChanges.subscribe(() => {
    //   this.sanitizeExerciseOrdering();
    // });

    // Se ci sono dati DTO, popola gli esercizi
    if (allenamentoDTO?.listaEsercizi) {
      allenamentoDTO.listaEsercizi.forEach((esercizioDTO) => {
        this.addEsercizioForm(esercizioDTO);
      });

      // Riordino correttamente gli esercizi
      this.sanitizeExerciseOrdering();
    }
  }

  addEsercizioForm(esercizioDTO?: EsercizioDTO) {
    try {
      this.identifier = this.identifier + 1;

      // Determina l'ordinamento per il nuovo esercizio (ultima posizione)
      const nextOrdinamento = this.listaEserciziForm.length + 1;

      const newEsercizioForm: EsercizioForm = new EsercizioForm(
        this.identifier,
        esercizioDTO
      );

      // Se non ha già un ordinamento (nuovo esercizio), assegna l'ultima posizione
      if (!esercizioDTO?.ordinamento) {
        newEsercizioForm.form
          .get("ordinamento")
          ?.setValue(nextOrdinamento, { emitEvent: false });
      }

      this.listaEserciziForm.push(newEsercizioForm);

      const listaEserciziFormArray = this.form.controls[
        "listaEsercizi"
      ] as FormArray;
      listaEserciziFormArray.push(newEsercizioForm.form);

      // Aggiorna le posizioni disponibili senza riordinare
      this.updateAvailablePositions();
      this.form.markAsDirty();
    } catch (error) {
      throw new Error("AllenamentoForm.addEsercizioForm: " + error);
    }
  }

  private updateAvailablePositions(): void {
    const totalExercises = this.listaEserciziForm.length;
    this.availableExercisePositions = Array.from(
      { length: totalExercises },
      (_, i) => i + 1
    );
  }

  deleteEsercizio(identifier: number): boolean {
    try {
      // Trova l'indice dell'esercizio da eliminare
      const esercizioIndex = this.listaEserciziForm.findIndex(
        (esercizio) => esercizio.form.get("identifier")?.value === identifier
      );

      if (esercizioIndex === -1) {
        throw new Error("Esercizio con identifier ${identifier} non trovato)");
      }

      // Rimuovi dall'array di EsercizioForm
      this.listaEserciziForm.splice(esercizioIndex, 1);

      // Rimuovi dal FormArray
      const listaEserciziFormArray = this.form.controls[
        "listaEsercizi"
      ] as FormArray;
      listaEserciziFormArray.removeAt(esercizioIndex);

      // Riassegna gli ordinamenti dopo l'eliminazione
      this.sanitizeExerciseOrdering();
      this.form.markAsDirty();

      return true;
    } catch (error) {
      throw new Error("AllenamentoForm.deleteEsercizio: " + error);
    }
  }

  findEsercizioByIdentifier(identifier: number): EsercizioForm | null {
    return (
      this.listaEserciziForm.find(
        (esercizio) => esercizio.form.get("identifier")?.value === identifier
      ) || null
    );
  }

  private sanitizeExerciseOrdering(): void {
    if (!this.listaEserciziForm || this.listaEserciziForm.length === 0) {
      this.availableExercisePositions = [];
      return;
    }

    // 1. Ordina gli esercizi per ordinamento corrente
    this.listaEserciziForm.sort((a, b) => {
      const ordinamentoA = a.form.get("ordinamento")?.value || 0;
      const ordinamentoB = b.form.get("ordinamento")?.value || 0;
      return ordinamentoA - ordinamentoB;
    });

    // 2. Riassegna gli ordinamenti da 1 a N per colmare i gap
    this.listaEserciziForm.forEach((esercizio, index) => {
      const newOrdinamento = index + 1;
      esercizio.form
        .get("ordinamento")
        ?.setValue(newOrdinamento, { emitEvent: false });
    });

    // 3. Aggiorna le posizioni disponibili
    const totalExercises = this.listaEserciziForm.length;
    this.availableExercisePositions = Array.from(
      { length: totalExercises },
      (_, i) => i + 1
    );

    // 4. Ricostruisci il FormArray nell'ordine corretto
    this.rebuildFormArray();
  }

  private rebuildFormArray(): void {
    const listaEserciziFormArray = this.form.controls[
      "listaEsercizi"
    ] as FormArray;

    // Pulisce il FormArray senza emettere eventi per evitare loop infiniti
    while (listaEserciziFormArray.length !== 0) {
      listaEserciziFormArray.removeAt(0, { emitEvent: false });
    }

    // Riaggiunge al FormArray nell'ordine corretto
    this.listaEserciziForm.forEach((esercizio) => {
      listaEserciziFormArray.push(esercizio.form, { emitEvent: false });
    });
  }

  moveEsercizio(exerciseIdentifier: number, newPosition: number): boolean {
    try {
      const currentIndex = this.listaEserciziForm.findIndex(
        (e) => e.form.get("identifier")?.value === exerciseIdentifier
      );

      if (currentIndex === -1) {
        console.error("Esercizio da spostare non trovato");
        return false;
      }

      // L'indice dell'array è basato su 0, la posizione su 1
      const newIndex = newPosition - 1;

      // 1. Rimuovi l'esercizio dalla sua posizione attuale nel nostro array di supporto
      const [exerciseToMove] = this.listaEserciziForm.splice(currentIndex, 1);

      // 2. Inseriscilo nella nuova posizione
      this.listaEserciziForm.splice(newIndex, 0, exerciseToMove);

      // 3. Ora che l'ordine è stato modificato, chiama la sanificazione
      // per aggiornare i valori 'ordinamento' e ricostruire il FormArray.
      this.sanitizeExerciseOrdering();
      this.form.markAsDirty();

      return true;
    } catch (error) {
      console.error("Errore durante lo spostamento dell'esercizio:", error);
      return false;
    }
  }

  getDatiAllenamentoDaSalvare(): AllenamentoDTO {
    try {
      let allenamentoDaSalvare: AllenamentoDTO = {
        id: this.form.controls["id"].value  ? this.form.controls["id"].value : 0,
        idTemplate: this.form.controls["idTemplate"].value  ? this.form.controls["idTemplate"].value : 0,
        dataEsecuzione: this.form.controls["dataEsecuzione"].value ? this.form.controls["dataEsecuzione"].value : new Date(),
        nomeAllenamento: this.form.controls["nomeAllenamento"].value ? this.form.controls["nomeAllenamento"].value : "",
        ordinamento: this.form.controls["ordinamento"].value ? this.form.controls["ordinamento"].value : 0,
        listaEsercizi: [],
      };

      this.listaEserciziForm.forEach((esercizio) => {
        allenamentoDaSalvare.listaEsercizi.push(
          esercizio.getDatiEsercizioDaSalvare()
        );
      });

      return allenamentoDaSalvare;
    } catch (error) {
      throw new Error("SchedaForm.getDatiAllenamentoDaSalvare: " + error);
    }
  }

  public resetForm(): void {
    this.form.reset();
    this.listaEserciziForm = [];
    this.identifier = 0;
  }

  get listaEserciziFormArray(): FormArray<FormGroup<EsercizioFormModel>> {
    return this.form.controls["listaEsercizi"] as FormArray<
      FormGroup<EsercizioFormModel>
    >;
  }
}
