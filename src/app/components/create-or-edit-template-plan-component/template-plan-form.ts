import { FormArray, FormControl, FormGroup } from "@angular/forms";
import { AllenamentoForm, AllenamentoFormModel } from "./workout-form";
import { SchedaDTO } from "src/app/models/modifica-scheda/schedadto";
import { AllenamentoDTO } from "src/app/models/modifica-scheda/allenamentodto";

interface SchedaFormModel {
  nomeScheda: FormControl<string | null>;
  listaAllenamenti: FormArray<FormGroup<AllenamentoFormModel>>;
}

export class SchedaForm {
  public listaAllenamentiForm: AllenamentoForm[] = [];
  public identifier: number = 0;
  public form: FormGroup;

  constructor(schedaDTO?: SchedaDTO) {
    this.form = new FormGroup<SchedaFormModel>({
      nomeScheda: new FormControl<string | null>(schedaDTO?.nomeScheda || null),
      listaAllenamenti: new FormArray<FormGroup<AllenamentoFormModel>>([]),
    });

    // Se ci sono dati DTO, popola gli allenamenti
    if (schedaDTO?.listaAllenamenti) {
      schedaDTO.listaAllenamenti.forEach((allenamentoDTO) => {
        this.addAllenamentoForm(allenamentoDTO);
      });
    }
  }

  addAllenamentoForm(allenamentoDTO?: AllenamentoDTO) {
    try {
      this.identifier = this.identifier + 1;

      const newAllenamentoForm: AllenamentoForm = new AllenamentoForm(
        this.identifier,
        allenamentoDTO
      );

      this.listaAllenamentiForm.push(newAllenamentoForm);

      const listaAllenamentiFormArray = this.form.controls[
        "listaAllenamenti"
      ] as FormArray;
      listaAllenamentiFormArray.push(newAllenamentoForm.form);
    } catch (error) {
      throw new Error("SchedaForm.addAllenamentoForm: " + error);
    }
  }

  public resetForm(): void {
    this.form.reset();
    this.listaAllenamentiForm = [];
    this.identifier = 0;
  }

  // Helper per ottenere il FormArray tipizzato
  get listaAllenamentiFormArray(): FormArray<FormGroup<AllenamentoFormModel>> {
    return this.form.controls["listaAllenamenti"] as FormArray<
      FormGroup<AllenamentoFormModel>
    >;
  }
}
