import { Component, ElementRef, inject, QueryList, TemplateRef, ViewChild, ViewChildren } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "src/app/core/services/auth.service";
import { ErrorHandlerService } from "src/app/core/services/error-handler.service";
import { ModalService } from "src/app/core/services/modal.service";
import { HapticService } from "src/app/core/services/haptic.service";
import { SpinnerService } from "src/app/core/services/spinner.service";
import { WorkoutService } from "src/app/core/services/workout.service";
import { SchedaListaDTO } from "src/app/models/lista-schede-svolte/schedalistadto";
import { DeleteDatiTemplateSchedaRequestModel, DeleteDatiTemplateSchedaResponseModel } from "src/app/models/view-modifica-scheda/deleteDatiTemplateScheda";
import { multiOptionGroup, OptionSelectedEvent } from "../shared/multi-option-button/multi-option-button";
import { CommonModule } from "@angular/common";
import { GetListaSchedeSvolteRequestModel, GetListaSchedeSvolteResponseModel } from "src/app/models/lista-schede-svolte/get-lista-schede-svolte";

@Component({
  selector: "app-list-executed-plans",
  imports: [CommonModule],
  templateUrl: "./list-executed-plans.html",
  styleUrl: "./list-executed-plans.scss",
})
export class ListExecutedPlans {
  private hapticService = inject(HapticService);
  @ViewChildren("schedaCard") schedaCards!: QueryList<ElementRef>;
  @ViewChild("headerDeleteTemplate") headerDeleteTemplate!: TemplateRef<any>;
  @ViewChild("bodyDeleteTemplate") bodyDeleteTemplate!: TemplateRef<any>;
  @ViewChild("footerCloseDeleteTemplate")
  footerCloseDeleteTemplate!: TemplateRef<any>;
  @ViewChild("footerConfirmDeleteTemplate")
  footerConfirmDeleteTemplate!: TemplateRef<any>;

  public listaSchede: SchedaListaDTO[] = [];
  public swipeStates: Map<number, boolean> = new Map();
  private draggableInstances: any[] = []; // Type as 'any' for GSAP Draggable instances
  private currentSpinnerId: string | null = null;

  public leftButtonOptionsGroup: multiOptionGroup[] = [
    {
      id: 1,
      label: "",
      options: [
        {
          optionId: 1,
          color: " rgba(0, 255, 225, 1)",
          description: "Importa scheda",
        },
        {
          optionId: 2,
          color: " rgba(0, 255, 225, 1)",
          description: "Download guida importazione",
        },
      ],
    },
  ];

  constructor(
    private errorHandlerService: ErrorHandlerService,
    private spinnerService: SpinnerService,
    private workoutService: WorkoutService,
    private authService: AuthService,
    private router: Router,
    private modalService: ModalService
  ) { }

  ngOnInit(): void {
    try {
      this.Initialize();
    } catch (error) {
      this.errorHandlerService.logError(error, "ListExecutedPlans.ngOnInit");
    }
  }

  Initialize() {
    try {
      this.listaSchede = [];
      this.getListaSchedeSvolte();
    } catch (error) {
      this.errorHandlerService.logError(error, "ListExecutedPlans.Initialize");
    }
  }

  ngAfterViewInit(): void {
    this.schedaCards.changes.subscribe(() => {
      this.initializeSwipe();
    });
    this.initializeSwipe();
  }

  ngOnDestroy(): void {
    this.draggableInstances.forEach((instance) => instance.kill());
  }

  private initializeSwipe(): void {
    try {
      this.draggableInstances.forEach((instance) => instance.kill());
      this.draggableInstances = [];

      // Usa setTimeout per assicurarti che il DOM sia completamente renderizzato
      setTimeout(() => {
        this.schedaCards.forEach((cardRef, index) => {
          const card = cardRef.nativeElement;
          const wrapper = card.closest(".scheda-wrapper");
          const deleteButton = wrapper?.querySelector(
            ".delete-action"
          ) as HTMLElement;

          if (!deleteButton) return;
          const schedaId = this.listaSchede[index].id;

          const SWIPE_THRESHOLD = -80;
          const DELETE_WIDTH = 80;

          // Imposta lo stato iniziale del bottone delete
          gsap.set(deleteButton, {
            autoAlpha: 0,
            pointerEvents: "none", // Disabilita inizialmente
          });

          const component = this;

          const draggableArray = Draggable.create(card, {
            type: "x",
            bounds: { minX: SWIPE_THRESHOLD, maxX: 0 },
            inertia: true,
            dragClickables: false, // Previene conflitti con i click
            zIndexBoost: false,
            onDrag: function (this: any) {
              const progress = Math.abs(this.x) / DELETE_WIDTH;
              const alpha = Math.min(progress, 1);

              gsap.to(deleteButton, {
                autoAlpha: alpha,
                duration: 0.1,
                overwrite: true,
              });

              // Abilita pointer-events quando diventa visibile
              if (alpha > 0.5) {
                gsap.set(deleteButton, { pointerEvents: "auto" });
              } else {
                gsap.set(deleteButton, { pointerEvents: "none" });
              }
            },
            onDragEnd: function (this: any) {
              if (this.x < SWIPE_THRESHOLD / 2) {
                // Apri swipe
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
                    // Assicurati che sia cliccabile
                    gsap.set(deleteButton, { pointerEvents: "auto" });
                  },
                });
                this.vars.isOpen = true;
              } else {
                // Chiudi swipe
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
                    // Disabilita pointer-events
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
      }, 0); // Il timeout a 0 sposta l'esecuzione dopo il rendering
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "ListExecutedPlans.initializeSwipe"
      );
    }
  }

  private closeSwipe(
    card: HTMLElement,
    deleteButton: Element,
    draggable: any
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
        // Disabilita pointer-events quando nascosto
        gsap.set(deleteButton, { pointerEvents: "none" });
      },
    });
    draggable.vars.isOpen = false;
  }

  private closeAllSwipes(): void {
    this.schedaCards.forEach((cardRef, index) => {
      const card = cardRef.nativeElement;
      const deleteButton = card.querySelector(".delete-action");
      const draggable = this.draggableInstances[index];

      if (draggable?.vars.isOpen) {
        this.closeSwipe(card, deleteButton, draggable);
      }
    });
  }

  getListaSchedeSvolte() {
    try {
      this.currentSpinnerId = this.spinnerService.showWithResult(
        "Recupero dati schede",
        {
          successMessage: "Dati recuperati con successo",
          errorMessage: "Errore nel recupero dei dati",
          resultDuration: 250,
          minSpinnerDuration: 250,
        }
      );

      const user = this.authService.getCurrentUser();

      if (user) {
        const request: GetListaSchedeSvolteRequestModel = {
          userId: user.userId,
        };

        this.workoutService.getListaSchedeSvolte(request).subscribe({
          next: (response: GetListaSchedeSvolteResponseModel) => {
            if (!response.errore?.error) {
              if (response.listaSchedeDTO) {
                this.listaSchede = response.listaSchedeDTO;
                if (this.currentSpinnerId) {
                  this.spinnerService.setSuccess(this.currentSpinnerId);
                }
              } else {
                if (this.currentSpinnerId) {
                  this.spinnerService.setError(this.currentSpinnerId);
                }
                this.errorHandlerService.logError(
                  response.errore.error,
                  "ListExecutedPlans.getListaSchedeSvolte"
                );
              }
            } else {
              if (this.currentSpinnerId) {
                this.spinnerService.setError(this.currentSpinnerId);
              }
              this.errorHandlerService.logError(
                response.errore.error,
                "ListExecutedPlans.getListaSchedeSvolte"
              );
            }
          },
          error: (error) => {
            if (this.currentSpinnerId) {
              this.spinnerService.setError(this.currentSpinnerId);
            }
            this.errorHandlerService.logError(
              error,
              "ListExecutedPlans.getListaSchedeSvolte"
            );
          },
        });
      } else {
        throw new Error(
          "ListExecutedPlans.getListaSchedeSvolte: " + "nessun user trovato"
        );
      }
    } catch (error) {
      if (this.currentSpinnerId) {
        this.spinnerService.setError(this.currentSpinnerId);
      }
      this.errorHandlerService.logError(
        error,
        "ListExecutedPlans.getListaSchedeSvolte"
      );
    }
  }

  visualizzaDatiScheda(idScheda: number) {
    try {
      this.closeAllSwipes();
      this.router.navigate(["/le-mie-schede/visualizza-scheda", idScheda]);
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "ListExecutedPlans.VisualizzaDatiScheda"
      );
    }
  }

  createNewScheda() {
    try {
      this.hapticService.trigger('medium');
      this.router.navigate(["/le-mie-schede/modifica-scheda"]);
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "ListExecutedPlans.VisualizzaDatiScheda"
      );
    }
  }

  openDeleteScheda(idScheda: number) {
    try {
      this.modalService.open({
        warning: true,
        headerTemplate: this.headerDeleteTemplate,
        bodyTemplate: this.bodyDeleteTemplate,
        footerCloseTemplate: this.footerCloseDeleteTemplate,
        footerConfirmTemplate: this.footerConfirmDeleteTemplate,
        onConfirm: () => this.eliminaScheda(idScheda),
      });
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "ListExecutedPlans.openDeleteScheda"
      );
    }
  }

  eliminaScheda(idScheda: number) {
    // try {
    //   // Mostra lo spinner di inizializzazione
    //   this.currentSpinnerId = this.spinnerService.showWithResult(
    //     "Elimino dati scheda",
    //     {
    //       forceShow: true,
    //       successMessage: "Scheda eliminata con successo",
    //       errorMessage: "Errore nell'eliminare la scheda",
    //       resultDuration: 250,
    //       minSpinnerDuration: 250,
    //     }
    //   );

    //   if (idScheda !== null && idScheda > 0) {
    //     const request: DeleteDatiTemplateSchedaRequestModel = {
    //       workoutId: idScheda,
    //     };

    //     this.workoutService.deleteTemplateScheda(request).subscribe({
    //       next: (response: DeleteDatiTemplateSchedaResponseModel) => {
    //         if (!response.errore?.error) {
    //           if (this.currentSpinnerId) {
    //             this.spinnerService.setSuccess(this.currentSpinnerId);
    //           }
    //           this.Initialize();
    //         } else {
    //           if (this.currentSpinnerId) {
    //             this.spinnerService.setError(this.currentSpinnerId);
    //           }
    //           this.errorHandlerService.logError(
    //             response.errore.error,
    //             "ListExecutedPlans.eliminaScheda"
    //           );
    //         }
    //       },
    //       error: (error) => {
    //         if (this.currentSpinnerId) {
    //           this.spinnerService.setError(this.currentSpinnerId);
    //         }
    //         this.errorHandlerService.logError(
    //           error,
    //           "ListExecutedPlans.eliminaScheda"
    //         );
    //       },
    //     });
    //   } else {
    //     if (this.currentSpinnerId) {
    //       this.spinnerService.setError(this.currentSpinnerId);
    //     }
    //     this.errorHandlerService.logError(
    //       "Nessuna scheda trovata: ",
    //       "ListExecutedPlans.eliminaScheda"
    //     );
    //   }
    // } catch (error) {
    //   if (this.currentSpinnerId) {
    //     this.spinnerService.setError(this.currentSpinnerId);
    //   }
    //   this.errorHandlerService.logError(
    //     error,
    //     "ListExecutedPlans.eliminaScheda"
    //   );
    // }
  }
}
