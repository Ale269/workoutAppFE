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

  @ViewChild("headerAddWorkout") headerAddWorkout!: TemplateRef<any>;
  @ViewChild("bodyAddWorkout") bodyAddWorkout!: TemplateRef<any>;
  @ViewChild("footerCloseAddWorkout")
  footerCloseAddWorkout!: TemplateRef<any>;
  @ViewChild("footerConfirmAddWorkout")
  footerConfirmAddWorkout!: TemplateRef<any>;

  @Input() formAllenamento!: AllenamentoForm;
  @Input() formScheda!: SchedaForm;

  @Output() onDeleteWorkout = new EventEmitter<number>();
  @Output() onAddWorkout = new EventEmitter<string>();

  public newWorkoutNameControl!: FormControl<string>;

  public ordinamentoControl!: FormControl<number | null>;

  private destroy$ = new Subject<void>();

  constructor(
    private errorHandlerService: ErrorHandlerService,
    private modalService: ModalService
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
      this.errorHandlerService.handleError(error, "WorkoutComponent.ngOnInit");
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ifEmptySetPlaceholder(event: any) {
    try {
      if (event.target.value.trim().length === 0) {
        // Qui è vuoto o solo spazi
        this.formAllenamento.form.controls["nomeAllenamento"].setValue(
          "Giorno " + this.formAllenamento.form.controls["ordinamento"].value
        );
      }
    } catch (error) {
      this.errorHandlerService.handleError(
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

      // Usa il metodo moveAllenamento di SchedaForm per gestire lo spostamento
      // e il riallineamento automatico di tutti gli ordinamenti
      const success = this.formScheda.moveAllenamento(
        currentWorkoutId,
        newPosition
      );

      if (!success) {
        console.error("Errore durante lo spostamento dell'allenamento");
        // Opzionalmente, potresti ripristinare il valore precedente
        // o mostrare un messaggio di errore all'utente
      }
    } catch (error) {
      this.errorHandlerService.handleError(
        error,
        "WorkoutComponent.changePosition"
      );
    }
  }

  deleteEexercise(identifier: number) {
    try {
      this.formAllenamento.deleteEsercizio(identifier);
    } catch (error) {
      this.errorHandlerService.handleError(
        error,
        "WorkoutComponent.deleteEexercise"
      );
    }
  }
  addNuovoEsercizio() {
    try {
      this.formAllenamento.addEsercizioForm(undefined);
    } catch (error) {
      this.errorHandlerService.handleError(
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
      this.errorHandlerService.handleError(
        error,
        "WorkoutComponent.openDeleteWorkout"
      );
    }
  }

  openAddWorkoutMdal() {
    try {
      // Devo creare un form da bindare all'html dell'add e passarlo al modal
      this.initializeNewWorkoutControl();

      this.modalService.open({
        warning: false, // Non è un warning, è un'aggiunta
        headerTemplate: this.headerAddWorkout,
        bodyTemplate: this.bodyAddWorkout,
        footerCloseTemplate: this.footerCloseAddWorkout,
        footerConfirmTemplate: this.footerConfirmAddWorkout,
        onConfirm: () => this.addWorkout(),
      });
    } catch (error) {
      this.errorHandlerService.handleError(
        error,
        "ExerciseComponent.openDeleteModal"
      );
    }
  }

  private initializeNewWorkoutControl(): void {
    // Calcola il placeholder basato sulla posizione successiva
    const nextPosition =
      (this.formScheda?.listaAllenamentiForm?.length || 0) + 1;
    const placeholder = `Giorno ${nextPosition}`;

    // Crea il FormControl con il placeholder come valore iniziale
    this.newWorkoutNameControl = new FormControl<string>(placeholder, {
      nonNullable: true,
    });
  }

  addWorkout() {
    try {
      // Ottieni il valore dal FormControl
      let workoutName = this.newWorkoutNameControl.value?.trim();
      
      // Se è vuoto o uguale al placeholder, usa il placeholder
      const nextPosition = (this.formScheda?.listaAllenamentiForm?.length || 0) + 1;
      const placeholder = `Giorno ${nextPosition}`;
      
      if (!workoutName || workoutName === placeholder) {
        workoutName = placeholder;
      }

      // Emetti il nome dell'allenamento al componente padre
      this.onAddWorkout.emit(workoutName);
      
    } catch (error) {
      this.errorHandlerService.handleError(
        error,
        "WorkoutComponent.confirmAddWorkout"
      );
    }
  }

  deleteWorkout() {
    try {
      this.onDeleteWorkout.emit(
        this.formAllenamento.form.controls["identifier"].value
      );
    } catch (error) {
      this.errorHandlerService.handleError(
        error,
        "WorkoutComponent.deleteWorkout"
      );
    }
  }
}
