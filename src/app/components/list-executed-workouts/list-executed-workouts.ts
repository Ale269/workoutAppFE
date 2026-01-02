import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "src/app/core/services/auth.service";
import { ErrorHandlerService } from "src/app/core/services/error-handler.service";
import { SpinnerService } from "src/app/core/services/spinner.service";
import { WorkoutService } from "src/app/core/services/workout.service";
import { AllenamentoSvoltoListaDTO } from "src/app/models/lista-allenamenti-svolti/allenamentosvoltolistadto";
import {
  GetListaAllenamentiSvoltiRequestModel,
  GetListaAllenamentiSvoltiResponseModel,
} from "src/app/models/lista-allenamenti-svolti/get-lista-templates-schede";

@Component({
  selector: "app-list-executed-workouts",
  imports: [CommonModule],
  templateUrl: "./list-executed-workouts.html",
  styleUrl: "./list-executed-workouts.scss",
})
export class ListExecutedWorkouts {
  public listaAllenamentiSvolti: AllenamentoSvoltoListaDTO[] = [];
  public listaAllenamentiSvoltiView: allenamentoSvoltoListaView[] = [];

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
      this.getListaAllenamentiSvolti();
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "ListExecutedWorkouts.ngOnInit"
      );
    }
  }

  getListaAllenamentiSvolti() {
    try {
      // Mostra lo spinner di inizializzazione
      this.currentSpinnerId = this.spinnerService.showWithResult(
        "Recupero dati allenamenti",
        {
          successMessage: "Dati recuperati con successo",
          errorMessage: "Errore nel recupero dei dati",
          resultDuration: 250,
          minSpinnerDuration: 250,
        }
      );

      const user = this.authService.getCurrentUser();

      if (user) {
        const request: GetListaAllenamentiSvoltiRequestModel = {
          userId: user.userId,
        };

        this.workoutService.getListaAllenamentiSvolti(request).subscribe({
          next: (response: GetListaAllenamentiSvoltiResponseModel) => {
            if (!response.errore?.error) {
              if (response.listaAllenamentiDTO) {
                this.listaAllenamentiSvolti = response.listaAllenamentiDTO;
                this.listaAllenamentiSvoltiView =
                  this.listaAllenamentiSvolti.map((el) => {
                    let giorniArray: number[] = [];

                    for (
                      let i = 1;
                      i <= el.numeroTotaleAllenamentiScheda;
                      i++
                    ) {
                      giorniArray.push(i);
                    }

                    return {
                      allenamentoSvolto: el,
                      giorniArray: giorniArray,
                    };
                  });
                if (this.currentSpinnerId) {
                  this.spinnerService.setSuccess(this.currentSpinnerId);
                }
              } else {
                if (this.currentSpinnerId) {
                  this.spinnerService.setError(this.currentSpinnerId);
                }
                this.errorHandlerService.logError(
                  response.errore.error,
                  "ListExecutedWorkouts.getListaTemplateSchede"
                );
              }
            } else {
              if (this.currentSpinnerId) {
                this.spinnerService.setError(this.currentSpinnerId);
              }
              this.errorHandlerService.logError(
                response.errore.error,
                "ListExecutedWorkouts.getListaTemplateSchede"
              );
            }
          },
          error: (error) => {
            if (this.currentSpinnerId) {
              this.spinnerService.setError(this.currentSpinnerId);
            }
            this.errorHandlerService.logError(
              error,
              "ListExecutedWorkouts.getListaTemplateSchede"
            );
          },
        });
      } else {
        throw new Error(
          "ListExecutedWorkouts.addEsercizioForm: " + "nessun user trovato"
        );
      }
    } catch (error) {
      if (this.currentSpinnerId) {
        this.spinnerService.setError(this.currentSpinnerId);
      }
      this.errorHandlerService.logError(
        error,
        "ListExecutedWorkouts.getListaTemplateSchede"
      );
    }
  }

  visualizzaDatiAllenamento(idAllenamento: number) {
    try {
      this.router.navigate(["/allenamenti-svolti/visualizza-allenamento", idAllenamento]);
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "ListExecutedWorkouts.VisualizzaDatiScheda"
      );
    }
  }
}

export interface allenamentoSvoltoListaView {
  allenamentoSvolto: AllenamentoSvoltoListaDTO;
  giorniArray: number[];
}
