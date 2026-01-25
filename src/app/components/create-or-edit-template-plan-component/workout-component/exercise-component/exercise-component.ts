import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
  OnDestroy,
  ChangeDetectorRef,
  ElementRef,
} from "@angular/core";
import { EsercizioForm } from "../../exercise-form";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { GymExerciseSelectorComponent } from "src/app/components/shared/app-gym-exercise-selector/app-gym-exercise-selector";
import { ErrorHandlerService } from "src/app/core/services/error-handler.service";
import { SetComponent } from "./set-component/set-component";
import { ModalService } from "src/app/core/services/modal.service";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { AllenamentoForm } from "../../workout-form";
import { Subject, takeUntil } from "rxjs";
import { TrainingMethodologySelectorComponent } from "src/app/components/shared/training-methodology-selector/training-methodology-selector";
import { ExerciseIconColorPipe } from "../../../../core/pipes/exercise-icon-color";
import { BottomSheetService } from "src/app/components/shared/bottom-sheet/bottom-sheet-service";
import { ExerciseService } from "src/app/core/services/exercise.service";
import { MatInputModule } from "@angular/material/input";
import { DatePipe } from "@angular/common";
import { WorkoutService } from "src/app/core/services/workout.service";
import { AuthService } from "src/app/core/services/auth.service";
import { LastTrainingExerciseData, LastTrainingSerieData } from "src/app/models/history/last-training-exercise";

@Component({
  selector: "app-exercise-component",
  imports: [
    ReactiveFormsModule,
    GymExerciseSelectorComponent,
    TrainingMethodologySelectorComponent,
    SetComponent,
    MatFormFieldModule,
    MatSelectModule,
    ExerciseIconColorPipe,
    MatFormFieldModule,
    MatInputModule,
    DatePipe
  ],
  templateUrl: "./exercise-component.html",
  styleUrl: "./exercise-component.scss",
})
export class ExerciseComponent implements OnInit, OnDestroy {
  @Input() formAllenamento!: AllenamentoForm;
  @Input() formEsercizio!: EsercizioForm;
  @Input() isCompactMode: boolean = false;
  @Input() historyTrainingId?: number;

  @ViewChild("headerDeleteWorkout") headerDeleteWorkout!: TemplateRef<any>;
  @ViewChild("bodyDeleteWorkout") bodyDeleteWorkout!: TemplateRef<any>;
  @ViewChild("footerCloseDeleteWorkout")
  footerCloseDeleteWorkout!: TemplateRef<any>;
  @ViewChild("footerConfirmDeleteWorkout")
  footerConfirmDeleteWorkout!: TemplateRef<any>;

  @ViewChild("headerHistoryTemplate") headerHistoryTemplate!: TemplateRef<any>;
  @ViewChild("bodyHistoryTemplate") bodyHistoryTemplate!: TemplateRef<any>;
  @ViewChild("footerCloseHistoryTemplate")
  footerCloseHistoryTemplate!: TemplateRef<any>;

  @Output() onDeleteExercise = new EventEmitter<number>();

  // Stato per la cronologia dell'ultimo allenamento
  public lastTrainingData: LastTrainingExerciseData | null = null;
  public lastTrainingLoading: boolean = false;
  public lastTrainingError: boolean = false;

  public idMetodologiaControl!: FormControl<number | null>;
  public idTipoEsercizioControl!: FormControl<number | null>;
  public ordinamentoControl!: FormControl<number | null>;
  public exerciseIconPath!: string;

  private destroy$ = new Subject<void>();

  constructor(
    private errorHandlerService: ErrorHandlerService,
    private modalService: ModalService,
    private cdr: ChangeDetectorRef,
    private bottomSheetService: BottomSheetService,
    private exerciseService: ExerciseService,
    private elementRef: ElementRef,
    private workoutService: WorkoutService,
    private authService: AuthService
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

      this.updateExerciseIcon();

      this.ordinamentoControl.valueChanges
        .pipe(takeUntil(this.destroy$))
        .subscribe((newPosition) => {
          if (newPosition !== null && newPosition !== undefined) {
            this.changePosition(newPosition);
          }
        });

      this.idTipoEsercizioControl.valueChanges
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.updateExerciseIcon();
        });
    } catch (error) {
      this.errorHandlerService.logError(error, "ExerciseComponent.ngOnInit");
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateExerciseIcon(): void {
    try {
      this.exerciseIconPath = this.exerciseService.getExerciseIconPathByExerciseId(
        this.idTipoEsercizioControl.value
      );
    } catch (error) {
      this.errorHandlerService.logError(
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
      this.errorHandlerService.logError(
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

      const success = this.formAllenamento.moveEsercizio(
        currentExerciseId,
        newPosition
      );

      if (!success) {
        console.error("Errore durante lo spostamento dell'esercizio");
      }

      this.cdr.detectChanges();
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "ExerciseComponent.changePosition"
      );
    }
  }

  /**
   * Salva l'altezza della pagina prima di aggiungere contenuto,
   * poi scrolla per mantenere i pulsanti nella stessa posizione visiva
   */
  private async maintainButtonPosition(callback: () => void): Promise<void> {
    try {
      // Salva l'altezza corrente della pagina
      const heightBefore = document.documentElement.scrollHeight;
      
      // Esegui l'operazione (aggiunta serie)
      callback();
      
      // Forza il rilevamento dei cambiamenti
      this.cdr.detectChanges();
      
      // Aspetta che il DOM sia aggiornato
      await new Promise(resolve => setTimeout(resolve, 0));
      
      // Calcola la differenza di altezza
      const heightAfter = document.documentElement.scrollHeight;
      const heightDifference = heightAfter - heightBefore;
      
      // Scrolla della differenza se c'è stato un aumento di altezza
      if (heightDifference > 0) {
        window.scrollBy({
          top: heightDifference,
          behavior: 'smooth'
        });
      }
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "ExerciseComponent.maintainButtonPosition"
      );
    }
  }

  async addSerie() {
    try {
      await this.maintainButtonPosition(() => {
        this.formEsercizio.addSerieForm();
      });
    } catch (error) {
      this.errorHandlerService.logError(error, "ExerciseComponent.addSerie");
    }
  }

  async duplicateLastSerie() {
    try {
      await this.maintainButtonPosition(() => {
        const seriesList = this.formEsercizio.listaSerieForm;

        if (seriesList.length === 0) {
          this.formEsercizio.addSerieForm();
        } else {
          const lastSerie = seriesList[seriesList.length - 1];
          const serieData = lastSerie.getDatiSerieDaSalvare();

          const newSerieData = {
            ...serieData,
            id: 0,
            idTemplate: 0,
            ordinamento: 0,
          };

          this.formEsercizio.addSerieForm(newSerieData);
        }
      });
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "ExerciseComponent.duplicateLastSerie"
      );
    }
  }

  deleteSerie(identifier: number) {
    try {
      this.formEsercizio.deleteSerie(identifier);
      this.cdr.detectChanges();
    } catch (error) {
      this.errorHandlerService.logError(
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
      this.errorHandlerService.logError(
        error,
        "ExerciseComponent.deleteExercise"
      );
    }
  }

  openLastTrainingHistory() {
    try {
      const exerciseId = this.idTipoEsercizioControl.value;
      const user = this.authService.getCurrentUser();

      if (!exerciseId || !user) {
        return;
      }

      // Reset dello stato
      this.lastTrainingData = null;
      this.lastTrainingLoading = true;
      this.lastTrainingError = false;

      // Apro il modal subito per mostrare lo stato di loading
      this.modalService.open({
        warning: false,
        headerTemplate: this.headerHistoryTemplate,
        bodyTemplate: this.bodyHistoryTemplate,
        footerCloseTemplate: this.footerCloseHistoryTemplate,
      });

      // Passo l'ID dell'history training corrente (se disponibile) per escluderlo dai risultati
      this.workoutService
        .getLastTrainingExercise(user.userId, exerciseId, this.historyTrainingId)
        .subscribe({
          next: (response) => {
            this.lastTrainingLoading = false;
            if (response.esercizio) {
              this.lastTrainingData = response.esercizio;
            } else {
              this.lastTrainingError = true;
            }
            this.cdr.detectChanges();
          },
          error: (error) => {
            this.lastTrainingLoading = false;
            this.lastTrainingError = true;
            this.cdr.detectChanges();
            this.errorHandlerService.logError(
              error,
              "ExerciseComponent.openLastTrainingHistory"
            );
          },
        });
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "ExerciseComponent.openLastTrainingHistory"
      );
    }
  }
}