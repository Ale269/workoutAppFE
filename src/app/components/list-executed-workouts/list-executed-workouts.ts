// list-executed-workouts.component.ts
import { CommonModule } from "@angular/common";
import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  QueryList,
  ViewChildren,
  ElementRef,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "src/app/core/services/auth.service";
import { ErrorHandlerService } from "src/app/core/services/error-handler.service";
import { SpinnerService } from "src/app/core/services/spinner.service";
import { WorkoutService } from "src/app/core/services/workout.service";
import { ModalService } from "src/app/core/services/modal.service";
import { AllenamentoSvoltoListaDTO } from "src/app/models/lista-allenamenti-svolti/allenamentosvoltolistadto";
import {
  GetListaAllenamentiSvoltiRequestModel,
  GetListaAllenamentiSvoltiResponseModel,
} from "src/app/models/lista-allenamenti-svolti/get-lista-templates-schede";
import { DeleteDatiAllenamentoRequestModel } from "src/app/models/view-modifica-allenamento-svolto/deleteDatiAllenamentoSvolto";
import { GetDatiAllenamentoResponseModel } from "src/app/models/view-modifica-allenamento-svolto/get-dati-allenamento";
import { MatIcon, MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";
import { MenuConfigService } from "src/app/core/services/menu-config.service";
import { HapticService } from "src/app/core/services/haptic.service";
import { SwipeToDeleteController } from "src/app/core/services/swipe-to-delete.controller";


export interface allenamentoSvoltoListaView {
  allenamentoSvolto: AllenamentoSvoltoListaDTO;
  giorniArray: number[];
}

@Component({
  selector: "app-list-executed-workouts",
  imports: [CommonModule, MatIcon],
  templateUrl: "./list-executed-workouts.html",
  styleUrl: "./list-executed-workouts.scss",
})
export class ListExecutedWorkouts implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren("allenamentoCard") allenamentoCards!: QueryList<ElementRef>;
  @ViewChild("headerDeleteTemplate") headerDeleteTemplate!: TemplateRef<any>;
  @ViewChild("bodyDeleteTemplate") bodyDeleteTemplate!: TemplateRef<any>;
  @ViewChild("footerCloseDeleteTemplate")
  footerCloseDeleteTemplate!: TemplateRef<any>;
  @ViewChild("footerConfirmDeleteTemplate")
  footerConfirmDeleteTemplate!: TemplateRef<any>;

  public listaAllenamentiSvolti: AllenamentoSvoltoListaDTO[] = [];
  public listaAllenamentiSvoltiView: allenamentoSvoltoListaView[] = [];
  /** Swipe-to-delete condiviso: vedi SwipeToDeleteController. */
  private swipe = new SwipeToDeleteController({
    wrapperSelector: ".allenamento-wrapper",
  });
  private currentSpinnerId: string | null = null;

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
      "Ultimi allenamenti svolti",
    );

    iconRegistry.addSvgIcon(
      "google-arrow",
      sanitizer.bypassSecurityTrustResourceUrl(
        "assets/recollect/svg/google-arrow.svg",
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
      this.errorHandlerService.logError(error, "ListExecutedWorkouts.ngOnInit");
    }
  }

  Initialize() {
    try {
      this.listaAllenamentiSvolti = [];
      this.listaAllenamentiSvoltiView = [];
      this.getListaAllenamentiSvolti();
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "ListExecutedWorkouts.Initialize",
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
    this.swipe.destroy();
  }

  async getListaAllenamentiSvolti() {
    try {
      this.currentSpinnerId = this.spinnerService.showWithResult(
        "Recupero dati allenamenti",
        {
          forceShow: false,
          successMessage: "Dati recuperati con successo",
          errorMessage: "Errore nel recupero dei dati",
          resultDuration: 250,
          minSpinnerDuration: 250,
        },
      );

      const user = this.authService.getCurrentUser();

      if (user) {
        const request: GetListaAllenamentiSvoltiRequestModel = {
          userId: user.userId,
        };

        this.workoutService.getListaAllenamentiSvolti(request).subscribe({
          next: async (response: GetListaAllenamentiSvoltiResponseModel) => {
            if (!response.errore?.error) {
              if (response.listaAllenamentiDTO) {
                this.listaAllenamentiSvolti = response.listaAllenamentiDTO;
                this.listaAllenamentiSvoltiView =
                  this.listaAllenamentiSvolti.map((el) => {
                    let giorniArray: number[] = [];

                    for (
                      let i = 1;
                      i <= el.numeroTotaleAllenamentiScheda;
                      i++
                    ) {
                      giorniArray.push(i);
                    }

                    return {
                      allenamentoSvolto: el,
                      giorniArray: giorniArray,
                    };
                  });
                if (this.currentSpinnerId) {
                  await this.spinnerService.setSuccess(this.currentSpinnerId);
                }
              } else {
                if (this.currentSpinnerId) {
                  await this.spinnerService.setError(this.currentSpinnerId);
                }
                this.errorHandlerService.logError(
                  response.errore.error,
                  "ListExecutedWorkouts.getListaAllenamentiSvolti",
                );
              }
            } else {
              if (this.currentSpinnerId) {
                await this.spinnerService.setError(this.currentSpinnerId);
              }
              this.errorHandlerService.logError(
                response.errore.error,
                "ListExecutedWorkouts.getListaAllenamentiSvolti",
              );
            }
          },
          error: async (error) => {
            if (this.currentSpinnerId) {
              await this.spinnerService.setError(this.currentSpinnerId);
            }
            this.errorHandlerService.logError(
              error,
              "ListExecutedWorkouts.getListaAllenamentiSvolti",
            );
          },
        });
      } else {
        throw new Error(
          "ListExecutedWorkouts.getListaAllenamentiSvolti: nessun user trovato",
        );
      }
    } catch (error) {
      if (this.currentSpinnerId) {
        await this.spinnerService.setError(this.currentSpinnerId);
      }
      this.errorHandlerService.logError(
        error,
        "ListExecutedWorkouts.getListaAllenamentiSvolti",
      );
    }
  }

  visualizzaDatiAllenamento(idAllenamento: number) {
    try {
      this.closeAllSwipes();
      this.router.navigate([
        "/allenamenti-svolti/visualizza-allenamento",
        idAllenamento,
      ]);
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "ListExecutedWorkouts.visualizzaDatiAllenamento",
      );
    }
  }

  openDeleteAllenamento(idAllenamento: number) {
    try {
      this.modalService.open({
        warning: true,
        headerTemplate: this.headerDeleteTemplate,
        bodyTemplate: this.bodyDeleteTemplate,
        footerCloseTemplate: this.footerCloseDeleteTemplate,
        footerConfirmTemplate: this.footerConfirmDeleteTemplate,
        onConfirm: () => this.eliminaAllenamento(idAllenamento),
      });
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "ListExecutedWorkouts.openDeleteScheda",
      );
    }
  }

  eliminaAllenamento(idAllenamento: number) {
    try {
      // Mostra lo spinner di inizializzazione
      this.currentSpinnerId = this.spinnerService.showWithResult(
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
        allenamentoId: idAllenamento,
      };

      this.workoutService.deleteDatiAllenamentoSvolto(request).subscribe({
        next: (response: GetDatiAllenamentoResponseModel) => {
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
              "ListExecutedWorkouts.modificaScheda",
            );
          }
        },
        error: (error) => {
          if (this.currentSpinnerId) {
            this.spinnerService.setError(this.currentSpinnerId);
          }
          this.errorHandlerService.logError(
            error,
            "ListExecutedWorkouts.modificaScheda",
          );
        },
      });
    } catch (error) {
      if (this.currentSpinnerId) {
        this.spinnerService.setError(this.currentSpinnerId);
      }
      this.errorHandlerService.logError(
        error,
        "CreateOrEditWorkoutExecution.ListExecutedWorkouts",
      );
    }
  }
}
