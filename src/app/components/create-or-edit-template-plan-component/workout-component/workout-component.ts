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
import { GenericModal } from "../../shared/generic-modal/generic-modal";
import { ModalService } from "src/app/core/services/modal.service";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { Subject, takeUntil } from "rxjs";
import { SchedaForm } from "../template-plan-form";
import gsap from "gsap";
import { LongPressDirective } from "../../shared/directives/long-press.directive";
import { FocusOverlayService } from "../../shared/focus-overlay/focus-overlay.service";
import { LoginComponent } from "../../login/login.component";
import { InfoComponent } from "../../info/info.component";
import { ReorderExerciseComponent } from "./reorder-exercise-component/reorder-exercise-component";

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

  @ViewChildren('exerciseCard', { read: ElementRef }) exerciseCardElements!: QueryList<ElementRef>;
  @ViewChild('exerciseDataContainer', { read: ElementRef }) exerciseDataContainer!: ElementRef;

  @Input() formAllenamento!: AllenamentoForm;
  @Input() formScheda!: SchedaForm;

  @Output() onDeleteWorkout = new EventEmitter<number>();
  @Output() onBackToList = new EventEmitter<void>();

  public ordinamentoControl!: FormControl<number | null>;
  public isCompactMode: boolean = false; // Stato globale per tutte le card

  private destroy$ = new Subject<void>();

  constructor(
    private errorHandlerService: ErrorHandlerService,
    private modalService: ModalService,
    private cdr: ChangeDetectorRef,
    public focusOverlayService: FocusOverlayService
  ) { }

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
      // 1. Inverti lo stato (questo fa partire l'animazione CSS nelle card)
      this.isCompactMode = !this.isCompactMode;

      // Forza il rinfresco della UI
      this.cdr.detectChanges();

      // 2. Avvia il timer sincronizzato con il CSS (0.3s = 300ms)
      // Aggiungiamo 50ms di "buffer" per sicurezza
      setTimeout(() => {
        this.handlePostAnimationLogic();
      }, 350);
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "WorkoutComponent.toggleCompactMode"
      );
    }
  }
  private handlePostAnimationLogic(): void {
    if (this.isCompactMode) {
      // Cattura la posizione del container exercise-data
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
          containerPosition: containerPosition
        },
        dismissOnBackdrop: false, // Disabilitiamo dismiss su backdrop, gestiamo manualmente
        onDismiss: () => {
          console.log("Overlay chiuso!");
          this.isCompactMode = false;
          this.cdr.detectChanges();
        },
      });

      // Registra callback per nascondere le card originali quando il posizionamento è completato
      controller.registerOnPositionedFn(() => {
        this.setOriginalCardsVisibility(false);
      });

      // Registra callback per ottenere la posizione aggiornata del container (dopo eventuale scroll)
      controller.registerGetContainerPositionFn(() => {
        const rect = this.exerciseDataContainer.nativeElement.getBoundingClientRect();
        return {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        };
      });

      // Registra callback per mostrare le card originali (durante animazione inversa)
      controller.registerOnReadyToShowFn(() => {
        this.setOriginalCardsVisibility(true);
      });

      // Registra callback per applicare il nuovo ordine degli esercizi
      controller.registerApplyNewOrderFn((orderedIdentifiers: number[]) => {
        this.formAllenamento.reorderExercisesByIdentifiers(orderedIdentifiers);
        this.cdr.detectChanges();
      });
    } else {
      // Logica da eseguire DOPO che si è espanso
    }
  }

  /**
   * Imposta la visibilità delle card originali usando autoAlpha per transizioni più fluide
   */
  private setOriginalCardsVisibility(visible: boolean): void {
    if (this.exerciseDataContainer) {
      const containerEl = this.exerciseDataContainer.nativeElement as HTMLElement;
      // Usando gsap.set con autoAlpha per controllare opacity + visibility
      gsap.set(containerEl, { autoAlpha: visible ? 1 : 0 });
    }
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
      this.errorHandlerService.logError(error, "WorkoutComponent.backToList");
    }
  }
}
