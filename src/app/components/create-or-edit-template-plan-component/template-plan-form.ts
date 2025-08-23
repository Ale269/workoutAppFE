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

  DeleteAllenamento(allenamentoIdentifier: number): void {
    try {
      if (!this.form) {
        throw new Error(
          "FormScheda non inizializzato. Chiamare prima InitializeScheda()"
        );
      }

      // Trova l'indice dell'allenamento da eliminare
      const indexToDelete = this.listaAllenamentiForm.findIndex(
        (allenamento) =>
          allenamento.form.controls["identifier"]?.value ===
          allenamentoIdentifier
      );

      if (indexToDelete === -1) {
        throw new Error(
          `Allenamento con identifier ${allenamentoIdentifier} non trovato`
        );
      }

      // Rimuovi l'allenamento dalla lista
      this.listaAllenamentiForm.splice(indexToDelete, 1);

      // Rimuovi il controllo dal FormArray
      this.listaAllenamentiFormArray.removeAt(indexToDelete);

      // Riassegna gli ordinamenti corretti
      this.reassignOrdinamentiAllenamenti();
    } catch (error) {
      throw new Error("SchedaForm.DeleteAllenamento: " + error);
    }
  }

  private reassignOrdinamentiAllenamenti(): void {
    if (!this.listaAllenamentiForm) {
      return;
    }

    // Ordina gli allenamenti per ordinamento corrente
    const allenamentiOrdinati = [...this.listaAllenamentiForm].sort((a, b) => {
      const ordinamentoA = a.form.controls["ordinamento"]?.value || 0;
      const ordinamentoB = b.form.controls["ordinamento"]?.value || 0;
      return ordinamentoA - ordinamentoB;
    });

    // Riassegna gli ordinamenti da 1 a N
    allenamentiOrdinati.forEach((allenamento, index) => {
      const newOrdinamento = index + 1;
      allenamento.form.controls["ordinamento"]?.setValue(newOrdinamento);
    });

    // Riordina anche l'array principale
    this.listaAllenamentiForm = allenamentiOrdinati;
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
