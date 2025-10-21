import { Injectable } from "@angular/core";
import { ErrorHandlerService } from "src/app/core/services/error-handler.service";
import { WorkoutService } from "../../core/services/workout.service";
import { AllenamentoForm } from "../create-or-edit-template-plan-component/workout-form";
import {
  GetDatiTemplateNuovoAllenamentoRequestModel,
  GetDatiTemplateNuovoAllenamentoResponseModel,
} from "src/app/models/esecuzione-allenamento/get-dati-template-nuovo-allenamento";
import { AllenamentoDTO } from "src/app/models/esecuzione-allenamento/allenamentodto";
import {
  GetDatiAllenamentoRequestModel,
  GetDatiAllenamentoResponseModel,
} from "src/app/models/esecuzione-allenamento/get-dati-allenamento";

@Injectable({
  providedIn: "root",
})
export class CreateOrEditWorkoutExecutionService {
  public AllenamentoForm!: AllenamentoForm;

  constructor(
    private errorHandlerService: ErrorHandlerService,
    private workoutService: WorkoutService
  ) {}

  async GetDatiAllenamento(
    request: GetDatiAllenamentoRequestModel
  ): Promise<GetDatiAllenamentoResponseModel> {
    return new Promise<GetDatiAllenamentoResponseModel>((resolve, reject) => {
      try {
        this.workoutService.getDatiAllenamento(request).subscribe({
          next: (response: GetDatiAllenamentoResponseModel) => {
            if (!response.errore?.error) {
              if (response.allenamentoCorrente) {
                this.InitializeEditAllenamento(response.allenamentoCorrente);
              }
              resolve(response);
            } else {
              reject(response.errore.error);
            }
          },
          error: (error) => {
            reject(error);
          },
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  async GetDatiTemplateNuovoAllenamento(
    request: GetDatiTemplateNuovoAllenamentoRequestModel
  ): Promise<GetDatiTemplateNuovoAllenamentoResponseModel> {
    return new Promise<GetDatiTemplateNuovoAllenamentoResponseModel>(
      (resolve, reject) => {
        try {
          this.workoutService
            .getDatiTemplateNuovoAllenamento(request)
            .subscribe({
              next: (
                response: GetDatiTemplateNuovoAllenamentoResponseModel
              ) => {
                if (!response.errore?.error) {
                  if (response.allenamentoCorrente) {
                    this.InitializeNuovoAllenamento(
                      response.allenamentoCorrente
                    );
                  }
                  resolve(response);
                } else {
                  reject(response.errore.error);
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

  /**
   * Inizializza un nuovo allenamento partendo da un template
   * @param idTemplateAllenamento ID del template da cui creare il nuovo allenamento
   */
  InitializeNuovoAllenamento(allenamento: AllenamentoDTO) {
    try {
      this.AllenamentoForm = new AllenamentoForm(0, allenamento);
    } catch (error) {
      throw new Error(
        "CreateOrEditWorkoutExecutionService.InitializeNuovoAllenamento: " +
          error
      );
    }
  }

  /**
   * Inizializza un allenamento esistente in modalità modifica
   */
  InitializeEditAllenamento(allenamento: AllenamentoDTO) {
    try {
      this.AllenamentoForm = new AllenamentoForm(0, allenamento);
    } catch (error) {
      throw new Error(
        "CreateOrEditWorkoutExecutionService.InitializeEditAllenamento: " +
          error
      );
    }
  }

  async registraAllenamento(savePlanRequest: AllenamentoDTO): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Chiamata al backend per salvare l'allenamento
        console.log("Registrazione allenamento:", savePlanRequest);

        // Simula salvataggio
        setTimeout(() => {
          resolve();
        }, 500);
      } catch (error) {
        reject(error);
      }
    });
  }

  resetData() {
    try {
      this.AllenamentoForm.resetForm();
    } catch (error) {
      throw new Error(
        "CreateOrEditWorkoutExecutionService.resetData: " + error
      );
    }
  }
}
