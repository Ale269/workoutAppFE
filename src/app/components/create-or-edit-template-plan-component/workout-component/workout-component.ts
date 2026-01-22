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
  ViewChildren,
  QueryList,
} from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import {
  MatLabel,
  MatError,
  MatFormField,
  MatInput,
} from "@angular/material/input";
import { AllenamentoForm } from "../workout-form";
import { ErrorHandlerService } from "src/app/core/services/error-handler.service";
import { ExerciseComponent } from "./exercise-component/exercise-component";
import { ModalService } from "src/app/core/services/modal.service";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { Subject, takeUntil } from "rxjs";
import { SchedaForm } from "../template-plan-form";
import gsap from "gsap";
import { LongPressDirective } from "../../shared/directives/long-press.directive";
import { FocusOverlayService } from "../../shared/focus-overlay/focus-overlay.service";
import { ReorderExerciseComponent } from "./reorder-exercise-component/reorder-exercise-component";
import {
  MultiOptionButton,
  multiOptionGroup,
  OptionSelectedEvent,
} from "../../shared/multi-option-button/multi-option-button";

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
    LongPressDirective,
    MultiOptionButton,
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

  @ViewChildren("exerciseCard", { read: ElementRef })
  exerciseCardElements!: QueryList<ElementRef>;
  @ViewChild("exerciseDataContainer", { read: ElementRef })
  exerciseDataContainer!: ElementRef;

  @Input() formAllenamento!: AllenamentoForm;
  @Input() formScheda!: SchedaForm;

  @Output() onDeleteWorkout = new EventEmitter<number>();
  @Output() onBackToList = new EventEmitter<void>();

  public ordinamentoControl!: FormControl<number | null>;
  public isCompactMode: boolean = false;

  public leftButtonOptionsGroup: multiOptionGroup[] = [
    {
      id: 1,
      label: "",
      options: [
        {
          optionId: 1,
          color: "#ff0000",
          description: "Elimina allenamento",
        },
      ],
    },
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private errorHandlerService: ErrorHandlerService,
    private modalService: ModalService,
    private cdr: ChangeDetectorRef,
    public focusOverlayService: FocusOverlayService,
  ) {}

  ngOnInit(): void {
    try {
      this.ordinamentoControl = this.formAllenamento.form.controls[
        "ordinamento"
      ] as FormControl<number | null>;

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

  toggleCompactMode(): void {
    try {
      this.isCompactMode = !this.isCompactMode;
      this.cdr.detectChanges();

      setTimeout(() => {
        this.handlePostAnimationLogic();
      }, 350);
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "WorkoutComponent.toggleCompactMode",
      );
    }
  }

  private handlePostAnimationLogic(): void {
    if (this.isCompactMode) {
      const containerEl = this.exerciseDataContainer.nativeElement;
      const containerRect = containerEl.getBoundingClientRect();
      const containerPosition = {
        top: containerRect.top,
        left: containerRect.left,
        width: containerRect.width,
        height: containerRect.height,
      };

      const controller = this.focusOverlayService.open({
        component: ReorderExerciseComponent,
        data: {
          exercises: this.formAllenamento.listaEserciziForm,
          containerPosition: containerPosition,
        },
        dismissOnBackdrop: false,
        onDismiss: () => {
          console.log("Overlay chiuso!");
          this.isCompactMode = false;
          this.cdr.detectChanges();
        },
      });

      controller.registerOnPositionedFn(() => {
        this.setOriginalCardsVisibility(false);
      });

      controller.registerGetContainerPositionFn(() => {
        const rect =
          this.exerciseDataContainer.nativeElement.getBoundingClientRect();
        return {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        };
      });

      controller.registerOnReadyToShowFn(() => {
        this.setOriginalCardsVisibility(true);
      });

      controller.registerApplyNewOrderFn((orderedIdentifiers: number[]) => {
        this.formAllenamento.reorderExercisesByIdentifiers(orderedIdentifiers);
        this.cdr.detectChanges();
      });
    }
  }

  private setOriginalCardsVisibility(visible: boolean): void {
    if (this.exerciseDataContainer) {
      const containerEl = this.exerciseDataContainer
        .nativeElement as HTMLElement;
      gsap.set(containerEl, { autoAlpha: visible ? 1 : 0 });
    }
  }

  ifEmptySetPlaceholder(event: any) {
    try {
      if (event.target.value.trim().length === 0) {
        this.formAllenamento.form.controls["nomeAllenamento"].setValue(
          "Giorno " + this.formAllenamento.form.controls["ordinamento"].value,
        );
      }
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "WorkoutComponent.ifEmptySetPlaceholder",
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
        newPosition,
      );

      if (!success) {
        console.error("Errore durante lo spostamento dell'allenamento");
      }

      this.cdr.detectChanges();
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "WorkoutComponent.changePosition",
      );
    }
  }

  deleteEexercise(identifier: number) {
    try {
      this.formAllenamento.deleteEsercizio(identifier);
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "WorkoutComponent.deleteEexercise",
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
        "WorkoutComponent.addNuovoEsercizio",
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
        "WorkoutComponent.openDeleteWorkout",
      );
    }
  }

  deleteWorkout() {
    try {
      this.onDeleteWorkout.emit(
        this.formAllenamento.form.controls["identifier"].value,
      );
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "WorkoutComponent.deleteWorkout",
      );
    }
  }

  backToList() {
    try {
      this.onBackToList.emit();
    } catch (error) {
      this.errorHandlerService.logError(error, "WorkoutComponent.backToList");
    }
  }

  onOptionSelected(option: OptionSelectedEvent) {
    switch (option.side) {
      case "left":
        switch (option.groupId) {
          case 1:
            switch (option.optionId) {
              case 1:
                this.openDeleteWorkout();
                break;
            }
            break;
        }
        break;
    }
  }
}