import { Component, OnDestroy, OnInit } from "@angular/core";
import { ErrorHandlerService } from "src/app/core/services/error-handler.service";
import { SpinnerService } from "src/app/core/services/spinner.service";
import { CreateOrEditWorkoutExecutionService } from "./create-or-edit-workout-execution-service";
import { ReactiveFormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatTabsModule } from "@angular/material/tabs";
import { AllenamentoDTO } from "src/app/models/view-modifica-scheda/allenamentodto";
import { ExerciseComponent } from "../create-or-edit-template-plan-component/workout-component/exercise-component/exercise-component";
import {
  MultiOptionButton,
} from "../shared/multi-option-button/multi-option-button";
import { altriAllenamentiSelectDTO } from "src/app/models/esecuzione-allenamento/altri-allenamenti-select-dto";

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

  // Definisci le opzioni del pulsante
  public buttonOptions: altriAllenamentiSelectDTO[] = [];

  constructor(
    private errorHandlerService: ErrorHandlerService,
    private spinnerService: SpinnerService,
    public createOrEditWorkoutExecutionService: CreateOrEditWorkoutExecutionService
  ) {}

  ngOnInit(): void {
  try {
    // Mostra lo spinner di inizializzazione
    this.initSpinnerId = this.spinnerService.showWithResult(
      "Recupero dati allenamento",
      {
        successMessage: "Dati recuperati con successo",
        errorMessage: "Errore nel recupero dei dati",
        resultDuration: 500,
        minSpinnerDuration: 500,
      }
    );

    this.initializeWorkout();

    // Simula un caricamento asincrono
    setTimeout(() => {
      if (this.initSpinnerId) {
        this.spinnerService.setSuccess(this.initSpinnerId);
      }
    }, 1000);
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
    // Chiamata unificata che restituisce sia l'allenamento che le opzioni
    const response = this.createOrEditWorkoutExecutionService.InitializeScheda(1);
    
    // Popola le opzioni del pulsante
    this.buttonOptions = response.opzioniAltriAllenamenti;
    
  } catch (error) {
    if (this.initSpinnerId) {
      this.spinnerService.setError(
        this.initSpinnerId,
        "Errore durante l'inizializzazione"
      );
    }
    this.errorHandlerService.handleError(
      error,
      "CreateOrEditWorkoutExecution.initializeWorkout"
    );
  }
}
  getOpzioniCambioAllenamento() {
    try {
     
      // Simula l'inizializzazione (sostituisci con la tua logica asincrona)
      this.createOrEditWorkoutExecutionService.InitializeScheda(1);

      
    } catch (error) {
      if (this.initSpinnerId) {
        this.spinnerService.setError(
          this.initSpinnerId,
          "Errore durante l'inizializzazione"
        );
      }
      this.errorHandlerService.handleError(
        error,
        "CreateOrEditWorkoutExecution.getDatiAllenamento"
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
          resultDuration: 500,
          minSpinnerDuration: 500,
        }
      );

      // Simula l'inizializzazione (sostituisci con la tua logica asincrona)
      this.createOrEditWorkoutExecutionService.InitializeScheda(1);

      // Simula un caricamento asincrono
      setTimeout(() => {
        if (this.initSpinnerId) {
          this.spinnerService.setSuccess(this.initSpinnerId);
        }
      }, 1000);
    } catch (error) {
      if (this.initSpinnerId) {
        this.spinnerService.setError(
          this.initSpinnerId,
          "Errore durante l'inizializzazione"
        );
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

    switch (
      optionId
      // case "option1":
      //   this.handleOption1();
      //   break;
      // case "option2":
      //   this.handleOption2();
      //   break;
      // case "option3":
      //   this.handleOption3();
      //   break;
    ) {
    }
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

      let allenamentoDaSalvare: AllenamentoDTO =
        this.createOrEditWorkoutExecutionService.AllenamentoForm.getDatiAllenamentoDaSalvare();

      this.createOrEditWorkoutExecutionService
        .registraAllenamento(allenamentoDaSalvare)
        .then((response) => {
          if (this.saveSpinnerId) {
            this.spinnerService.setSuccess(this.saveSpinnerId);
          }
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
}
