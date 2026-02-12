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
import { RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { ProssimoAllenamento } from "../widgets/prossimo-allenamento/prossimo-allenamento";
import { ErrorHandlerService } from "src/app/core/services/error-handler.service";
import { SpinnerService } from "src/app/core/services/spinner.service";
import { CreateOrEditWorkoutExecution } from "../create-or-edit-workout-execution/create-or-edit-workout-execution";
import { AuthService } from "src/app/core/services/auth.service";
import { SchedaCorrente } from "../widgets/scheda-corrente/scheda-corrente";
import { UltimiAllenamentiSvolti } from "../widgets/ultimi-allenamenti-svolti/ultimi-allenamenti-svolti";
import { UltimeSchedeSvolte } from "../widgets/ultime-schede-svolte/ultime-schede-svolte";
import { MenuConfigService } from "src/app/core/services/menu-config.service";
import { AccountInfo } from "../account-info/account-info";
import { SelezionaAllenamentoDaSvolgere } from "../widgets/seleziona-allenamento-da-svolgere/seleziona-allenamento-da-svolgere";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Registra il plugin ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

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

  constructor(
    private menuConfigService: MenuConfigService,
    private cdr: ChangeDetectorRef,
    private errorHandlerService: ErrorHandlerService,
    private spinnerService: SpinnerService,
    private authService: AuthService,
    private elementRef: ElementRef,
  ) {}

  ngOnInit() {
    try {
      this.menuConfigService.setConfig({
        leftButton: "none",
      });
      
    } catch (error) {
      this.errorHandlerService.logError(error, "HomeComponent.ngOnInit");
    }
  }

  async ngAfterViewInit() {
    try {
      this.initializeWidgets();
      // Inizializza l'animazione parallasse dopo un breve delay
      // per assicurarsi che il DOM sia completamente renderizzato
      setTimeout(() => {
        this.initParallaxAnimation();
      }, 100);
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

  initParallaxAnimation() {
    try {
      const pageScroller = this.elementRef.nativeElement.querySelector('.page-scroller');
      const selezionaAllenamento = this.elementRef.nativeElement.querySelector('app-seleziona-allenamento-da-svolgere');

      if (!pageScroller || !selezionaAllenamento) {
        console.warn('Elementi per parallax non trovati');
        return;
      }

      // Configura ScrollTrigger per usare .page-scroller come scroller
      ScrollTrigger.defaults({
        scroller: pageScroller
      });

      // Crea l'animazione parallasse
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: selezionaAllenamento,
          start: "top top", // Inizia quando il top dell'elemento tocca il top dello scroller
          end: "90% top", // Finisce quando il bottom dell'elemento raggiunge il top dello scroller
          scrub: 1, // Scrub smooth (0 = istantaneo, 1+ = più smooth)
          invalidateOnRefresh: true, // Ricalcola su resize
          // markers: true, // Decommentare per debug
        }
      });

      // Animazione combinata: translateY, opacity e scale
      timeline.to(selezionaAllenamento, {
        yPercent: 16, // Movimento parallasse (negativo = sale più lentamente)
        opacity: 0,
        scale: 0.8,
        ease: "none", // Linear per seguire esattamente lo scroll
        force3D: true, // Forza accelerazione GPU
        transformOrigin: "center center",
      });

      // Salva l'istanza per cleanup
      this.scrollTriggerInstance = timeline.scrollTrigger as ScrollTrigger;

    } catch (error) {
      this.errorHandlerService.logError(error, "HomeComponent.initParallaxAnimation");
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

      // Refresh ScrollTrigger dopo il caricamento dei dati
      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 200);

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