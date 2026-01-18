import {
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { ErrorHandlerService } from "src/app/core/services/error-handler.service";
import { SpinnerService } from "src/app/core/services/spinner.service";
import { CreateOrEditWorkoutExecutionService } from "./create-or-edit-workout-execution-service";
import { ReactiveFormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatTabsModule } from "@angular/material/tabs";
import { ExerciseComponent } from "../create-or-edit-template-plan-component/workout-component/exercise-component/exercise-component";
import {
  MultiOptionButton,
  multiOptionGroup,
  OptionSelectedEvent,
} from "../shared/multi-option-button/multi-option-button";
import { Router } from "@angular/router";
import { AllenamentoDTO as AllenamentoFormDTO } from "src/app/models/create-or-edit-template-or-entity-form-dto/allenamentodto";
import { AllenamentoDTO } from "src/app/models/view-modifica-allenamento-svolto/allenamentodto";
import { EsercizioDTO } from "src/app/models/view-modifica-allenamento-svolto/eserciziodto";
import { SerieDTO } from "src/app/models/view-modifica-allenamento-svolto/seriedto";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { RegistraAllenamentoRequestModel } from "src/app/models/view-modifica-allenamento-svolto/registra-allenaneto";
import { MatNativeDateModule } from "@angular/material/core"; // <<-- provides DateAdapter
import { MatInput } from "@angular/material/input";
import { GetDatiAllenamentoRequestModel } from "src/app/models/view-modifica-allenamento-svolto/get-dati-allenamento";
import { GetDatiTemplateNuovoAllenamentoRequestModel } from "src/app/models/view-modifica-allenamento-svolto/get-dati-template-nuovo-allenamento";
import { ModalService } from "src/app/core/services/modal.service";
import { LoadingProgression } from "src/app/models/enums/loading-progression";
import { DeleteDatiAllenamentoRequestModel } from "src/app/models/view-modifica-allenamento-svolto/deleteDatiAllenamentoSvolto";
import {AuthService} from "../../core/services/auth.service";

@Component({
  selector: "app-create-or-edit-workout-execution",
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatTabsModule,
    ExerciseComponent,
    MultiOptionButton,
    MatInput,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: "./create-or-edit-workout-execution.html",
  styleUrl: "./create-or-edit-workout-execution.scss",
})
export class CreateOrEditWorkoutExecution implements OnInit, OnDestroy {
  @ViewChild("headerGoBack") headerGoBack!: TemplateRef<any>;
  @ViewChild("bodyGoBack") bodyGoBack!: TemplateRef<any>;
  @ViewChild("footerCloseGoBack")
  footerCloseGoBack!: TemplateRef<any>;
  @ViewChild("footerConfirmGoBack")
  footerConfirmGoBack!: TemplateRef<any>;

  @ViewChild("headerDeleteTemplate") headerDeleteTemplate!: TemplateRef<any>;
  @ViewChild("bodyDeleteTemplate") bodyDeleteTemplate!: TemplateRef<any>;
  @ViewChild("footerCloseDeleteTemplate")
  footerCloseDeleteTemplate!: TemplateRef<any>;
  @ViewChild("footerConfirmDeleteTemplate")
  footerConfirmDeleteTemplate!: TemplateRef<any>;

  private initSpinnerId: string | null = null;
  private saveSpinnerId: string | null = null;

  public accordionOpenKeys: string[] = [];

  public idTemplateAllenamento: number = 0;
  public idAllenamento: number = 0;
  public allenamentoDTO: AllenamentoDTO | null = null;
  public createOrEdit: createOrEdit | null = null;

  public LoadingProgressionEnum = LoadingProgression;
  public loadingProgression: LoadingProgression = LoadingProgression.none;

  // Definisci le opzioni del pulsante
  public rightButtonOptionsGroup: multiOptionGroup[] = [];

  constructor(
    private errorHandlerService: ErrorHandlerService,
    private spinnerService: SpinnerService,
    public createOrEditWorkoutExecutionService: CreateOrEditWorkoutExecutionService,
    private router: Router,
    private modalService: ModalService,
    private authService: AuthService
  ) {
    try {
      const navigation = this.router.getCurrentNavigation();
      const state = navigation?.extras.state as {
        idTemplateAllenamento: number;
        idAllenamento: number;
        createOrEdit: createOrEdit;
        allenamentoDTO: AllenamentoDTO;
      };

      if (state?.idTemplateAllenamento) {
        this.idTemplateAllenamento = state.idTemplateAllenamento;
      }

      if (state?.idAllenamento) {
        this.idAllenamento = state.idAllenamento;
      }

      if (state?.allenamentoDTO) {
        this.allenamentoDTO = state.allenamentoDTO;
      }

      if (state?.createOrEdit) {
        this.createOrEdit = state.createOrEdit;
      }
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "CreateOrEditWorkoutExecution.constructor"
      );
    }
  }

  ngOnInit(): void {
    try {
      this.initializeWorkout();
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "CreateOrEditWorkoutExecution.ngOnInit"
      );
    }
  }

  // Nuovo metodo unificato nel component
  initializeWorkout() {
    try {
      this.loadingProgression = LoadingProgression.loading;

      switch (this.createOrEdit) {
        case createOrEdit.create:
          this.getDatiTemplateNuovoAllenamento();
          break;
        case createOrEdit.edit:
          if (this.allenamentoDTO) {
            try {
              this.initSpinnerId = this.spinnerService.showWithResult(
                "Recupero dati allenamento",
                {
                  successMessage: "Dati recuperati con successo",
                  errorMessage: "Errore nel recupero dei dati",
                  resultDuration: 250,
                  minSpinnerDuration: 250,
                }
              );

              this.createOrEditWorkoutExecutionService.InitializeAllenamento(
                this.allenamentoDTO
              );

              this.loadingProgression = LoadingProgression.complete;

              if (this.initSpinnerId) {
                this.spinnerService.setSuccess(this.initSpinnerId);
              }
            } catch (error) {
              if (this.initSpinnerId) {
                this.spinnerService.setError(this.initSpinnerId);
              }
              this.errorHandlerService.logError(
                error,
                "CreateOrEditWorkoutExecution.getDatiAllenamento"
              );
              this.loadingProgression = LoadingProgression.failed;
            }
          } else if (this.idAllenamento) {
            this.getDatiAllenamento();
          } else {
            this.loadingProgression = LoadingProgression.failed;
            throw new Error("Nessun allenamento fornito");
          }
          break;
      }
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "CreateOrEditWorkoutExecution.initializeWorkout"
      );
      this.loadingProgression = LoadingProgression.failed;
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
              this.loadingProgression = LoadingProgression.complete;
            } else {
              if (this.initSpinnerId) {
                this.spinnerService.setError(this.initSpinnerId);
              }
              this.errorHandlerService.logError(
                response.errore.error,
                "CreateOrEditWorkoutExecution.getDatiAllenamento"
              );
              this.loadingProgression = LoadingProgression.failed;
            }
          })
          .catch((error) => {
            if (this.initSpinnerId) {
              this.spinnerService.setError(this.initSpinnerId);
            }
            this.loadingProgression = LoadingProgression.failed;
            throw new Error(error);
          });
      } else {
        if (this.initSpinnerId) {
          this.spinnerService.setError(this.initSpinnerId);
        }
        this.errorHandlerService.logError(
          "nessun id allenamento trovato",
          "CreateOrEditWorkoutExecution.getDatiAllenamento"
        );
        this.loadingProgression = LoadingProgression.failed;
      }
    } catch (error) {
      if (this.initSpinnerId) {
        this.spinnerService.setError(this.initSpinnerId);
      }
      this.errorHandlerService.logError(
        error,
        "CreateOrEditWorkoutExecution.getDatiAllenamento"
      );
      this.loadingProgression = LoadingProgression.failed;
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
              this.loadingProgression = LoadingProgression.complete;
              this.rightButtonOptionsGroup = [
                {
                  id: 1,
                  label: "",
                  options: response.opzioniAltriAllenamenti.map((o) => {
                    return {
                      description: o.description,
                      optionId: o.id,
                      color: " rgba(0, 255, 225, 1)",
                    };
                  }),
                },
              ];
              if (this.initSpinnerId) {
                this.spinnerService.setSuccess(this.initSpinnerId);
              }
            } else {
              if (this.initSpinnerId) {
                this.spinnerService.setError(this.initSpinnerId);
              }
              this.errorHandlerService.logError(
                response.errore.error,
                "CreateOrEditWorkoutExecution.getDatiTemplateNuovoAllenamento"
              );
              this.loadingProgression = LoadingProgression.failed;
            }
          })
          .catch((error) => {
            if (this.initSpinnerId) {
              this.spinnerService.setError(this.initSpinnerId);
            }
            this.errorHandlerService.logError(
              error,
              "CreateOrEditWorkoutExecution.getDatiTemplateNuovoAllenamento"
            );
            this.loadingProgression = LoadingProgression.failed;
          });
      } else {
        if (this.initSpinnerId) {
          this.spinnerService.setError(this.initSpinnerId);
        }
        this.errorHandlerService.logError(
          "nessun id allenamento trovato",
          "CreateOrEditWorkoutExecution.getDatiTemplateNuovoAllenamento"
        );
        this.loadingProgression = LoadingProgression.failed;
      }
    } catch (error) {
      if (this.initSpinnerId) {
        this.spinnerService.setError(this.initSpinnerId);
      }
      this.errorHandlerService.logError(
        error,
        "CreateOrEditWorkoutExecution.getDatiAllenamento"
      );
      this.loadingProgression = LoadingProgression.failed;
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
      this.errorHandlerService.logError(
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
      this.errorHandlerService.logError(
        error,
        "CreateOrEditWorkoutExecution.addNuovoEsercizio"
      );
    }
  }

  onOptionSelected(option: OptionSelectedEvent) {
    switch (option.side) {
      case "right":
        switch (option.groupId) {
          case 1:
            this.idTemplateAllenamento = option.optionId;
            this.createOrEditWorkoutExecutionService.resetData();
            this.initializeWorkout();
            break;
        }
        break;
    }
  }

  registraAllenamento() {
    try {
      let allenamentoForm: AllenamentoFormDTO =
        this.createOrEditWorkoutExecutionService.AllenamentoForm.getDatiAllenamentoDaSalvare();

      const allenamentoDaSalvare: AllenamentoDTO | null =
        this.ConvertAllenamentoFormDTOToAllenamentoDTO(allenamentoForm);
      
      const user = this.authService.getCurrentUser();
      if (allenamentoDaSalvare != null && user!=null) {
        const registraAllenamentoRequest: RegistraAllenamentoRequestModel = {
          dataSvolgimento:
            this.createOrEditWorkoutExecutionService.AllenamentoForm.form
              .controls["dataEsecuzione"].value,
          allenamentoDTO: allenamentoDaSalvare,
          userId: user.userId,
        };

        if (allenamentoDaSalvare) {
          if (this.createOrEdit === createOrEdit.edit) {
            // Mostra lo spinner di salvataggio
            this.saveSpinnerId = this.spinnerService.showWithResult(
              "Salvataggio in corso",
              {
                forceShow: true,
                successMessage: "Salvataggio completato con successo",
                errorMessage: "Errore durante il salvataggio",
                resultDuration: 2000,
                minSpinnerDuration: 500,
              }
            );

            this.createOrEditWorkoutExecutionService
              .aggiornaAllenamentoSvolto(registraAllenamentoRequest)
              .then(async (response) => {
                if (this.saveSpinnerId) {
                  await this.spinnerService.setSuccess(this.saveSpinnerId);
                }

                this.idAllenamento = response.allenamentoCorrente.id;
                this.allenamentoDTO = response.allenamentoCorrente;
                this.initializeWorkout();
              })
              .catch((error) => {
                if (this.saveSpinnerId) {
                  this.spinnerService.setError(
                    this.saveSpinnerId,
                    "Errore nella fase di salvataggio"
                  );
                }
                this.errorHandlerService.logError(
                  error,
                  "CreateOrEditWorkoutExecution.registraAllenamento"
                );
              });
          } else {
            // Mostra lo spinner di salvataggio
            this.saveSpinnerId = this.spinnerService.showWithResult(
              "Salvataggio in corso",
              {
                forceShow: true,
                successMessage:
                  "Salvataggio completato con successo, redirect a home",
                errorMessage: "Errore durante il salvataggio",
                resultDuration: 3000,
                minSpinnerDuration: 500,
              }
            );

            this.createOrEditWorkoutExecutionService
              .registraAllenamento(registraAllenamentoRequest)
              .then(async (response) => {
                if (this.saveSpinnerId) {
                  await this.spinnerService.setSuccess(this.saveSpinnerId);
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
                this.errorHandlerService.logError(
                  error,
                  "CreateOrEditWorkoutExecution.registraAllenamento"
                );
              });
          }
        }
      }
    } catch (error) {
      if (this.saveSpinnerId) {
        this.spinnerService.setError(this.saveSpinnerId);
      }
      this.errorHandlerService.logError(
        error,
        "CreateOrEditWorkoutExecution.registraAllenamento"
      );
    }
  }

  ConvertAllenamentoFormDTOToAllenamentoDTO(
    allenamentoForm: AllenamentoFormDTO
  ): AllenamentoDTO | null {
    try {
      const allenamentoDTO: AllenamentoDTO = {
        id: allenamentoForm.idTemplate,
        //TODO usare unica sintassi, evitare idTemplate, meglio usare solita nomenclatura
        //come allenamentoId, schedaId, ecc...
        idTemplate: allenamentoForm.idTemplate,
        description: allenamentoForm.description,
        dataEsecuzione: allenamentoForm.dataEsecuzione,
        nomeScheda: null,
        listaEsercizi: [],
        nomeAllenamento: allenamentoForm.nomeAllenamento,
        ordinamento: allenamentoForm.ordinamento,
      };

      allenamentoForm.listaEsercizi.forEach((esercizioForm) => {
        const esercizioDTO: EsercizioDTO = {
          id: esercizioForm.id,
          idTemplate: esercizioForm.idTemplate,
          description: esercizioForm.description,
          idIconaEsercizio: esercizioForm.idIconaEsercizio,
          idMetodologia: esercizioForm.idMetodologia,
          idTipoEsercizio: esercizioForm.idTipoEsercizio,
          listaSerie: [],
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
      this.errorHandlerService.logError(
        error,
        "CreateOrEditWorkoutExecution.ConvertAllenamentoFormDTOToAllenamentoDTO"
      );
      return null;
    }
  }

  goBack() {
    try {
      if (this.createOrEditWorkoutExecutionService.AllenamentoForm.form.dirty) {
        this.modalService.open({
          warning: true,
          headerTemplate: this.headerGoBack,
          bodyTemplate: this.bodyGoBack,
          footerCloseTemplate: this.footerCloseGoBack,
          footerConfirmTemplate: this.footerConfirmGoBack,
          onConfirm: () => {
            this.PerformBackNavigate();
          },
        });
      } else {
        this.PerformBackNavigate();
      }
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "CreateOrEditWorkoutExecution.goBack"
      );
    }
  }

  openDeleteAllenamento() {
    try {
      this.modalService.open({
        warning: true,
        headerTemplate: this.headerDeleteTemplate,
        bodyTemplate: this.bodyDeleteTemplate,
        footerCloseTemplate: this.footerCloseDeleteTemplate,
        footerConfirmTemplate: this.footerConfirmDeleteTemplate,
        onConfirm: () => this.eliminaAllenamento(),
      });
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "ViewTemplatePlan.openDeleteScheda"
      );
    }
  }

  eliminaAllenamento() {
    try {
      if (
        this.createOrEditWorkoutExecutionService.AllenamentoForm.form.controls[
          "id"
        ].value !== null &&
        this.createOrEditWorkoutExecutionService.AllenamentoForm.form.controls[
          "id"
        ].value > 0
      ) {
        // Mostra lo spinner di inizializzazione
        this.initSpinnerId = this.spinnerService.showWithResult(
          "Elimino dati allenamento",
          {
            forceShow: true,
            successMessage: "Allenamento eliminato con successo",
            errorMessage: "Errore nell'eliminare la scheda",
            resultDuration: 250,
            minSpinnerDuration: 250,
          }
        );

        const request: DeleteDatiAllenamentoRequestModel = {
          allenamentoId:
            this.createOrEditWorkoutExecutionService.AllenamentoForm.form
              .controls["id"].value,
        };

        this.createOrEditWorkoutExecutionService
          .eliminaAllenamento(request)
          .then((objResponse) => {
            if (this.initSpinnerId) {
              this.spinnerService.setSuccess(this.initSpinnerId);
            }
            this.PerformDeleteNavigate();
          })
          .catch((objError) => {
            if (this.initSpinnerId) {
              this.spinnerService.setError(this.initSpinnerId);
            }
            this.errorHandlerService.logError(
              objError,
              "CreateOrEditWorkoutExecution.getListaTemplateSchede"
            );
          });
      } else {
        this.PerformDeleteNavigate();
      }
    } catch (error) {
      if (this.initSpinnerId) {
        this.spinnerService.setError(this.initSpinnerId);
      }
      this.errorHandlerService.logError(
        error,
        "CreateOrEditWorkoutExecution.getListaTemplateSchede"
      );
    }
  }

  PerformBackNavigate() {
    try {
      switch (this.createOrEdit) {
        case createOrEdit.create:
          this.router.navigate(["/home"]);
          break;
        case createOrEdit.edit:
          if (this.allenamentoDTO) {
            this.router.navigate([
              "/allenamenti-svolti/visualizza-allenamento",
              this.allenamentoDTO.id,
            ]);
          } else if (this.idAllenamento) {
            this.router.navigate([
              "/allenamenti-svolti/visualizza-allenamento",
              this.idAllenamento,
            ]);
          } else {
            throw new Error("Nessun allenamento fornito");
          }
          break;
      }
    } catch (error) {
      throw new Error("CreateOrEditWorkoutExecution.PerformNavigate: " + error);
    }
  }
  PerformDeleteNavigate() {
    try {
      switch (this.createOrEdit) {
        case createOrEdit.create:
          this.router.navigate(["/home"]);
          break;
        case createOrEdit.edit:
          this.router.navigate(["/allenamenti-svolti/"]);
          break;
      }
    } catch (error) {
      throw new Error("CreateOrEditWorkoutExecution.PerformNavigate: " + error);
    }
  }
}

export enum createOrEdit {
  create = 1,
  edit = 2,
}
