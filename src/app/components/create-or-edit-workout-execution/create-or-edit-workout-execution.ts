import {
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
  ChangeDetectorRef,
  ViewChildren,
  QueryList,
  ElementRef,
} from "@angular/core";
import { ErrorHandlerService } from "src/app/core/services/error-handler.service";
import { SpinnerService } from "src/app/core/services/spinner.service";
import { CreateOrEditWorkoutExecutionService } from "./create-or-edit-workout-execution-service";
import { ReactiveFormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatTabsModule } from "@angular/material/tabs";
import { ExerciseComponent } from "../create-or-edit-template-plan-component/workout-component/exercise-component/exercise-component";
import {
  MultiOptionButton,
  multiOptionGroup,
  OptionSelectedEvent,
} from "../shared/multi-option-button/multi-option-button";
import { Router } from "@angular/router";
import { AllenamentoDTO as AllenamentoFormDTO } from "src/app/models/create-or-edit-template-or-entity-form-dto/allenamentodto";
import { AllenamentoDTO } from "src/app/models/view-modifica-allenamento-svolto/allenamentodto";
import { EsercizioDTO } from "src/app/models/view-modifica-allenamento-svolto/eserciziodto";
import { SerieDTO } from "src/app/models/view-modifica-allenamento-svolto/seriedto";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { RegistraAllenamentoRequestModel } from "src/app/models/view-modifica-allenamento-svolto/registra-allenaneto";
import { MatNativeDateModule } from "@angular/material/core";
import { MatInput } from "@angular/material/input";
import { GetDatiAllenamentoRequestModel } from "src/app/models/view-modifica-allenamento-svolto/get-dati-allenamento";
import { GetDatiTemplateNuovoAllenamentoRequestModel } from "src/app/models/view-modifica-allenamento-svolto/get-dati-template-nuovo-allenamento";
import { ModalService } from "src/app/core/services/modal.service";
import { LoadingProgression } from "src/app/models/enums/loading-progression";
import { DeleteDatiAllenamentoRequestModel } from "src/app/models/view-modifica-allenamento-svolto/deleteDatiAllenamentoSvolto";
import { AuthService } from "../../core/services/auth.service";
import { LongPressDirective } from "../shared/directives/long-press.directive";
import { FocusOverlayService } from "../shared/focus-overlay/focus-overlay.service";
import { ReorderExerciseComponent } from "../create-or-edit-template-plan-component/workout-component/reorder-exercise-component/reorder-exercise-component";
import gsap from "gsap";
import { Observable, Subject } from "rxjs";
import { MatIcon, MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";
import { MenuConfigService } from "src/app/core/services/menu-config.service";
import { HapticService } from "src/app/core/services/haptic.service";

@Component({
  selector: "app-create-or-edit-workout-execution",
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatTabsModule,
    ExerciseComponent,
    MultiOptionButton,
    MatInput,
    MatDatepickerModule,
    MatNativeDateModule,
    LongPressDirective,
    MatIcon,
  ],
  templateUrl: "./create-or-edit-workout-execution.html",
  styleUrl: "./create-or-edit-workout-execution.scss",
})
export class CreateOrEditWorkoutExecution implements OnInit, OnDestroy {
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

  @ViewChildren("exerciseCard", { read: ElementRef })
  exerciseCardElements!: QueryList<ElementRef>;
  @ViewChild("exerciseDataContainer", { read: ElementRef })
  exerciseDataContainer!: ElementRef;

  private initSpinnerId: string | null = null;
  private saveSpinnerId: string | null = null;

  public accordionOpenKeys: string[] = [];

  public idTemplateAllenamento: number = 0;
  public idAllenamento: number = 0;
  public allenamentoDTO: AllenamentoDTO | null = null;
  public createOrEdit: createOrEdit | null = null;

  public createOrEditEnum = createOrEdit;

  public LoadingProgressionEnum = LoadingProgression;
  public loadingProgression: LoadingProgression = LoadingProgression.none;

  public isCompactMode: boolean = false; // Stato per modalità compatta

  // Definisci le opzioni del pulsante
  public rightButtonOptionsGroup: multiOptionGroup[] = [];

  public leftButtonOptionsGroup: multiOptionGroup[] = [
    {
      id: 1,
      label: "",
      options: [
        {
          optionId: 1,
          color: "#ff0000",
          description: "Elimina allenamento",
        },
      ],
    },
  ];

  canDeactivate(): Observable<boolean> | boolean {
    if (
      this.createOrEditWorkoutExecutionService.AllenamentoForm.form.pristine
    ) {
      return true;
    }

    // Creiamo un Subject che emetterà true (naviga) o false (resta)
    const navigationResponse$ = new Subject<boolean>();

    // Apriamo il modale
    this.modalService.open({
      warning: true,
      headerTemplate: this.headerGoBack,
      bodyTemplate: this.bodyGoBack,
      footerCloseTemplate: this.footerCloseGoBack,
      footerConfirmTemplate: this.footerConfirmGoBack,
      onConfirm: () => {
        navigationResponse$.next(true);
        navigationResponse$.complete();
      },
      onClose: () => {
        navigationResponse$.next(false);
        navigationResponse$.complete();
      },
    });

    return navigationResponse$.asObservable();
  }

  constructor(
    private errorHandlerService: ErrorHandlerService,
    private spinnerService: SpinnerService,
    public createOrEditWorkoutExecutionService: CreateOrEditWorkoutExecutionService,
    private router: Router,
    private modalService: ModalService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    public focusOverlayService: FocusOverlayService,
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer,
    private menuConfigService: MenuConfigService,
    private hapticService: HapticService,
  ) {
    try {
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

      const navigation = this.router.getCurrentNavigation();
      const state = navigation?.extras.state as {
        idTemplateAllenamento: number;
        idAllenamento: number;
        createOrEdit: createOrEdit;
        allenamentoDTO: AllenamentoDTO;
      };

      if (state?.idTemplateAllenamento) {
        this.idTemplateAllenamento = state.idTemplateAllenamento;
      }

      if (state?.idAllenamento) {
        this.idAllenamento = state.idAllenamento;
      }

      if (state?.allenamentoDTO) {
        this.allenamentoDTO = state.allenamentoDTO;
      }

      if (state?.createOrEdit) {
        this.createOrEdit = state.createOrEdit;
      }
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "CreateOrEditWorkoutExecution.constructor",
      );
    }
  }

  ngOnInit(): void {
    try {
      let navigationText: string = "";

      if (!this.idAllenamento) {
        navigationText = "Nuovo allenamento";
      } else {
        navigationText = "Modifica allenamento";
      }

      this.menuConfigService.setCloseModal(() => this.goBack(), navigationText);

      this.initializeWorkout();
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "CreateOrEditWorkoutExecution.ngOnInit",
      );
    }
  }

  ngOnDestroy(): void {
    // Chiudi eventuali spinner attivi
    if (this.initSpinnerId) {
      this.spinnerService.hide(this.initSpinnerId);
    }
    if (this.saveSpinnerId) {
      this.spinnerService.hide(this.saveSpinnerId);
    }
  }

  /**
   * Toggle della modalità compatta per il riordino degli esercizi
   */
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
        "CreateOrEditWorkoutExecution.toggleCompactMode",
      );
    }
  }

  /**
   * Gestisce la logica dopo l'animazione CSS
   */
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
        component: ReorderExerciseComponent,
        data: {
          exercises:
            this.createOrEditWorkoutExecutionService.AllenamentoForm
              .listaEserciziForm,
          containerPosition: containerPosition,
        },
        dismissOnBackdrop: false,
        onDismiss: () => {
          console.log("Overlay chiuso!");
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

      controller.registerApplyNewOrderFn((orderedIdentifiers: number[]) => {
        this.createOrEditWorkoutExecutionService.AllenamentoForm.reorderExercisesByIdentifiers(
          orderedIdentifiers,
        );
        this.cdr.detectChanges();
      });
    }
  }

  /**
   * Imposta la visibilità delle card originali
   */
  private setOriginalCardsVisibility(visible: boolean): void {
    if (this.exerciseDataContainer) {
      const containerEl = this.exerciseDataContainer
        .nativeElement as HTMLElement;
      gsap.set(containerEl, { autoAlpha: visible ? 1 : 0 });
    }
  }

  // Nuovo metodo unificato nel component
  initializeWorkout() {
    try {
      this.loadingProgression = LoadingProgression.loading;

      switch (this.createOrEdit) {
        case createOrEdit.create:
          this.getDatiTemplateNuovoAllenamento();
          break;
        case createOrEdit.edit:
          if (this.allenamentoDTO) {
            try {
              this.initSpinnerId = this.spinnerService.showWithResult(
                "Recupero dati allenamento",
                {
                  successMessage: "Dati recuperati con successo",
                  errorMessage: "Errore nel recupero dei dati",
                  resultDuration: 250,
                  minSpinnerDuration: 250,
                },
              );

              this.createOrEditWorkoutExecutionService.InitializeAllenamento(
                this.allenamentoDTO,
              );

              this.loadingProgression = LoadingProgression.complete;

              if (this.initSpinnerId) {
                this.spinnerService.setSuccess(this.initSpinnerId);
              }
            } catch (error) {
              if (this.initSpinnerId) {
                this.spinnerService.setError(this.initSpinnerId);
              }
              this.errorHandlerService.logError(
                error,
                "CreateOrEditWorkoutExecution.getDatiAllenamento",
              );
              this.loadingProgression = LoadingProgression.failed;
            }
          } else if (this.idAllenamento) {
            this.getDatiAllenamento();

          } else {
            this.loadingProgression = LoadingProgression.failed;
            throw new Error("Nessun allenamento fornito");
          }
          break;
      }


    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "CreateOrEditWorkoutExecution.initializeWorkout",
      );
      this.loadingProgression = LoadingProgression.failed;
    }
  }

  getDatiAllenamento() {
    try {
      this.initSpinnerId = this.spinnerService.showWithResult(
        "Recupero dati allenamento",
        {
          successMessage: "Dati recuperati con successo",
          errorMessage: "Errore nel recupero dei dati",
          resultDuration: 250,
          minSpinnerDuration: 250,
        },
      );

      if (this.idAllenamento !== null && this.idAllenamento > 0) {
        const request: GetDatiAllenamentoRequestModel = {
          idAllenamento: this.idAllenamento,
        };

        this.createOrEditWorkoutExecutionService
          .GetDatiAllenamento(request)
          .then((response) => {
            if (!response.errore?.error) {
              if (this.initSpinnerId) {
                this.spinnerService.setSuccess(this.initSpinnerId);
              }
              this.loadingProgression = LoadingProgression.complete;
            } else {
              if (this.initSpinnerId) {
                this.spinnerService.setError(this.initSpinnerId);
              }
              this.errorHandlerService.logError(
                response.errore.error,
                "CreateOrEditWorkoutExecution.getDatiAllenamento",
              );
              this.loadingProgression = LoadingProgression.failed;
            }
          })
          .catch((error) => {
            if (this.initSpinnerId) {
              this.spinnerService.setError(this.initSpinnerId);
            }
            this.loadingProgression = LoadingProgression.failed;
            throw new Error(error);
          });
      } else {
        if (this.initSpinnerId) {
          this.spinnerService.setError(this.initSpinnerId);
        }
        this.errorHandlerService.logError(
          "nessun id allenamento trovato",
          "CreateOrEditWorkoutExecution.getDatiAllenamento",
        );
        this.loadingProgression = LoadingProgression.failed;
      }
    } catch (error) {
      if (this.initSpinnerId) {
        this.spinnerService.setError(this.initSpinnerId);
      }
      this.errorHandlerService.logError(
        error,
        "CreateOrEditWorkoutExecution.getDatiAllenamento",
      );
      this.loadingProgression = LoadingProgression.failed;
    }
  }

  getDatiTemplateNuovoAllenamento() {
    try {
      this.initSpinnerId = this.spinnerService.showWithResult(
        "Recupero dati nuovo allenamento",
        {
          successMessage: "Dati recuperati con successo",
          errorMessage: "Errore nel recupero dei dati",
          resultDuration: 250,
          minSpinnerDuration: 250,
        },
      );

      if (
        this.idTemplateAllenamento !== null &&
        this.idTemplateAllenamento > 0
      ) {
        const request: GetDatiTemplateNuovoAllenamentoRequestModel = {
          idTemplateAllenamento: this.idTemplateAllenamento,
        };

        this.createOrEditWorkoutExecutionService
          .GetDatiTemplateNuovoAllenamento(request)
          .then((response) => {
            if (!response.errore?.error) {
              this.loadingProgression = LoadingProgression.complete;
              this.rightButtonOptionsGroup = [
                {
                  id: 1,
                  label: "",
                  options: response.opzioniAltriAllenamenti.map((o) => {
                    return {
                      description: o.description,
                      optionId: o.id,
                      color: " #fff",
                    };
                  }),
                },
              ];
              if (this.initSpinnerId) {
                this.spinnerService.setSuccess(this.initSpinnerId);
              }
            } else {
              if (this.initSpinnerId) {
                this.spinnerService.setError(this.initSpinnerId);
              }
              this.errorHandlerService.logError(
                response.errore.error,
                "CreateOrEditWorkoutExecution.getDatiTemplateNuovoAllenamento",
              );
              this.loadingProgression = LoadingProgression.failed;
            }
          })
          .catch((error) => {
            if (this.initSpinnerId) {
              this.spinnerService.setError(this.initSpinnerId);
            }
            this.errorHandlerService.logError(
              error,
              "CreateOrEditWorkoutExecution.getDatiTemplateNuovoAllenamento",
            );
            this.loadingProgression = LoadingProgression.failed;
          });
      } else {
        if (this.initSpinnerId) {
          this.spinnerService.setError(this.initSpinnerId);
        }
        this.errorHandlerService.logError(
          "nessun id allenamento trovato",
          "CreateOrEditWorkoutExecution.getDatiTemplateNuovoAllenamento",
        );
        this.loadingProgression = LoadingProgression.failed;
      }
    } catch (error) {
      if (this.initSpinnerId) {
        this.spinnerService.setError(this.initSpinnerId);
      }
      this.errorHandlerService.logError(
        error,
        "CreateOrEditWorkoutExecution.getDatiAllenamento",
      );
      this.loadingProgression = LoadingProgression.failed;
    }
  }

  deleteEexercise(identifier: number) {
    try {
      this.hapticService.trigger('error');
      this.createOrEditWorkoutExecutionService.AllenamentoForm.deleteEsercizio(
        identifier,
      );
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "CreateOrEditWorkoutExecution.deleteEexercise",
      );
    }
  }

  addNuovoEsercizio() {
    try {
      this.hapticService.trigger('medium');
      this.createOrEditWorkoutExecutionService.AllenamentoForm.addEsercizioForm(
        undefined,
      );
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "CreateOrEditWorkoutExecution.addNuovoEsercizio",
      );
    }
  }

  onOptionSelected(option: OptionSelectedEvent) {
    switch (option.side) {
      case "right":
        switch (option.groupId) {
          case 1:
            this.idTemplateAllenamento = option.optionId;
            this.createOrEditWorkoutExecutionService.resetData();
            this.initializeWorkout();
            break;
        }
        break;
      case "left":
        switch (option.groupId) {
          case 1:
            this.openDeleteAllenamento();
            break;
        }
    }
  }

  registraAllenamento() {
    try {
      this.hapticService.trigger('success');
      let allenamentoForm: AllenamentoFormDTO =
        this.createOrEditWorkoutExecutionService.AllenamentoForm.getDatiAllenamentoDaSalvare();

      const allenamentoDaSalvare: AllenamentoDTO | null =
        this.ConvertAllenamentoFormDTOToAllenamentoDTO(allenamentoForm);

      const user = this.authService.getCurrentUser();
      if (allenamentoDaSalvare != null && user != null) {
        const registraAllenamentoRequest: RegistraAllenamentoRequestModel = {
          dataSvolgimento:
            this.createOrEditWorkoutExecutionService.AllenamentoForm.form
              .controls["dataEsecuzione"].value,
          allenamentoDTO: allenamentoDaSalvare,
          userId: user.userId,
        };

        if (allenamentoDaSalvare) {
          if (this.createOrEdit === createOrEdit.edit) {
            this.saveSpinnerId = this.spinnerService.showWithResult(
              "Salvataggio in corso",
              {
                forceShow: true,
                successMessage: "Salvataggio completato con successo",
                errorMessage: "Errore durante il salvataggio",
                resultDuration: 1000,
                minSpinnerDuration: 500,
              },
            );

            this.createOrEditWorkoutExecutionService
              .aggiornaAllenamentoSvolto(registraAllenamentoRequest)
              .then(async (response) => {
                if (this.saveSpinnerId) {
                  await this.spinnerService.setSuccess(this.saveSpinnerId);
                }

                // Marca il form come pristine dopo il salvataggio con successo
                this.createOrEditWorkoutExecutionService.AllenamentoForm.form.markAsPristine();

                if (response.allenamentoCorrente) {
                  // TODO al momento il server non ci manda indietro l'allenamento corrente. Da implementare così da evitare un chiamata indietro
                  this.idAllenamento = response.allenamentoCorrente.id;
                  this.allenamentoDTO = response.allenamentoCorrente;
                } else {
                  // Se non troviamo l'allenamento, forziamo il componente ad effettuare la chiamata per recuperare l'allenamento corrente.
                  // Se rivediamo la gestione, sarebbe da avvisare l'utente che l'allenamento non è stato trovato con un errore.
                  this.allenamentoDTO = null;
                }

                this.initializeWorkout();
              })
              .catch(async (error) => {
                if (this.saveSpinnerId) {
                  await this.spinnerService.setError(
                    this.saveSpinnerId,
                    "Errore nella fase di salvataggio",
                  );
                }
                this.errorHandlerService.logError(
                  error,
                  "CreateOrEditWorkoutExecution.registraAllenamento",
                );
              });
          } else {
            this.saveSpinnerId = this.spinnerService.showWithResult(
              "Salvataggio in corso",
              {
                forceShow: true,
                successMessage:
                  "Salvataggio completato con successo, redirect a home",
                errorMessage: "Errore durante il salvataggio",
                resultDuration: 1000,
                minSpinnerDuration: 500,
              },
            );

            this.createOrEditWorkoutExecutionService
              .registraAllenamento(registraAllenamentoRequest)
              .then(async (response) => {
                if (this.saveSpinnerId) {
                  await this.spinnerService.setSuccess(this.saveSpinnerId);
                }
                this.createOrEditWorkoutExecutionService.AllenamentoForm.form.markAsPristine();
                this.router.navigate(["/home"]);
              })
              .catch(async (error) => {
                if (this.saveSpinnerId) {
                  await this.spinnerService.setError(
                    this.saveSpinnerId,
                    "Errore nella fase di salvataggio",
                  );
                }
                this.errorHandlerService.logError(
                  error,
                  "CreateOrEditWorkoutExecution.registraAllenamento",
                );
              });
          }
        }
      }
    } catch (error) {
      if (this.saveSpinnerId) {
        this.spinnerService.setError(this.saveSpinnerId);
      }
      this.errorHandlerService.logError(
        error,
        "CreateOrEditWorkoutExecution.registraAllenamento",
      );
    }
  }

  ConvertAllenamentoFormDTOToAllenamentoDTO(
    allenamentoForm: AllenamentoFormDTO,
  ): AllenamentoDTO | null {
    try {
      const allenamentoDTO: AllenamentoDTO = {
        id: allenamentoForm.idTemplate,
        idTemplate: allenamentoForm.idTemplate,
        description: allenamentoForm.description,
        dataEsecuzione: allenamentoForm.dataEsecuzione,
        nomeScheda: null,
        listaEsercizi: [],
        nomeAllenamento: allenamentoForm.nomeAllenamento,
        ordinamento: allenamentoForm.ordinamento,
      };

      allenamentoForm.listaEsercizi.forEach((esercizioForm) => {
        const esercizioDTO: EsercizioDTO = {
          id: esercizioForm.id,
          idTemplate: esercizioForm.idTemplate,
          description: esercizioForm.description,
          idIconaEsercizio: esercizioForm.idIconaEsercizio,
          idMetodologia: esercizioForm.idMetodologia,
          idTipoEsercizio: esercizioForm.idTipoEsercizio,
          listaSerie: [],
          ordinamento: esercizioForm.ordinamento,
        };

        esercizioForm.listaSerie.forEach((serieForm) => {
          const serieDTO: SerieDTO = {
            id: serieForm.id,
            idTemplate: serieForm.idTemplate,
            carico: serieForm.carico,
            ordinamento: serieForm.ordinamento,
            ripetizioni: serieForm.ripetizioni,
          };

          esercizioDTO.listaSerie.push(serieDTO);
        });

        allenamentoDTO.listaEsercizi.push(esercizioDTO);
      });

      return allenamentoDTO;
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "CreateOrEditWorkoutExecution.ConvertAllenamentoFormDTOToAllenamentoDTO",
      );
      return null;
    }
  }

  goBack() {
    try {
      if (this.createOrEditWorkoutExecutionService.AllenamentoForm.form.dirty) {
        this.modalService.open({
          warning: true,
          headerTemplate: this.headerGoBack,
          bodyTemplate: this.bodyGoBack,
          footerCloseTemplate: this.footerCloseGoBack,
          footerConfirmTemplate: this.footerConfirmGoBack,
          onConfirm: () => {
            this.createOrEditWorkoutExecutionService.AllenamentoForm.form.markAsPristine();
            this.PerformBackNavigate();
          },
        });
      } else {
        this.PerformBackNavigate();
      }
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "CreateOrEditWorkoutExecution.goBack",
      );
    }
  }

  openDeleteAllenamento() {
    try {
      this.hapticService.trigger('error');
      this.modalService.open({
        warning: true,
        headerTemplate: this.headerDeleteTemplate,
        bodyTemplate: this.bodyDeleteTemplate,
        footerCloseTemplate: this.footerCloseDeleteTemplate,
        footerConfirmTemplate: this.footerConfirmDeleteTemplate,
        onConfirm: () => this.eliminaAllenamento(),
      });
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "ViewTemplatePlan.openDeleteScheda",
      );
    }
  }

  eliminaAllenamento() {
    try {
      if (
        this.createOrEditWorkoutExecutionService.AllenamentoForm.form.controls[
          "id"
        ].value !== null &&
        this.createOrEditWorkoutExecutionService.AllenamentoForm.form.controls[
          "id"
        ].value > 0
      ) {
        this.initSpinnerId = this.spinnerService.showWithResult(
          "Elimino dati allenamento",
          {
            forceShow: true,
            successMessage: "Allenamento eliminato con successo",
            errorMessage: "Errore nell'eliminare la scheda",
            resultDuration: 250,
            minSpinnerDuration: 250,
          },
        );

        const request: DeleteDatiAllenamentoRequestModel = {
          allenamentoId:
            this.createOrEditWorkoutExecutionService.AllenamentoForm.form
              .controls["id"].value,
        };

        this.createOrEditWorkoutExecutionService
          .eliminaAllenamento(request)
          .then((objResponse) => {
            if (this.initSpinnerId) {
              this.spinnerService.setSuccess(this.initSpinnerId);
            }
            this.PerformDeleteNavigate();
          })
          .catch((objError) => {
            if (this.initSpinnerId) {
              this.spinnerService.setError(this.initSpinnerId);
            }
            this.errorHandlerService.logError(
              objError,
              "CreateOrEditWorkoutExecution.getListaTemplateSchede",
            );
          });
      } else {
        this.PerformDeleteNavigate();
      }
    } catch (error) {
      if (this.initSpinnerId) {
        this.spinnerService.setError(this.initSpinnerId);
      }
      this.errorHandlerService.logError(
        error,
        "CreateOrEditWorkoutExecution.getListaTemplateSchede",
      );
    }
  }

  PerformBackNavigate() {
    try {
      switch (this.createOrEdit) {
        case createOrEdit.create:
          this.router.navigate(["/home"]);
          break;
        case createOrEdit.edit:
          if (this.allenamentoDTO) {
            this.router.navigate([
              "/allenamenti-svolti/visualizza-allenamento",
              this.allenamentoDTO.id,
            ]);
          } else if (this.idAllenamento) {
            this.router.navigate([
              "/allenamenti-svolti/visualizza-allenamento",
              this.idAllenamento,
            ]);
          } else {
            throw new Error("Nessun allenamento fornito");
          }
          break;
      }
    } catch (error) {
      throw new Error("CreateOrEditWorkoutExecution.PerformNavigate: " + error);
    }
  }

  PerformDeleteNavigate() {
    try {
      switch (this.createOrEdit) {
        case createOrEdit.create:
          this.router.navigate(["/home"]);
          break;
        case createOrEdit.edit:
          this.router.navigate(["/allenamenti-svolti/"]);
          break;
      }
    } catch (error) {
      throw new Error("CreateOrEditWorkoutExecution.PerformNavigate: " + error);
    }
  }
}

export enum createOrEdit {
  create = 1,
  edit = 2,
}
