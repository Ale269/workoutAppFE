import { Component, OnInit, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { MatIcon, MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";
import { MenuConfigService } from "src/app/core/services/menu-config.service";
import { SpinnerService } from "src/app/core/services/spinner.service";
import { AuthService } from "src/app/core/services/auth.service";
import { ErrorHandlerService } from "src/app/core/services/error-handler.service";
import { StatisticsService } from "src/app/core/services/statistics.service";
import { HapticService } from "src/app/core/services/haptic.service";
import {
  StatisticheOverviewResponse,
  StatistichePeriodo,
  STATISTICHE_PERIODI,
} from "src/app/models/statistics/statistiche-overview-models";
import { CardUltimaSessione } from "./card-ultima-sessione/card-ultima-sessione";
import { CardCostanza } from "./card-costanza/card-costanza";
import { CardForza } from "./card-forza/card-forza";
import { CardVolumeMuscolo } from "./card-volume-muscolo/card-volume-muscolo";
import { CardAderenza } from "./card-aderenza/card-aderenza";

@Component({
  selector: "app-statistiche",
  standalone: true,
  imports: [
    CommonModule,
    MatIcon,
    CardUltimaSessione,
    CardCostanza,
    CardForza,
    CardVolumeMuscolo,
    CardAderenza,
  ],
  templateUrl: "./statistiche.html",
  styleUrls: ["./statistiche.scss"],
})
export class StatisticheComponent implements OnInit {
  private menuConfigService = inject(MenuConfigService);
  private spinnerService = inject(SpinnerService);
  private authService = inject(AuthService);
  private errorHandlerService = inject(ErrorHandlerService);
  private statisticsService = inject(StatisticsService);
  private hapticService = inject(HapticService);
  private router = inject(Router);

  readonly periodi = STATISTICHE_PERIODI;

  periodoAttivo = signal<StatistichePeriodo>("scheda-attiva");
  overview = signal<StatisticheOverviewResponse | null>(null);
  caricamento = signal<boolean>(false);

  constructor(
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer,
  ) {
    iconRegistry.addSvgIcon(
      "google-arrow",
      sanitizer.bypassSecurityTrustResourceUrl(
        "assets/recollect/svg/google-arrow.svg",
      ),
    );
  }

  ngOnInit(): void {
    // Stessa configurazione di "Allenamenti svolti": anche le pagine
    // raggiungibili dal bottom menu mostrano la freccia di ritorno alla home.
    this.menuConfigService.setBackToRoute("/home", "back", "Statistiche");
    this.caricaOverview(true);
  }

  selezionaPeriodo(periodo: StatistichePeriodo): void {
    if (periodo === this.periodoAttivo()) return;
    this.hapticService.trigger("light");
    this.periodoAttivo.set(periodo);
    // Cambio tab: niente spinner a tutto schermo, solo il ricarico dei dati.
    // Lo spinner serve al primo ingresso, quando la pagina è vuota.
    this.caricaOverview(false);
  }

  // I drill-down di livello L2 (dettaglio esercizio, dettaglio distretto,
  // liste complete) non esistono ancora: qui restano gli agganci, cablati
  // quando arriveranno le rispettive schermate.
  apriDettaglioSessione(idAllenamentoSvolto: number): void {
    this.router.navigate(["/statistiche/sessione", idAllenamentoSvolto]);
  }

  apriDettaglioEsercizio(idTipoEsercizio: number): void {
    // La provenienza serve alla pagina di destinazione per sapere dove
    // riportare la freccia indietro: la stessa pagina si raggiunge anche dal
    // dettaglio sessione.
    this.router.navigate(["/statistiche/esercizio", idTipoEsercizio], {
      state: { provenienza: "/statistiche" },
    });
  }

  apriDettaglioMuscolo(idMuscolo: number): void {
    console.debug("TODO drill-down distretto", idMuscolo);
  }

  apriTuttiGliEsercizi(): void {
    this.router.navigate(["/statistiche/forza"]);
  }

  apriTuttiIDistretti(): void {
    console.debug("TODO lista completa distretti");
  }

  apriDettaglioAderenza(): void {
    console.debug("TODO drill-down aderenza");
  }

  apriStatisticheAvanzate(): void {
    console.debug("TODO schermata statistiche avanzate");
  }

  private async caricaOverview(conSpinner: boolean): Promise<void> {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    const spinnerId = conSpinner
      ? this.spinnerService.showWithResult("Recupero dati statistiche", {
          // forceShow: false => se i dati arrivano prima dei 250ms di
          // INITIAL_DELAY dello SpinnerComponent, il popup non compare
          // affatto. Stessi valori delle altre liste dell'app.
          forceShow: false,
          successMessage: "Dati recuperati con successo",
          errorMessage: "Errore nel recupero dei dati",
          resultDuration: 250,
          minSpinnerDuration: 250,
        })
      : null;

    this.caricamento.set(true);

    try {
      const risposta = await this.statisticsService
        .getStatisticheOverview(user.userId, this.periodoAttivo())
        .toPromise();

      // Una tab cambiata durante il volo non deve sovrascrivere quella nuova.
      if (risposta && risposta.periodo === this.periodoAttivo()) {
        this.overview.set(risposta);
      }

      if (spinnerId) this.spinnerService.setSuccess(spinnerId);
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "StatisticheComponent.caricaOverview",
      );
      if (spinnerId) this.spinnerService.setError(spinnerId);
    } finally {
      this.caricamento.set(false);
    }
  }
}
