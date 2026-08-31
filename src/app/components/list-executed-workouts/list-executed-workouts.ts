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
  ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "src/app/core/services/auth.service";
import { ErrorHandlerService } from "src/app/core/services/error-handler.service";
import { SpinnerService } from "src/app/core/services/spinner.service";
import { WorkoutService } from "src/app/core/services/workout.service";
import { ModalService } from "src/app/core/services/modal.service";
import { ConfirmPopupService } from "src/app/core/services/confirm-popup.service";
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
import { InfiniteScrollController } from "src/app/core/services/infinite-scroll.controller";
import {
  MultiOptionButton,
  multiOptionGroup,
  OptionSelectedEvent,
} from "src/app/components/shared/multi-option-button/multi-option-button";
import { createOrEdit } from "../create-or-edit-workout-execution/create-or-edit-workout-execution";
import { WidgetsService } from "src/app/core/services/widgets.service";
import { DIMENSIONE_PAGINA_LISTE } from "src/app/models/paginazione/paginazione";


export interface allenamentoSvoltoListaView {
  allenamentoSvolto: AllenamentoSvoltoListaDTO;
  giorniArray: number[];
}

@Component({
  selector: "app-list-executed-workouts",
  imports: [CommonModule, MatIcon, MultiOptionButton],
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

  /** Le due strade per iniziare un allenamento. */
  public gruppiNuovoAllenamento: multiOptionGroup[] = [
    {
      id: 1,
      label: "",
      options: [
        { optionId: 1, color: "#fff", description: "Segui la scheda attiva" },
        { optionId: 2, color: "#fff", description: "Allenamento libero" },
      ],
    },
  ];

  /** Pagina successiva da chiedere; le pagine gia' scaricate restano in lista. */
  private pagina = 0;
  public caricandoAltro = false;

  private infiniteScroll = new InfiniteScrollController({
    onCaricaProssimaPagina: () => this.caricaProssimaPagina(),
  });

  constructor(
    private errorHandlerService: ErrorHandlerService,
    private spinnerService: SpinnerService,
    private workoutService: WorkoutService,
    private authService: AuthService,
    private router: Router,
    private modalService: ModalService,
    private confirmPopupService: ConfirmPopupService,
    private widgetsService: WidgetsService,
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

  onNuovoAllenamentoSelezionato(evento: OptionSelectedEvent): void {
    try {
      if (evento.optionId === 1) {
        this.seguiSchedaAttiva();
      } else {
        this.avviaAllenamentoLibero();
      }
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "ListExecutedWorkouts.onNuovoAllenamentoSelezionato",
      );
    }
  }

  /**
   * Stessa navigazione del widget "prossimo allenamento" della home: si chiede
   * al server qual e' il giorno da svolgere della scheda attiva e si apre
   * quello. La logica sta sul server, qui si riusa lo stesso endpoint invece
   * di riderivarla.
   */
  private seguiSchedaAttiva(): void {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    this.widgetsService
      .getDatiProssimoAllenamento({ userId: user.userId })
      .subscribe({
        next: (response: any) => {
          if (response?.errore?.error || !response?.idAllenamento) {
            this.errorHandlerService.logError(
              response?.errore?.error ?? "nessun allenamento da svolgere",
              "ListExecutedWorkouts.seguiSchedaAttiva",
            );
            return;
          }
          this.router.navigate(["/registra-allenamento/", response.idAllenamento], {
            state: {
              idAllenamento: null,
              idTemplateAllenamento: response.idAllenamento,
              createOrEdit: createOrEdit.create,
            },
          });
        },
        error: (error) => {
          this.errorHandlerService.logError(
            error,
            "ListExecutedWorkouts.seguiSchedaAttiva",
          );
        },
      });
  }

  /**
   * Allenamento libero: stessa pagina di registrazione, id template a 0.
   * Nessuna rotta dedicata e nessuna chiamata al server — non c'e' nessun
   * template da scaricare.
   */
  private avviaAllenamentoLibero(): void {
    this.router.navigate(["/registra-allenamento/", 0], {
      state: {
        idAllenamento: null,
        idTemplateAllenamento: 0,
        createOrEdit: createOrEdit.create,
        provenienza: "/allenamenti-svolti",
      },
    });
  }

  private closeAllSwipes(): void {
    this.swipe.closeAll();
  }

  ngAfterViewInit(): void {
    this.allenamentoCards.changes.subscribe(() => {
      this.swipe.attach(this.allenamentoCards);
      // Il page-scroller puo' essere stato ricreato da un @if del template.
      this.infiniteScroll.attach();
    });
    this.swipe.attach(this.allenamentoCards);
    this.infiniteScroll.attach();
  }

  ngOnDestroy(): void {
    this.swipe.destroy();
    this.infiniteScroll.detach();
  }

  /**
   * Prima pagina: azzera la lista e mostra lo spinner. Le pagine successive
   * arrivano da caricaProssimaPagina() e non devono far comparire lo spinner
   * a tutto schermo, che coprirebbe la lista che l'utente sta gia' leggendo.
   */
  async getListaAllenamentiSvolti() {
    this.pagina = 0;
    this.listaAllenamentiSvolti = [];
    this.listaAllenamentiSvoltiView = [];
    this.infiniteScroll.reset();

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

    this.caricaPagina(0, this.currentSpinnerId);
  }

  private caricaProssimaPagina(): void {
    // Nessuno spinner qui: e' l'utente che sta scorrendo, non un'attesa.
    this.caricaPagina(this.pagina, null);
  }

  private caricaPagina(pagina: number, spinnerId: string | null): void {
    try {
      const user = this.authService.getCurrentUser();
      if (!user) {
        throw new Error("ListExecutedWorkouts.caricaPagina: nessun user trovato");
      }

      this.infiniteScroll.segnalaCaricamentoIniziato();
      this.caricandoAltro = spinnerId === null;

      this.workoutService
        .getListaAllenamentiSvoltiPaginata({
          userId: user.userId,
          page: pagina,
          size: DIMENSIONE_PAGINA_LISTE,
        })
        .subscribe({
          next: async (response: GetListaAllenamentiSvoltiResponseModel) => {
            this.caricandoAltro = false;

            if (response.errore?.error) {
              // Il flag va rilasciato anche qui, altrimenti l'infinite scroll
              // resta bloccato per il resto della sessione.
              this.infiniteScroll.segnalaCaricamentoFinito(true);
              if (spinnerId) await this.spinnerService.setError(spinnerId);
              this.errorHandlerService.logError(
                response.errore.error,
                "ListExecutedWorkouts.caricaPagina",
              );
              return;
            }

            const nuovi = response.listaAllenamentiDTO ?? [];
            this.listaAllenamentiSvolti = [...this.listaAllenamentiSvolti, ...nuovi];
            this.listaAllenamentiSvoltiView = [
              ...this.listaAllenamentiSvoltiView,
              ...nuovi.map((el) => {
                const giorniArray: number[] = [];
                for (let i = 1; i <= el.numeroTotaleAllenamentiScheda; i++) {
                  giorniArray.push(i);
                }
                return { allenamentoSvolto: el, giorniArray };
              }),
            ];

            this.pagina = pagina + 1;
            this.infiniteScroll.segnalaCaricamentoFinito(
              response.paginazione?.ultimaPagina ?? true,
            );

            if (spinnerId) await this.spinnerService.setSuccess(spinnerId);
          },
          error: async (error) => {
            this.caricandoAltro = false;
            this.infiniteScroll.segnalaCaricamentoFinito(true);
            if (spinnerId) await this.spinnerService.setError(spinnerId);
            this.errorHandlerService.logError(
              error,
              "ListExecutedWorkouts.caricaPagina",
            );
          },
        });
    } catch (error) {
      this.caricandoAltro = false;
      this.infiniteScroll.segnalaCaricamentoFinito(true);
      if (spinnerId) this.spinnerService.setError(spinnerId);
      this.errorHandlerService.logError(error, "ListExecutedWorkouts.caricaPagina");
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
      this.confirmPopupService.open({
        title: "Eliminare questo allenamento?",
        message: "Questa azione non può essere annullata.",
        confirmText: "Elimina",
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
