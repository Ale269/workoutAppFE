import { Component, OnDestroy, OnInit } from '@angular/core';
import { ErrorHandlerService } from 'src/app/core/services/error-handler.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { CreateOrEditWorkoutExecutionService } from './create-or-edit-workout-execution-service';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { AllenamentoDTO } from 'src/app/models/modifica-scheda/allenamentodto';
import { AccordionBodyComponent } from '../shared/accordion/accordion-element/accordion-body/accordion-body.component';
import { AccordionHeaderComponent } from '../shared/accordion/accordion-element/accordion-header/accordion-header.component';
import { AccordionComponent } from '../shared/accordion/accordion-element/accordion.component';
import { AccordionGroupComponent } from '../shared/accordion/accordion-group/accordion-group.component';
import { ExerciseComponent } from '../create-or-edit-template-plan-component/workout-component/exercise-component/exercise-component';


@Component({
  selector: 'app-create-or-edit-workout-execution',
  imports: [ReactiveFormsModule,
    MatFormFieldModule,
    MatTabsModule,
    // AccordionBodyComponent,
    // AccordionHeaderComponent,
    // AccordionComponent,
    // AccordionGroupComponent,
    ExerciseComponent
  ],
  templateUrl: './create-or-edit-workout-execution.html',
  styleUrl: './create-or-edit-workout-execution.scss'
})
export class CreateOrEditWorkoutExecution implements OnInit, OnDestroy {

  private initSpinnerId: string | null = null;
  private saveSpinnerId: string | null = null;

  public accordionOpenKeys: string[] = [];


  constructor(private errorHandlerService: ErrorHandlerService, private spinnerService: SpinnerService, public createOrEditWorkoutExecutionService: CreateOrEditWorkoutExecutionService
  ) {
  }

  ngOnInit(): void {
    try {
      // Mostra lo spinner di inizializzazione
      this.initSpinnerId = this.spinnerService.showWithResult(
        "Recupero dati allenamento",
        {
          successMessage: "Dati recuperati con successo",
          errorMessage: "Errore nel recupero dei dati",
          resultDuration: 500,
          minSpinnerDuration: 500
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
        "CreateOrEditWorkoutExecution.ngOnInit"
      );
    }
  }

  // onKeysChange(keys: string[]): void {
  //   try {
  //     this.accordionOpenKeys = keys;
  //   } catch (error) {
  //     this.errorHandlerService.handleError(
  //       error,
  //       "CreateOrEditWorkoutExecution.onKeysChange"
  //     );
  //   }
  // }

  ngOnDestroy(): void {
    // Chiudi eventuali spinner attivi
    if (this.initSpinnerId) {
      this.spinnerService.hide(this.initSpinnerId);
    }
    if (this.saveSpinnerId) {
      this.spinnerService.hide(this.saveSpinnerId);
    }
  }

  // toggleAccordion(key: string): void {
  //   try {
  //     const index = this.accordionOpenKeys.indexOf(key);

  //     if (index > -1) {
  //       // Se è aperto, chiudilo
  //       this.accordionOpenKeys.splice(index, 1);
  //     } else {
  //       // Se è chiuso, aprilo
  //       this.accordionOpenKeys.push(key);
  //     }

  //   } catch (error) {
  //     this.errorHandlerService.handleError(
  //       error,
  //       "CreateOrEditWorkoutExecution.toggleAccordion"
  //     );
  //   }
  // }

  // // Metodo per verificare se un accordion è aperto
  // isAccordionOpen(key: string): boolean {
  //   return this.accordionOpenKeys.includes(key);
  // }

  deleteEexercise(identifier: number) {
    try {
      this.createOrEditWorkoutExecutionService.AllenamentoForm.deleteEsercizio(identifier);
    } catch (error) {
      this.errorHandlerService.handleError(
        error,
        "CreateOrEditWorkoutExecution.deleteEexercise"
      );
    }
  }
  addNuovoEsercizio() {
    try {
      this.createOrEditWorkoutExecutionService.AllenamentoForm.addEsercizioForm(undefined);
    } catch (error) {
      this.errorHandlerService.handleError(
        error,
        "CreateOrEditWorkoutExecution.addNuovoEsercizio"
      );
    }
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
          minSpinnerDuration: 500
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
      this.errorHandlerService.handleError(error, "WorkoutComponent.registraAllenamento");
    }
  }
}
