import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  input,
  Output,
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
import {
  AllenamentoForm,
  AllenamentoUnit,
  ReorderUnitRef,
} from "../workout-form";
import { ErrorHandlerService } from "src/app/core/services/error-handler.service";
import { ExerciseComponent } from "./exercise-component/exercise-component";
import { ExerciseGroupComponent } from "./exercise-group-component/exercise-group-component";
import { ConfirmPopupService } from "src/app/core/services/confirm-popup.service";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { Subject, takeUntil } from "rxjs";
import { SchedaForm } from "../template-plan-form";
import gsap from "gsap";
import { FocusOverlayService } from "../../shared/focus-overlay/focus-overlay.service";
import { ReorderUnitsComponent } from "./reorder-units-component/reorder-units-component";
import {
  MultiOptionButton,
  multiOptionGroup,
  OptionSelectedEvent,
} from "../../shared/multi-option-button/multi-option-button";
import {
  PopupOptionButton,
  popupOption,
} from "../../shared/popup-option-button/popup-option-button";
import { MatIcon, MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";
import { HapticService } from "src/app/core/services/haptic.service";
import { HapticSwitchDirective } from "src/app/components/shared/directives/haptic-switch.directive";
import { BottomMenuService } from "src/app/core/services/bottom-menu.service";

@Component({
  selector: "app-workout-component",
  imports: [
    ReactiveFormsModule,
    MatLabel,
    MatError,
    MatFormField,
    MatInput,
    ExerciseComponent,
    ExerciseGroupComponent,
    MatFormFieldModule,
    MatSelectModule,
    MultiOptionButton,
    PopupOptionButton,
    MatIcon,
    HapticSwitchDirective
  ],
  templateUrl: "./workout-component.html",
  styleUrl: "./workout-component.scss",
})
export class WorkoutComponent implements OnInit, OnDestroy {
  @ViewChildren("exerciseCard", { read: ElementRef })
  exerciseCardElements!: QueryList<ElementRef>;
  @ViewChild("exerciseDataContainer", { read: ElementRef })
  exerciseDataContainer!: ElementRef;
  @ViewChild("deleteWorkoutAnchor", { read: ElementRef })
  deleteWorkoutAnchor!: ElementRef<HTMLElement>;

  @Input() formAllenamento!: AllenamentoForm;
  @Input() formScheda!: SchedaForm;

  @Output() onDeleteWorkout = new EventEmitter<number>();
  @Output() onBackToList = new EventEmitter<void>();

  public ordinamentoControl!: FormControl<number | null>;
  public isCompactMode: boolean = false;

  // Opzioni del popup "Aggiungi" (esercizio / superset / circuito)
  public addOptions: popupOption[] = [
    { optionId: 1, description: "Aggiungi esercizio" },
    { optionId: 2, description: "Aggiungi superset", color: "#ffb300" },
    { optionId: 3, description: "Aggiungi circuito", color: "#3b82f6" },
  ];

  public leftButtonOptionsGroup: multiOptionGroup[] = [
    {
      id: 1,
      label: "",
      options: [
        {
          optionId: 1,
          color: "#ff6b6b",
          description: "Elimina allenamento",
        },
      ],
    },
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private errorHandlerService: ErrorHandlerService,
    private confirmPopupService: ConfirmPopupService,
    private cdr: ChangeDetectorRef,
    public focusOverlayService: FocusOverlayService,
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer,
    private hapticService: HapticService,
    private elementRef: ElementRef,
    private bottomMenuService: BottomMenuService,
  ) {
    iconRegistry.addSvgIcon(
      "google-add",
      sanitizer.bypassSecurityTrustResourceUrl(
        "assets/recollect/svg/google-add.svg",
      ),
    );
  }

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
      this.hapticService.trigger('medium');
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
        component: ReorderUnitsComponent,
        data: {
          units: this.formAllenamento.units,
          containerPosition: containerPosition,
        },
        dismissOnBackdrop: false,
        onDismiss: () => {
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

      controller.registerApplyNewOrderFn<ReorderUnitRef>((orderedUnits) => {
        this.formAllenamento.reorderUnits(orderedUnits);
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

  async addNuovoEsercizio() {
    try {
      this.hapticService.trigger('medium');
      await this.maintainButtonPosition(() => {
        this.formAllenamento.addEsercizioForm(undefined);
      });
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "WorkoutComponent.addNuovoEsercizio",
      );
    }
  }

  /**
   * Gestisce la selezione dal popup "Aggiungi"
   */
  async onAddOptionSelected(optionId: number) {
    try {
      this.hapticService.trigger('medium');
      await this.maintainButtonPosition(() => {
        switch (optionId) {
          case 1:
            this.formAllenamento.addEsercizioForm(undefined);
            break;
          case 2:
            this.formAllenamento.addGruppoForm("SUPERSET");
            break;
          case 3:
            this.formAllenamento.addGruppoForm("CIRCUIT");
            break;
        }
      });
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "WorkoutComponent.onAddOptionSelected",
      );
    }
  }

  /**
   * Aggiunge un nuovo esercizio in coda ai membri del gruppo indicato
   */
  async addEsercizioToGruppo(groupIdentifier: number) {
    try {
      await this.maintainButtonPosition(() => {
        this.formAllenamento.addEsercizioToGruppo(groupIdentifier);
      });
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "WorkoutComponent.addEsercizioToGruppo",
      );
    }
  }

  trackUnit(unit: AllenamentoUnit): string {
    return unit.kind === "esercizio"
      ? "e" + unit.esercizio.exerciseIdentifier
      : "g" + unit.gruppo.identifier;
  }

  private async maintainButtonPosition(callback: () => void): Promise<void> {
    try {
      // .page-scroller è ora DENTRO il template di questo componente (non più
      // un antenato: prima viveva nella pagina genitore, l'ho spostato qui
      // per tenere la barra di pulsanti floating fuori dal contenitore che
      // scrolla, altrimenti su iOS ricadeva nella sua scroll view). closest()
      // cerca solo tra host e antenati, quindi con la nuova struttura
      // restituiva sempre null: querySelector cerca invece tra i discendenti.
      const scroller = this.elementRef.nativeElement.querySelector('.page-scroller') as HTMLElement | null;
      if (!scroller) return;

      const heightBefore = scroller.scrollHeight;

      callback();

      this.cdr.detectChanges();

      await new Promise((resolve) => setTimeout(resolve, 0));

      const heightAfter = scroller.scrollHeight;
      const heightDifference = heightAfter - heightBefore;

      if (heightDifference > 0) {
        this.bottomMenuService.suspendScrollDetection(600);
        scroller.scrollBy({
          top: heightDifference,
          behavior: "smooth",
        });
      }
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "WorkoutComponent.maintainButtonPosition",
      );
    }
  }

  openDeleteWorkout() {
    try {
      this.hapticService.trigger('error');
      this.confirmPopupService.open({
        triggerElement: this.deleteWorkoutAnchor.nativeElement,
        title: 'Eliminare questo allenamento?',
        message: 'Questa azione non può essere annullata.',
        confirmText: 'Elimina',
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
      this.hapticService.trigger('medium');
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