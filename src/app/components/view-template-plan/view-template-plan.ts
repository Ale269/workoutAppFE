import { Component } from "@angular/core";
import { ErrorHandlerService } from "src/app/core/services/error-handler.service";
import { SpinnerService } from "src/app/core/services/spinner.service";
import { SchedaDTO } from "src/app/models/modifica-scheda/schedadto";

@Component({
  selector: "app-view-template-plan",
  imports: [],
  templateUrl: "./view-template-plan.html",
  styleUrl: "./view-template-plan.scss",
})
export class ViewTemplatePlan {
  public scheda!: SchedaDTO;
  private currentSpinnerId: string | null = null;

  constructor(
    private errorHandlerService: ErrorHandlerService,
    private spinnerService: SpinnerService
  ) {}

  ngOnInit(): void {
    try {
      this.getDatiScheda();
    } catch (error) {
      this.errorHandlerService.handleError(error, "ListTemplatePlans.ngOnInit");
    }
  }

  async getDatiScheda() {
    try {
      // Mostra lo spinner con risultato finale
      this.currentSpinnerId = this.spinnerService.showWithResult(
        "Recupero dati scheda",
        {
          successMessage: "Dati recuperati con successo",
          errorMessage: "Errore nel recupero dei dati",
          resultDuration: 500,
          minSpinnerDuration: 500,
        }
      );

      this.getSchedaById(1)
        .then((response) => {
          this.scheda = response;
          if (this.currentSpinnerId) {
            this.spinnerService.setSuccess(this.currentSpinnerId);
          }
        })
        .catch((error) => {
          if (this.currentSpinnerId) {
            this.spinnerService.setError(
              this.currentSpinnerId,
              "Errore durante il caricamento delle schede"
            );
          }
          this.errorHandlerService.handleError(
            error,
            "ListTemplatePlans.getListaTemplateSchede"
          );
        });
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

  private getSchedaById(id: number): Promise<SchedaDTO> {
    // Dati mock per simulare risposta del server
    const mockSchedaDTO: SchedaDTO = {
      id: id,
      nomeScheda: "Scheda Push/Pull/Legs",
      listaAllenamenti: [
        {
          id: 1,
          nomeAllenamento: "Push Day",
          ordinamento: 1,
          listaEsercizi: [
            {
              id: 1,
              idMetodologia: 1,
              idTipoEsercizio: 1,
              idIconaEsercizio: 0,
              ordinamento: 1,
              listaSerie: [
                {
                  id: 1,
                  ripetizioni: 8,
                  carico: 80,
                  ordinamento: 1,
                },
                {
                  id: 2,
                  ripetizioni: 8,
                  carico: 80,
                  ordinamento: 2,
                },
                {
                  id: 3,
                  ripetizioni: 6,
                  carico: 85,
                  ordinamento: 3,
                },
              ],
            },
            {
              id: 2,
              idMetodologia: 1,
              idTipoEsercizio: 2,
              idIconaEsercizio: 2,
              ordinamento: 2,
              listaSerie: [
                {
                  id: 4,
                  ripetizioni: 10,
                  carico: 50,
                  ordinamento: 1,
                },
                {
                  id: 5,
                  ripetizioni: 8,
                  carico: 55,
                  ordinamento: 2,
                },
              ],
            },
          ],
        },
        {
          id: 2,
          nomeAllenamento: "Pull Day",
          ordinamento: 2,
          listaEsercizi: [
            {
              id: 3,
              idMetodologia: 1,
              idTipoEsercizio: 3,
              idIconaEsercizio: 1,
              ordinamento: 1,
              listaSerie: [
                {
                  id: 6,
                  ripetizioni: 5,
                  carico: 120,
                  ordinamento: 1,
                },
                {
                  id: 7,
                  ripetizioni: 5,
                  carico: 125,
                  ordinamento: 2,
                },
              ],
            },
          ],
        },
      ],
    };

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simula successo o errore casuale per test
        if (Math.random() > 0.1) {
          // 90% successo
          resolve(mockSchedaDTO);
        } else {
          reject(new Error("Errore simulato di rete"));
        }
      }, 2000);
    });
  }
}
