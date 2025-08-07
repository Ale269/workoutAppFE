import { FormArray, FormControl, FormGroup } from "@angular/forms";
import { EsercizioForm, EsercizioFormModel } from "./exercise-form";
import { SchedaDTO } from "src/app/models/modifica-scheda/schedadto";
import { EsercizioDTO } from "src/app/models/modifica-scheda/eserciziodto";

interface SchedaFormModel {
  nomeScheda: FormControl<string | null>;
  listaEsercizi: FormArray<FormGroup<EsercizioFormModel>>;
}

export class SchedaForm {
  public listaEserciziForm: EsercizioForm[] = [];
  public identifier: number = 0;
  public form: FormGroup;

  constructor(schedaDTO?: SchedaDTO) {
    this.form = new FormGroup<SchedaFormModel>({
      nomeScheda: new FormControl<string | null>(schedaDTO?.nomeScheda || null),
      listaEsercizi: new FormArray<FormGroup<EsercizioFormModel>>([]),
    });

    // Se ci sono dati DTO, popola gli esercizi
    if (schedaDTO?.listaEsercizi) {
      schedaDTO.listaEsercizi.forEach(esercizioDTO => {
        this.addEsercizioForm(esercizioDTO);
      });
    }
  }

  addEsercizioForm(esercizioDTO?: EsercizioDTO) {
    try {
      this.identifier++;

      const newEsercizioForm: EsercizioForm = new EsercizioForm(
        this.identifier,
        esercizioDTO
      );

      this.listaEserciziForm.push(newEsercizioForm);

      const listaEserciziFormArray = this.form.controls[
        "listaEsercizi"
      ] as FormArray;
      listaEserciziFormArray.push(newEsercizioForm.form);
    } catch (error) {
      throw new Error("SchedaForm.addEsercizioForm: " + error);
    }
  }

  public resetForm(): void {
    this.form.reset();
    this.listaEserciziForm = [];
    this.identifier = 0;
  }

  // Helper per ottenere il FormArray tipizzato
  get listaEserciziFormArray(): FormArray<FormGroup<EsercizioFormModel>> {
    return this.form.controls['listaEsercizi'] as FormArray<FormGroup<EsercizioFormModel>>;
  }
}