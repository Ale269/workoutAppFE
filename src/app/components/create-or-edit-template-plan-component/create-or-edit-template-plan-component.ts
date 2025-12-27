// create-or-edit-template-plan-component.ts
import {
  AfterViewInit,
  Component,
  OnInit,
  ViewChild,
  OnDestroy,
  TemplateRef,
  ChangeDetectorRef,
} from "@angular/core";
import { ErrorHandlerService } from "src/app/core/services/error-handler.service";
import { CreateOrEditTemplatePlanService } from "./create-or-edit-template-plan-service";
import { MatTabGroup, MatTabsModule } from "@angular/material/tabs";

import { WorkoutComponent } from "./workout-component/workout-component";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatLabel, MatFormField, MatInput } from "@angular/material/input";
import { Subscription } from "rxjs";
import { ModalService } from "src/app/core/services/modal.service";
import { SchedaDTO } from "src/app/models/view-modifica-scheda/schedadto";
import { SpinnerService } from "src/app/core/services/spinner.service";
import { Router } from "@angular/router";
import { SaveDatiTemplateSchedaRequestModel } from "src/app/models/view-modifica-scheda/saveDatiTemplateScheda";
import { AuthService } from "src/app/core/services/auth.service";
import { AccordionGroupComponent } from "../shared/accordion/accordion-group/accordion-group.component";
import { AccordionComponent } from "../shared/accordion/accordion-element/accordion.component";
import { AccordionHeaderComponent } from "../shared/accordion/accordion-element/accordion-header/accordion-header.component";
import { AccordionBodyComponent } from "../shared/accordion/accordion-element/accordion-body/accordion-body.component";
import { WorkoutService } from "src/app/core/services/workout.service";
import { DeleteDatiTemplateSchedaRequestModel } from "src/app/models/view-modifica-scheda/deleteDatiTemplateScheda";
import { LoadingProgression } from "src/app/models/enums/loading-progression";
import { Switch } from "../shared/switch/switch";

@Component({
  selector: "app-create-or-edit-template-plan-component",
  imports: [
    WorkoutComponent,
    ReactiveFormsModule,
    MatLabel,
    MatFormField,
    MatInput,
    MatFormFieldModule,
    MatTabsModule,
    AccordionGroupComponent,
    AccordionComponent,
    AccordionHeaderComponent,
    AccordionBodyComponent,
    Switch,
  ],
  templateUrl: "./create-or-edit-template-plan-component.html",
  styleUrl: "./create-or-edit-template-plan-component.scss",
})
export class CreateOrEditTemplatePlanComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  @ViewChild(MatTabGroup) tabGroup!: MatTabGroup;

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

  public selectedTabIndex: number = 0;
  public scheda!: SchedaDTO;

  public LoadingProgressionEnum = LoadingProgression;
  public loadingProgression: LoadingProgression = LoadingProgression.none;

  private selectedIndexSubscription?: Subscription;
  private initSpinnerId: string | null = null;
  private saveSpinnerId: string | null = null;

  public newWorkoutNameControl!: FormControl<string>;

  private currentSpinnerId: string | null = null;

  constructor(
    private errorHandlerService: ErrorHandlerService,
    public createOrEditTemplatePlanService: CreateOrEditTemplatePlanService,
    private modalService: ModalService,
    private spinnerService: SpinnerService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private authService: AuthService,
    private workoutService: WorkoutService
  ) {
    try {
      const navigation = this.router.getCurrentNavigation();
      const state = navigation?.extras.state as { scheda: SchedaDTO };

      if (state?.scheda) {
        this.scheda = state.scheda;
      }
    } catch (error) {
      this.errorHandlerService.handleError(
        error,
        "CreateOrEditTemplatePlanComponent.constructor"
      );
    }
  }

  ngOnInit(): void {
    try {
      // Mostra lo spinner di inizializzazione
      this.currentSpinnerId = this.spinnerService.showWithResult(
        "Inizializzazione dati scheda",
        {
          successMessage: "Inizializzazione completata",
          errorMessage: "Errore nel processo di inizializzazione",
          resultDuration: 250,
          minSpinnerDuration: 250,
        }
      );

      this.loadingProgression = LoadingProgression.loading;

      if (this.scheda) {
        this.createOrEditTemplatePlanService.initializeFormWithData(
          this.scheda
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
    } catch (error) {
      setTimeout(() => {
        if (this.currentSpinnerId) {
          this.spinnerService.setError(this.currentSpinnerId);
        }
      }, 100);

      this.errorHandlerService.handleError(
        error,
        "CreateOrEditTemplatePlanComponent.ngOnInit"
      );

      this.loadingProgression = LoadingProgression.failed;
    }
  }

  ngAfterViewInit(): void {
    // Sottoscrivi ai cambi di tab per gestire lo scroll automatico
    if (this.tabGroup) {
      this.selectedIndexSubscription =
        this.tabGroup.selectedIndexChange.subscribe((newIndex: number) => {
          this.selectedTabIndex = newIndex;
          // Delay per assicurarsi che il DOM sia aggiornato
          setTimeout(() => {
            this.scrollToActiveTab(newIndex);
          }, 150);
        });
    }
  }

  ngOnDestroy(): void {
    // Pulisci la sottoscrizione per evitare memory leak
    if (this.selectedIndexSubscription) {
      this.selectedIndexSubscription.unsubscribe();
    }

    // Chiudi eventuali spinner attivi
    if (this.initSpinnerId) {
      this.spinnerService.hide(this.initSpinnerId);
    }
    if (this.saveSpinnerId) {
      this.spinnerService.hide(this.saveSpinnerId);
    }
  }

  /**
   * Effettua uno scroll smooth per rendere visibile la tab attiva
   */
  private scrollToActiveTab(tabIndex: number): void {
    try {
      const tabGroupElement = this.tabGroup._elementRef.nativeElement;
      const tabList = tabGroupElement.querySelector(
        ".mat-mdc-tab-list"
      ) as HTMLElement;
      const tabLabels = tabGroupElement.querySelectorAll(".mat-mdc-tab");

      if (!tabList || !tabLabels || !tabLabels[tabIndex]) {
        console.warn("Elementi tab non trovati per lo scroll");
        return;
      }

      const activeTabElement = tabLabels[tabIndex] as HTMLElement;
      const tabListRect = tabList.getBoundingClientRect();
      const activeTabRect = activeTabElement.getBoundingClientRect();

      // Calcola la posizione relativa della tab attiva rispetto al container
      const tabLeftRelative = activeTabElement.offsetLeft;
      const tabRightRelative = tabLeftRelative + activeTabElement.offsetWidth;

      // Posizione corrente dello scroll
      const currentScrollLeft = tabList.scrollLeft;
      const containerWidth = tabList.clientWidth;

      // Calcola se la tab è visibile completamente
      const tabLeftVisible = tabLeftRelative >= currentScrollLeft;
      const tabRightVisible =
        tabRightRelative <= currentScrollLeft + containerWidth;

      let targetScrollPosition = currentScrollLeft;

      if (!tabLeftVisible) {
        // La tab è tagliata a sinistra, scroll verso sinistra
        targetScrollPosition = tabLeftRelative - 20; // 20px di padding
      } else if (!tabRightVisible) {
        // La tab è tagliata a destra, scroll verso destra
        targetScrollPosition = tabRightRelative - containerWidth + 20; // 20px di padding
      } else {
        // La tab è già completamente visibile, non fare nulla
        return;
      }

      // Assicurati che il target non sia negativo
      targetScrollPosition = Math.max(0, targetScrollPosition);

      // Effettua lo scroll smooth
      this.smoothScrollTo(tabList, targetScrollPosition);
    } catch (error) {
      console.error("Errore durante lo scroll automatico delle tab:", error);
    }
  }

  /**
   * Implementazione custom dello smooth scroll
   */
  private smoothScrollTo(
    element: HTMLElement,
    targetPosition: number,
    duration: number = 300
  ): void {
    const startPosition = element.scrollLeft;
    const distance = targetPosition - startPosition;
    const startTime = performance.now();

    const animateScroll = (currentTime: number) => {
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);

      element.scrollLeft = startPosition + distance * easeOut;

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };

    requestAnimationFrame(animateScroll);
  }

  deleteWorkout(identifier: number): void {
    try {
      const currentTabsCount =
        this.createOrEditTemplatePlanService.formScheda.listaAllenamentiForm
          .length;

      this.createOrEditTemplatePlanService.DeleteWorkout(identifier);

      // Gestisci l'indice dopo la cancellazione
      setTimeout(() => {
        const newTabsCount =
          this.createOrEditTemplatePlanService.formScheda.listaAllenamentiForm
            .length;

        if (newTabsCount === 0) {
          this.selectedTabIndex = 0;
        } else if (this.selectedTabIndex >= newTabsCount) {
          this.selectedTabIndex = newTabsCount - 1;
          // Forza l'aggiornamento del MatTabGroup
          if (this.tabGroup) {
            this.tabGroup.selectedIndex = this.selectedTabIndex;
          }
        }
      }, 100);
      this.cdr.detectChanges();
    } catch (error) {
      this.errorHandlerService.handleError(
        error,
        "CreateOrEditTemplatePlanComponent.deleteExercise"
      );
    }
  }

  /**
   * Metodo pubblico per navigare programmaticamente a una tab specifica
   */
  public goToTab(index: number): void {
    if (
      index >= 0 &&
      index <
        this.createOrEditTemplatePlanService.formScheda.listaAllenamentiForm
          .length
    ) {
      if (this.tabGroup) {
        this.tabGroup.selectedIndex = index;
      }
    }
  }

  openAddWorkoutModal() {
    try {
      // Devo creare un form da bindare all'html dell'add e passarlo al modal
      this.initializeNewWorkoutControl();

      this.modalService.open({
        warning: false, // Non è un warning, è un'aggiunta
        headerTemplate: this.headerAddWorkout,
        bodyTemplate: this.bodyAddWorkout,
        footerCloseTemplate: this.footerCloseAddWorkout,
        footerConfirmTemplate: this.footerConfirmAddWorkout,
        onConfirm: () => this.addWorkout(),
      });
    } catch (error) {
      this.errorHandlerService.handleError(
        error,
        "CreateOrEditTemplatePlanComponent.openDeleteModal"
      );
    }
  }

  private initializeNewWorkoutControl(): void {
    // Calcola il placeholder basato sulla posizione successiva
    const nextPosition =
      (this.createOrEditTemplatePlanService.formScheda?.listaAllenamentiForm
        ?.length || 0) + 1;
    const placeholder = `Giorno ${nextPosition}`;

    // Crea il FormControl con il placeholder come valore iniziale
    this.newWorkoutNameControl = new FormControl<string>(placeholder, {
      nonNullable: true,
    });
  }

  addWorkout() {
    try {
      // Mostra un breve spinner per l'aggiunta
      const addSpinnerId = this.spinnerService.showLoading(
        "Aggiunta allenamento..."
      );

      // Ottieni il valore dal FormControl
      let workoutName = this.newWorkoutNameControl.value?.trim();

      // Se è vuoto o uguale al placeholder, usa il placeholder
      const nextPosition =
        (this.createOrEditTemplatePlanService.formScheda?.listaAllenamentiForm
          ?.length || 0) + 1;
      const placeholder = `Giorno ${nextPosition}`;

      if (!workoutName || workoutName === placeholder) {
        workoutName = placeholder;
      }

      this.createOrEditTemplatePlanService.AddWorkout(workoutName);

      // Vai all'ultima tab (quella appena creata)
      const newTabIndex =
        this.createOrEditTemplatePlanService.formScheda.listaAllenamentiForm
          .length - 1;

      setTimeout(() => {
        this.selectedTabIndex = newTabIndex;
        if (this.tabGroup) {
          this.tabGroup.selectedIndex = newTabIndex;
        }

        // Nasconde lo spinner dopo l'operazione
        this.spinnerService.hide(addSpinnerId);
      }, 500);
      this.cdr.detectChanges();
    } catch (error) {
      this.errorHandlerService.handleError(
        error,
        "CreateOrEditTemplatePlanComponent.confirmAddWorkout"
      );
    }
  }

   onAttivazioneStateChange(newState: boolean) {
    try {
      this.createOrEditTemplatePlanService.formScheda.toggleActiveState(newState);
    } catch (error) {
      this.errorHandlerService.handleError(
        error,
        "CreateOrEditTemplatePlanComponent.OnAttivazioneStateChange"
      );
    }
  }

  savePlan(actionId: number) {
    try {
      // Mostra lo spinner di salvataggio
      this.saveSpinnerId = this.spinnerService.showWithResult(
        "Salvataggio in corso",
        {
          forceShow: true,
          successMessage: "Salvataggio completato con successo",
          errorMessage: "Errore durante il salvataggio",
          resultDuration: 500,
          minSpinnerDuration: 500,
        }
      );

        this.scheda = this.createOrEditTemplatePlanService.formScheda.getDatiSchedaDaSalvare();

      const user = this.authService.getCurrentUser();
      
      if (user) {
        const SaveDatiTemplateSchedaRequest: SaveDatiTemplateSchedaRequestModel =
          {
            schedaDTO:  this.scheda,
            userId: user.userId,
          };
        
        //ho messo un parametro actionId per distinguere duplicazione da salvataggio standard
        //se passo 0 -> duplicazione e metto schedaDTO.id !== 0
        //se passo 1 -> salvataggio standard non faccio nulla
        if (actionId===0){
          SaveDatiTemplateSchedaRequest.schedaDTO.id=-1;
          SaveDatiTemplateSchedaRequest.schedaDTO.schedaAttiva=false;
        }
        this.createOrEditTemplatePlanService
          .savePlan(SaveDatiTemplateSchedaRequest)
          .then((response) => {
            this.resetAll(response);

            if (this.saveSpinnerId) {
              this.spinnerService.setSuccess(this.saveSpinnerId);
            }
          })
          .catch((error) => {
            if (this.saveSpinnerId) {
              this.spinnerService.setError(
                this.saveSpinnerId,
                "Errore nella fase di salvataggio"
              );
            }
            this.errorHandlerService.handleError(
              error,
              "CreateOrEditTemplatePlanComponent.SavePlan"
            );
          });
      } else {
        throw new Error(
          "CreateOrEditTemplatePlanComponent.SavePlan: " + "nessun user trovato"
        );
      }
    } catch (error) {
      if (this.saveSpinnerId) {
        this.spinnerService.setError(this.saveSpinnerId);
      }
      this.errorHandlerService.handleError(
        error,
        "CreateOrEditTemplatePlanComponent.SavePlan"
      );
    }
  }

  resetAll(datiScheda: SchedaDTO) {
    try {
      this.selectedTabIndex = 0;
      this.scheda = datiScheda;
      this.createOrEditTemplatePlanService.resetAll();
      this.createOrEditTemplatePlanService.initializeFormWithData(datiScheda);
      this.cdr.detectChanges();
    } catch (error) {
      this.errorHandlerService.handleError(
        error,
        "CreateOrEditTemplatePlanComponent.resetAll"
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
      this.errorHandlerService.handleError(
        error,
        "CreateOrEditTemplatePlanComponent.goBack"
      );
    }
  }
  openDeleteScheda() {
    try {
      this.modalService.open({
        warning: true,
        headerTemplate: this.headerDeleteTemplate,
        bodyTemplate: this.bodyDeleteTemplate,
        footerCloseTemplate: this.footerCloseDeleteTemplate,
        footerConfirmTemplate: this.footerConfirmDeleteTemplate,
        onConfirm: () => this.eliminaScheda(),
      });
    } catch (error) {
      this.errorHandlerService.handleError(
        error,
        "ViewTemplatePlan.openDeleteScheda"
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
        // Mostra lo spinner di inizializzazione
        this.currentSpinnerId = this.spinnerService.showWithResult(
          "Elimino dati scheda",
          {
            forceShow: true,
            successMessage: "Scheda eliminata con successo",
            errorMessage: "Errore nell'eliminare la scheda",
            resultDuration: 250,
            minSpinnerDuration: 250,
          }
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
            // Naviga alla lista dei template
            this.router.navigate(["/le-mie-schede"]);
          })
          .catch((objError) => {
            if (this.currentSpinnerId) {
              this.spinnerService.setError(this.currentSpinnerId);
            }
            this.errorHandlerService.handleError(
              objError,
              "CreateOrEditTemplatePlanComponent.getListaTemplateSchede"
            );
          });
      } else {
        this.router.navigate(["/le-mie-schede"]);
      }
    } catch (error) {
      if (this.currentSpinnerId) {
        this.spinnerService.setError(this.currentSpinnerId);
      }
      this.errorHandlerService.handleError(
        error,
        "CreateOrEditTemplatePlanComponent.getListaTemplateSchede"
      );
    }
  }
}
