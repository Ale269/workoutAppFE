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
import { SwipeToDeleteController } from "src/app/core/services/swipe-to-delete.controller";


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
