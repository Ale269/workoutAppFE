import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  Output,
  TemplateRef,
  ViewChild,
  OnDestroy,
  ChangeDetectorRef,
  ElementRef,
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
import { DatePipe } from "@angular/common";
import { WorkoutService } from "src/app/core/services/workout.service";
import { AuthService } from "src/app/core/services/auth.service";
import {
  LastTrainingExerciseData,
  LastTrainingSerieData,
  LastNTrainingExercisesResponseModel,
} from "src/app/models/history/last-training-exercise";
import { DomSanitizer } from "@angular/platform-browser";
import { MatIcon, MatIconRegistry } from "@angular/material/icon";
import { HapticService } from "src/app/core/services/haptic.service";
import { BottomMenuService } from "src/app/core/services/bottom-menu.service";

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
    MatInputModule,
    DatePipe,
    MatIcon
  ],
  templateUrl: "./exercise-component.html",
  styleUrl: "./exercise-component.scss",
})
export class ExerciseComponent implements OnInit, OnChanges, OnDestroy {
  @Input() formAllenamento!: AllenamentoForm;
  @Input() formEsercizio!: EsercizioForm;
  @Input() isCompactMode: boolean = false;
  @Input() historyTrainingId?: number;

  @ViewChild("headerDeleteWorkout") headerDeleteWorkout!: TemplateRef<any>;
  @ViewChild("bodyDeleteWorkout") bodyDeleteWorkout!: TemplateRef<any>;
  @ViewChild("footerCloseDeleteWorkout")
  footerCloseDeleteWorkout!: TemplateRef<any>;
  @ViewChild("footerConfirmDeleteWorkout")
  footerConfirmDeleteWorkout!: TemplateRef<any>;

  @ViewChild("headerHistoryTemplate") headerHistoryTemplate!: TemplateRef<any>;
  @ViewChild("bodyHistoryTemplate") bodyHistoryTemplate!: TemplateRef<any>;
  @ViewChild("footerCloseHistoryTemplate")
  footerCloseHistoryTemplate!: TemplateRef<any>;

  @ViewChild("headerLastNHistoryTemplate") headerLastNHistoryTemplate!: TemplateRef<any>;
  @ViewChild("bodyLastNHistoryTemplate") bodyLastNHistoryTemplate!: TemplateRef<any>;
  @ViewChild("footerCloseLastNHistoryTemplate")
  footerCloseLastNHistoryTemplate!: TemplateRef<any>;
  @ViewChild("sessionCarousel") sessionCarouselRef!: ElementRef<HTMLElement>;

  @Output() onDeleteExercise = new EventEmitter<number>();

  // Stato per la cronologia dell'ultimo allenamento
  public lastTrainingData: LastTrainingExerciseData | null = null;
  public lastTrainingLoading: boolean = false;
  public lastTrainingError: boolean = false;

  // Stato per la cronologia degli ultimi N allenamenti
  public lastNTrainingsData: LastTrainingExerciseData[] = [];
  public lastNTrainingsLoading: boolean = false;
  public lastNTrainingsError: boolean = false;
  public readonly lastNLimit: number = 3;
  public activeSessionIndex: number = 0;

  public idMetodologiaControl!: FormControl<number | null>;
  public idTipoEsercizioControl!: FormControl<number | null>;
  public ordinamentoControl!: FormControl<number | null>;
  public exerciseIconPath!: string;

  private destroy$ = new Subject<void>();
  private serieSubscriptions$ = new Subject<void>();

  constructor(
    private errorHandlerService: ErrorHandlerService,
    private modalService: ModalService,
    private cdr: ChangeDetectorRef,
    private bottomSheetService: BottomSheetService,
    private exerciseService: ExerciseService,
    private elementRef: ElementRef,
    private workoutService: WorkoutService,
    private authService: AuthService,
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer,
    private hapticService: HapticService,
    private bottomMenuService: BottomMenuService,
  ) {
    iconRegistry.addSvgIcon(
      "google-arrow",
      sanitizer.bypassSecurityTrustResourceUrl(
        "assets/recollect/svg/google-arrow.svg",
      ),
    ); iconRegistry.addSvgIcon(
      "google-add",
      sanitizer.bypassSecurityTrustResourceUrl(
        "assets/recollect/svg/google-add.svg",
      ),
    ); iconRegistry.addSvgIcon(
      "google-copy",
      sanitizer.bypassSecurityTrustResourceUrl(
        "assets/recollect/svg/google-copy.svg",
      ),
    ); iconRegistry.addSvgIcon(
      "google-close-icon",
      sanitizer.bypassSecurityTrustResourceUrl(
        "assets/recollect/svg/google-close-icon.svg",
      ),
    ); iconRegistry.addSvgIcon(
      "google-history",
      sanitizer.bypassSecurityTrustResourceUrl(
        "assets/recollect/svg/google-history.svg",
      ),
    );
  }

  ngOnInit(): void {
    try {
      this.initFormBindings();
    } catch (error) {
      this.errorHandlerService.logError(error, "ExerciseComponent.ngOnInit");
    }
  }

  /**
   * Quando il form esercizio viene sostituito (es. dopo save+reinit in edit mode),
   * Angular riusa il componente perché l'identifier ha lo stesso valore.
   * ngOnInit non viene richiamato, ma ngOnChanges sì → ri-sottoscriviamo.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['formEsercizio'] && !changes['formEsercizio'].firstChange) {
      try {
        // Annulla le subscription precedenti
        this.serieSubscriptions$.next();
        this.destroy$.next();
        // Ricrea i Subject per le nuove subscription
        this.destroy$ = new Subject<void>();
        this.serieSubscriptions$ = new Subject<void>();
        this.initFormBindings();
      } catch (error) {
        this.errorHandlerService.logError(error, "ExerciseComponent.ngOnChanges");
      }
    }
  }

  ngOnDestroy(): void {
    this.serieSubscriptions$.next();
    this.serieSubscriptions$.complete();
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Inizializza i binding ai controlli del form e le subscription.
   * Chiamato sia da ngOnInit che da ngOnChanges quando il form viene sostituito.
   */
  private initFormBindings(): void {
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

    // Sottoscrivi ai cambiamenti delle serie esistenti
    this.subscribeToSerieChanges();
  }

  /**
   * Sottoscrive i valueChanges di ripetizioni e carico di ogni serie.
   * Quando un valore cambia:
   * - Marca la serie corrente come editata manualmente (autoFilled = false)
   * - Propaga il valore alle serie successive solo se vuote o auto-filled
   */
  subscribeToSerieChanges(): void {
    // Annulla le subscription precedenti
    this.serieSubscriptions$.next();

    const serieList = this.formEsercizio.listaSerieForm;

    serieList.forEach((serieForm, index) => {
      const ripetizioniCtrl = serieForm.form.controls['ripetizioni'];
      const caricoCtrl = serieForm.form.controls['carico'];

      // valueChanges si attiva solo per input utente diretto,
      // perché propagateToNextSeries usa { emitEvent: false }
      ripetizioniCtrl.valueChanges
        .pipe(takeUntil(this.serieSubscriptions$), takeUntil(this.destroy$))
        .subscribe((value) => {
          serieForm.autoFilledRipetizioni = false;
          this.propagateToNextSeries(index, 'ripetizioni', value);
        });

      caricoCtrl.valueChanges
        .pipe(takeUntil(this.serieSubscriptions$), takeUntil(this.destroy$))
        .subscribe((value) => {
          serieForm.autoFilledCarico = false;
          this.propagateToNextSeries(index, 'carico', value);
        });
    });
  }

  /**
   * Propaga il valore alle serie successive solo se:
   * - Il campo è vuoto (null/0), oppure
   * - Il campo è stato precedentemente impostato dall'auto-propagazione (autoFilled = true)
   *
   * Non sovrascrive campi editati manualmente dall'utente o caricati dal server.
   */
  private propagateToNextSeries(fromIndex: number, field: 'ripetizioni' | 'carico', value: number | null): void {
    const serieList = this.formEsercizio.listaSerieForm;
    const autoFilledKey = field === 'ripetizioni' ? 'autoFilledRipetizioni' : 'autoFilledCarico';

    for (let i = fromIndex + 1; i < serieList.length; i++) {
      const targetSerie = serieList[i];
      const currentValue = targetSerie.form.controls[field].value;
      const isEmpty = currentValue === null || currentValue === 0;
      const isAutoFilled = targetSerie[autoFilledKey];

      if (isEmpty || isAutoFilled) {
        targetSerie.form.controls[field].setValue(value, { emitEvent: false });
        targetSerie[autoFilledKey] = true;
      }
    }
  }

  private updateExerciseIcon(): void {
    try {
      this.exerciseIconPath =
        this.exerciseService.getExerciseIconPathByExerciseId(
          this.idTipoEsercizioControl.value,
        );
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "ExerciseComponent.updateExerciseIcon",
      );
    }
  }

  openDeleteModal() {
    try {
      this.hapticService.trigger('error');
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
        "ExerciseComponent.openDeleteModal",
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
        newPosition,
      );

      if (!success) {
        console.error("Errore durante lo spostamento dell'esercizio");
      }

      this.cdr.detectChanges();
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "ExerciseComponent.changePosition",
      );
    }
  }

  /**
   * Salva l'altezza della pagina prima di aggiungere contenuto,
   * poi scrolla per mantenere i pulsanti nella stessa posizione visiva.
   * Usa il .page-scroller come contenitore di scroll.
   */
  private async maintainButtonPosition(callback: () => void): Promise<void> {
    try {
      const scroller = this.elementRef.nativeElement.closest('.page-scroller') as HTMLElement | null;
      if (!scroller) return;

      // Salva l'altezza corrente del page-scroller
      const heightBefore = scroller.scrollHeight;

      // Esegui l'operazione (aggiunta serie)
      callback();

      // Forza il rilevamento dei cambiamenti
      this.cdr.detectChanges();

      // Aspetta che il DOM sia aggiornato
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Calcola la differenza di altezza
      const heightAfter = scroller.scrollHeight;
      const heightDifference = heightAfter - heightBefore;

      // Scrolla della differenza se c'è stato un aumento di altezza
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
        "ExerciseComponent.maintainButtonPosition",
      );
    }
  }

  async addSerie() {
    try {
      this.hapticService.trigger('medium');
      await this.maintainButtonPosition(() => {
        this.formEsercizio.addSerieForm();
      });
      this.subscribeToSerieChanges();
    } catch (error) {
      this.errorHandlerService.logError(error, "ExerciseComponent.addSerie");
    }
  }

  async duplicateLastSerie() {
    try {
      this.hapticService.trigger('medium');
      await this.maintainButtonPosition(() => {
        const seriesList = this.formEsercizio.listaSerieForm;

        if (seriesList.length === 0) {
          this.formEsercizio.addSerieForm();
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
        }
      });
      this.subscribeToSerieChanges();
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "ExerciseComponent.duplicateLastSerie",
      );
    }
  }

  deleteSerie(identifier: number) {
    try {
      this.hapticService.trigger('error');
      this.formEsercizio.deleteSerie(identifier);
      this.subscribeToSerieChanges();
      this.cdr.detectChanges();
    } catch (error) {
      this.errorHandlerService.logError(error, "ExerciseComponent.deleteSerie");
    }
  }

  deleteExercise() {
    try {
      this.hapticService.trigger('error');
      this.onDeleteExercise.emit(
        this.formEsercizio.form.controls["identifier"].value,
      );
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "ExerciseComponent.deleteExercise",
      );
    }
  }

  openLastTrainingHistory() {
    try {
      const exerciseId = this.idTipoEsercizioControl.value;
      const user = this.authService.getCurrentUser();

      if (!exerciseId || !user) {
        return;
      }

      // Reset dello stato
      this.lastTrainingData = null;
      this.lastTrainingLoading = true;
      this.lastTrainingError = false;

      // Apro il modal subito per mostrare lo stato di loading
      this.modalService.open({
        warning: false,
        headerTemplate: this.headerHistoryTemplate,
        bodyTemplate: this.bodyHistoryTemplate,
        footerCloseTemplate: this.footerCloseHistoryTemplate,
      });

      // Passo l'ID dell'history training corrente (se disponibile) per escluderlo dai risultati
      this.workoutService
        .getLastTrainingExercise(
          user.userId,
          exerciseId,
          this.historyTrainingId,
        )
        .subscribe({
          next: (response) => {
            this.lastTrainingLoading = false;
            if (response.esercizio) {
              this.lastTrainingData = response.esercizio;
            } else {
              this.lastTrainingError = true;
            }
            this.cdr.detectChanges();
          },
          error: (error) => {
            this.lastTrainingLoading = false;
            this.lastTrainingError = true;
            this.cdr.detectChanges();
            this.errorHandlerService.logError(
              error,
              "ExerciseComponent.openLastTrainingHistory",
            );
          },
        });
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "ExerciseComponent.openLastTrainingHistory",
      );
    }
  }

  onSessionCarouselScroll(event: Event): void {
    const el = event.target as HTMLElement;
    if (el.clientWidth > 0) {
      this.activeSessionIndex = Math.round(el.scrollLeft / el.clientWidth);
      this.cdr.detectChanges();
    }
  }

  openLastNTrainingHistory() {
    try {
      const exerciseId = this.idTipoEsercizioControl.value;
      const user = this.authService.getCurrentUser();

      if (!exerciseId || !user) {
        return;
      }

      // Reset dello stato
      this.lastNTrainingsData = [];
      this.lastNTrainingsLoading = true;
      this.lastNTrainingsError = false;
      this.activeSessionIndex = 0;

      // Apro il modal subito per mostrare lo stato di loading
      this.modalService.open({
        warning: false,
        headerTemplate: this.headerLastNHistoryTemplate,
        bodyTemplate: this.bodyLastNHistoryTemplate,
        footerCloseTemplate: this.footerCloseLastNHistoryTemplate,
      });

      this.workoutService
        .getLastNTrainingsForExercise(
          user.userId,
          exerciseId,
          this.lastNLimit,
          this.historyTrainingId,
        )
        .subscribe({
          next: (response) => {
            this.lastNTrainingsLoading = false;
            if (response.esercizi && response.esercizi.length > 0) {
              this.lastNTrainingsData = response.esercizi;
            } else {
              this.lastNTrainingsError = true;
            }
            this.cdr.detectChanges();
          },
          error: (error) => {
            this.lastNTrainingsLoading = false;
            this.lastNTrainingsError = true;
            this.cdr.detectChanges();
            this.errorHandlerService.logError(
              error,
              "ExerciseComponent.openLastNTrainingHistory",
            );
          },
        });
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "ExerciseComponent.openLastNTrainingHistory",
      );
    }
  }
}
