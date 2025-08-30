// list-template-plans.component.ts
import { Component, OnInit } from "@angular/core";
import { ErrorHandlerService } from "src/app/core/services/error-handler.service";
import { SchedaListaDTO } from "src/app/models/lista-template-schede/seriedto";
import { CommonModule } from "@angular/common";
import { SpinnerService } from "src/app/core/services/spinner.service";

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
    private spinnerService: SpinnerService
  ) {}

  ngOnInit(): void {
    try {
      this.getListaTemplateSchede();
    } catch (error) {
      this.errorHandlerService.handleError(error, "ListTemplatePlans.ngOnInit");
    }
  }

  async getListaTemplateSchede() {
    try {
      // Mostra lo spinner con risultato finale
      this.currentSpinnerId = this.spinnerService.showWithResult(
        "Recupero dati scheda",
        {
          successMessage: "Dati recuperati con successo",
          errorMessage: "Errore nel recupero dei dati",
          resultDuration: 500,
          minSpinnerDuration: 500
        }
      );

      this.fetchMockSchede()
        .then((response) => {
          this.listaSchede = response;
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
      this.errorHandlerService.handleError(error, "ListTemplatePlans.getListaTemplateSchede");
    }
  }

  private fetchMockSchede(): Promise<SchedaListaDTO[]> {
    const mockData: SchedaListaDTO[] = [
      {
        id: 1,
        nomeScheda: "Scheda Forza A",
        dataCreazione: new Date("2025-08-15T10:00:00Z"),
      },
      {
        id: 2,
        nomeScheda: "Scheda Ipertrofia B",
        dataCreazione: new Date("2025-08-20T11:30:00Z"),
      },
      {
        id: 3,
        nomeScheda: "Programma Cardio HIIT",
        dataCreazione: new Date("2025-08-28T09:00:00Z"),
      },
    ];

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simula successo o errore casuale per test
        if (Math.random() > 0.1) { // 90% successo
          resolve(mockData);
        } else {
          reject(new Error("Errore simulato di rete"));
        }
      }, 2000);
    });
  }
}