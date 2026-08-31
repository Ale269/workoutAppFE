import {
  Component,
  ElementRef,
  inject,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewChildren,
} from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "src/app/core/services/auth.service";
import { ErrorHandlerService } from "src/app/core/services/error-handler.service";
import { ModalService } from "src/app/core/services/modal.service";
import { ConfirmPopupService } from "src/app/core/services/confirm-popup.service";
import { HapticService } from "src/app/core/services/haptic.service";
import { SpinnerService } from "src/app/core/services/spinner.service";
import { WorkoutService } from "src/app/core/services/workout.service";
import { SchedaListaDTO } from "src/app/models/lista-schede-svolte/schedalistadto";
import {
  DeleteDatiTemplateSchedaRequestModel,
  DeleteDatiTemplateSchedaResponseModel,
} from "src/app/models/view-modifica-scheda/deleteDatiTemplateScheda";
import {
  multiOptionGroup,
  OptionSelectedEvent,
} from "../shared/multi-option-button/multi-option-button";
import { CommonModule } from "@angular/common";
import {
  GetListaSchedeSvolteRequestModel,
  GetListaSchedeSvolteResponseModel,
} from "src/app/models/lista-schede-svolte/get-lista-schede-svolte";
import { MatIcon, MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";
import { SwipeToDeleteController } from "src/app/core/services/swipe-to-delete.controller";

@Component({
  selector: "app-list-executed-plans",
  imports: [CommonModule, MatIcon],
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
  /** Swipe-to-delete condiviso: vedi SwipeToDeleteController. */
  private swipe = new SwipeToDeleteController({
    wrapperSelector: ".scheda-wrapper",
  });
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
    private modalService: ModalService,
    private confirmPopupService: ConfirmPopupService,
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer,
  ) {
    iconRegistry.addSvgIcon(
      "google-arrow",
      sanitizer.bypassSecurityTrustResourceUrl(
        "assets/recollect/svg/google-delete.svg",
      ),
    );
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

  private closeAllSwipes(): void {
    this.swipe.closeAll();
  }

  ngAfterViewInit(): void {
    this.schedaCards.changes.subscribe(() => {
      this.swipe.attach(this.schedaCards);
    });
    this.swipe.attach(this.schedaCards);
  }

  ngOnDestroy(): void {
    this.swipe.destroy();
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
        },
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
                  "ListExecutedPlans.getListaSchedeSvolte",
                );
              }
            } else {
              if (this.currentSpinnerId) {
                this.spinnerService.setError(this.currentSpinnerId);
              }
              this.errorHandlerService.logError(
                response.errore.error,
                "ListExecutedPlans.getListaSchedeSvolte",
              );
            }
          },
          error: (error) => {
            if (this.currentSpinnerId) {
              this.spinnerService.setError(this.currentSpinnerId);
            }
            this.errorHandlerService.logError(
              error,
              "ListExecutedPlans.getListaSchedeSvolte",
            );
          },
        });
      } else {
        throw new Error(
          "ListExecutedPlans.getListaSchedeSvolte: " + "nessun user trovato",
        );
      }
    } catch (error) {
      if (this.currentSpinnerId) {
        this.spinnerService.setError(this.currentSpinnerId);
      }
      this.errorHandlerService.logError(
        error,
        "ListExecutedPlans.getListaSchedeSvolte",
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
        "ListExecutedPlans.VisualizzaDatiScheda",
      );
    }
  }

  createNewScheda() {
    try {
      this.hapticService.trigger("medium");
      this.router.navigate(["/le-mie-schede/modifica-scheda"]);
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "ListExecutedPlans.VisualizzaDatiScheda",
      );
    }
  }

  openDeleteScheda(idScheda: number) {
    try {
      this.confirmPopupService.open({
        title: "Eliminare questa scheda?",
        message: "Questa azione non può essere annullata.",
        confirmText: "Elimina",
        onConfirm: () => this.eliminaScheda(idScheda),
      });
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "ListExecutedPlans.openDeleteScheda",
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
