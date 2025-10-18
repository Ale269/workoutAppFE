import { Injectable } from "@angular/core";
import { ErrorHandlerService } from "src/app/core/services/error-handler.service";
import { SchedaForm } from "./template-plan-form";
import { SchedaDTO } from "src/app/models/view-modifica-scheda/schedadto";
import { AllenamentoDTO } from "src/app/models/view-modifica-scheda/allenamentodto";
import { WorkoutService } from "../../core/services/workout.service";
import {
  SaveDatiTemplateSchedaRequestModel,
  SaveDatiTemplateSchedaResponseModel,
} from "src/app/models/view-modifica-scheda/saveDatiTemplateScheda";
import { P } from "@angular/cdk/platform.d-B3vREl3q";
import {
  DeleteDatiTemplateSchedaRequestModel,
  DeleteDatiTemplateSchedaResponseModel,
} from "src/app/models/view-modifica-scheda/deleteDatiTemplateScheda";

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

  async savePlan(
    request: SaveDatiTemplateSchedaRequestModel
  ): Promise<SchedaDTO> {
    return new Promise<SchedaDTO>((resolve, reject) => {
      try {
        if (request.schedaDTO.id) {
          this.workoutService.editTemplateScheda(request).subscribe({
            next: (response: SaveDatiTemplateSchedaResponseModel) => {
              if (!response.errore?.error) {
                if (response.datiScheda) {
                  resolve(response.datiScheda);
                } else {
                  reject(response.errore.error);
                }
              } else {
                reject(response.errore.error);
              }
            },
            error: (error) => {
              reject(error);
            },
          });
        } else {
          this.workoutService.addTemplateScheda(request).subscribe({
            next: (response: SaveDatiTemplateSchedaResponseModel) => {
              if (!response.errore?.error) {
                if (response.datiScheda) {
                  resolve(response.datiScheda);
                } else {
                  reject(response.errore.error);
                }
              } else {
                reject(response.errore.error);
              }
            },
            error: (error) => {
              reject(error);
            },
          });
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  resetAll() {
    try {
      this.formScheda.resetForm();
    } catch (error) {
      throw new Error("CreateOrEditTemplatePlanService.resetAll: " + error);
    }
  }

  eliminaScheda(
    request: DeleteDatiTemplateSchedaRequestModel
  ): Promise<DeleteDatiTemplateSchedaResponseModel> {
    return new Promise<DeleteDatiTemplateSchedaResponseModel>(
      (resolve, reject) => {
        try {
          this.workoutService.deleteTemplateScheda(request).subscribe({
            next: (response: DeleteDatiTemplateSchedaResponseModel) => {
              if (!response.errore?.error) {
                resolve(response);
              } else {
                reject(null);
              }
            },
            error: (error) => {
              reject(error);
            },
          });
        } catch (error) {
          reject(error);
        }
      }
    );
  }
}
