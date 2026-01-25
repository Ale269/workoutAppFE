import { AfterViewInit, Component, ElementRef, Input, NgZone, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren, ViewEncapsulation } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { AllenamentoForm } from "../../workout-form";
import { EsercizioForm } from "../../exercise-form";
import { FocusOverlayController } from "../../../shared/focus-overlay/focus-overlay.controller";
import { ExerciseService } from "src/app/core/services/exercise.service";
import { ExerciseIconColorPipe } from "src/app/core/pipes/exercise-icon-color";
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
    workoutIdentifier: number;
    dragger: Draggable;
    setIndex: (newIndex: number) => void;
}

@Component({
    selector: "app-reorder-workout",
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, ExerciseIconColorPipe],
    templateUrl: "./reorder-workout-component.html",
    styleUrls: ["./reorder-workout-component.scss"],
    encapsulation: ViewEncapsulation.None,
})
export class ReorderWorkoutComponent implements OnInit, AfterViewInit, OnDestroy {
    @Input() workouts: AllenamentoForm[] = [];
    @Input() containerPosition!: ContainerPosition;

    @ViewChild('workoutDataContainer') workoutDataContainer!: ElementRef;
    @ViewChildren('cardElement') cardElements!: QueryList<ElementRef>;

    private readonly TARGET_TOP = 120;
    private readonly GAP = 16;
    private isAnimating = false;
    private sortables: Sortable[] = [];
    private savedScrollPosition = 0;

    constructor(
        private controller: FocusOverlayController,
        private ngZone: NgZone,
        private exerciseService: ExerciseService
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
        this.ngZone.runOutsideAngular(() => {
            this.positionContainerOverOriginal();
            this.controller.notifyPositioned();

            (this.workoutDataContainer.nativeElement as HTMLElement).offsetHeight;

            requestAnimationFrame(() => {
                this.controller.showBackdrop();
                this.animateCardsToTop();
            });
        });
    }

    private positionContainerOverOriginal(): void {
        const container = this.workoutDataContainer.nativeElement;

        if (this.containerPosition) {
            // ✅ Usa y invece di top + force3D
            gsap.set(container, {
                position: 'absolute',
                y: this.containerPosition.top,
                left: this.containerPosition.left,
                width: this.containerPosition.width,
                margin: 0,
                zIndex: 95,
                force3D: true // ✅ GPU
            });

            const cardRows = container.querySelectorAll('.card-row') as NodeListOf<HTMLElement>;
            if (cardRows.length > 0) {
                const firstCard = cardRows[0];
                const cardHeight = firstCard.offsetHeight;
                const rowSize = cardHeight + this.GAP;
                const BOTTOM_PADDING = 80;

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
                        zIndex: 1,
                        force3D: true // ✅ GPU
                    });
                });
            }
        }
    }

    private animateCardsToTop(): void {
        const container = this.workoutDataContainer.nativeElement;
        const dragHandles = container.querySelectorAll('.drag-handle-container');

        // ✅ Anima handle con force3D
        gsap.to(dragHandles, {
            width: 28,
            duration: 0.4,
            ease: "power2.out",
            force3D: true
        });

        // ✅ Usa y invece di top + force3D
        gsap.to(container, {
            y: this.TARGET_TOP,
            duration: 0.4,
            ease: "power2.out",
            force3D: true,
            onComplete: () => {
                console.log('Animazione verso top completata');
                this.initSortable();
            }
        });
    }

    private initSortable(): void {
        const container = this.workoutDataContainer.nativeElement;
        const cardRows = container.querySelectorAll('.card-row') as NodeListOf<HTMLElement>;
        if (!cardRows.length) return;

        const totalItems = cardRows.length;
        const clampIndex = gsap.utils.clamp(0, totalItems - 1);

        const refreshLayout = (animate = true) => {
            const orderedSortables = [...this.sortables].sort((a, b) => a.index - b.index);
            
            let currentY = 0;
            const BOTTOM_PADDING = 80;

            orderedSortables.forEach((sortable) => {
                if (animate && sortable.dragger && !sortable.dragger.isDragging) {
                    // ✅ Aggiungi force3D
                    gsap.to(sortable.element, {
                        y: currentY,
                        duration: 0.3,
                        ease: "power2.out",
                        force3D: true
                    });
                } else if (!animate) {
                    gsap.set(sortable.element, { 
                        y: currentY,
                        force3D: true
                    });
                }

                currentY += sortable.element.offsetHeight + this.GAP;
            });

            gsap.set(container, {
                height: currentY + BOTTOM_PADDING
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
            console.log('Ordine aggiornato:', this.sortables.map(s => s.workoutIdentifier));
        };

        const getIndexFromY = (y: number): number => {
            const orderedSortables = [...this.sortables].sort((a, b) => a.index - b.index);
            let accumulateY = 0;
            
            for (let i = 0; i < orderedSortables.length; i++) {
                const height = orderedSortables[i].element.offsetHeight;
                const threshold = accumulateY + (height / 2);
                
                if (y < threshold) {
                    return i;
                }
                accumulateY += height + this.GAP;
            }
            return orderedSortables.length - 1;
        };

        cardRows.forEach((cardRow, index) => {
            const dragHandle = cardRow.querySelector('.drag-handle-container') as HTMLElement;
            if (!dragHandle) return;

            const workoutIdentifier = this.workouts[index]?.form.get('identifier')?.value ?? -1;

            const sortable: Sortable = {
                element: cardRow,
                index: index,
                workoutIdentifier: workoutIdentifier,
                dragger: null as any,
                setIndex: () => { }
            };

            const setIndex = (newIndex: number) => {
                sortable.index = newIndex;
                if (!sortable.dragger.isDragging) {
                    refreshLayout(true);
                }
            };

            const downAction = () => {
                refreshLayout(false);
                // ✅ Rimuovi box-shadow dall'animazione
                gsap.to(cardRow, {
                    scale: 1.02,
                    zIndex: 100,
                    duration: 0.2,
                    overwrite: "auto",
                    force3D: true
                });
                
                // ✅ Applica shadow via classe CSS
                cardRow.classList.add('dragging-shadow');
            };

            const dragAction = function (this: Draggable) {
                const newIndex = clampIndex(getIndexFromY(this.y));
                
                if (newIndex !== sortable.index) {
                    changeIndex(sortable, newIndex);
                    refreshLayout(true);
                }
            };

            const upAction = () => {
                // ✅ Rimuovi box-shadow dall'animazione
                gsap.to(cardRow, {
                    scale: 1,
                    zIndex: 1,
                    duration: 0.3,
                    force3D: true
                });
                
                // ✅ Rimuovi classe shadow
                cardRow.classList.remove('dragging-shadow');
                
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

        console.log('Sortable inizializzato con layout dinamico');
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
        const container = this.workoutDataContainer.nativeElement;
        const dragHandles = container.querySelectorAll('.drag-handle-container');
        
        // ✅ Aggiungi force3D
        gsap.to(dragHandles, {
            width: 0,
            duration: 0.4,
            ease: "power2.inOut",
            force3D: true
        });

        const updatedPosition = this.controller.getUpdatedContainerPosition();
        const targetTop = updatedPosition ? updatedPosition.top : this.containerPosition.top;

        const orderedSortables = [...this.sortables].sort((a, b) => a.index - b.index);
        let currentY = 0;

        orderedSortables.forEach((sortable) => {
            // ✅ Rimuovi box-shadow dall'animazione
            gsap.to(sortable.element, {
                y: currentY,
                scale: 1,
                zIndex: 1,
                duration: 0.2,
                ease: "power2.out",
                force3D: true
            });
            currentY += sortable.element.offsetHeight + this.GAP;
        });

        // ✅ Usa y invece di top + force3D
        gsap.to(container, {
            y: targetTop,
            duration: 0.4,
            ease: "power2.inOut",
            force3D: true,
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
            .sort((a, b) => a.index - b.index)
            .map(sortable => sortable.workoutIdentifier)
            .filter((id): id is number => id !== null && id !== undefined && id !== -1);
    }

    onCardClick(event: Event): void {
        event.stopPropagation();
    }

    onConfirmClick(event: Event): void {
        event.stopPropagation();
        this.startCloseAnimation();
    }

    getControl(allenamentoForm: AllenamentoForm, controlName: string): FormControl {
        return allenamentoForm.form.controls[controlName] as FormControl;
    }

    getExerciseCount(workout: AllenamentoForm): number {
        return workout.listaEserciziForm.length;
    }

    getExerciseIconPath(esercizioForm: EsercizioForm): string {
        const idTipoEsercizio = esercizioForm.form.controls["idTipoEsercizio"].value;
        return this.exerciseService.getExerciseIconPathByExerciseId(idTipoEsercizio);
    }
}