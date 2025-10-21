import { Component, OnDestroy, OnInit } from "@angular/core";
import { ErrorHandlerService } from "src/app/core/services/error-handler.service";
import { SpinnerService } from "src/app/core/services/spinner.service";
import { CreateOrEditWorkoutExecutionService } from "./create-or-edit-workout-execution-service";
import { ReactiveFormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatTabsModule } from "@angular/material/tabs";
import { ExerciseComponent } from "../create-or-edit-template-plan-component/workout-component/exercise-component/exercise-component";
import {
  buttonOption,
  MultiOptionButton,
} from "../shared/multi-option-button/multi-option-button";
import { Router } from "@angular/router";
import { altriAllenamentiSelectDTO } from "src/app/models/esecuzione-allenamento/altri-allenamenti-select-dto";
import { GetDatiAllenamentoRequestModel } from "src/app/models/esecuzione-allenamento/get-dati-allenamento";
import { GetDatiTemplateNuovoAllenamentoRequestModel } from "src/app/models/esecuzione-allenamento/get-dati-template-nuovo-allenamento";
import { AllenamentoDTO as AllenamentoFormDTO } from "src/app/models/create-or-edit-template-or-entity-form-dto/allenamentodto";
import { AllenamentoDTO } from "src/app/models/esecuzione-allenamento/allenamentodto";
import { EsercizioDTO } from "src/app/models/esecuzione-allenamento/eserciziodto";
import { SerieDTO } from "src/app/models/esecuzione-allenamento/seriedto";

@Component({
  selector: "app-create-or-edit-workout-execution",
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatTabsModule,
    ExerciseComponent,
    MultiOptionButton,
  ],
  templateUrl: "./create-or-edit-workout-execution.html",
  styleUrl: "./create-or-edit-workout-execution.scss",
})
export class CreateOrEditWorkoutExecution implements OnInit, OnDestroy {
  private initSpinnerId: string | null = null;
  private saveSpinnerId: string | null = null;

  public accordionOpenKeys: string[] = [];

  public idTemplateAllenamento: number = 0;
  public idAllenamento: number = 0;

  public allenamentoDataLoaded: boolean = false;

  // Definisci le opzioni del pulsante
  public buttonOptions: buttonOption[] = [];

  constructor(
    private errorHandlerService: ErrorHandlerService,
    private spinnerService: SpinnerService,
    public createOrEditWorkoutExecutionService: CreateOrEditWorkoutExecutionService,
    private router: Router
  ) {
    try {
      const navigation = this.router.getCurrentNavigation();
      const state = navigation?.extras.state as {
        idTemplateAllenamento: number;
        idAllenamento: number;
      };

      if (state?.idTemplateAllenamento) {
        this.idTemplateAllenamento = state.idTemplateAllenamento;
      }

      if (state?.idAllenamento) {
        this.idAllenamento = state.idAllenamento;
      }
    } catch (error) {
      this.errorHandlerService.handleError(
        error,
        "CreateOrEditWorkoutExecution.constructor"
      );
    }
  }

  ngOnInit(): void {
    try {
      this.initializeWorkout();
    } catch (error) {
      this.errorHandlerService.handleError(
        error,
        "CreateOrEditWorkoutExecution.ngOnInit"
      );
    }
  }

  // Nuovo metodo unificato nel component
  initializeWorkout() {
    try {
      // Se sto registrando un nuovo allenamento
      if (this.idAllenamento) {
        this.getDatiAllenamento();
      }
      // sto editando un allenamento
      else {
        this.getDatiTemplateNuovoAllenamento();
      }
    } catch (error) {
      this.errorHandlerService.handleError(
        error,
        "CreateOrEditWorkoutExecution.initializeWorkout"
      );
    }
  }

  getDatiAllenamento() {
    try {
      // Mostra lo spinner di inizializzazione
      this.initSpinnerId = this.spinnerService.showWithResult(
        "Recupero dati allenamento",
        {
          successMessage: "Dati recuperati con successo",
          errorMessage: "Errore nel recupero dei dati",
          resultDuration: 250,
          minSpinnerDuration: 250,
        }
      );

      if (this.idAllenamento !== null && this.idAllenamento > 0) {
        const request: GetDatiAllenamentoRequestModel = {
          idAllenamento: this.idAllenamento,
        };

        this.createOrEditWorkoutExecutionService
          .GetDatiAllenamento(request)
          .then((response) => {
            if (!response.errore?.error) {
              if (this.initSpinnerId) {
                this.spinnerService.setSuccess(this.initSpinnerId);
              }
            } else {
              if (this.initSpinnerId) {
                this.spinnerService.setError(this.initSpinnerId);
              }
              this.errorHandlerService.handleError(
                response.errore.error,
                "CreateOrEditWorkoutExecution.getDatiAllenamento"
              );
            }
          })
          .catch((error) => {
            if (this.initSpinnerId) {
              this.spinnerService.setError(this.initSpinnerId);
            }
            this.errorHandlerService.handleError(
              error,
              "CreateOrEditWorkoutExecution.getDatiAllenamento"
            );
          });
      } else {
        if (this.initSpinnerId) {
          this.spinnerService.setError(this.initSpinnerId);
        }
        this.errorHandlerService.handleError(
          "nessun id allenamento trovato",
          "CreateOrEditWorkoutExecution.getDatiAllenamento"
        );
      }
    } catch (error) {
      if (this.initSpinnerId) {
        this.spinnerService.setError(this.initSpinnerId);
      }
      this.errorHandlerService.handleError(
        error,
        "CreateOrEditWorkoutExecution.getDatiAllenamento"
      );
    }
  }

  getDatiTemplateNuovoAllenamento() {
    try {
      // Mostra lo spinner di inizializzazione
      this.initSpinnerId = this.spinnerService.showWithResult(
        "Recupero dati nuovo allenamento",
        {
          successMessage: "Dati recuperati con successo",
          errorMessage: "Errore nel recupero dei dati",
          resultDuration: 250,
          minSpinnerDuration: 250,
        }
      );

      if (
        this.idTemplateAllenamento !== null &&
        this.idTemplateAllenamento > 0
      ) {
        const request: GetDatiTemplateNuovoAllenamentoRequestModel = {
          idTemplateAllenamento: this.idTemplateAllenamento,
        };

        this.createOrEditWorkoutExecutionService
          .GetDatiTemplateNuovoAllenamento(request)
          .then((response) => {
            if (!response.errore?.error) {
              this.allenamentoDataLoaded = true;
              this.buttonOptions = response.opzioniAltriAllenamenti.map((o) => {
                return { description: o.description, optionId: o.idTemplate };
              });
              if (this.initSpinnerId) {
                this.spinnerService.setSuccess(this.initSpinnerId);
              }
            } else {
              if (this.initSpinnerId) {
                this.spinnerService.setError(this.initSpinnerId);
              }
              this.errorHandlerService.handleError(
                response.errore.error,
                "CreateOrEditWorkoutExecution.getDatiTemplateNuovoAllenamento"
              );
            }
          })
          .catch((error) => {
            if (this.initSpinnerId) {
              this.spinnerService.setError(this.initSpinnerId);
            }
            this.errorHandlerService.handleError(
              error,
              "CreateOrEditWorkoutExecution.getDatiTemplateNuovoAllenamento"
            );
          });
      } else {
        if (this.initSpinnerId) {
          this.spinnerService.setError(this.initSpinnerId);
        }
        this.errorHandlerService.handleError(
          "nessun id allenamento trovato",
          "CreateOrEditWorkoutExecution.getDatiTemplateNuovoAllenamento"
        );
      }
    } catch (error) {
      if (this.initSpinnerId) {
        this.spinnerService.setError(this.initSpinnerId);
      }
      this.errorHandlerService.handleError(
        error,
        "CreateOrEditWorkoutExecution.getDatiAllenamento"
      );
    }
  }

  ngOnDestroy(): void {
    // Chiudi eventuali spinner attivi
    if (this.initSpinnerId) {
      this.spinnerService.hide(this.initSpinnerId);
    }
    if (this.saveSpinnerId) {
      this.spinnerService.hide(this.saveSpinnerId);
    }
  }

  deleteEexercise(identifier: number) {
    try {
      this.createOrEditWorkoutExecutionService.AllenamentoForm.deleteEsercizio(
        identifier
      );
    } catch (error) {
      this.errorHandlerService.handleError(
        error,
        "CreateOrEditWorkoutExecution.deleteEexercise"
      );
    }
  }
  addNuovoEsercizio() {
    try {
      this.createOrEditWorkoutExecutionService.AllenamentoForm.addEsercizioForm(
        undefined
      );
    } catch (error) {
      this.errorHandlerService.handleError(
        error,
        "CreateOrEditWorkoutExecution.addNuovoEsercizio"
      );
    }
  }

  onOptionSelected(optionId: number) {
    console.log("Opzione selezionata:", optionId);
    this.allenamentoDataLoaded = false;
    // this.idTemplateAllenamento = optionId;
    this.idTemplateAllenamento = 2;
    this.createOrEditWorkoutExecutionService.resetData();
    this.initializeWorkout();
  }

  private handleOption1() {
    // Logica per l'opzione 1
  }

  private handleOption2() {
    // Logica per l'opzione 2
  }

  private handleOption3() {
    // Logica per l'opzione 3
  }

  registraAllenamento() {
    try {
      // Mostra lo spinner di salvataggio
      this.saveSpinnerId = this.spinnerService.showWithResult(
        "Salvataggio in corso",
        {
          successMessage: "Salvataggio completato con successo",
          errorMessage: "Errore durante il salvataggio",
          resultDuration: 500,
          minSpinnerDuration: 500,
        }
      );

      let allenamentoForm: AllenamentoFormDTO =
        this.createOrEditWorkoutExecutionService.AllenamentoForm.getDatiAllenamentoDaSalvare();

      const allenamentoDaSalvare: AllenamentoDTO | null =
        this.ConvertAllenamentoFormDTOToAllenamentoDTO(allenamentoForm);

      if (allenamentoDaSalvare) {
        this.createOrEditWorkoutExecutionService
          .registraAllenamento(allenamentoDaSalvare)
          .then((response) => {
            if (this.saveSpinnerId) {
              this.spinnerService.setSuccess(this.saveSpinnerId);
            }
            this.router.navigate(["/home"]);
          })
          .catch((error) => {
            if (this.saveSpinnerId) {
              this.spinnerService.setError(
                this.saveSpinnerId,
                "Errore nella fase di salvataggio"
              );
            }
            this.errorHandlerService.handleError(
              error,
              "WorkoutComponent.registraAllenamento"
            );
          });
      }
    } catch (error) {
      if (this.saveSpinnerId) {
        this.spinnerService.setError(this.saveSpinnerId);
      }
      this.errorHandlerService.handleError(
        error,
        "WorkoutComponent.registraAllenamento"
      );
    }
  }

  ConvertAllenamentoFormDTOToAllenamentoDTO(
    allenamentoForm: AllenamentoFormDTO
  ): AllenamentoDTO | null {
    try {
      const allenamentoDTO: AllenamentoDTO = {
        id: allenamentoForm.id,
        idTemplate: allenamentoForm.idTemplate,
        listaEsercizi: [],
        nomeAllenamento: allenamentoForm.nomeAllenamento,
        ordinamento: allenamentoForm.ordinamento,
      };

      allenamentoForm.listaEsercizi.forEach((esercizioForm) => {
        const esercizioDTO: EsercizioDTO = {
          id: esercizioForm.id,
          idTemplate: esercizioForm.idTemplate,
          idIconaEsercizio: esercizioForm.idIconaEsercizio,
          idMetodologia: esercizioForm.idMetodologia,
          idTipoEsercizio: esercizioForm.idTipoEsercizio,
          listaSerie: esercizioForm.listaSerie,
          ordinamento: esercizioForm.ordinamento,
        };

        esercizioForm.listaSerie.forEach((serieForm) => {
          const serieDTO: SerieDTO = {
            id: serieForm.id,
            idTemplate: serieForm.idTemplate,
            carico: serieForm.carico,
            ordinamento: serieForm.ordinamento,
            ripetizioni: serieForm.ripetizioni,
          };

          esercizioDTO.listaSerie.push(serieDTO);
        });

        allenamentoDTO.listaEsercizi.push(esercizioDTO);
      });

      return allenamentoDTO;
    } catch (error) {
      this.errorHandlerService.handleError(
        error,
        "WorkoutComponent.ConvertAllenamentoFormDTOToAllenamentoDTO"
      );
      return null;
    }
  }
}
