import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import {
  AllenamentoUnit,
  ReorderUnitRef,
} from "../../workout-form";
import { EsercizioForm } from "../../exercise-form";
import { GymExerciseSelectorComponent } from "../../../shared/app-gym-exercise-selector/app-gym-exercise-selector";
import { ExerciseIconColorPipe } from "src/app/core/pipes/exercise-icon-color";
import { ExerciseService } from "src/app/core/services/exercise.service";
import { FocusOverlayController } from "../../../shared/focus-overlay/focus-overlay.controller";
import { GroupCompactCard } from "../group-compact-card/group-compact-card";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { HapticService } from "src/app/core/services/haptic.service";

gsap.registerPlugin(Draggable);

export interface ContainerPosition {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface Sortable {
  element: HTMLElement;
  index: number;
  unitRef: ReorderUnitRef;
  dragger: Draggable;
  setIndex: (newIndex: number) => void;
}

/**
 * Overlay di riordino a "unit": ogni riga trascinabile è un esercizio sciolto
 * (card compatta) oppure un intero gruppo superset/circuito (card compatta di
 * gruppo). Le righe hanno altezze diverse, quindi il layout usa l'algoritmo
 * ad accumulo di altezze (come il riordino allenamenti della scheda).
 */
@Component({
  selector: "app-reorder-units",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    GymExerciseSelectorComponent,
    ExerciseIconColorPipe,
    GroupCompactCard,
  ],
  templateUrl: "./reorder-units-component.html",
  styleUrls: ["./reorder-units-component.scss"],
})
export class ReorderUnitsComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() units: AllenamentoUnit[] = [];
  @Input() containerPosition!: ContainerPosition;

  @ViewChild("unitsDataContainer") unitsDataContainer!: ElementRef;

  private readonly TARGET_TOP = 120;
  private readonly GAP = 16;
  private readonly BOTTOM_PADDING = 80;
  private isAnimating = false;
  private sortables: Sortable[] = [];
  private savedScrollPosition = 0;

  constructor(
    private exerciseService: ExerciseService,
    private controller: FocusOverlayController,
    private ngZone: NgZone,
    private hapticService: HapticService,
  ) {}

  ngOnInit(): void {
    this.savedScrollPosition =
      window.scrollY || document.documentElement.scrollTop;

    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${this.savedScrollPosition}px`;
    document.body.style.width = "100%";

    this.controller.registerStartCloseAnimationFn(() => {
      this.startCloseAnimation();
    });
  }

  ngOnDestroy(): void {
    document.body.style.overflow = "";
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";

    window.scrollTo(0, this.savedScrollPosition);

    this.sortables.forEach((sortable) => {
      if (sortable.dragger) {
        sortable.dragger.kill();
      }
    });
    this.sortables = [];
  }

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {
      this.positionContainerOverOriginal();
      this.controller.notifyPositioned();

      (this.unitsDataContainer.nativeElement as HTMLElement).offsetHeight;

      requestAnimationFrame(() => {
        this.controller.showBackdrop();
        this.animateCardsToTop();
      });
    });
  }

  private positionContainerOverOriginal(): void {
    const container = this.unitsDataContainer.nativeElement;

    if (this.containerPosition) {
      gsap.set(container, {
        position: "absolute",
        y: this.containerPosition.top,
        left: this.containerPosition.left,
        width: this.containerPosition.width,
        margin: 0,
        zIndex: 95,
        force3D: true,
      });

      const cardRows = container.querySelectorAll(
        ".card-row",
      ) as NodeListOf<HTMLElement>;

      // Altezze variabili: accumula le altezze reali riga per riga
      let currentY = 0;
      cardRows.forEach((cardRow) => {
        gsap.set(cardRow, {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          y: currentY,
          zIndex: 1,
          force3D: true,
        });
        currentY += cardRow.offsetHeight + this.GAP;
      });

      gsap.set(container, {
        height: currentY + this.BOTTOM_PADDING,
      });
    }
  }

  private animateCardsToTop(): void {
    const container = this.unitsDataContainer.nativeElement;
    const dragHandles = container.querySelectorAll(".drag-handle-container");

    gsap.to(dragHandles, {
      width: 28,
      duration: 0.4,
      ease: "power2.out",
      force3D: true,
    });

    gsap.to(container, {
      y: this.TARGET_TOP,
      duration: 0.4,
      ease: "power2.out",
      force3D: true,
      onComplete: () => {
        this.initSortable();
      },
    });
  }

  private initSortable(): void {
    const container = this.unitsDataContainer.nativeElement;
    const cardRows = container.querySelectorAll(
      ".card-row",
    ) as NodeListOf<HTMLElement>;
    if (!cardRows.length) return;

    const totalItems = cardRows.length;
    const clampIndex = gsap.utils.clamp(0, totalItems - 1);

    const refreshLayout = (animate = true) => {
      const orderedSortables = [...this.sortables].sort(
        (a, b) => a.index - b.index,
      );

      let currentY = 0;

      orderedSortables.forEach((sortable) => {
        if (animate && sortable.dragger && !sortable.dragger.isDragging) {
          gsap.to(sortable.element, {
            y: currentY,
            duration: 0.3,
            ease: "power2.out",
            force3D: true,
          });
        } else if (!animate) {
          gsap.set(sortable.element, {
            y: currentY,
            force3D: true,
          });
        }

        currentY += sortable.element.offsetHeight + this.GAP;
      });

      gsap.set(container, {
        height: currentY + this.BOTTOM_PADDING,
      });

      return currentY;
    };

    const arrayMove = (array: Sortable[], from: number, to: number) => {
      array.splice(to, 0, array.splice(from, 1)[0]);
    };

    const changeIndex = (item: Sortable, to: number) => {
      const fromPosition = this.sortables.indexOf(item);
      if (fromPosition === -1) return;

      arrayMove(this.sortables, fromPosition, to);
      this.sortables.forEach((sortable, index) => sortable.setIndex(index));
    };

    const getIndexFromY = (y: number): number => {
      const orderedSortables = [...this.sortables].sort(
        (a, b) => a.index - b.index,
      );
      let accumulateY = 0;

      for (let i = 0; i < orderedSortables.length; i++) {
        const height = orderedSortables[i].element.offsetHeight;
        const threshold = accumulateY + height / 2;

        if (y < threshold) {
          return i;
        }
        accumulateY += height + this.GAP;
      }
      return orderedSortables.length - 1;
    };

    cardRows.forEach((cardRow, index) => {
      const dragHandle = cardRow.querySelector(
        ".drag-handle-container",
      ) as HTMLElement;
      if (!dragHandle) return;

      const unit = this.units[index];
      const unitRef: ReorderUnitRef =
        unit.kind === "esercizio"
          ? { kind: "esercizio", identifier: unit.esercizio.exerciseIdentifier }
          : { kind: "gruppo", identifier: unit.gruppo.identifier };

      const sortable: Sortable = {
        element: cardRow,
        index: index,
        unitRef: unitRef,
        dragger: null as any,
        setIndex: () => {},
      };

      const setIndex = (newIndex: number) => {
        sortable.index = newIndex;
        if (!sortable.dragger.isDragging) {
          refreshLayout(true);
        }
      };

      const downAction = () => {
        refreshLayout(false);
        gsap.to(cardRow, {
          scale: 1.02,
          zIndex: 100,
          duration: 0.2,
          overwrite: "auto",
          force3D: true,
        });
        cardRow.classList.add("dragging-shadow");
      };

      const dragAction = function (this: Draggable) {
        const newIndex = clampIndex(getIndexFromY(this.y));

        if (newIndex !== sortable.index) {
          changeIndex(sortable, newIndex);
          refreshLayout(true);
        }
      };

      const upAction = () => {
        gsap.to(cardRow, {
          scale: 1,
          zIndex: 1,
          duration: 0.3,
          force3D: true,
        });
        cardRow.classList.remove("dragging-shadow");
        refreshLayout(true);
      };

      const draggerArray = Draggable.create(cardRow, {
        type: "y",
        trigger: dragHandle,
        edgeResistance: 0.85,
        zIndexBoost: false,
        autoScroll: 1,
        onPress: downAction,
        onDrag: dragAction,
        onRelease: upAction,
      });

      sortable.dragger = draggerArray[0];
      sortable.setIndex = setIndex;

      this.sortables.push(sortable);
    });

    refreshLayout(true);
  }

  private startCloseAnimation(): void {
    if (this.isAnimating) return;
    this.isAnimating = true;

    this.sortables.forEach((sortable) => {
      if (sortable.dragger) {
        sortable.dragger.kill();
      }
    });

    this.ngZone.runOutsideAngular(() => {
      this.animateCloseSequence();
    });
  }

  private animateCloseSequence(): void {
    const container = this.unitsDataContainer.nativeElement;
    const dragHandles = container.querySelectorAll(".drag-handle-container");

    gsap.to(dragHandles, {
      width: 0,
      duration: 0.4,
      ease: "power2.inOut",
      force3D: true,
    });

    const updatedPosition = this.controller.getUpdatedContainerPosition();
    const targetTop = updatedPosition
      ? updatedPosition.top
      : this.containerPosition.top;

    const orderedSortables = [...this.sortables].sort(
      (a, b) => a.index - b.index,
    );
    let currentY = 0;

    orderedSortables.forEach((sortable) => {
      gsap.to(sortable.element, {
        y: currentY,
        scale: 1,
        zIndex: 1,
        duration: 0.2,
        ease: "power2.out",
        force3D: true,
      });
      currentY += sortable.element.offsetHeight + this.GAP;
    });

    gsap.to(container, {
      y: targetTop,
      duration: 0.4,
      ease: "power2.inOut",
      force3D: true,
      onComplete: () => {
        const orderedUnits = this.getOrderedUnits();
        this.controller.applyNewOrder<ReorderUnitRef>(orderedUnits);

        this.controller.notifyReadyToShow();
        this.controller.hideBackdrop();

        setTimeout(() => {
          this.controller.dismiss();
        }, 250);
      },
    });
  }

  private getOrderedUnits(): ReorderUnitRef[] {
    return [...this.sortables]
      .sort((a, b) => a.index - b.index)
      .map((sortable) => sortable.unitRef);
  }

  trackUnit(unit: AllenamentoUnit): string {
    return unit.kind === "esercizio"
      ? "e" + unit.esercizio.exerciseIdentifier
      : "g" + unit.gruppo.identifier;
  }

  onCardClick(event: Event): void {
    event.stopPropagation();
  }

  onConfirmClick(event: Event): void {
    this.hapticService.trigger("light");
    event.stopPropagation();
    this.startCloseAnimation();
  }

  getControl(esercizioForm: EsercizioForm, controlName: string): FormControl {
    return esercizioForm.form.controls[controlName] as FormControl;
  }

  getExerciseIconPath(exerciseId: number): string {
    return this.exerciseService.getExerciseIconPathByExerciseId(exerciseId);
  }
}
