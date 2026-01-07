import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  input,
  Output,
  TemplateRef,
  ViewChild,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
} from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { MatIconButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import {
  MatLabel,
  MatError,
  MatFormField,
  MatInput,
  MatHint,
} from "@angular/material/input";
import { AllenamentoForm } from "../workout-form";
import { ErrorHandlerService } from "src/app/core/services/error-handler.service";
import { ExerciseComponent } from "./exercise-component/exercise-component";
import { GenericModal } from "../../shared/generic-modal/generic-modal";
import { ModalService } from "src/app/core/services/modal.service";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { Subject, takeUntil } from "rxjs";
import { SchedaForm } from "../template-plan-form";

@Component({
  selector: "app-workout-component",
  imports: [
    ReactiveFormsModule,
    MatLabel,
    MatError,
    MatFormField,
    MatInput,
    ExerciseComponent,
    MatFormFieldModule,
    MatSelectModule,
  ],
  templateUrl: "./workout-component.html",
  styleUrl: "./workout-component.scss",
})
export class WorkoutComponent implements OnInit, OnDestroy {
  @ViewChild("headerDeleteWorkout") headerDeleteWorkout!: TemplateRef<any>;
  @ViewChild("bodyDeleteWorkout") bodyDeleteWorkout!: TemplateRef<any>;
  @ViewChild("footerCloseDeleteWorkout")
  footerCloseDeleteWorkout!: TemplateRef<any>;
  @ViewChild("footerConfirmDeleteWorkout")
  footerConfirmDeleteWorkout!: TemplateRef<any>;
  
  @Input() formAllenamento!: AllenamentoForm;
  @Input() formScheda!: SchedaForm;

  @Output() onDeleteWorkout = new EventEmitter<number>();
  @Output() onBackToList = new EventEmitter<void>();

  public ordinamentoControl!: FormControl<number | null>;

  private destroy$ = new Subject<void>();

  constructor(
    private errorHandlerService: ErrorHandlerService,
    private modalService: ModalService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    try {
      this.ordinamentoControl = this.formAllenamento.form.controls[
        "ordinamento"
      ] as FormControl<number | null>;

      // Sottoscrizione al cambio di valore dell'ordinamento
      this.ordinamentoControl.valueChanges
        .pipe(takeUntil(this.destroy$))
        .subscribe((newPosition) => {
          if (newPosition !== null && newPosition !== undefined) {
            this.changePosition(newPosition);
          }
        });
    } catch (error) {
      this.errorHandlerService.logError(error, "WorkoutComponent.ngOnInit");
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ifEmptySetPlaceholder(event: any) {
    try {
      if (event.target.value.trim().length === 0) {
        this.formAllenamento.form.controls["nomeAllenamento"].setValue(
          "Giorno " + this.formAllenamento.form.controls["ordinamento"].value
        );
      }
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "WorkoutComponent.ifEmptySetPlaceholder"
      );
    }
  }

  private changePosition(newPosition: number): void {
    try {
      const currentWorkoutId =
        this.formAllenamento.form.controls["identifier"].value;

      if (!currentWorkoutId) {
        console.warn("Identifier dell'allenamento non trovato");
        return;
      }

      const success = this.formScheda.moveAllenamento(
        currentWorkoutId,
        newPosition
      );

      if (!success) {
        console.error("Errore durante lo spostamento dell'allenamento");
      }
      
      this.cdr.detectChanges();
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "WorkoutComponent.changePosition"
      );
    }
  }

  deleteEexercise(identifier: number) {
    try {
      this.formAllenamento.deleteEsercizio(identifier);
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "WorkoutComponent.deleteEexercise"
      );
    }
  }

  addNuovoEsercizio() {
    try {
      this.formAllenamento.addEsercizioForm(undefined);
      this.cdr.detectChanges();
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "WorkoutComponent.addNuovoEsercizio"
      );
    }
  }

  openDeleteWorkout() {
    try {
      this.modalService.open({
        warning: true,
        headerTemplate: this.headerDeleteWorkout,
        bodyTemplate: this.bodyDeleteWorkout,
        footerCloseTemplate: this.footerCloseDeleteWorkout,
        footerConfirmTemplate: this.footerConfirmDeleteWorkout,
        onConfirm: () => this.deleteWorkout(),
      });
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "WorkoutComponent.openDeleteWorkout"
      );
    }
  }

  deleteWorkout() {
    try {
      this.onDeleteWorkout.emit(
        this.formAllenamento.form.controls["identifier"].value
      );
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "WorkoutComponent.deleteWorkout"
      );
    }
  }

  backToList() {
    try {
      this.onBackToList.emit();
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "WorkoutComponent.backToList"
      );
    }
  }
}