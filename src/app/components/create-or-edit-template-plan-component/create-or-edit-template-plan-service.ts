import { Injectable } from "@angular/core";
import { ErrorHandlerService } from "src/app/core/services/error-handler.service";
import { SchedaForm } from "./template-plan-form";
import { SchedaDTO } from "src/app/models/view-modifica-scheda/schedadto";
import { AllenamentoDTO } from "src/app/models/view-modifica-scheda/allenamentodto";
import { WorkoutService } from "../../core/services/workout.service";

@Injectable({
  providedIn: "root",
})
export class CreateOrEditTemplatePlanService {
  public formScheda!: SchedaForm;

  constructor(
    private errorHandlerService: ErrorHandlerService,
    private workoutService: WorkoutService
  ) {}

  initializeFormWithData(scheda: SchedaDTO): void {
    try {
      this.formScheda = new SchedaForm();
      this.formScheda.updateForm(scheda);
    } catch (error) {
      throw new Error(`initializeFormWithData: ${error}`);
    }
  }

  initializeEmptyForm(): void {
    try {
      this.formScheda = new SchedaForm();
    } catch (error) {
      throw new Error(`initializeEmptyForm: ${error}`);
    }
  }

  AddWorkout(nomeAllenamento?: string): void {
    try {
      if (!this.formScheda) {
        throw new Error(
          "FormScheda non inizializzato. Chiamare prima InitializeScheda()"
        );
      }

      // Calcola l'ordinamento per il nuovo allenamento (ultima posizione)
      const nextOrdinamento = this.formScheda.listaAllenamentiForm.length + 1;

      // Crea un AllenamentoDTO con il nome e l'ordinamento
      const nuovoAllenamentoDTO: AllenamentoDTO = {
        id: 0,
        nomeAllenamento: nomeAllenamento || `Giorno ${nextOrdinamento}`,
        ordinamento: nextOrdinamento,
        listaEsercizi: [], // Lista vuota per un nuovo allenamento
      };

      // Usa il metodo esistente per aggiungere l'allenamento
      this.formScheda.addAllenamentoForm(nuovoAllenamentoDTO);
    } catch (error) {
      throw new Error("CreateOrEditTemplatePlanService.AddWorkout: " + error);
    }
  }

  DeleteWorkout(allenamentoIdentifier: number): void {
    try {
      this.formScheda.DeleteAllenamento(allenamentoIdentifier);
    } catch (error) {
      throw new Error(
        "CreateOrEditTemplatePlanService.DeleteAllenamento: " + error
      );
    }
  }

  async savePlan(savePlanRequest: SchedaDTO): Promise<void> {
    // Bisogna anche avere il modello della response
    return new Promise((resolve, reject) => {
      try {
        // Esegui la chiamata mandando i dati necessari
        // Adesso come request ho messo la SchedaDTO ma potrebbe servire altro

        //per prova
        setInterval(() => {
          resolve();
        }, 2000);

        // setInterval(() => {
        //   reject();
        // }, 2000);
      } catch (error) {
        throw new Error("CreateOrEditTemplatePlanService.savePlan: " + error);
      }
    });
  }
}
