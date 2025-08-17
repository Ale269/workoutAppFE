import { FormArray, FormControl, FormGroup } from "@angular/forms";
import { EsercizioForm, EsercizioFormModel } from "./exercise-form";
import { AllenamentoDTO } from "src/app/models/modifica-scheda/allenamentodto";
import { EsercizioDTO } from "src/app/models/modifica-scheda/eserciziodto";

export interface AllenamentoFormModel {
  identifier: FormControl<number | null>;
  idAllenamento: FormControl<number | null>;
  nomeAllenamento: FormControl<string | null>;
  ordinamento: FormControl<number | null>;
  listaEsercizi: FormArray<FormGroup<EsercizioFormModel>>;
}

export class AllenamentoForm {
  public listaEserciziForm: EsercizioForm[] = [];
  public identifier: number = 0;
  public form: FormGroup;

  constructor(identifier: number, allenamentoDTO?: AllenamentoDTO) {
    this.form = new FormGroup<AllenamentoFormModel>({
      identifier: new FormControl<number | null>(identifier),
      idAllenamento: new FormControl<number | null>(
        allenamentoDTO?.idAllenamento || null
      ),
      nomeAllenamento: new FormControl<string | null>(
        allenamentoDTO?.nomeAllenamento || null
      ),
      ordinamento: new FormControl<number | null>(
        allenamentoDTO?.ordinamento || null
      ),
      listaEsercizi: new FormArray<FormGroup<EsercizioFormModel>>([]),
    });

    // Se ci sono dati DTO, popola gli esercizi
    if (allenamentoDTO?.listaEsercizi) {
      allenamentoDTO.listaEsercizi.forEach((esercizioDTO) => {
        this.addEsercizioForm(esercizioDTO);
      });
    }
  }

  addEsercizioForm(esercizioDTO?: EsercizioDTO) {
    try {
      this.identifier = this.identifier + 1;

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
      throw new Error("AllenamentoForm.addEsercizioForm: " + error);
    }
  }

  findEsercizioByIdentifier(identifier: number): EsercizioForm | null {
    return (
      this.listaEserciziForm.find(
        (esercizio) => esercizio.form.get("identifier")?.value === identifier
      ) || null
    );
  }

  reassignOrdinamentiEsercizi(): void {
    if (!this.listaEserciziForm) {
      return;
    }

    // Ordina gli esercizi per ordinamento corrente
    const eserciziOrdinati = [...this.listaEserciziForm].sort((a, b) => {
      const ordinamentoA = a.form.get("Ordinamento")?.value || 0;
      const ordinamentoB = b.form.get("Ordinamento")?.value || 0;
      return ordinamentoA - ordinamentoB;
    });

    // Riassegna gli ordinamenti da 1 a N
    eserciziOrdinati.forEach((esercizio, index) => {
      const newOrdinamento = index + 1;
      esercizio.form.get("Ordinamento")?.setValue(newOrdinamento);
    });

    // Riordina anche l'array principale
    this.listaEserciziForm = eserciziOrdinati;
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
