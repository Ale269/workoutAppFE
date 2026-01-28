import { Injectable } from "@angular/core";
import { ErrorHandlerService } from "src/app/core/services/error-handler.service";
import { SchedaForm } from "./template-plan-form";
import { SchedaDTO } from "src/app/models/view-modifica-scheda/schedadto";
import { SchedaDTO as SchedaFormDTO } from "src/app/models/create-or-edit-template-or-entity-form-dto/schedadto";
import { AllenamentoDTO } from "src/app/models/view-modifica-scheda/allenamentodto";
import { AllenamentoDTO as AllenamentoFormDTO } from "src/app/models/create-or-edit-template-or-entity-form-dto/allenamentodto";
import { EsercizioDTO as EsercizioFormDTO } from "src/app/models/create-or-edit-template-or-entity-form-dto/eserciziodto";
import { SerieDTO as SerieFormDTO } from "src/app/models/create-or-edit-template-or-entity-form-dto/seriedto";
import { WorkoutService } from "../../core/services/workout.service";
import {
  SaveDatiTemplateSchedaRequestModel,
  SaveDatiTemplateSchedaResponseModel,
} from "src/app/models/view-modifica-scheda/saveDatiTemplateScheda";
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
      const schedaFormDTO: SchedaFormDTO =
        this.getSchedaFormDTOFromSchedaDTO(scheda);
      this.formScheda.updateForm(schedaFormDTO);
      this.formScheda.form.markAsPristine();
    } catch (error) {
      throw new Error(`initializeFormWithData: ${error}`);
    }
  }

  getSchedaFormDTOFromSchedaDTO(schedaDTO: SchedaDTO): SchedaFormDTO {
    try {
      const schedaFormDTO: SchedaFormDTO = {
        id: 0,
        idTemplate: schedaDTO.id,
        listaAllenamenti: [],
        nomeScheda: schedaDTO.nomeScheda,
        schedaAttiva: schedaDTO.schedaAttiva,
        description: schedaDTO.description,
      };

      schedaDTO.listaAllenamenti.forEach((allenamento) => {
        const allenamentoFormDTO: AllenamentoFormDTO = {
          id: 0,
          dataEsecuzione: null,
          idTemplate: allenamento.id,
          listaEsercizi: [],
          nomeAllenamento: allenamento.nomeAllenamento,
          ordinamento: allenamento.ordinamento,
          description: allenamento.description
        };
        schedaFormDTO.listaAllenamenti.push(allenamentoFormDTO);

        allenamento.listaEsercizi.forEach((esercizio) => {
          const esercizioFormDTO: EsercizioFormDTO = {
            id: 0,
            idTemplate: esercizio.id,
            description: esercizio.description,
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
      });

      return schedaFormDTO;
    } catch (error) {
      throw new Error(
        "CreateOrEditTemplatePlanService.getSchedaFormDTOFromSchedaDTO: " +
          error
      );
    }
  }

  initializeEmptyForm(): void {
    try {
      this.formScheda = new SchedaForm();
      this.formScheda.form.markAsPristine();
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
      const nuovoAllenamentoDTO: AllenamentoFormDTO = {
        id: 0,
        idTemplate: 0,
        dataEsecuzione: null,
        nomeAllenamento: nomeAllenamento || `Giorno ${nextOrdinamento}`,
        ordinamento: nextOrdinamento,
        listaEsercizi: [],
        description: ""
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
        if (request.schedaDTO.id !== -1) {
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
