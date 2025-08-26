import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
  OnDestroy,
} from "@angular/core";
import { EsercizioForm } from "../../exercise-form";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { GymExerciseSelectorComponent } from "src/app/components/shared/app-gym-exercise-selector/app-gym-exercise-selector";
import { ErrorHandlerService } from "src/app/core/services/error-handler.service";
import { SetComponent } from "./set-component/set-component";
import { getExerciseIconPathByExerciseId } from "src/app/components/enums/exercise-icons";
import { ModalService } from "src/app/core/services/modal.service";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { AllenamentoForm } from "../../workout-form";
import { Subject, takeUntil } from "rxjs";
import { TrainingMethodologySelectorComponent } from "src/app/components/shared/training-methodology-selector/training-methodology-selector";

@Component({
  selector: "app-exercise-component",
  imports: [
    ReactiveFormsModule,
    GymExerciseSelectorComponent,
    TrainingMethodologySelectorComponent,
    SetComponent,
    MatFormFieldModule,
    MatSelectModule,
  ],
  templateUrl: "./exercise-component.html",
  styleUrl: "./exercise-component.scss",
})
export class ExerciseComponent implements OnInit, OnDestroy {
  @Input() formAllenamento!: AllenamentoForm;
  @Input() formEsercizio!: EsercizioForm;

  @ViewChild("headerDeleteWorkout") headerDeleteWorkout!: TemplateRef<any>;
  @ViewChild("bodyDeleteWorkout") bodyDeleteWorkout!: TemplateRef<any>;
  @ViewChild("footerCloseDeleteWorkout")
  footerCloseDeleteWorkout!: TemplateRef<any>;
  @ViewChild("footerConfirmDeleteWorkout")
  footerConfirmDeleteWorkout!: TemplateRef<any>;

  @Output() onDeleteExercise = new EventEmitter<number>();

  public idMetodologiaControl!: FormControl<number | null>;
  public idTipoEsercizioControl!: FormControl<number | null>;
  public ordinamentoControl!: FormControl<number | null>;
  public exerciseIconPath!: string;

  private destroy$ = new Subject<void>();

  constructor(
    private errorHandlerService: ErrorHandlerService,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    try {
      this.idTipoEsercizioControl = this.formEsercizio.form.controls[
        "idTipoEsercizio"
      ] as FormControl<number | null>;

      this.idMetodologiaControl = this.formEsercizio.form.controls[
        "idMetodologia"
      ] as FormControl<number | null>;

      this.ordinamentoControl = this.formEsercizio.form.controls[
        "ordinamento"
      ] as FormControl<number | null>;

      // Inizializza l'icona basandosi sull'IdTipoEsercizio
      this.updateExerciseIcon();

      // Sottoscrizione al cambio di valore dell'ordinamento
      this.ordinamentoControl.valueChanges
        .pipe(takeUntil(this.destroy$))
        .subscribe((newPosition) => {
          if (newPosition !== null && newPosition !== undefined) {
            this.changePosition(newPosition);
          }
        });

      // Sottoscrizione al cambio del tipo di esercizio per aggiornare l'icona
      this.idTipoEsercizioControl.valueChanges
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.updateExerciseIcon();
        });

    } catch (error) {
      this.errorHandlerService.handleError(
        error,
        "ExerciseComponent.ngOnInit"
      );
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateExerciseIcon(): void {
    try {
      // Usa la nuova funzione che mappa IdTipoEsercizio -> Icona
      this.exerciseIconPath = getExerciseIconPathByExerciseId(
        this.idTipoEsercizioControl.value
      );
    } catch (error) {
      this.errorHandlerService.handleError(
        error,
        "ExerciseComponent.updateExerciseIcon"
      );
    }
  }

  openDeleteModal() {
    try {
      this.modalService.open({
        warning: true,
        headerTemplate: this.headerDeleteWorkout,
        bodyTemplate: this.bodyDeleteWorkout,
        footerCloseTemplate: this.footerCloseDeleteWorkout,
        footerConfirmTemplate: this.footerConfirmDeleteWorkout,
        onConfirm: () => this.deleteExercise(),
        onClose: () => console.log("Modal closed"),
      });
    } catch (error) {
      this.errorHandlerService.handleError(
        error,
        "ExerciseComponent.openDeleteModal"
      );
    }
  }

  private changePosition(newPosition: number): void {
    try {
      const currentExerciseId =
        this.formEsercizio.form.controls["identifier"].value;
      
      if (!currentExerciseId) {
        console.warn("Identifier dell'esercizio non trovato");
        return;
      }

      // Usa il metodo moveEsercizio di AllenamentoForm per gestire lo spostamento
      // e il riallineamento automatico di tutti gli ordinamenti
      const success = this.formAllenamento.moveEsercizio(currentExerciseId, newPosition);
      
      if (!success) {
        console.error("Errore durante lo spostamento dell'esercizio");
        // Opzionalmente, potresti ripristinare il valore precedente
        // o mostrare un messaggio di errore all'utente
      }

    } catch (error) {
      this.errorHandlerService.handleError(
        error,
        "ExerciseComponent.changePosition"
      );
    }
  }

  addSerie() {
    try {
      this.formEsercizio.addSerieForm();
    } catch (error) {
      this.errorHandlerService.handleError(
        error,
        "ExerciseComponent.addSerie"
      );
    }
  }

  deleteSerie(identifier: number) {
    try {
      this.formEsercizio.deleteSerie(identifier);
    } catch (error) {
      this.errorHandlerService.handleError(
        error,
        "ExerciseComponent.deleteSerie"
      );
    }
  }

  deleteExercise() {
    try {
      this.onDeleteExercise.emit(
        this.formEsercizio.form.controls["identifier"].value
      );
    } catch (error) {
      this.errorHandlerService.handleError(
        error,
        "ExerciseComponent.deleteExercise"
      );
    }
  }
}