import { Component, TemplateRef, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ErrorHandlerService } from "src/app/core/services/error-handler.service";
import { ModalService } from "src/app/core/services/modal.service";
import { SpinnerService } from "src/app/core/services/spinner.service";
import { WorkoutService } from "src/app/core/services/workout.service";
import {
  GetDatiAllenamentoRequestModel,
  GetDatiAllenamentoResponseModel,
} from "src/app/models/view-modifica-allenamento-svolto/get-dati-allenamento";
import { ExerciseIconColorPipe } from "../../core/pipes/exercise-icon-color";
import { ExerciseIconPipe } from "../../core/pipes/exercise-icon";
import { ExerciseNamePipe } from "../../core/pipes/exercise-name";
import { AccordionComponent } from "../shared/accordion/accordion-element/accordion.component";
import { AccordionGroupComponent } from "../shared/accordion/accordion-group/accordion-group.component";
import { AccordionBodyComponent } from "../shared/accordion/accordion-element/accordion-body/accordion-body.component";
import { AccordionHeaderComponent } from "../shared/accordion/accordion-element/accordion-header/accordion-header.component";
import { TrainingMethodologyPipe } from "../../core/pipes/training-methodology";
import { SeriesRepsPipe } from "../../core/pipes/series-reps-pipe ";
import { AllenamentoDTO } from "src/app/models/view-modifica-allenamento-svolto/allenamentodto";
import { CommonModule } from "@angular/common";
import { createOrEdit } from "../create-or-edit-workout-execution/create-or-edit-workout-execution";
import { LoadingProgression } from "src/app/models/enums/loading-progression";

@Component({
  selector: "app-view-data-executed-workout",
  imports: [
    ExerciseIconColorPipe,
    ExerciseIconPipe,
    ExerciseNamePipe,
    AccordionComponent,
    AccordionGroupComponent,
    AccordionBodyComponent,
    AccordionHeaderComponent,
    TrainingMethodologyPipe,
    SeriesRepsPipe,
    CommonModule,
  ],
  templateUrl: "./view-data-executed-workout.html",
  styleUrl: "./view-data-executed-workout.scss",
})
export class ViewDataExecutedWorkout {
  @ViewChild("headerDeleteWorkout") headerDeleteWorkout!: TemplateRef<any>;
  @ViewChild("bodyDeleteWorkout") bodyDeleteWorkout!: TemplateRef<any>;
  @ViewChild("footerCloseDeleteWorkout")
  footerCloseDeleteWorkout!: TemplateRef<any>;
  @ViewChild("footerConfirmDeleteWorkout")
  footerConfirmDeleteWorkout!: TemplateRef<any>;

  public LoadingProgressionEnum = LoadingProgression;
  public loadingProgression: LoadingProgression = LoadingProgression.none;

  public idAllenamento: number | null = 0;
  public allenamento!: AllenamentoDTO;
  private currentSpinnerId: string | null = null;

  constructor(
    private errorHandlerService: ErrorHandlerService,
    private spinnerService: SpinnerService,
    private activatedRouter: ActivatedRoute,
    private router: Router,
    private workoutService: WorkoutService,
    private modalService: ModalService
  ) {
    try {
      this.idAllenamento = Number(
        this.activatedRouter.snapshot.paramMap.get("id")
      );
    } catch (error) {
      this.errorHandlerService.handleError(
        error,
        "ViewDataExecutedWorkout.constructor"
      );
    }
  }

  ngOnInit(): void {
    try {
      this.getDatiAllenamento();
    } catch (error) {
      this.errorHandlerService.handleError(
        error,
        "ViewDataExecutedWorkout.ngOnInit"
      );
    }
  }

  getDatiAllenamento() {
    try {
      // Mostra lo spinner di inizializzazione
      this.currentSpinnerId = this.spinnerService.showWithResult(
        "Recupero dati allenamento",
        {
          successMessage: "Dati recuperati con successo",
          errorMessage: "Errore nel recupero dei dati",
          resultDuration: 250,
          minSpinnerDuration: 250,
        }
      );

      this.loadingProgression = LoadingProgression.loading;

      if (this.idAllenamento !== null && this.idAllenamento > 0) {
        const request: GetDatiAllenamentoRequestModel = {
          idAllenamento: this.idAllenamento,
        };

        this.workoutService.getDatiAllenamento(request).subscribe({
          next: (response: GetDatiAllenamentoResponseModel) => {
            if (!response.errore?.error) {
              if (response.allenamentoCorrente) {
                this.allenamento = response.allenamentoCorrente;
                if (this.currentSpinnerId) {
                  this.spinnerService.setSuccess(this.currentSpinnerId);
                }
                this.loadingProgression = LoadingProgression.complete;
              } else {
                if (this.currentSpinnerId) {
                  this.spinnerService.setError(this.currentSpinnerId);
                }
                this.errorHandlerService.handleError(
                  response.errore.error,
                  "ViewDataExecutedWorkout.getDatiAllenamento"
                );
                this.loadingProgression = LoadingProgression.failed;
              }
            } else {
              if (this.currentSpinnerId) {
                this.spinnerService.setError(this.currentSpinnerId);
              }
              this.errorHandlerService.handleError(
                response.errore.error,
                "ViewDataExecutedWorkout.getDatiAllenamento"
              );
              this.loadingProgression = LoadingProgression.failed;
            }
          },
          error: (error) => {
            if (this.currentSpinnerId) {
              this.spinnerService.setError(this.currentSpinnerId);
            }
            this.errorHandlerService.handleError(
              error,
              "ViewDataExecutedWorkout.getDatiAllenamento"
            );
            this.loadingProgression = LoadingProgression.failed;
          },
        });
      } else {
        if (this.currentSpinnerId) {
          this.spinnerService.setError(this.currentSpinnerId);
        }
        this.errorHandlerService.handleError(
          "Nessuna scheda trovata: ",
          "ViewDataExecutedWorkout.getDatiAllenamento"
        );
        this.loadingProgression = LoadingProgression.failed;
      }
    } catch (error) {
      if (this.currentSpinnerId) {
        this.spinnerService.setError(this.currentSpinnerId);
      }
      this.errorHandlerService.handleError(
        error,
        "ViewTemplatePlan.getDatiAllenamento"
      );
      this.loadingProgression = LoadingProgression.failed;
    }
  }

  goBack() {
    try {
      this.router.navigate(["/allenamenti-svolti"]);
    } catch (error) {
      this.errorHandlerService.handleError(
        error,
        "ViewDataExecutedWorkout.goBack"
      );
    }
  }

  modificaAllenamento() {
    try {
      this.router.navigate(
        ["/allenamenti-svolti/modifica-allenamento/", this.idAllenamento],
        {
          state: {
            allenamentoDTO: this.allenamento,
            createOrEdit: createOrEdit.edit,
          },
        }
      );
    } catch (error) {
      this.errorHandlerService.handleError(
        error,
        "ViewDataExecutedWorkout.modificaScheda"
      );
    }
  }

  openDeleteScheda() {
    try {
      this.modalService.open({
        warning: true,
        headerTemplate: this.headerDeleteWorkout,
        bodyTemplate: this.bodyDeleteWorkout,
        footerCloseTemplate: this.footerCloseDeleteWorkout,
        footerConfirmTemplate: this.footerConfirmDeleteWorkout,
        onConfirm: () => this.eliminaScheda(),
      });
    } catch (error) {
      this.errorHandlerService.handleError(
        error,
        "ViewDataExecutedWorkout.modificaScheda"
      );
    }
  }

  eliminaScheda() {
    try {
      // Mostra lo spinner di inizializzazione
      // this.currentSpinnerId = this.spinnerService.showWithResult(
      //   "Elimino dati scheda",
      //   {
      //     successMessage: "Scheda eliminata con successo",
      //     errorMessage: "Errore nell'eliminare la scheda",
      //     resultDuration: 250,
      //     minSpinnerDuration: 250,
      //   }
      // );
      // if (this.idScheda !== null && this.idScheda > 0) {
      //   const request: DeleteDatiTemplateSchedaRequestModel = {
      //     workoutId: this.idScheda,
      //   };
      //   this.workoutService.deleteTemplateScheda(request).subscribe({
      //     next: (response: DeleteDatiTemplateSchedaResponseModel) => {
      //       if (!response.errore?.error) {
      //         if (this.currentSpinnerId) {
      //           this.spinnerService.setSuccess(this.currentSpinnerId);
      //         }
      //         this.goBack();
      //       } else {
      //         if (this.currentSpinnerId) {
      //           this.spinnerService.setError(this.currentSpinnerId);
      //         }
      //         this.errorHandlerService.handleError(
      //           response.errore.error,
      //           "ViewDataExecutedWorkout.modificaScheda"
      //         );
      //       }
      //     },
      //     error: (error) => {
      //       if (this.currentSpinnerId) {
      //         this.spinnerService.setError(this.currentSpinnerId);
      //       }
      //       this.errorHandlerService.handleError(
      //         error,
      //         "ViewDataExecutedWorkout.modificaScheda"
      //       );
      //     },
      //   });
      // } else {
      //   if (this.currentSpinnerId) {
      //     this.spinnerService.setError(this.currentSpinnerId);
      //   }
      //   this.errorHandlerService.handleError(
      //     "Nessuna scheda trovata: ",
      //     "ViewDataExecutedWorkout.modificaScheda"
      //   );
      // }
    } catch (error) {
      if (this.currentSpinnerId) {
        this.spinnerService.setError(this.currentSpinnerId);
      }
      this.errorHandlerService.handleError(
        error,
        "ViewDataExecutedWorkout.modificaScheda"
      );
    }
  }
}
