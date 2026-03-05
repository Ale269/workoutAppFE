import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
  OnDestroy,
  ElementRef,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { ProssimoAllenamento } from "../widgets/prossimo-allenamento/prossimo-allenamento";
import { ErrorHandlerService } from "src/app/core/services/error-handler.service";
import { SpinnerService } from "src/app/core/services/spinner.service";
import { AuthService } from "src/app/core/services/auth.service";
import { SchedaCorrente } from "../widgets/scheda-corrente/scheda-corrente";
import { UltimiAllenamentiSvolti } from "../widgets/ultimi-allenamenti-svolti/ultimi-allenamenti-svolti";
import { UltimeSchedeSvolte } from "../widgets/ultime-schede-svolte/ultime-schede-svolte";
import { MenuConfigService } from "src/app/core/services/menu-config.service";
import { AccountInfo } from "../account-info/account-info";
import { SelezionaAllenamentoDaSvolgere } from "../widgets/seleziona-allenamento-da-svolgere/seleziona-allenamento-da-svolgere";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { HapticService } from "src/app/core/services/haptic.service";
import { WorkoutStorageService } from "src/app/core/services/workout-storage.service";

// Registra il plugin ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Ignora il resize della barra indirizzi su iOS
ScrollTrigger.config({ ignoreMobileResize: true });

@Component({
  selector: "app-home",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ProssimoAllenamento,
    SchedaCorrente,
    UltimiAllenamentiSvolti,
    UltimeSchedeSvolte,
    AccountInfo,
    SelezionaAllenamentoDaSvolgere
  ],
  templateUrl: "./home-component.html",
  styleUrls: ["./home-component.scss"],
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(SelezionaAllenamentoDaSvolgere) SelezionaAllenamentoDaSvolgere!: SelezionaAllenamentoDaSvolgere;
  @ViewChild(SchedaCorrente) SchedaCorrente!: SchedaCorrente;
  @ViewChild(UltimiAllenamentiSvolti)
  UltimiAllenamentiSvolti!: UltimiAllenamentiSvolti;
  @ViewChild(UltimeSchedeSvolte)
  UltimeSchedeSvolte!: UltimeSchedeSvolte;

  private currentSpinnerId: string | null = null;
  private scrollTriggerInstance: ScrollTrigger | null = null;
  private lastHapticState: 'visible' | 'hidden' | null = null;

  constructor(
    private menuConfigService: MenuConfigService,
    private cdr: ChangeDetectorRef,
    private errorHandlerService: ErrorHandlerService,
    private spinnerService: SpinnerService,
    private authService: AuthService,
    private elementRef: ElementRef,
    private hapticService: HapticService,
    private workoutStorageService: WorkoutStorageService,
    private router: Router,
  ) { }

  ngOnInit() {
    try {
      this.menuConfigService.setConfig({
        leftButton: "none",
      });

      // Controlla se ci sono dati in corso salvati in localStorage
      // e nel caso naviga alla pagina giusta per riprendere
      if (this.checkAndRecoverPendingWork()) {
        return;
      }

    } catch (error) {
      this.errorHandlerService.logError(error, "HomeComponent.ngOnInit");
    }
  }

  /**
   * Controlla se ci sono sessioni di lavoro in corso salvate in localStorage.
   * Se trovate, naviga alla pagina corretta per riprendere il lavoro.
   * @returns true se è stata trovata una sessione da recuperare (navigazione avviata)
   */
  private checkAndRecoverPendingWork(): boolean {
    try {
      // Controlla workout execution in corso
      const workoutData = this.workoutStorageService.load();
      if (workoutData) {
        if (workoutData.createOrEdit === 1) {
          // create mode → registra-allenamento/:idTemplate
          this.router.navigate(["/registra-allenamento", workoutData.idTemplateAllenamento]);
        } else {
          // edit mode → modifica-allenamento/:idAllenamento
          this.router.navigate(["/allenamenti-svolti/modifica-allenamento", workoutData.idAllenamento]);
        }
        return true;
      }

      // Controlla template plan in corso
      const templateData = this.workoutStorageService.loadTemplate();
      if (templateData) {
        if (templateData.schedaId > 0) {
          this.router.navigate(["/le-mie-schede/modifica-scheda", templateData.schedaId]);
        } else {
          this.router.navigate(["/le-mie-schede/modifica-scheda"]);
        }
        return true;
      }

      return false;
    } catch (error) {
      this.errorHandlerService.logError(error, "HomeComponent.checkAndRecoverPendingWork");
      return false;
    }
  }

  async ngAfterViewInit() {
    try {
      // Inizializza i widget — l'animazione parallasse verrà avviata
      // DOPO il caricamento dei dati per garantire che il DOM sia stabile
      await this.initializeWidgets();
    } catch (error) {
      this.errorHandlerService.logError(error, "HomeComponent.ngAfterViewInit");
    }
  }

  ngOnDestroy() {
    // Pulisci l'istanza di ScrollTrigger per evitare memory leaks
    if (this.scrollTriggerInstance) {
      this.scrollTriggerInstance.kill();
    }
    // Pulisci tutte le istanze di ScrollTrigger
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
  }

  /**
   * Inizializza l'animazione parallasse aspettando che il browser
   * abbia effettivamente completato il paint del DOM.
   * Usa doppio requestAnimationFrame per sincronizzarsi col ciclo di rendering.
   */
  initParallaxAnimation() {
    // Il primo RAF aspetta il prossimo frame di rendering,
    // il secondo RAF assicura che il paint sia completato.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.setupParallax();
      });
    });
  }

  private setupParallax() {
    try {
      const pageScroller = this.elementRef.nativeElement.querySelector('.page-scroller');
      const selezionaAllenamento = this.elementRef.nativeElement.querySelector('app-seleziona-allenamento-da-svolgere');

      if (!pageScroller || !selezionaAllenamento) {
        console.warn('Elementi per parallax non trovati');
        return;
      }

      // NOTA: normalizeScroll(true) è stato rimosso perché bloccava
      // completamente lo scroll nativo della pagina.

      // Crea l'animazione parallasse con scroller specifico (non globale)
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: selezionaAllenamento,
          scroller: pageScroller, // Scroller nella config specifica, non nei defaults globali
          start: "top top",
          end: "90% top",
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            // Triggera haptic al passaggio della soglia di visibilità
            if (self.progress > 0.9 && this.lastHapticState !== 'hidden') {
              this.lastHapticState = 'hidden';
              this.hapticService.trigger('medium');
            } else if (self.progress < 0.1 && this.lastHapticState !== 'visible') {
              this.lastHapticState = 'visible';
              this.hapticService.trigger('medium');
            }
          },
        }
      });

      // Animazione: translateY, opacity e scale
      timeline.to(selezionaAllenamento, {
        yPercent: 16,
        opacity: 0,
        scale: 0.8,
        ease: "none",
        force3D: true,
        transformOrigin: "center center",
      });

      // Salva l'istanza per cleanup
      this.scrollTriggerInstance = timeline.scrollTrigger as ScrollTrigger;

    } catch (error) {
      this.errorHandlerService.logError(error, "HomeComponent.setupParallax");
    }
  }

  async initializeWidgets() {
    try {
      const user = this.authService.getCurrentUser();
      if (user) {
        await this.getWidgetsData(user.userId);
      } else {
        this.errorHandlerService.logError(
          "nessun user trovato",
          "HomeComponent.initializeWidgets",
        );
      }
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "HomeComponent.initializeWidgets",
      );
    }
  }

  async getWidgetsData(idUser: number) {
    try {
      // Mostra lo spinner di inizializzazione
      this.currentSpinnerId = this.spinnerService.showWithResult(
        "Caricamento dati widgets",
        {
          successMessage: "Caricamento completato",
          errorMessage: "Errore nel processo di caricamento",
          resultDuration: 300,
          minSpinnerDuration: 300,
        },
      );

      // Gestione errori per singolo widget
      const results = await Promise.allSettled([
        this.SelezionaAllenamentoDaSvolgere.prossimoAllenamento
          .getDatiProssimoAllenamentoWidget(idUser)
          .catch((error) => {
            this.errorHandlerService.logError(
              error,
              "Widget ProssimoAllenamento",
            );
            return null;
          }),
        this.SchedaCorrente.getDatiSchedaCorrenteWidget(idUser).catch(
          (error) => {
            this.errorHandlerService.logError(error, "Widget SchedaCorrente");
            return null;
          },
        ),
        this.UltimiAllenamentiSvolti.getDatiUltimiAllenamentiSvoltiWidget(
          idUser,
        ).catch((error) => {
          this.errorHandlerService.logError(
            error,
            "Widget UltimiAllenamentiSvolti",
          );
          return null;
        }),
        this.UltimeSchedeSvolte.getDatiUltimeSchedeSvolteWidget(idUser).catch(
          (error) => {
            this.errorHandlerService.logError(
              error,
              "Widget UltimeSchedeSvolte",
            );
            return null;
          },
        ),

        // Altri widget...
        // this.altroWidget.getDatiWidget().catch(...)
      ]);

      // Controlla quali widget sono andati in errore
      results.forEach((result, index) => {
        if (result.status === "rejected") {
          console.error(`Widget ${index} fallito:`, result.reason);
        }
      });

      // Inizializza l'animazione parallasse ORA che i dati sono caricati
      // e il DOM è stato aggiornato con i contenuti reali
      this.initParallaxAnimation();

    } catch (error) {
      this.errorHandlerService.logError(error, "HomeComponent.getWidgetsData");
    } finally {
      setTimeout(() => {
        if (this.currentSpinnerId) {
          this.spinnerService.setSuccess(this.currentSpinnerId);
        }
      }, 100);
    }
  }

  // Metodo per ricaricare i dati (utile per refresh button)
  async refreshWidgets() {
    this.initializeWidgets();
  }
}