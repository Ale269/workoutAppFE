import { AfterViewInit, Component, ElementRef, Input, NgZone, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren, ViewEncapsulation } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { EsercizioForm } from "../../exercise-form";
import { GymExerciseSelectorComponent } from "../../../shared/app-gym-exercise-selector/app-gym-exercise-selector";
import { ExerciseIconColorPipe } from "src/app/core/pipes/exercise-icon-color";
import { ExerciseService } from "src/app/core/services/exercise.service";
import { FocusOverlayController } from "../../../shared/focus-overlay/focus-overlay.controller";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";

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
    exerciseIdentifier: number;
    dragger: Draggable;
    setIndex: (newIndex: number) => void;
}

@Component({
    selector: "app-reorder-exercise",
    standalone: true,
    imports: [CommonModule, GymExerciseSelectorComponent, ExerciseIconColorPipe, ReactiveFormsModule],
    templateUrl: "./reorder-exercise-component.html",
    styleUrls: ["./reorder-exercise-component.scss"],
    encapsulation: ViewEncapsulation.None,
})
export class ReorderExerciseComponent implements OnInit, AfterViewInit, OnDestroy {
    @Input() exercises: EsercizioForm[] = [];
    @Input() containerPosition!: ContainerPosition;

    @ViewChild('exerciseDataContainer') exerciseDataContainer!: ElementRef;
    @ViewChildren('cardElement') cardElements!: QueryList<ElementRef>;

    private readonly TARGET_TOP = 80;
    private readonly GAP = 16;
    private isAnimating = false;
    private sortables: Sortable[] = [];
    private savedScrollPosition = 0;

    constructor(
        private exerciseService: ExerciseService,
        private controller: FocusOverlayController,
        private ngZone: NgZone
    ) { }

    ngOnInit(): void {
        this.savedScrollPosition = window.scrollY || document.documentElement.scrollTop;

        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.top = `-${this.savedScrollPosition}px`;
        document.body.style.width = '100%';

        this.controller.registerStartCloseAnimationFn(() => {
            this.startCloseAnimation();
        });
    }

    ngOnDestroy(): void {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';

        window.scrollTo(0, this.savedScrollPosition);

        this.sortables.forEach(sortable => {
            if (sortable.dragger) {
                sortable.dragger.kill();
            }
        });
        this.sortables = [];
    }

    ngAfterViewInit(): void {
        this.positionContainerOverOriginal();
        this.controller.notifyPositioned();

        (this.exerciseDataContainer.nativeElement as HTMLElement).offsetHeight;

        this.ngZone.runOutsideAngular(() => {
            requestAnimationFrame(() => {
                this.controller.showBackdrop();
                this.animateCardsToTop();
            });
        });
    }

    private positionContainerOverOriginal(): void {
        const container = this.exerciseDataContainer.nativeElement;

        if (this.containerPosition) {
            // Impostiamo position: 'absolute' invece di 'fixed'.
            // Essendo dentro .scrollable-container (che è relative), 
            // questo elemento contribuirà all'altezza totale permettendo lo scroll.
            gsap.set(container, {
                position: 'absolute',
                top: this.containerPosition.top,
                left: this.containerPosition.left,
                width: this.containerPosition.width,
                margin: 0,
                zIndex: 1001
            });

            const cardRows = container.querySelectorAll('.card-row') as NodeListOf<HTMLElement>;
            if (cardRows.length > 0) {
                const firstCard = cardRows[0];
                const cardHeight = firstCard.offsetHeight;
                const rowSize = cardHeight + this.GAP;

                const BOTTOM_PADDING = 80;

                // Calcoliamo e assegniamo l'altezza esplicita al container.
                // Questo forza il .scrollable-container padre a creare la scrollbar.
                gsap.set(container, {
                    height: (cardRows.length * rowSize) + BOTTOM_PADDING
                });

                cardRows.forEach((cardRow, index) => {
                    gsap.set(cardRow, {
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        y: index * rowSize,
                        zIndex: 1
                    });
                });
            }
        }
    }

    private animateCardsToTop(): void {
        const container = this.exerciseDataContainer.nativeElement;

        // Anima .exercise-data verso il top
        gsap.to(container, {
            top: this.TARGET_TOP,
            duration: 0.4,
            ease: "power2.out",
            onComplete: () => {
                console.log('Animazione verso top completata');

                this.ngZone.runOutsideAngular(() => {
                    this.initSortable();
                });
            }
        });

        const dragHandles = container.querySelectorAll('.drag-handle-container');
        gsap.to(dragHandles, {
            width: 28,
            duration: 0.4,
            ease: "power2.out"
        });
    }

    private initSortable(): void {
        const container = this.exerciseDataContainer.nativeElement;
        const cardRows = container.querySelectorAll('.card-row') as NodeListOf<HTMLElement>;
        if (!cardRows.length) return;

        const totalItems = cardRows.length;
        const firstCard = cardRows[0] as HTMLElement;
        const cardHeight = firstCard.offsetHeight;
        const rowSize = cardHeight + this.GAP;

        const clampIndex = gsap.utils.clamp(0, totalItems - 1);

        const arrayMove = (array: Sortable[], from: number, to: number) => {
            array.splice(to, 0, array.splice(from, 1)[0]);
        };

        const changeIndex = (item: Sortable, to: number) => {
            const fromPosition = this.sortables.indexOf(item);
            if (fromPosition === -1) return;

            arrayMove(this.sortables, fromPosition, to);
            this.sortables.forEach((sortable, index) => sortable.setIndex(index));

            console.log('Ordine aggiornato:', this.sortables.map(s => s.exerciseIdentifier));
        };

        cardRows.forEach((cardRow, index) => {
            const dragHandle = cardRow.querySelector('.drag-handle-container') as HTMLElement;
            if (!dragHandle) return;

            const exerciseIdentifier = this.exercises[index]?.form.get('identifier')?.value ?? -1;

            const sortable: Sortable = {
                element: cardRow,
                index: index,
                exerciseIdentifier: exerciseIdentifier,
                dragger: null as any,
                setIndex: () => { }
            };

            const setIndex = (newIndex: number) => {
                sortable.index = newIndex;
                if (!sortable.dragger.isDragging) {
                    layout();
                }
            };

            const layout = () => {
                gsap.to(cardRow, {
                    y: sortable.index * rowSize,
                    duration: 0.3,
                    ease: "power2.out"
                });
            };

            const downAction = () => {
                gsap.to(cardRow, {
                    scale: 1.02,
                    boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
                    zIndex: 100,
                    duration: 0.2,
                    overwrite: "auto"
                });
            };

            const dragAction = function (this: Draggable) {
                const newIndex = clampIndex(Math.round(this.y / rowSize));
                if (newIndex !== sortable.index) {
                    changeIndex(sortable, newIndex);
                }
            };

            const upAction = () => {
                gsap.to(cardRow, {
                    scale: 1,
                    boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
                    zIndex: 1,
                    duration: 0.3
                });
                layout();
            };

            const totalHeight = (totalItems - 1) * rowSize;

            const draggerArray = Draggable.create(cardRow, {
                type: "y",
                trigger: dragHandle,
                edgeResistance: 0.85,
                zIndexBoost: false,
                autoScroll: 1,
                bounds: {
                    minY: 0,
                    maxY: totalHeight
                },
                onPress: downAction,
                onDrag: dragAction,
                onRelease: upAction
            });

            sortable.dragger = draggerArray[0];
            sortable.setIndex = setIndex;

            this.sortables.push(sortable);
        });

        console.log('Sortable inizializzato con', this.sortables.length, 'elementi');
    }

    private startCloseAnimation(): void {
        if (this.isAnimating) return;
        this.isAnimating = true;

        this.sortables.forEach(sortable => {
            if (sortable.dragger) {
                sortable.dragger.kill();
            }
        });

        this.ngZone.runOutsideAngular(() => {
            this.animateCloseSequence();
        });
    }

    private animateCloseSequence(): void {
        const container = this.exerciseDataContainer.nativeElement;
        const cardRows = container.querySelectorAll('.card-row') as NodeListOf<HTMLElement>;

        const updatedPosition = this.controller.getUpdatedContainerPosition();
        const targetTop = updatedPosition ? updatedPosition.top : this.containerPosition.top;

        if (cardRows.length > 0) {
            const cardHeight = cardRows[0].offsetHeight;
            const rowSize = cardHeight + this.GAP;

            this.sortables.forEach((sortable, idx) => {
                gsap.to(sortable.element, {
                    y: idx * rowSize,
                    scale: 1,
                    boxShadow: "none",
                    zIndex: 1,
                    duration: 0.2,
                    ease: "power2.out"
                });
            });
        }

        const dragHandles = container.querySelectorAll('.drag-handle-container');
        gsap.to(dragHandles, {
            width: 0,
            duration: 0.4,
            ease: "power2.inOut"
        });

        gsap.to(container, {
            top: targetTop,
            duration: 0.4,
            ease: "power2.inOut",
            onComplete: () => {
                const orderedIdentifiers = this.getOrderedIdentifiers();
                console.log('Nuovo ordine da applicare:', orderedIdentifiers);
                this.controller.applyNewOrder(orderedIdentifiers);

                this.controller.notifyReadyToShow();
                this.controller.hideBackdrop();

                setTimeout(() => {
                    this.controller.dismiss();
                }, 250);
            }
        });
    }

    private getOrderedIdentifiers(): number[] {
        return this.sortables
            .map(sortable => sortable.exerciseIdentifier)
            .filter((id): id is number => id !== null && id !== undefined && id !== -1);
    }

    onCardClick(event: Event): void {
        event.stopPropagation();
    }

    onConfirmClick(event: Event): void {
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