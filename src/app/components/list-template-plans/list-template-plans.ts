// list-template-plans.component.ts
import { Component, OnInit } from "@angular/core";
import { ErrorHandlerService } from "src/app/core/services/error-handler.service";
import { SchedaListaDTO } from "src/app/models/lista-template-schede/seriedto";
import { CommonModule } from "@angular/common";
import { SpinnerService } from "src/app/core/services/spinner.service";
import { WorkoutService } from "src/app/core/services/workout.service";
import { AuthService } from "src/app/core/services/auth.service";

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
    private authService: AuthService
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
        "Recupero dati scheda",
        {
          successMessage: "Dati recuperati con successo",
          errorMessage: "Errore nel recupero dei dati",
          resultDuration: 500,
          minSpinnerDuration: 500,
        }
      );

      // Attende il completamento del caricamento delle schede
      this.initializeListaSchede()
        .then(() => {
          // Imposta il successo dello spinner
          if (this.currentSpinnerId) {
            this.spinnerService.setSuccess(this.currentSpinnerId);
          }
        })
        .catch((error) => {
          // Gestisce gli errori
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

  private initializeListaSchede(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Chiamata al servizio per ottenere la lista delle schede
        // const idUser: string | undefined =
        //   this.authService.getCurrentUser()?.id;

        // if (idUser != null) {
        //   this.workoutService.getlistTemplatePlans(idUser).subscribe({
        //     next: (response) => {
        //       console.log("RESPONSE WORKOUT LIST: ", response);
        //       if (response.esito === "OK") {
        //         if (response.payload.workouts) {
        //           const workouts: SchedaListaDTO[] = response.payload.workouts;
        //           this.listaSchede = workouts;
        //           resolve(); // Risolve la promise in caso di successo
        //         } else {
        //           reject(new Error("Nessuna scheda trovata nella response"));
        //         }
        //       } else {
        //         reject(
        //           new Error(
        //             `Errore dal server: ${
        //               response.messaggio || "Errore sconosciuto"
        //             }`
        //           )
        //         );
        //       }
        //     },
        //     error: (error) => {
        //       reject(
        //         new Error(
        //           `Errore nella chiamata API: ${error.message || error}`
        //         )
        //       );
        //     },
        //   });
        // } else {
        //   reject(new Error("Nessun utente trovato"));
        // }
      } catch (error) {
        reject(new Error(`ListTemplatePlans.initializeListaSchede: ${error}`));
      }
    });
  }
}
