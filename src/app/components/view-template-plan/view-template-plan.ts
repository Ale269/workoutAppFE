import {
  ChangeDetectorRef,
  Component,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { ErrorHandlerService } from "src/app/core/services/error-handler.service";
import { SpinnerService } from "src/app/core/services/spinner.service";
import { SchedaDTO } from "src/app/models/view-modifica-scheda/schedadto";
import { TrainingMethodologyPipe } from "../../core/pipes/training-methodology";
import { SeriesRepsPipe } from "../../core/pipes/series-reps-pipe ";
import { ExerciseNamePipe } from "../../core/pipes/exercise-name";
import { ExerciseIconPipe } from "../../core/pipes/exercise-icon";
import { ExerciseIconColorPipe } from "../../core/pipes/exercise-icon-color";
import { ActivatedRoute, Router } from "@angular/router";
import { WorkoutService } from "src/app/core/services/workout.service";
import {
  GetDatiTemplateSchedaRequestModel,
  GetDatiTemplateSchedaResponseModel,
} from "src/app/models/view-modifica-scheda/getDatiTemplateScheda";
import {
  DeleteDatiTemplateSchedaRequestModel,
  DeleteDatiTemplateSchedaResponseModel,
} from "../../models/view-modifica-scheda/deleteDatiTemplateScheda";
import { ModalService } from "src/app/core/services/modal.service";
import { LoadingProgression } from "src/app/models/enums/loading-progression";
import { Switch } from "../shared/switch/switch";
import {
  AttivaSchedaRequestModel,
  AttivaSchedaResponseModel,
} from "src/app/models/view-modifica-scheda/attivaScheda";
import { DownloadSchedaRequestModel } from "../../models/view-modifica-scheda/downloadScheda";
import {
  SaveDatiTemplateSchedaRequestModel,
  SaveDatiTemplateSchedaResponseModel,
} from "../../models/view-modifica-scheda/saveDatiTemplateScheda";
import { Observable } from "rxjs";
import { CreateOrEditTemplatePlanService } from "../create-or-edit-template-plan-component/create-or-edit-template-plan-service";
import { AuthService } from "../../core/services/auth.service";
import { MultiOptionButton } from "../shared/multi-option-button/multi-option-button";

@Component({
  selector: "app-view-template-plan",
  imports: [
    TrainingMethodologyPipe,
    SeriesRepsPipe,
    ExerciseNamePipe,
    ExerciseIconPipe,
    ExerciseIconColorPipe,
    Switch,
    MultiOptionButton
  ],
  templateUrl: "./view-template-plan.html",
  styleUrl: "./view-template-plan.scss",
})
export class ViewTemplatePlan {
  @ViewChild("IsActiveSwitch") Switch!: Switch;
  @ViewChild("headerDeleteTemplate") headerDeleteTemplate!: TemplateRef<any>;
  @ViewChild("bodyDeleteTemplate") bodyDeleteTemplate!: TemplateRef<any>;
  @ViewChild("footerCloseDeleteTemplate")
  footerCloseDeleteTemplate!: TemplateRef<any>;
  @ViewChild("footerConfirmDeleteTemplate")
  footerConfirmDeleteTemplate!: TemplateRef<any>;

  public idScheda: number | null = 0;
  public scheda!: SchedaDTO;
  public selectedTabIndex: number = 0;
  private currentSpinnerId: string | null = null;
  private saveSpinnerId: string | null = null;

  public LoadingProgressionEnum = LoadingProgression;
  public loadingProgression: LoadingProgression = LoadingProgression.none;

  constructor(
    private errorHandlerService: ErrorHandlerService,
    private spinnerService: SpinnerService,
    private activatedRouter: ActivatedRoute,
    private router: Router,
    private workoutService: WorkoutService,
    private modalService: ModalService,

    public createOrEditTemplatePlanService: CreateOrEditTemplatePlanService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) {
    try {
      this.idScheda = Number(this.activatedRouter.snapshot.paramMap.get("id"));
    } catch (error) {
      this.errorHandlerService.logError(error, "ViewTemplatePlan.constructor");
    }
  }

  ngOnInit(): void {
    try {
      this.getDatiScheda();
    } catch (error) {
      this.errorHandlerService.logError(error, "ViewTemplatePlan.ngOnInit");
    }
  }

  getDatiScheda() {
    try {
      // Mostra lo spinner di inizializzazione
      this.currentSpinnerId = this.spinnerService.showWithResult(
        "Recupero dati scheda",
        {
          successMessage: "Dati recuperati con successo",
          errorMessage: "Errore nel recupero dei dati",
          resultDuration: 250,
          minSpinnerDuration: 250,
        }
      );

      this.loadingProgression = LoadingProgression.loading;

      if (this.idScheda !== null && this.idScheda > 0) {
        const request: GetDatiTemplateSchedaRequestModel = {
          workoutId: this.idScheda,
        };

        this.workoutService.getDatiTemplateScheda(request).subscribe({
          next: (response: GetDatiTemplateSchedaResponseModel) => {
            if (!response.errore?.error) {
              if (response.datiScheda) {
                this.scheda = this.ordinaScheda(response.datiScheda);

                if (this.currentSpinnerId) {
                  this.spinnerService.setSuccess(this.currentSpinnerId);
                }
                this.loadingProgression = LoadingProgression.complete;
              } else {
                if (this.currentSpinnerId) {
                  this.spinnerService.setError(this.currentSpinnerId);
                }
                this.errorHandlerService.logError(
                  response.errore.error,
                  "ViewTemplatePlan.getListaTemplateSchede"
                );
                this.loadingProgression = LoadingProgression.failed;
              }
            } else {
              if (this.currentSpinnerId) {
                this.spinnerService.setError(this.currentSpinnerId);
              }
              this.errorHandlerService.logError(
                response.errore.error,
                "ViewTemplatePlan.getListaTemplateSchede"
              );
              this.loadingProgression = LoadingProgression.failed;
            }
          },
          error: (error) => {
            if (this.currentSpinnerId) {
              this.spinnerService.setError(this.currentSpinnerId);
            }
            this.errorHandlerService.logError(
              error,
              "ViewTemplatePlan.getListaTemplateSchede"
            );
            this.loadingProgression = LoadingProgression.failed;
          },
        });
      } else {
        if (this.currentSpinnerId) {
          this.spinnerService.setError(this.currentSpinnerId);
        }
        this.errorHandlerService.logError(
          "Nessuna scheda trovata: ",
          "ViewTemplatePlan.getListaTemplateSchede"
        );
        this.loadingProgression = LoadingProgression.failed;
      }
    } catch (error) {
      if (this.currentSpinnerId) {
        this.spinnerService.setError(this.currentSpinnerId);
      }
      this.errorHandlerService.logError(
        error,
        "ViewTemplatePlan.getListaTemplateSchede"
      );
      this.loadingProgression = LoadingProgression.failed;
    }
  }

  private ordinaScheda(scheda: SchedaDTO): SchedaDTO {
    const schedaOrdinata = { ...scheda };

    if (
      schedaOrdinata.listaAllenamenti &&
      schedaOrdinata.listaAllenamenti.length > 0
    ) {
      schedaOrdinata.listaAllenamenti = schedaOrdinata.listaAllenamenti
        .map((allenamento) => {
          const allenamentoOrdinato = { ...allenamento };

          if (
            allenamentoOrdinato.listaEsercizi &&
            allenamentoOrdinato.listaEsercizi.length > 0
          ) {
            allenamentoOrdinato.listaEsercizi =
              allenamentoOrdinato.listaEsercizi
                .map((esercizio) => {
                  const esercizioOrdinato = { ...esercizio };

                  if (
                    esercizioOrdinato.listaSerie &&
                    esercizioOrdinato.listaSerie.length > 0
                  ) {
                    esercizioOrdinato.listaSerie = [
                      ...esercizioOrdinato.listaSerie,
                    ].sort((a, b) => a.ordinamento - b.ordinamento);
                  }

                  return esercizioOrdinato;
                })
                .sort((a, b) => a.ordinamento - b.ordinamento);
          }

          return allenamentoOrdinato;
        })
        .sort((a, b) => a.ordinamento - b.ordinamento);
    }

    return schedaOrdinata;
  }

  goBack() {
    try {
      this.router.navigate(["/le-mie-schede"]);
    } catch (error) {
      this.errorHandlerService.logError(error, "ViewTemplatePlan.goBack");
    }
  }

  modificaScheda() {
    try {
      this.router.navigate(["/le-mie-schede/modifica-scheda/", this.idScheda], {
        state: { scheda: this.scheda },
      });
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "ViewTemplatePlan.modificaScheda"
      );
    }
  }

  openDeleteScheda() {
    try {
      this.modalService.open({
        warning: true,
        headerTemplate: this.headerDeleteTemplate,
        bodyTemplate: this.bodyDeleteTemplate,
        footerCloseTemplate: this.footerCloseDeleteTemplate,
        footerConfirmTemplate: this.footerConfirmDeleteTemplate,
        onConfirm: () => this.eliminaScheda(),
      });
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "WorkoutComponent.modificaScheda"
      );
    }
  }

  eliminaScheda() {
    try {
      // Mostra lo spinner di inizializzazione
      this.currentSpinnerId = this.spinnerService.showWithResult(
        "Elimino dati scheda",
        {
          forceShow: true,
          successMessage: "Scheda eliminata con successo",
          errorMessage: "Errore nell'eliminare la scheda",
          resultDuration: 250,
          minSpinnerDuration: 250,
        }
      );

      if (this.idScheda !== null && this.idScheda > 0) {
        const request: DeleteDatiTemplateSchedaRequestModel = {
          workoutId: this.idScheda,
        };

        this.workoutService.deleteTemplateScheda(request).subscribe({
          next: (response: DeleteDatiTemplateSchedaResponseModel) => {
            if (!response.errore?.error) {
              if (this.currentSpinnerId) {
                this.spinnerService.setSuccess(this.currentSpinnerId);
              }
              this.goBack();
            } else {
              if (this.currentSpinnerId) {
                this.spinnerService.setError(this.currentSpinnerId);
              }
              this.errorHandlerService.logError(
                response.errore.error,
                "ViewTemplatePlan.modificaScheda"
              );
            }
          },
          error: (error) => {
            if (this.currentSpinnerId) {
              this.spinnerService.setError(this.currentSpinnerId);
            }
            this.errorHandlerService.logError(
              error,
              "ViewTemplatePlan.modificaScheda"
            );
          },
        });
      } else {
        if (this.currentSpinnerId) {
          this.spinnerService.setError(this.currentSpinnerId);
        }
        this.errorHandlerService.logError(
          "Nessuna scheda trovata: ",
          "ViewTemplatePlan.modificaScheda"
        );
      }
    } catch (error) {
      if (this.currentSpinnerId) {
        this.spinnerService.setError(this.currentSpinnerId);
      }
      this.errorHandlerService.logError(
        error,
        "ViewTemplatePlan.modificaScheda"
      );
    }
  }

  onAttivazioneStateChange(newState: boolean) {
    try {
      this.cambiaStatoAttivazioneScheda(newState);
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "WorkoutComponent.OnAttivazioneStateChange"
      );
    }
  }

  cambiaStatoAttivazioneScheda(newState: boolean) {
    try {
      // Mostra lo spinner
      this.currentSpinnerId = this.spinnerService.showWithResult(
        newState ? "Attivazione scheda" : "Disattivazione scheda",
        {
          forceShow: true,
          successMessage: newState
            ? "Scheda attivata con successo"
            : "Scheda disattivata con successo",
          errorMessage: newState
            ? "Errore nell'attivazione della scheda"
            : "Errore nella disattivazione della scheda",
          resultDuration: 250,
          minSpinnerDuration: 250,
        }
      );
      const user = this.authService.getCurrentUser();

      if (this.idScheda !== null && this.idScheda > 0 && user) {
        const request: AttivaSchedaRequestModel = {
          idScheda: this.idScheda,
          userId: user.userId,
        };

        this.workoutService.attivaScheda(request).subscribe({
          next: (response: AttivaSchedaResponseModel) => {
            if (!response.errore?.error) {
              if (this.currentSpinnerId) {
                this.spinnerService.setSuccess(this.currentSpinnerId);
              }

              this.scheda.schedaAttiva = this.Switch.isActiveInternal;
            } else {
              this.Switch.setValue(false);
              if (this.currentSpinnerId) {
                this.spinnerService.setError(this.currentSpinnerId);
              }
              this.errorHandlerService.logError(
                response.errore.error,
                "ViewTemplatePlan.CambiaStatoAttivazioneScheda"
              );
            }
          },
          error: (error) => {
            this.Switch.setValue(false);
            if (this.currentSpinnerId) {
              this.spinnerService.setError(this.currentSpinnerId);
            }
            this.errorHandlerService.logError(
              error,
              "ViewTemplatePlan.CambiaStatoAttivazioneScheda"
            );
          },
        });
      } else {
        this.Switch.setValue(false);
        if (this.currentSpinnerId) {
          this.spinnerService.setError(this.currentSpinnerId);
        }
        this.errorHandlerService.logError(
          "Nessuna scheda trovata: ",
          "ViewTemplatePlan.CambiaStatoAttivazioneScheda"
        );
      }
    } catch (error) {
      if (this.currentSpinnerId) {
        this.spinnerService.setError(this.currentSpinnerId);
      }
      this.errorHandlerService.logError(
        error,
        "ViewTemplatePlan.CambiaStatoAttivazioneScheda"
      );
    }
  }

  downloadSchedaExcel() {
    if (this.idScheda !== null && this.idScheda > 0) {
      const request: DownloadSchedaRequestModel = {
        idScheda: this.idScheda,
      };

      this.workoutService.esportaScheda(request).subscribe({
        next: (response: any) => {
          if (response instanceof Blob) {
            const blob = new Blob([response], {
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = "Scheda_Allenamento.xlsx"; // Nome del file
            link.click();
            window.URL.revokeObjectURL(url);
          }
        },
        error: (error: any) => {},
      });
    }
  }
}
