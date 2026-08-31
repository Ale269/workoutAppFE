// list-template-plans.component.ts
import {
  Component,
  OnInit,
  AfterViewInit,
  QueryList,
  ViewChildren,
  ElementRef,
  TemplateRef,
  ViewChild } from "@angular/core";
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
import { ConfirmPopupService } from "src/app/core/services/confirm-popup.service";
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
import { InfiniteScrollController } from "src/app/core/services/infinite-scroll.controller";
import { DIMENSIONE_PAGINA_LISTE } from "src/app/models/paginazione/paginazione";


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

  /** Pagina successiva da chiedere; le pagine gia' scaricate restano in lista. */
  private pagina = 0;
  public caricandoAltro = false;

  private infiniteScroll = new InfiniteScrollController({
    onCaricaProssimaPagina: () => this.caricaProssimaPagina(),
  });

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
    private confirmPopupService: ConfirmPopupService,
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
      // Il page-scroller puo' essere stato ricreato da un @if del template.
      this.infiniteScroll.attach();
    });
    this.swipe.attach(this.schedaCards);
    this.infiniteScroll.attach();
  }

  ngOnDestroy(): void {
    this.swipe.destroy();
    this.infiniteScroll.detach();
  }

  /**
   * Prima pagina: azzera la lista e mostra lo spinner. Le pagine successive
   * arrivano da caricaProssimaPagina() senza spinner a tutto schermo, che
   * coprirebbe la lista che l'utente sta gia' leggendo.
   */
  getListaTemplateSchede() {
    this.pagina = 0;
    this.listaSchede = [];
    this.infiniteScroll.reset();

    this.currentSpinnerId = this.spinnerService.showWithResult(
      "Recupero dati schede",
      {
        forceShow: false,
        successMessage: "Dati recuperati con successo",
        errorMessage: "Errore nel recupero dei dati",
        resultDuration: 250,
        minSpinnerDuration: 250,
      },
    );

    this.caricaPagina(0, this.currentSpinnerId);
  }

  private caricaProssimaPagina(): void {
    this.caricaPagina(this.pagina, null);
  }

  private caricaPagina(pagina: number, spinnerId: string | null): void {
    try {
      const user = this.authService.getCurrentUser();
      if (!user) {
        throw new Error("ListTemplatePlans.caricaPagina: nessun user trovato");
      }

      this.infiniteScroll.segnalaCaricamentoIniziato();
      this.caricandoAltro = spinnerId === null;

      this.workoutService
        .getListaTemplatesSchedaPaginata({
          userId: user.userId,
          page: pagina,
          size: DIMENSIONE_PAGINA_LISTE,
        })
        .subscribe({
          next: (response: GetListaTemplatesSchedaResponseModel) => {
            this.caricandoAltro = false;

            if (response.errore?.error) {
              // Il flag va rilasciato anche sul ramo di errore, altrimenti
              // l'infinite scroll resta bloccato per il resto della sessione.
              this.infiniteScroll.segnalaCaricamentoFinito(true);
              if (spinnerId) this.spinnerService.setError(spinnerId);
              this.errorHandlerService.logError(
                response.errore.error,
                "ListTemplatePlans.caricaPagina",
              );
              return;
            }

            const nuovi = response.listaSchedeDTO ?? [];
            this.listaSchede = [...this.listaSchede, ...nuovi];

            this.pagina = pagina + 1;
            this.infiniteScroll.segnalaCaricamentoFinito(
              response.paginazione?.ultimaPagina ?? true,
            );

            if (spinnerId) this.spinnerService.setSuccess(spinnerId);
          },
          error: (error) => {
            this.caricandoAltro = false;
            this.infiniteScroll.segnalaCaricamentoFinito(true);
            if (spinnerId) this.spinnerService.setError(spinnerId);
            this.errorHandlerService.logError(
              error,
              "ListTemplatePlans.caricaPagina",
            );
          },
        });
    } catch (error) {
      this.caricandoAltro = false;
      this.infiniteScroll.segnalaCaricamentoFinito(true);
      if (spinnerId) this.spinnerService.setError(spinnerId);
      this.errorHandlerService.logError(error, "ListTemplatePlans.caricaPagina");
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
      this.confirmPopupService.open({
        title: "Eliminare questa scheda?",
        message: "Questa azione non può essere annullata.",
        confirmText: "Elimina",
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
