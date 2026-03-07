// create-or-edit-template-plan-component.ts
import {
  AfterViewInit,
  Component,
  OnInit,
  ViewChild,
  OnDestroy,
  TemplateRef,
  ChangeDetectorRef,
  ElementRef,
  ViewChildren,
  QueryList,
} from "@angular/core";
import { ErrorHandlerService } from "src/app/core/services/error-handler.service";
import { CreateOrEditTemplatePlanService } from "./create-or-edit-template-plan-service";

import { ExerciseIconColorPipe } from "../../core/pipes/exercise-icon-color";
import { WorkoutComponent } from "./workout-component/workout-component";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatLabel, MatFormField, MatInput } from "@angular/material/input";
import { ModalService } from "src/app/core/services/modal.service";
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
import { Draggable } from "gsap/Draggable";
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
import {
  WorkoutStorageService,
  TemplateStorageData,
} from "src/app/core/services/workout-storage.service";
import { SchedaDTO as SchedaFormDTO } from "src/app/models/create-or-edit-template-or-entity-form-dto/schedadto";

// Registra il plugin Draggable
gsap.registerPlugin(Draggable);

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
    ExerciseIconColorPipe,
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

  @ViewChild("headerAddWorkout") headerAddWorkout!: TemplateRef<any>;
  @ViewChild("bodyAddWorkout") bodyAddWorkout!: TemplateRef<any>;
  @ViewChild("footerCloseAddWorkout")
  footerCloseAddWorkout!: TemplateRef<any>;
  @ViewChild("footerConfirmAddWorkout")
  footerConfirmAddWorkout!: TemplateRef<any>;

  @ViewChild("headerGoBack") headerGoBack!: TemplateRef<any>;
  @ViewChild("bodyGoBack") bodyGoBack!: TemplateRef<any>;
  @ViewChild("footerCloseGoBack")
  footerCloseGoBack!: TemplateRef<any>;
  @ViewChild("footerConfirmGoBack")
  footerConfirmGoBack!: TemplateRef<any>;

  @ViewChild("headerDeleteTemplate") headerDeleteTemplate!: TemplateRef<any>;
  @ViewChild("bodyDeleteTemplate") bodyDeleteTemplate!: TemplateRef<any>;
  @ViewChild("footerCloseDeleteTemplate")
  footerCloseDeleteTemplate!: TemplateRef<any>;
  @ViewChild("footerConfirmDeleteTemplate")
  footerConfirmDeleteTemplate!: TemplateRef<any>;

  @ViewChild("headerDeleteWorkoutTemplate")
  headerDeleteWorkoutTemplate!: TemplateRef<any>;
  @ViewChild("bodyDeleteWorkoutTemplate")
  bodyDeleteWorkoutTemplate!: TemplateRef<any>;
  @ViewChild("footerCloseDeleteWorkoutTemplate")
  footerCloseDeleteWorkoutTemplate!: TemplateRef<any>;
  @ViewChild("footerConfirmDeleteWorkoutTemplate")
  footerConfirmDeleteWorkoutTemplate!: TemplateRef<any>;

  @ViewChildren("workoutCard", { read: ElementRef })
  workoutCardElements!: QueryList<ElementRef>;
  @ViewChild("workoutListContainer", { read: ElementRef })
  workoutListContainer!: ElementRef;

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

  public newWorkoutNameControl!: FormControl<string>;

  private currentSpinnerId: string | null = null;

  private autoSaveIntervalId: any = null;
  private lastSavedSnapshot: string = "";

  // Gestione swipe
  private draggableInstances: any[] = [];

  public leftButtonOptionsGroup: multiOptionGroup[] = [
    {
      id: 1,
      label: "",
      options: [
        {
          optionId: 1,
          color: "#ff0000",
          description: "Elimina scheda",
        },
      ],
    },
  ];

  constructor(
    private errorHandlerService: ErrorHandlerService,
    public createOrEditTemplatePlanService: CreateOrEditTemplatePlanService,
    private modalService: ModalService,
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
      );iconRegistry.addSvgIcon(
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

  ngAfterViewInit(): void {
    try {
      // Inizializza lo swipe quando le card cambiano
      this.allenamentoCards.changes.subscribe(() => {
        this.initializeSwipe();
      });
      this.initializeSwipe();
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "CreateOrEditTemplatePlanComponent.ngAfterViewInit",
      );
    }
  }

  ngOnDestroy(): void {
    this.bottomMenuService.setEnabled(true);
    this.stopAutoSave();
    if (this.initSpinnerId) {
      this.spinnerService.hide(this.initSpinnerId);
    }
    if (this.saveSpinnerId) {
      this.spinnerService.hide(this.saveSpinnerId);
    }
    // Pulisci le istanze draggable
    this.draggableInstances.forEach((instance) => instance.kill());
  }

  private initializeSwipe(): void {
    try {
      // Pulisci istanze precedenti
      this.draggableInstances.forEach((instance) => instance.kill());
      this.draggableInstances = [];

      setTimeout(() => {
        this.allenamentoCards.forEach((cardRef, index) => {
          const card = cardRef.nativeElement;
          const wrapper = card.closest(".allenamento-wrapper");
          const deleteButton = wrapper?.querySelector(
            ".delete-action",
          ) as HTMLElement;

          if (!deleteButton) return;

          const SWIPE_THRESHOLD = -80;
          const DELETE_WIDTH = 80;

          gsap.set(deleteButton, {
            autoAlpha: 0,
            pointerEvents: "none",
          });

          const component = this;

          const draggableArray = Draggable.create(card, {
            type: "x",
            bounds: { minX: SWIPE_THRESHOLD, maxX: 0 },
            inertia: true,
            dragClickables: false,
            zIndexBoost: false,
            onDragStart: function (this: any) {
              component.closeOtherSwipes(index);
            },
            onDrag: function (this: any) {
              const progress = Math.abs(this.x) / DELETE_WIDTH;
              const alpha = Math.min(progress, 1);

              gsap.to(deleteButton, {
                autoAlpha: alpha,
                duration: 0.1,
                overwrite: true,
              });

              if (alpha > 0.5) {
                gsap.set(deleteButton, { pointerEvents: "auto" });
              } else {
                gsap.set(deleteButton, { pointerEvents: "none" });
              }
            },
            onDragEnd: function (this: any) {
              if (this.x < SWIPE_THRESHOLD / 2) {
                gsap.to(card, {
                  x: SWIPE_THRESHOLD,
                  duration: 0.3,
                  ease: "power2.out",
                });
                gsap.to(deleteButton, {
                  autoAlpha: 1,
                  duration: 0.3,
                  overwrite: true,
                  onComplete: () => {
                    gsap.set(deleteButton, { pointerEvents: "auto" });
                  },
                });
                this.vars.isOpen = true;
                component.hapticService.trigger("warning");
              } else {
                gsap.to(card, {
                  x: 0,
                  duration: 0.3,
                  ease: "power2.out",
                });
                gsap.to(deleteButton, {
                  autoAlpha: 0,
                  duration: 0.3,
                  overwrite: true,
                  onComplete: () => {
                    gsap.set(deleteButton, { pointerEvents: "none" });
                  },
                });
                this.vars.isOpen = false;
              }
            },
            onClick: function (this: any, e: MouseEvent) {
              if (this.vars.isOpen) {
                e.stopPropagation();
                component.closeSwipe(card, deleteButton, this);
              }
            },
          });

          const draggable = draggableArray[0];
          draggable.vars["isOpen"] = false;
          this.draggableInstances.push(draggable);
        });
      }, 0);
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "CreateOrEditTemplatePlanComponent.initializeSwipe",
      );
    }
  }

  private closeSwipe(
    card: HTMLElement,
    deleteButton: Element,
    draggable: any,
  ): void {
    gsap.to(card, {
      x: 0,
      duration: 0.3,
      ease: "power2.out",
    });
    gsap.to(deleteButton, {
      autoAlpha: 0,
      duration: 0.3,
      onComplete: () => {
        gsap.set(deleteButton, { pointerEvents: "none" });
      },
    });
    draggable.vars.isOpen = false;
  }

  private closeOtherSwipes(exceptIndex: number): void {
    this.allenamentoCards.forEach((cardRef, index) => {
      if (index === exceptIndex) return;
      const card = cardRef.nativeElement;
      const deleteButton = card
        .closest(".allenamento-wrapper")
        ?.querySelector(".delete-action");
      const draggable = this.draggableInstances[index];

      if (draggable?.vars.isOpen && deleteButton) {
        this.closeSwipe(card, deleteButton, draggable);
      }
    });
  }

  private closeAllSwipes(): void {
    this.closeOtherSwipes(-1);
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
      const scroller = document.querySelector('.page-scroller');
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
      const scroller = document.querySelector('.page-scroller');
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

  openDeleteWorkout(identifier: number): void {
    try {
      this.hapticService.trigger("error");
      this.modalService.open({
        warning: true,
        headerTemplate: this.headerDeleteWorkoutTemplate,
        bodyTemplate: this.bodyDeleteWorkoutTemplate,
        footerCloseTemplate: this.footerCloseDeleteWorkoutTemplate,
        footerConfirmTemplate: this.footerConfirmDeleteWorkoutTemplate,
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
      this.initializeNewWorkoutControl();

      this.modalService.open({
        warning: false,
        headerTemplate: this.headerAddWorkout,
        bodyTemplate: this.bodyAddWorkout,
        footerCloseTemplate: this.footerCloseAddWorkout,
        footerConfirmTemplate: this.footerConfirmAddWorkout,
        onConfirm: () => this.addWorkout(),
      });
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "CreateOrEditTemplatePlanComponent.openAddWorkoutModal",
      );
    }
  }

  private initializeNewWorkoutControl(): void {
    const nextPosition =
      (this.createOrEditTemplatePlanService.formScheda?.listaAllenamentiForm
        ?.length || 0) + 1;

    this.newWorkoutNameControl = new FormControl<string>("", {
      nonNullable: true,
    });
  }

  addWorkout() {
    try {
      this.hapticService.trigger("medium");
      let workoutName = this.newWorkoutNameControl.value?.trim();

      const nextPosition =
        (this.createOrEditTemplatePlanService.formScheda?.listaAllenamentiForm
          ?.length || 0) + 1;
      const placeholder = `Giorno ${nextPosition}`;

      if (!workoutName || workoutName === placeholder) {
        workoutName = placeholder;
      }

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
        this.modalService.open({
          warning: true,
          headerTemplate: this.headerGoBack,
          bodyTemplate: this.bodyGoBack,
          footerCloseTemplate: this.footerCloseGoBack,
          footerConfirmTemplate: this.footerConfirmGoBack,
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

  openDeleteScheda() {
    try {
      this.hapticService.trigger("error");
      this.modalService.open({
        warning: true,
        headerTemplate: this.headerDeleteTemplate,
        bodyTemplate: this.bodyDeleteTemplate,
        footerCloseTemplate: this.footerCloseDeleteTemplate,
        footerConfirmTemplate: this.footerConfirmDeleteTemplate,
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

  getExerciseIconPath(esercizioForm: EsercizioForm): string {
    try {
      const idTipoEsercizio =
        esercizioForm.form.controls["idTipoEsercizio"].value;
      return this.exerciseService.getExerciseIconPathByExerciseId(
        idTipoEsercizio,
      );
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "TemplatePlanComponent.getExerciseIconPath",
      );
      return "assets/recollect/svg/default-exercise-icon.svg";
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
