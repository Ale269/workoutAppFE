// list-template-plans.component.ts
import { Component, OnInit } from "@angular/core";
import { ErrorHandlerService } from "src/app/core/services/error-handler.service";
import { SchedaListaDTO } from "src/app/models/lista-template-schede/seriedto";
import { CommonModule } from "@angular/common";
import { SpinnerService } from "src/app/core/services/spinner.service";
import { WorkoutService } from "src/app/core/services/workout.service";
import { AuthService } from "src/app/core/services/auth.service";
import {
  GetListaTemplatesSchedaRequestModel,
  GetListaTemplatesSchedaResponseModel,
} from "src/app/models/lista-template-schede/get-lista-templates-schede";
import { Router } from "@angular/router";

@Component({
  selector: "app-list-template-plans",
  imports: [CommonModule],
  templateUrl: "./list-template-plans.html",
  styleUrl: "./list-template-plans.scss",
})
export class ListTemplatePlans implements OnInit {
  public listaSchede: SchedaListaDTO[] = [];
  private currentSpinnerId: string | null = null;

  constructor(
    private errorHandlerService: ErrorHandlerService,
    private spinnerService: SpinnerService,
    private workoutService: WorkoutService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    try {
      this.getListaTemplateSchede();
    } catch (error) {
      this.errorHandlerService.handleError(error, "ListTemplatePlans.ngOnInit");
    }
  }

  getListaTemplateSchede() {
    try {
      // Mostra lo spinner di inizializzazione
      this.currentSpinnerId = this.spinnerService.showWithResult(
        "Recupero dati schede",
        {
          successMessage: "Dati recuperati con successo",
          errorMessage: "Errore nel recupero dei dati",
          resultDuration: 250,
          minSpinnerDuration: 250,
        }
      );

      const user = this.authService.getCurrentUser();

      if (user) {
        const request: GetListaTemplatesSchedaRequestModel = {
          userId: user.usedId,
        };

        this.workoutService.getListaTemplatesScheda(request).subscribe({
          next: (response: GetListaTemplatesSchedaResponseModel) => {
            if (!response.errore?.error) {
              if (response.listaSchedeDTO) {
                this.listaSchede = response.listaSchedeDTO;
                if (this.currentSpinnerId) {
                  this.spinnerService.setSuccess(this.currentSpinnerId);
                }
              } else {
                if (this.currentSpinnerId) {
                  this.spinnerService.setError(this.currentSpinnerId);
                }
                this.errorHandlerService.handleError(
                  response.errore.error,
                  "ListTemplatePlans.getListaTemplateSchede"
                );
              }
            } else {
              if (this.currentSpinnerId) {
                this.spinnerService.setError(this.currentSpinnerId);
              }
              this.errorHandlerService.handleError(
                response.errore.error,
                "ListTemplatePlans.getListaTemplateSchede"
              );
            }
          },
          error: (error) => {
            if (this.currentSpinnerId) {
              this.spinnerService.setError(this.currentSpinnerId);
            }
            this.errorHandlerService.handleError(
              error,
              "ListTemplatePlans.getListaTemplateSchede"
            );
          },
        });
      } else {
        throw new Error(
          "ListTemplatePlans.addEsercizioForm: " + "nessun user trovato"
        );
      }
    } catch (error) {
      if (this.currentSpinnerId) {
        this.spinnerService.setError(this.currentSpinnerId);
      }
      this.errorHandlerService.handleError(
        error,
        "ListTemplatePlans.getListaTemplateSchede"
      );
    }
  }

  visualizzaDatiScheda(idScheda: number) {
    try {
      this.router.navigate(["/le-mie-schede/visualizza-scheda", idScheda]);
    } catch (error) {
      this.errorHandlerService.handleError(
        error,
        "ListTemplatePlans.VisualizzaDatiScheda"
      );
    }
  }

  createNewScheda() {
    try {
      this.router.navigate(["/le-mie-schede/modifica-scheda" ]);
    } catch (error) {
      this.errorHandlerService.handleError(
        error,
        "ListTemplatePlans.VisualizzaDatiScheda"
      );
    }
  }
}
