import { Injectable } from "@angular/core";
import { ErrorHandlerService } from "src/app/core/services/error-handler.service";
import { WorkoutService } from "../../core/services/workout.service";
import { AllenamentoDTO as AllenamentoFormDTO } from "src/app/models/create-or-edit-template-or-entity-form-dto/allenamentodto";
import { EsercizioDTO as EsercizioFormDTO } from "src/app/models/create-or-edit-template-or-entity-form-dto/eserciziodto";
import { SerieDTO as SerieFormDTO } from "src/app/models/create-or-edit-template-or-entity-form-dto/seriedto";
import {
  GetDatiTemplateNuovoAllenamentoRequestModel,
  GetDatiTemplateNuovoAllenamentoResponseModel,
} from "src/app/models/esecuzione-allenamento/get-dati-template-nuovo-allenamento";
import { AllenamentoDTO } from "src/app/models/esecuzione-allenamento/allenamentodto";
import {
  GetDatiAllenamentoRequestModel,
  GetDatiAllenamentoResponseModel,
} from "src/app/models/esecuzione-allenamento/get-dati-allenamento";
import { AllenamentoForm } from "../create-or-edit-template-plan-component/workout-form";
import { RegistraAllenamentoRequestModel } from "src/app/models/esecuzione-allenamento/registra-allenaneto";

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
                this.InitializeAllenamento(response.allenamentoCorrente);
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
                    this.InitializeAllenamento(
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
  InitializeAllenamento(allenamento: AllenamentoDTO) {
    try {
      const allenamentoFormDTO: AllenamentoFormDTO =
        this.getAllenamentoFormDTOFromAllenamentoDTO(allenamento);

      this.AllenamentoForm = new AllenamentoForm(0, allenamentoFormDTO);
    } catch (error) {
      throw new Error(
        "CreateOrEditWorkoutExecutionService.InitializeNuovoAllenamento: " +
          error
      );
    }
  }

  getAllenamentoFormDTOFromAllenamentoDTO(
    allenamento: AllenamentoDTO
  ): AllenamentoFormDTO {
    try {
      const allenamentoFormDTO: AllenamentoFormDTO = {
        id: 0,
        dataEsecuzione: null,
        idTemplate: allenamento.id,
        listaEsercizi: [],
        nomeAllenamento: allenamento.nomeAllenamento,
        ordinamento: allenamento.ordinamento,
      };

      allenamento.listaEsercizi.forEach((esercizio) => {
        const esercizioFormDTO: EsercizioFormDTO = {
          id: 0,
          idTemplate: esercizio.id,
          idIconaEsercizio: esercizio.idIconaEsercizio,
          idMetodologia: esercizio.idMetodologia,
          idTipoEsercizio: esercizio.idTipoEsercizio,
          ordinamento: esercizio.ordinamento,
          listaSerie: [],
        };
        allenamentoFormDTO.listaEsercizi.push(esercizioFormDTO);

        esercizio.listaSerie.forEach((serie) => {
          const serieFormDTO: SerieFormDTO = {
            carico: serie.carico,
            id: 0,
            idTemplate: serie.id,
            ordinamento: serie.ordinamento,
            ripetizioni: serie.ripetizioni,
          };
          esercizioFormDTO.listaSerie.push(serieFormDTO);
        });
      });

      return allenamentoFormDTO;
    } catch (error) {
      throw new Error("CreateOrEditWorkoutExecutionService.getAllenamentoFormDTOFromAllenamentoDTO: " + error);
    }
  }

  async registraAllenamento(savePlanRequest: RegistraAllenamentoRequestModel): Promise<void> {
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
