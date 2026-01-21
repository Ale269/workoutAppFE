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
    MatInputModule
  ],
  templateUrl: "./exercise-component.html",
  styleUrl: "./exercise-component.scss",
})
export class ExerciseComponent implements OnInit, OnDestroy {
  @Input() formAllenamento!: AllenamentoForm;
  @Input() formEsercizio!: EsercizioForm;
  @Input() isCompactMode: boolean = false; // Nuova proprietà per la modalità compatta

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
    private modalService: ModalService,
    private cdr: ChangeDetectorRef,
    private bottomSheetService: BottomSheetService,
    private exerciseService: ExerciseService 
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

  addSerie() {
    try {
      this.formEsercizio.addSerieForm();
      this.cdr.detectChanges();
    } catch (error) {
      this.errorHandlerService.logError(error, "ExerciseComponent.addSerie");
    }
  }

  duplicateLastSerie() {
    try {
      const seriesList = this.formEsercizio.listaSerieForm;

      if (seriesList.length === 0) {
        this.addSerie();
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
        this.cdr.detectChanges();
      }
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

}