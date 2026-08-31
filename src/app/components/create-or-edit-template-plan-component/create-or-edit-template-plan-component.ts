// create-or-edit-template-plan-component.ts
import {
  AfterViewInit,
  Component,
  OnInit,
  ViewChild,
  OnDestroy,
  ChangeDetectorRef,
  ElementRef,
  ViewChildren,
  QueryList,
} from "@angular/core";
import { ErrorHandlerService } from "src/app/core/services/error-handler.service";
import { CreateOrEditTemplatePlanService } from "./create-or-edit-template-plan-service";

import { ExerciseIconColorPipe } from "../../core/pipes/exercise-icon-color";
import { ExerciseIconPipe } from "../../core/pipes/exercise-icon";
import { WorkoutComponent } from "./workout-component/workout-component";
import { ReactiveFormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatLabel, MatFormField, MatInput } from "@angular/material/input";
import { ConfirmPopupService } from "src/app/core/services/confirm-popup.service";
import { PromptPopupService } from "src/app/core/services/prompt-popup.service";
import { SchedaDTO } from "src/app/models/view-modifica-scheda/schedadto";
import { SpinnerService } from "src/app/core/services/spinner.service";
import { ActivatedRoute, Router } from "@angular/router";
import { SaveDatiTemplateSchedaRequestModel } from "src/app/models/view-modifica-scheda/saveDatiTemplateScheda";
import { AuthService } from "src/app/core/services/auth.service";
import { BottomMenuService } from "src/app/core/services/bottom-menu.service";
import { WorkoutService } from "src/app/core/services/workout.service";
import { DeleteDatiTemplateSchedaRequestModel } from "src/app/models/view-modifica-scheda/deleteDatiTemplateScheda";
import { LoadingProgression } from "src/app/models/enums/loading-progression";
import { Switch } from "../shared/switch/switch";
import { AllenamentoForm } from "./workout-form";
import { gsap } from "gsap";
import { EsercizioForm } from "./exercise-form";
import { ExerciseService } from "src/app/core/services/exercise.service";
import {
  MultiOptionButton,
  multiOptionGroup,
  OptionSelectedEvent,
} from "../shared/multi-option-button/multi-option-button";
import { FocusOverlayService } from "../shared/focus-overlay/focus-overlay.service";
import { ReorderWorkoutComponent } from "./workout-component/reorder-workout-component/reorder-workout-component";
import { MatIcon, MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";
import { MenuConfigService } from "src/app/core/services/menu-config.service";
import { HapticService } from "src/app/core/services/haptic.service";
import { HapticSwitchDirective } from "src/app/components/shared/directives/haptic-switch.directive";
import {
  WorkoutStorageService,
  TemplateStorageData,
} from "src/app/core/services/workout-storage.service";
import { SchedaDTO as SchedaFormDTO } from "src/app/models/create-or-edit-template-or-entity-form-dto/schedadto";
import { SwipeToDeleteController } from "src/app/core/services/swipe-to-delete.controller";

@Component({
  selector: "app-create-or-edit-template-plan-component",
  imports: [
    WorkoutComponent,
    ReactiveFormsModule,
    MatLabel,
    MatFormField,
    MatInput,
    MatFormFieldModule,
    Switch,
    HapticSwitchDirective,
    ExerciseIconColorPipe,
    ExerciseIconPipe,
    MultiOptionButton,
    MatIcon,
  ],
  templateUrl: "./create-or-edit-template-plan-component.html",
  styleUrl: "./create-or-edit-template-plan-component.scss",
})
export class CreateOrEditTemplatePlanComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  @ViewChild("listView") listView!: ElementRef<HTMLElement>;
  @ViewChild("detailView") detailView!: ElementRef<HTMLElement>;
  @ViewChildren("workoutCard") allenamentoCards!: QueryList<ElementRef>;

  @ViewChild("deleteSchedaAnchor", { read: ElementRef })
  deleteSchedaAnchor!: ElementRef<HTMLElement>;

  @ViewChildren("workoutCard", { read: ElementRef })
  workoutCardElements!: QueryList<ElementRef>;
  @ViewChild("workoutListContainer", { read: ElementRef })
  workoutListContainer!: ElementRef;

  // Offset orizzontale casuale del gradiente decorativo (resta in alto)
  public gradientShiftX: number = Math.round(Math.random() * 140) - 70;

  // Gestione visualizzazione
  public currentView: "list" | "detail" = "list";
  public selectedWorkout: AllenamentoForm | null = null;
  private isAnimating = false;

  public scheda!: SchedaDTO;

  public get isNuovaScheda(): boolean {
    return !this.scheda || this.scheda.id == -1;
  }

  public LoadingProgressionEnum = LoadingProgression;
  public loadingProgression: LoadingProgression = LoadingProgression.none;

  private initSpinnerId: string | null = null;
  private saveSpinnerId: string | null = null;

  private currentSpinnerId: string | null = null;

  private autoSaveIntervalId: any = null;
  private lastSavedSnapshot: string = "";

  // Gestione swipe
  /** Swipe-to-delete condiviso: vedi SwipeToDeleteController. */
  private swipe = new SwipeToDeleteController({
    wrapperSelector: ".allenamento-wrapper",
  });

  public leftButtonOptionsGroup: multiOptionGroup[] = [
    {
      id: 1,
      label: "",
      options: [
        {
          optionId: 1,
          color: "#ff6b6b",
          description: "Elimina scheda",
        },
      ],
    },
  ];

  constructor(
    private errorHandlerService: ErrorHandlerService,
    public createOrEditTemplatePlanService: CreateOrEditTemplatePlanService,
    private confirmPopupService: ConfirmPopupService,
    private promptPopupService: PromptPopupService,
    private spinnerService: SpinnerService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private authService: AuthService,
    private workoutService: WorkoutService,
    private exerciseService: ExerciseService,
    private focusOverlayService: FocusOverlayService,
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer,
    private menuConfigService: MenuConfigService,
    private hapticService: HapticService,
    private activatedRoute: ActivatedRoute,
    private workoutStorageService: WorkoutStorageService,
    private bottomMenuService: BottomMenuService,
  ) {
    try {
      iconRegistry.addSvgIcon(
        "google-arrow",
        sanitizer.bypassSecurityTrustResourceUrl(
          "assets/recollect/svg/google-arrow.svg",
        ),
      );
      iconRegistry.addSvgIcon(
        "google-add",
        sanitizer.bypassSecurityTrustResourceUrl(
          "assets/recollect/svg/google-add.svg",
        ),
      );
      iconRegistry.addSvgIcon(
        "google-reorder",
        sanitizer.bypassSecurityTrustResourceUrl(
          "assets/recollect/svg/google-reorder.svg",
        ),
      );
      iconRegistry.addSvgIcon(
        "google-delete",
        sanitizer.bypassSecurityTrustResourceUrl(
          "assets/recollect/svg/google-delete.svg",
        ),
      );

      const navigation = this.router.getCurrentNavigation();
      const state = navigation?.extras.state as { scheda: SchedaDTO };

      if (state?.scheda) {
        this.scheda = state.scheda;
      }
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "CreateOrEditTemplatePlanComponent.constructor",
      );
    }
  }

  ngOnInit(): void {
    try {
      this.bottomMenuService.setEnabled(false);

      // Se non abbiamo la scheda (PWA reload), recupera l'ID dalla URL
      if (!this.scheda) {
        this.recoverSchedaIdFromUrl();
      }

      let navigationText: string = "";

      if (this.isNuovaScheda) {
        navigationText = "Nuova scheda";
      } else {
        navigationText = "Modifica scheda";
      }

      this.menuConfigService.setCloseModal(() => this.goBack(), navigationText);

      this.loadingProgression = LoadingProgression.loading;

      // Controlla se esiste una sessione in cache da recuperare
      const schedaId = this.scheda?.id ?? -1;
      const cachedData = this.workoutStorageService.loadTemplate();
      if (cachedData && cachedData.schedaId === schedaId) {
        this.restoreFromCache(cachedData);
        this.startAutoSave();
        return;
      }

      this.currentSpinnerId = this.spinnerService.showWithResult(
        "Inizializzazione dati scheda",
        {
          successMessage: "Inizializzazione completata",
          errorMessage: "Errore nel processo di inizializzazione",
          resultDuration: 250,
          minSpinnerDuration: 250,
        },
      );

      if (this.scheda) {
        this.createOrEditTemplatePlanService.initializeFormWithData(
          this.scheda,
        );

        setTimeout(() => {
          if (this.currentSpinnerId) {
            this.spinnerService.setSuccess(this.currentSpinnerId);
          }
        }, 100);

        this.loadingProgression = LoadingProgression.complete;
      } else {
        this.createOrEditTemplatePlanService.initializeEmptyForm();

        setTimeout(() => {
          if (this.currentSpinnerId) {
            this.spinnerService.setSuccess(this.currentSpinnerId);
          }
        }, 100);

        this.loadingProgression = LoadingProgression.complete;
      }

      this.startAutoSave();
    } catch (error) {
      setTimeout(() => {
        if (this.currentSpinnerId) {
          this.spinnerService.setError(this.currentSpinnerId);
        }
      }, 100);

      this.errorHandlerService.logError(
        error,
        "CreateOrEditTemplatePlanComponent.ngOnInit",
      );

      this.loadingProgression = LoadingProgression.failed;
    }
  }

  private recoverSchedaIdFromUrl(): void {
    const url = this.router.url;
    if (url.includes("modifica-scheda/")) {
      const routeId = Number(this.activatedRoute.snapshot.params["id"]) || 0;
      if (routeId > 0) {
        // In edit mode senza navigation state, creiamo un oggetto scheda minimale
        // per poter matchare la cache
        this.scheda = {
          id: routeId,
          nomeScheda: "",
          idTemplate: 0,
          listaAllenamenti: [],
          schedaAttiva: false,
          description: "",
        };
      }
    }
  }

  private restoreFromCache(data: TemplateStorageData): void {
    try {
      this.createOrEditTemplatePlanService.initializeFromFormDTO(data.formDTO);

      // I dati recuperati sono lavoro in corso, marca come dirty
      this.createOrEditTemplatePlanService.formScheda.form.markAsDirty();
      this.loadingProgression = LoadingProgression.complete;
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "CreateOrEditTemplatePlanComponent.restoreFromCache",
      );
      this.workoutStorageService.clearTemplate();
      this.loadingProgression = LoadingProgression.failed;
    }
  }

  private startAutoSave(): void {
    this.stopAutoSave();
    this.autoSaveIntervalId = setInterval(() => {
      this.saveToLocalStorage();
    }, 5000);
  }

  private stopAutoSave(): void {
    if (this.autoSaveIntervalId) {
      clearInterval(this.autoSaveIntervalId);
      this.autoSaveIntervalId = null;
    }
  }

  private saveToLocalStorage(): void {
    try {
      if (!this.createOrEditTemplatePlanService.formScheda) return;

      const formDTO: SchedaFormDTO =
        this.createOrEditTemplatePlanService.formScheda.getFormDTO();

      const snapshot: TemplateStorageData = {
        version: 1,
        schedaId: this.scheda?.id ?? -1,
        formDTO: formDTO,
        savedAt: "",
      };

      const snapshotJson = JSON.stringify(snapshot);
      if (snapshotJson !== this.lastSavedSnapshot) {
        this.workoutStorageService.saveTemplate(snapshot);
        this.lastSavedSnapshot = snapshotJson;
      }
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "CreateOrEditTemplatePlanComponent.saveToLocalStorage",
      );
    }
  }

  private closeAllSwipes(): void {
    this.swipe.closeAll();
  }

  ngAfterViewInit(): void {
    this.allenamentoCards.changes.subscribe(() => {
      this.swipe.attach(this.allenamentoCards);
    });
    this.swipe.attach(this.allenamentoCards);
  }

  ngOnDestroy(): void {
    // Il menu va RIABILITATO uscendo: ngOnInit lo disattiva, e senza questa
    // riga resta spento per tutto il resto della sessione.
    this.bottomMenuService.setEnabled(true);

    // Fermare l'autosave e' altrettanto obbligatorio: se il timer sopravvive
    // al componente continua a riscrivere la bozza "template_in_progress_*"
    // in localStorage, e al riavvio l'app rientra da sola nella creazione
    // scheda che l'utente aveva abbandonato.
    this.stopAutoSave();

    if (this.initSpinnerId) {
      this.spinnerService.hide(this.initSpinnerId);
    }
    if (this.saveSpinnerId) {
      this.spinnerService.hide(this.saveSpinnerId);
    }

    this.swipe.destroy();
  }

  // Metodi per la navigazione animata tra viste
  public async openWorkoutDetail(workout: AllenamentoForm): Promise<void> {
    if (this.isAnimating) return;

    try {
      this.menuConfigService.setBackWithCallback(
        () => this.backToList(),
        "back",
        "Modifica allenamento",
      );

      this.isAnimating = true;

      // Chiudi tutti gli swipe aperti prima di navigare
      this.closeAllSwipes();

      // Fade out della vista corrente
      if (this.listView?.nativeElement) {
        await this.playFadeOut(this.listView.nativeElement);
      }

      // Reset scroll del page-scroller
      const scroller = document.querySelector(".page-scroller");
      if (scroller) scroller.scrollTop = 0;

      // Cambia la vista
      this.selectedWorkout = workout;
      this.currentView = "detail";
      this.cdr.detectChanges();

      // Fade in della nuova vista
      if (this.detailView?.nativeElement) {
        await this.playFadeIn(this.detailView.nativeElement);
      }

      this.isAnimating = false;
    } catch (error) {
      this.isAnimating = false;
      this.errorHandlerService.logError(
        error,
        "CreateOrEditTemplatePlanComponent.openWorkoutDetail",
      );
    }
  }

  public async backToList(): Promise<void> {
    if (this.isAnimating) return;

    try {
      let navigationText: string = "";

      if (this.isNuovaScheda) {
        navigationText = "Nuova scheda";
      } else {
        navigationText = "Modifica scheda";
      }

      this.menuConfigService.setCloseModal(() => this.goBack(), navigationText);

      this.isAnimating = true;

      // Fade out della vista corrente
      if (this.detailView?.nativeElement) {
        await this.playFadeOut(this.detailView.nativeElement);
      }

      // Reset scroll del page-scroller
      const scroller = document.querySelector(".page-scroller");
      if (scroller) scroller.scrollTop = 0;

      // Cambia la vista
      this.selectedWorkout = null;
      this.currentView = "list";
      this.cdr.detectChanges();

      // Fade in della nuova vista
      if (this.listView?.nativeElement) {
        await this.playFadeIn(this.listView.nativeElement);
      }

      this.isAnimating = false;
    } catch (error) {
      this.isAnimating = false;
      this.errorHandlerService.logError(
        error,
        "CreateOrEditTemplatePlanComponent.backToList",
      );
    }
  }

  // Metodi di animazione privati
  private playFadeOut(element: HTMLElement, duration = 0.3): Promise<void> {
    return new Promise((resolve) => {
      gsap.to(element, {
        autoAlpha: 0,
        duration,
        ease: "power2.inOut",
        onComplete: () => {
          resolve();
        },
      });
    });
  }

  private playFadeIn(element: HTMLElement, duration = 0.3): Promise<void> {
    return new Promise((resolve) => {
      gsap.to(element, {
        autoAlpha: 1,
        duration,
        ease: "power2.inOut",
        onComplete: () => {
          resolve();
        },
      });
    });
  }

  // Metodo per contare gli esercizi di un allenamento
  public getExerciseCount(workout: AllenamentoForm): number {
    return workout.listaEserciziForm.length;
  }

  openDeleteWorkout(identifier: number, event: Event): void {
    try {
      this.hapticService.trigger("error");
      this.confirmPopupService.open({
        triggerElement: event.currentTarget as HTMLElement,
        title: "Eliminare questo allenamento?",
        message: "Questa azione non può essere annullata.",
        confirmText: "Elimina",
        onConfirm: () => this.deleteWorkout(identifier),
      });
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "CreateOrEditTemplatePlanComponent.openDeleteWorkout",
      );
    }
  }

  deleteWorkout(identifier: number): void {
    try {
      this.createOrEditTemplatePlanService.DeleteWorkout(identifier);

      // Se siamo in vista dettaglio e abbiamo cancellato l'allenamento visualizzato, torna alla lista
      if (
        this.currentView === "detail" &&
        this.selectedWorkout?.form.controls["identifier"].value === identifier
      ) {
        this.backToList();
      }

      this.cdr.detectChanges();
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "CreateOrEditTemplatePlanComponent.deleteWorkout",
      );
    }
  }

  openAddWorkoutModal() {
    try {
      const placeholder = `Giorno ${this.nextWorkoutPosition()}`;

      this.promptPopupService.open({
        title: "Aggiungi allenamento",
        inputLabel: "Nome allenamento",
        placeholder,
        hint: "Se lasci vuoto, verrà usato il nome predefinito",
        confirmText: "Aggiungi",
        onConfirm: (value) => this.addWorkout(value, placeholder),
      });
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "CreateOrEditTemplatePlanComponent.openAddWorkoutModal",
      );
    }
  }

  private nextWorkoutPosition(): number {
    return (
      (this.createOrEditTemplatePlanService.formScheda?.listaAllenamentiForm
        ?.length || 0) + 1
    );
  }

  addWorkout(value: string, placeholder: string) {
    try {
      this.hapticService.trigger("medium");
      const workoutName = value?.trim() || placeholder;

      this.createOrEditTemplatePlanService.AddWorkout(workoutName);

      this.cdr.detectChanges();
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "CreateOrEditTemplatePlanComponent.addWorkout",
      );
    }
  }

  onAttivazioneStateChange(newState: boolean) {
    try {
      this.hapticService.trigger("light");

      this.createOrEditTemplatePlanService.formScheda.toggleActiveState(
        newState,
      );
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "CreateOrEditTemplatePlanComponent.onAttivazioneStateChange",
      );
    }
  }

  savePlan(actionId: number) {
    try {
      this.hapticService.trigger("success");
      this.saveSpinnerId = this.spinnerService.showWithResult(
        "Salvataggio in corso",
        {
          forceShow: true,
          successMessage: "Salvataggio completato con successo",
          errorMessage: "Errore durante il salvataggio",
          resultDuration: 500,
          minSpinnerDuration: 500,
        },
      );

      this.scheda =
        this.createOrEditTemplatePlanService.formScheda.getDatiSchedaDaSalvare();

      const user = this.authService.getCurrentUser();

      if (user) {
        const SaveDatiTemplateSchedaRequest: SaveDatiTemplateSchedaRequestModel =
          {
            schedaDTO: this.scheda,
            userId: user.userId,
          };

        if (actionId === 0) {
          SaveDatiTemplateSchedaRequest.schedaDTO.id = -1;
          SaveDatiTemplateSchedaRequest.schedaDTO.schedaAttiva = false;
        }
        this.createOrEditTemplatePlanService
          .savePlan(SaveDatiTemplateSchedaRequest)
          .then((response) => {
            this.workoutStorageService.clearTemplate();
            this.resetAll(response);

            if (this.saveSpinnerId) {
              this.spinnerService.setSuccess(this.saveSpinnerId);
            }
          })
          .catch((error) => {
            if (this.saveSpinnerId) {
              this.spinnerService.setError(
                this.saveSpinnerId,
                "Errore nella fase di salvataggio",
              );
            }
            this.errorHandlerService.logError(
              error,
              "CreateOrEditTemplatePlanComponent.savePlan",
            );
          });
      } else {
        throw new Error(
          "CreateOrEditTemplatePlanComponent.savePlan: nessun user trovato",
        );
      }
    } catch (error) {
      if (this.saveSpinnerId) {
        this.spinnerService.setError(this.saveSpinnerId);
      }
      this.errorHandlerService.logError(
        error,
        "CreateOrEditTemplatePlanComponent.savePlan",
      );
    }
  }

  resetAll(datiScheda: SchedaDTO) {
    try {
      this.scheda = datiScheda;
      this.currentView = "list";
      this.selectedWorkout = null;
      this.createOrEditTemplatePlanService.resetAll();
      this.createOrEditTemplatePlanService.initializeFormWithData(datiScheda);
      this.cdr.detectChanges();
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "CreateOrEditTemplatePlanComponent.resetAll",
      );
    }
  }

  goBack() {
    try {
      if (this.createOrEditTemplatePlanService.formScheda.form.dirty) {
        this.confirmPopupService.open({
          triggerElement: this.getHeaderCloseButtonElement(),
          title: "Annullare la modifica?",
          message: "I dati non salvati andranno persi.",
          confirmText: "Conferma",
          onConfirm: () => {
            this.createOrEditTemplatePlanService.formScheda.form.markAsPristine();
            this.workoutStorageService.clearTemplate();
            if (this.scheda) {
              this.router.navigate([
                "/le-mie-schede/visualizza-scheda",
                this.scheda.id,
              ]);
            } else {
              this.router.navigate(["/le-mie-schede"]);
            }
          },
        });
      } else {
        this.workoutStorageService.clearTemplate();
        if (this.scheda) {
          this.router.navigate([
            "/le-mie-schede/visualizza-scheda",
            this.scheda.id,
          ]);
        } else {
          this.router.navigate(["/le-mie-schede"]);
        }
      }
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "CreateOrEditTemplatePlanComponent.goBack",
      );
    }
  }

  /**
   * Il bottone "X" di chiusura vive nell'header condiviso (app-menu-component),
   * fuori da questa pagina: lo recuperiamo così per ancorarci il popup di conferma.
   */
  private getHeaderCloseButtonElement(): HTMLElement {
    // .left-button ha padding:16px (da ".app-menu-container > div"): il suo
    // rect è più grande dell'icona visibile. Puntiamo a .menu-btn-container
    // (il cerchio 48x48 dell'icona) per allineare il popup esattamente su
    // di essa, non sull'area di tap più ampia che la contiene.
    return (
      (document.querySelector(
        ".left-button .menu-btn-container",
      ) as HTMLElement) ||
      (document.querySelector(".left-button") as HTMLElement) ||
      document.body
    );
  }

  openDeleteScheda() {
    try {
      this.hapticService.trigger("error");
      this.confirmPopupService.open({
        triggerElement: this.deleteSchedaAnchor.nativeElement,
        title: "Eliminare questo template scheda?",
        message: "Questa azione non può essere annullata.",
        confirmText: "Elimina",
        onConfirm: () => this.eliminaScheda(),
      });
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "CreateOrEditTemplatePlanComponent.openDeleteScheda",
      );
    }
  }

  eliminaScheda() {
    try {
      if (
        this.createOrEditTemplatePlanService.formScheda.form.controls["id"]
          .value !== null &&
        this.createOrEditTemplatePlanService.formScheda.form.controls["id"]
          .value > 0
      ) {
        this.currentSpinnerId = this.spinnerService.showWithResult(
          "Elimino dati scheda",
          {
            forceShow: true,
            successMessage: "Scheda eliminata con successo",
            errorMessage: "Errore nell'eliminare la scheda",
            resultDuration: 250,
            minSpinnerDuration: 250,
          },
        );

        const request: DeleteDatiTemplateSchedaRequestModel = {
          workoutId:
            this.createOrEditTemplatePlanService.formScheda.form.controls["id"]
              .value,
        };

        this.createOrEditTemplatePlanService
          .eliminaScheda(request)
          .then((objResponse) => {
            if (this.currentSpinnerId) {
              this.spinnerService.setSuccess(this.currentSpinnerId);
            }
            this.workoutStorageService.clearTemplate();
            this.router.navigate(["/le-mie-schede"]);
          })
          .catch((objError) => {
            if (this.currentSpinnerId) {
              this.spinnerService.setError(this.currentSpinnerId);
            }
            this.errorHandlerService.logError(
              objError,
              "CreateOrEditTemplatePlanComponent.eliminaScheda",
            );
          });
      } else {
        this.workoutStorageService.clearTemplate();
        this.router.navigate(["/le-mie-schede"]);
      }
    } catch (error) {
      if (this.currentSpinnerId) {
        this.spinnerService.setError(this.currentSpinnerId);
      }
      this.errorHandlerService.logError(
        error,
        "CreateOrEditTemplatePlanComponent.eliminaScheda",
      );
    }
  }

  onOptionSelected(option: OptionSelectedEvent) {
    switch (option.side) {
      case "left":
        switch (option.groupId) {
          case 1:
            switch (option.optionId) {
              case 1:
                this.openDeleteScheda();
                break;
            }
            break;
        }
        break;
    }
  }

  openWorkoutReorder(): void {
    try {
      this.hapticService.trigger("medium");
      const containerEl = this.workoutListContainer.nativeElement;
      const containerRect = containerEl.getBoundingClientRect();
      const containerPosition = {
        top: containerRect.top,
        left: containerRect.left,
        width: containerRect.width,
        height: containerRect.height,
      };

      const controller = this.focusOverlayService.open({
        component: ReorderWorkoutComponent,
        data: {
          workouts:
            this.createOrEditTemplatePlanService.formScheda
              .listaAllenamentiForm,
          containerPosition: containerPosition,
        },
        dismissOnBackdrop: false,
        onDismiss: () => {
          console.log("Overlay riordino allenamenti chiuso!");
          this.cdr.detectChanges();
        },
      });

      controller.registerOnPositionedFn(() => {
        this.setOriginalWorkoutCardsVisibility(false);
      });

      controller.registerGetContainerPositionFn(() => {
        const rect =
          this.workoutListContainer.nativeElement.getBoundingClientRect();
        return {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        };
      });

      controller.registerOnReadyToShowFn(() => {
        this.setOriginalWorkoutCardsVisibility(true);
      });

      controller.registerApplyNewOrderFn((orderedIdentifiers: number[]) => {
        this.createOrEditTemplatePlanService.formScheda.reorderWorkoutsByIdentifiers(
          orderedIdentifiers,
        );
        this.cdr.detectChanges();
      });
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "CreateOrEditTemplatePlanComponent.openWorkoutReorder",
      );
    }
  }

  private setOriginalWorkoutCardsVisibility(visible: boolean): void {
    if (this.workoutListContainer) {
      const containerEl = this.workoutListContainer
        .nativeElement as HTMLElement;
      gsap.set(containerEl, { autoAlpha: visible ? 1 : 0 });
    }
  }
}
