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
        this.positionContainerOverOriginal();
        this.controller.notifyPositioned();

        // Forza un reflow iniziale
        (this.workoutDataContainer.nativeElement as HTMLElement).offsetHeight;

        this.ngZone.runOutsideAngular(() => {
            requestAnimationFrame(() => {
                this.controller.showBackdrop();
                this.animateCardsToTop();
            });
        });
    }

    private positionContainerOverOriginal(): void {
        const container = this.workoutDataContainer.nativeElement;

        if (this.containerPosition) {
            gsap.set(container, {
                position: 'absolute',
                top: this.containerPosition.top,
                left: this.containerPosition.left,
                width: this.containerPosition.width,
                margin: 0,
                zIndex: 95
            });

            const cardRows = container.querySelectorAll('.card-row') as NodeListOf<HTMLElement>;
            if (cardRows.length > 0) {
                // Calcolo altezza iniziale approssimativa basata sulla prima card
                // Verrà ricalcolata accuratamente dopo
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
                        zIndex: 1
                    });
                });
            }
        }
    }

    private animateCardsToTop(): void {
        const container = this.workoutDataContainer.nativeElement;
        const dragHandles = container.querySelectorAll('.drag-handle-container');

        // 1. Anima l'espansione degli handle (questo causa il text wrapping)
        gsap.to(dragHandles, {
            width: 28,
            duration: 0.4,
            ease: "power2.out"
        });

        // 2. Anima il container verso l'alto
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
    }

    private initSortable(): void {
        const container = this.workoutDataContainer.nativeElement;
        const cardRows = container.querySelectorAll('.card-row') as NodeListOf<HTMLElement>;
        if (!cardRows.length) return;

        const totalItems = cardRows.length;
        const clampIndex = gsap.utils.clamp(0, totalItems - 1);

        // --- Logica di Layout Dinamico ---
        // Ricalcola la posizione Y di ogni elemento basandosi sull'altezza reale
        // degli elementi che lo precedono.
        const refreshLayout = (animate = true) => {
            // Ordiniamo l'array sortables in base al loro indice corrente
            // (Nota: non riordiniamo l'array sortables stesso, creiamo una vista ordinata)
            const orderedSortables = [...this.sortables].sort((a, b) => a.index - b.index);
            
            let currentY = 0;
            const BOTTOM_PADDING = 80;

            orderedSortables.forEach((sortable) => {
                // Se stiamo trascinando questo elemento, NON forziamo la sua Y con GSAP
                // altrimenti combatteremmo con il Draggable.
                if (animate && sortable.dragger && !sortable.dragger.isDragging) {
                    gsap.to(sortable.element, {
                        y: currentY,
                        duration: 0.3,
                        ease: "power2.out"
                    });
                } else if (!animate) {
                     gsap.set(sortable.element, { y: currentY });
                }

                // Incrementiamo Y per il prossimo elemento
                // Usiamo offsetHeight per prendere l'altezza reale (incluso padding/border)
                // che potrebbe essere cambiata col text-wrap
                currentY += sortable.element.offsetHeight + this.GAP;
            });

            // Aggiorniamo l'altezza del container per permettere lo scroll corretto
            gsap.set(container, {
                height: currentY + BOTTOM_PADDING
            });
            
            return currentY; // Ritorna l'altezza totale content
        };

        // --- Helper: Sposta elemento nell'array ---
        const arrayMove = (array: Sortable[], from: number, to: number) => {
            array.splice(to, 0, array.splice(from, 1)[0]);
        };

        // --- Logica cambio indice ---
        const changeIndex = (item: Sortable, to: number) => {
            const fromPosition = this.sortables.indexOf(item);
            if (fromPosition === -1) return;

            arrayMove(this.sortables, fromPosition, to);
            // Aggiorna la proprietà .index di tutti
            this.sortables.forEach((sortable, index) => sortable.setIndex(index));
            console.log('Ordine aggiornato:', this.sortables.map(s => s.workoutIdentifier));
        };

        // --- Helper: Trova indice basato sulla posizione Y ---
        // Con altezze variabili, non possiamo fare Math.round(y / rowSize).
        // Dobbiamo vedere in quale "slot" cade la Y corrente.
        const getIndexFromY = (y: number): number => {
            // Simula il layout corrente per trovare i punti di taglio
            const orderedSortables = [...this.sortables].sort((a, b) => a.index - b.index);
            let accumulateY = 0;
            
            for (let i = 0; i < orderedSortables.length; i++) {
                const height = orderedSortables[i].element.offsetHeight;
                const threshold = accumulateY + (height / 2); // Metà della card corrente
                
                if (y < threshold) {
                    return i;
                }
                accumulateY += height + this.GAP;
            }
            return orderedSortables.length - 1;
        };

        // --- Inizializzazione Cards ---
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

            // Callback per aggiornare l'indice locale e rilanciare il layout visivo
            const setIndex = (newIndex: number) => {
                sortable.index = newIndex;
                if (!sortable.dragger.isDragging) {
                    refreshLayout(true);
                }
            };

            const downAction = () => {
                refreshLayout(false); // Assicuriamoci che tutto sia in posizione prima del drag
                gsap.to(cardRow, {
                    scale: 1.02,
                    boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
                    zIndex: 100,
                    duration: 0.2,
                    overwrite: "auto"
                });
            };

            const dragAction = function (this: Draggable) {
                // Usiamo la funzione custom per altezze variabili
                const newIndex = clampIndex(getIndexFromY(this.y));
                
                if (newIndex !== sortable.index) {
                    changeIndex(sortable, newIndex);
                    // Ricalcola il layout degli altri elementi (quello draggato è ignorato)
                    refreshLayout(true);
                }
            };

            const upAction = () => {
                gsap.to(cardRow, {
                    scale: 1,
                    boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
                    zIndex: 1,
                    duration: 0.3
                });
                refreshLayout(true);
            };

            // Creiamo il Draggable senza bounds rigidi su Y per ora, 
            // gestiamo lo scroll container tramite CSS/layout
            const draggerArray = Draggable.create(cardRow, {
                type: "y",
                trigger: dragHandle,
                edgeResistance: 0.85,
                zIndexBoost: false,
                autoScroll: 1, // Importante per liste lunghe
                onPress: downAction,
                onDrag: dragAction,
                onRelease: upAction,
                // bounds: container // Rimuoviamo bounds calcolati manualm. per evitare conflitti con altezze dinamiche
            });

            sortable.dragger = draggerArray[0];
            sortable.setIndex = setIndex;

            this.sortables.push(sortable);
        });

        // FASE CRUCIALE:
        // Appena inizializzato, forziamo un layout. 
        // A questo punto gli handle sono visibili (width 28px) e il testo potrebbe essere andato a capo.
        // refreshLayout leggerà le nuove altezze reali e riposizionerà le card senza sovrapposizioni.
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
        
        // Prima di chiudere, nascondiamo gli handle.
        // Questo potrebbe far "restringere" di nuovo le altezze delle card (testo torna su riga singola).
        const dragHandles = container.querySelectorAll('.drag-handle-container');
        
        gsap.to(dragHandles, {
            width: 0,
            duration: 0.4,
            ease: "power2.inOut"
        });

        const updatedPosition = this.controller.getUpdatedContainerPosition();
        const targetTop = updatedPosition ? updatedPosition.top : this.containerPosition.top;

        // Ricalcoliamo posizioni "flat" per l'uscita
        // Nota: durante la chiusura, siccome rimuoviamo gli handle, le altezze cambieranno ancora.
        // Per semplicità visiva, resettiamo verso un layout standard o usiamo refreshLayout continuamente.
        // Qui usiamo una logica semplificata per l'uscita.

        // Riordiniamo visivamente per l'animazione di uscita
        const orderedSortables = [...this.sortables].sort((a, b) => a.index - b.index);
        let currentY = 0;

        orderedSortables.forEach((sortable) => {
            // Prendiamo l'altezza attuale (che sta cambiando mentre gli handle si chiudono)
            // Se vogliamo essere precisi dovremmo usare un onUpdate, ma per l'uscita veloce basta questo:
            gsap.to(sortable.element, {
                y: currentY,
                scale: 1,
                boxShadow: "none",
                zIndex: 1,
                duration: 0.2,
                ease: "power2.out"
            });
            // Usiamo l'altezza corrente approssimata o ricalcolata
             currentY += sortable.element.offsetHeight + this.GAP;
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
        // Importante riordinare l'array in base all'indice visuale prima di estrarre gli ID
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