import { Component } from "@angular/core";
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

@Component({
  selector: "app-view-template-plan",
  imports: [
    TrainingMethodologyPipe,
    SeriesRepsPipe,
    ExerciseNamePipe,
    ExerciseIconPipe,
    ExerciseIconColorPipe,
  ],
  templateUrl: "./view-template-plan.html",
  styleUrl: "./view-template-plan.scss",
})
export class ViewTemplatePlan {
  public idScheda: number | null = 0;
  public scheda!: SchedaDTO;
  private currentSpinnerId: string | null = null;

  constructor(
    private errorHandlerService: ErrorHandlerService,
    private spinnerService: SpinnerService,
    private activatedRouter: ActivatedRoute,
    private router: Router,
    private workoutService: WorkoutService
  ) {
    try {
      this.idScheda = Number(this.activatedRouter.snapshot.paramMap.get("id"));
    } catch (error) {
      this.errorHandlerService.handleError(
        error,
        "ViewTemplatePlan.constructor"
      );
    }
  }

  ngOnInit(): void {
    try {
      this.getDatiScheda();
    } catch (error) {
      this.errorHandlerService.handleError(error, "ViewTemplatePlan.ngOnInit");
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

      if (this.idScheda !== null && this.idScheda > 0) {
        const request: GetDatiTemplateSchedaRequestModel = {
          workoutId: this.idScheda,
        };

        this.workoutService.getDatiTemplateScheda(request).subscribe({
          next: (response: GetDatiTemplateSchedaResponseModel) => {
            if (!response.errore?.error) {
              if (response.datiScheda) {
                this.scheda = response.datiScheda;
                if (this.currentSpinnerId) {
                  this.spinnerService.setSuccess(this.currentSpinnerId);
                }
              } else {
                if (this.currentSpinnerId) {
                  this.spinnerService.setError(this.currentSpinnerId);
                }
                this.errorHandlerService.handleError(
                  response.errore.error,
                  "ViewTemplatePlan.getListaTemplateSchede"
                );
              }
            } else {
              if (this.currentSpinnerId) {
                this.spinnerService.setError(this.currentSpinnerId);
              }
              this.errorHandlerService.handleError(
                response.errore.error,
                "ViewTemplatePlan.getListaTemplateSchede"
              );
            }
          },
          error: (error) => {
            if (this.currentSpinnerId) {
              this.spinnerService.setError(this.currentSpinnerId);
            }
            this.errorHandlerService.handleError(
              error,
              "ViewTemplatePlan.getListaTemplateSchede"
            );
          },
        });
      } else {
        if (this.currentSpinnerId) {
          this.spinnerService.setError(this.currentSpinnerId);
        }
        this.errorHandlerService.handleError(
          "Nessuna scheda trovata: ",
          "ViewTemplatePlan.getListaTemplateSchede"
        );
      }
    } catch (error) {
      if (this.currentSpinnerId) {
        this.spinnerService.setError(this.currentSpinnerId);
      }
      this.errorHandlerService.handleError(
        error,
        "ViewTemplatePlan.getListaTemplateSchede"
      );
    }
  }

  goBack() {
    try {
      this.router.navigate(["/le-mie-schede"]);
    } catch (error) {
      this.errorHandlerService.handleError(error, "ViewTemplatePlan.goBack");
    }
  }

  modificaScheda() {
    try {
      this.router.navigate(["/le-mie-schede/modifica-scheda/", this.idScheda], {
        state: { scheda: this.scheda },
      });
    } catch (error) {
      this.errorHandlerService.handleError(
        error,
        "ViewTemplatePlan.modificaScheda"
      );
    }
  }
}
