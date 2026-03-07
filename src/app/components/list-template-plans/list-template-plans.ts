// list-template-plans.component.ts
import {
  Component,
  OnInit,
  AfterViewInit,
  QueryList,
  ViewChildren,
  ElementRef,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { ErrorHandlerService } from "src/app/core/services/error-handler.service";
import { SchedaListaDTO } from "src/app/models/lista-template-schede/schedalistadto";
import { CommonModule } from "@angular/common";
import { SpinnerService } from "src/app/core/services/spinner.service";
import { WorkoutService } from "src/app/core/services/workout.service";
import { AuthService } from "src/app/core/services/auth.service";
import {
  GetListaTemplatesSchedaRequestModel,
  GetListaTemplatesSchedaResponseModel,
} from "src/app/models/lista-template-schede/get-lista-templates-schede";
import { Router } from "@angular/router";
import { ReactiveFormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { ModalService } from "src/app/core/services/modal.service";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import {
  DeleteDatiTemplateSchedaRequestModel,
  DeleteDatiTemplateSchedaResponseModel,
} from "src/app/models/view-modifica-scheda/deleteDatiTemplateScheda";
import {
  MultiOptionButton,
  multiOptionGroup,
  OptionSelectedEvent,
} from "../shared/multi-option-button/multi-option-button";
import { MatIcon, MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";
import { MenuConfigService } from "src/app/core/services/menu-config.service";
import { HapticService } from "src/app/core/services/haptic.service";

// Registra il plugin Draggable
gsap.registerPlugin(Draggable);

@Component({
  selector: "app-list-template-plans",
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MultiOptionButton,
    MatIcon,
  ],
  templateUrl: "./list-template-plans.html",
  styleUrl: "./list-template-plans.scss",
})
export class ListTemplatePlans implements OnInit, AfterViewInit {
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
          color: " #fff",
          description: "Importa scheda",
        },
        {
          optionId: 2,
          color: " #fff",
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
    private modalService: ModalService,
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer,
    private menuConfigService: MenuConfigService,
    private hapticService: HapticService,
  ) {
    this.menuConfigService.setBackToRoute(
      "/",
      "back",
      "I tuoi template scheda",
    );

    iconRegistry.addSvgIcon(
      "google-arrow",
      sanitizer.bypassSecurityTrustResourceUrl(
        "assets/recollect/svg/google-arrow.svg",
      ),
    )
    iconRegistry.addSvgIcon(
      "google-delete",
      sanitizer.bypassSecurityTrustResourceUrl(
        "assets/recollect/svg/google-delete.svg",
      ),
    );
  }

  ngOnInit(): void {
    try {
      this.Initialize();
    } catch (error) {
      this.errorHandlerService.logError(error, "ListTemplatePlans.ngOnInit");
    }
  }

  Initialize() {
    try {
      this.listaSchede = [];
      this.getListaTemplateSchede();
    } catch (error) {
      this.errorHandlerService.logError(error, "ListTemplatePlans.Initialize");
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
            ".delete-action",
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
        "ListTemplatePlans.initializeSwipe",
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
        // Disabilita pointer-events quando nascosto
        gsap.set(deleteButton, { pointerEvents: "none" });
      },
    });
    draggable.vars.isOpen = false;
  }

  private closeOtherSwipes(exceptIndex: number): void {
    this.schedaCards.forEach((cardRef, index) => {
      if (index === exceptIndex) return;
      const card = cardRef.nativeElement;
      const deleteButton = card.querySelector(".delete-action");
      const draggable = this.draggableInstances[index];

      if (draggable?.vars.isOpen && deleteButton) {
        this.closeSwipe(card, deleteButton, draggable);
      }
    });
  }

  private closeAllSwipes(): void {
    this.closeOtherSwipes(-1);
  }

  getListaTemplateSchede() {
    try {
      this.currentSpinnerId = this.spinnerService.showWithResult(
        "Recupero dati schede",
        {
          successMessage: "Dati recuperati con successo",
          errorMessage: "Errore nel recupero dei dati",
          resultDuration: 250,
          minSpinnerDuration: 250,
        },
      );

      const user = this.authService.getCurrentUser();

      if (user) {
        const request: GetListaTemplatesSchedaRequestModel = {
          userId: user.userId,
        };

        this.workoutService.getListaTemplatesScheda(request).subscribe({
          next: (response: GetListaTemplatesSchedaResponseModel) => {
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
                  "ListTemplatePlans.getListaTemplateSchede",
                );
              }
            } else {
              if (this.currentSpinnerId) {
                this.spinnerService.setError(this.currentSpinnerId);
              }
              this.errorHandlerService.logError(
                response.errore.error,
                "ListTemplatePlans.getListaTemplateSchede",
              );
            }
          },
          error: (error) => {
            if (this.currentSpinnerId) {
              this.spinnerService.setError(this.currentSpinnerId);
            }
            this.errorHandlerService.logError(
              error,
              "ListTemplatePlans.getListaTemplateSchede",
            );
          },
        });
      } else {
        throw new Error(
          "ListTemplatePlans.addEsercizioForm: " + "nessun user trovato",
        );
      }
    } catch (error) {
      if (this.currentSpinnerId) {
        this.spinnerService.setError(this.currentSpinnerId);
      }
      this.errorHandlerService.logError(
        error,
        "ListTemplatePlans.getListaTemplateSchede",
      );
    }
  }

  visualizzaDatiScheda(idScheda: number) {
    try {
      this.hapticService.trigger("light");
      this.closeAllSwipes();
      this.router.navigate(["/le-mie-schede/visualizza-scheda", idScheda]);
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "ListTemplatePlans.VisualizzaDatiScheda",
      );
    }
  }

  createNewScheda() {
    try {
      this.router.navigate(["/le-mie-schede/modifica-scheda"]);
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "ListTemplatePlans.VisualizzaDatiScheda",
      );
    }
  }

  guidaImportScheda() {
    this.workoutService.getGuidaImport().subscribe({
      next: (response: any) => {
        if (response instanceof Blob) {
          const blob = new Blob([response], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });
          const url = window.URL.createObjectURL(blob);

          const link = document.createElement("a");
          link.href = url;
          link.download = "GuidaImportSchedaExcel.xlsx";
          link.click();
          window.URL.revokeObjectURL(url);
        }
      },
      error: (error: any) => {
        this.errorHandlerService.logError(
          error,
          "ListTemplatePlans.guidaImportScheda",
        );
      },
    });
  }

  importScheda() {
    this.workoutService.importaScheda();
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
        "ListTemplatePlans.openDeleteScheda",
      );
    }
  }

  eliminaScheda(idScheda: number) {
    try {
      // Mostra lo spinner di inizializzazione
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

      if (idScheda !== null && idScheda > 0) {
        const request: DeleteDatiTemplateSchedaRequestModel = {
          workoutId: idScheda,
        };

        this.workoutService.deleteTemplateScheda(request).subscribe({
          next: (response: DeleteDatiTemplateSchedaResponseModel) => {
            if (!response.errore?.error) {
              if (this.currentSpinnerId) {
                this.spinnerService.setSuccess(this.currentSpinnerId);
              }
              this.Initialize();
            } else {
              if (this.currentSpinnerId) {
                this.spinnerService.setError(this.currentSpinnerId);
              }
              this.errorHandlerService.logError(
                response.errore.error,
                "ListTemplatePlans.eliminaScheda",
              );
            }
          },
          error: (error) => {
            if (this.currentSpinnerId) {
              this.spinnerService.setError(this.currentSpinnerId);
            }
            this.errorHandlerService.logError(
              error,
              "ListTemplatePlans.eliminaScheda",
            );
          },
        });
      } else {
        if (this.currentSpinnerId) {
          this.spinnerService.setError(this.currentSpinnerId);
        }
        this.errorHandlerService.logError(
          "Nessuna scheda trovata: ",
          "ListTemplatePlans.eliminaScheda",
        );
      }
    } catch (error) {
      if (this.currentSpinnerId) {
        this.spinnerService.setError(this.currentSpinnerId);
      }
      this.errorHandlerService.logError(
        error,
        "ListTemplatePlans.eliminaScheda",
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
                this.importScheda();
                break;
              case 2:
                this.guidaImportScheda();
                break;
            }
            break;
        }
        break;
    }
  }
}
