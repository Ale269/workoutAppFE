import { Component, OnInit, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { BaseChartDirective } from "ng2-charts";
import { ChartConfiguration, Plugin } from "chart.js";
import { MenuConfigService } from "src/app/core/services/menu-config.service";
import { SpinnerService } from "src/app/core/services/spinner.service";
import { ErrorHandlerService } from "src/app/core/services/error-handler.service";
import { StatisticsService } from "src/app/core/services/statistics.service";
import { HapticService } from "src/app/core/services/haptic.service";
import { ExerciseIconPipe } from "src/app/core/pipes/exercise-icon";
import { ExerciseIconColorPipe } from "src/app/core/pipes/exercise-icon-color";
import {
  DettaglioEsercizioResponse,
  GraficoEsercizio,
} from "src/app/models/statistics/statistiche-esercizio-models";

type TabEsercizio = "storico" | "grafico" | "record";

@Component({
  selector: "app-dettaglio-esercizio",
  standalone: true,
  imports: [
    CommonModule,
    BaseChartDirective,
    ExerciseIconPipe,
    ExerciseIconColorPipe,
  ],
  templateUrl: "./dettaglio-esercizio.html",
  styleUrl: "./dettaglio-esercizio.scss",
})
export class DettaglioEsercizio implements OnInit {
  private menuConfigService = inject(MenuConfigService);
  private spinnerService = inject(SpinnerService);
  private errorHandlerService = inject(ErrorHandlerService);
  private statisticsService = inject(StatisticsService);
  private hapticService = inject(HapticService);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);

  readonly tabs: { id: TabEsercizio; label: string }[] = [
    { id: "storico", label: "Storico" },
    { id: "grafico", label: "Grafico" },
    { id: "record", label: "Record" },
  ];

  tabAttiva = signal<TabEsercizio>("storico");
  dettaglio = signal<DettaglioEsercizioResponse | null>(null);

  /** Configurazioni dei tre grafici, nell'ordine in cui arrivano. */
  grafici: {
    modello: GraficoEsercizio;
    data: ChartConfiguration<"line">["data"];
    options: ChartConfiguration<"line">["options"];
    plugins: Plugin<"line">[];
  }[] = [];

  ngOnInit(): void {
    // La freccia indietro torna da dove si e' arrivati: questa pagina si
    // raggiunge sia da Statistiche sia dal dettaglio sessione. Stessa ricetta
    // gia' usata per la registrazione allenamento (state.provenienza).
    const provenienza =
      (history.state?.provenienza as string | undefined) ?? "/statistiche";
    this.menuConfigService.setBackToRoute(provenienza, "back", "");

    this.caricaDettaglio();
  }

  selezionaTab(tab: TabEsercizio): void {
    if (tab === this.tabAttiva()) return;
    this.hapticService.trigger("light");
    this.tabAttiva.set(tab);
  }

  /** "+4 kg dal 17/06" — il numero non sta mai solo. */
  etichettaDeltaGrafico(g: GraficoEsercizio): string {
    if (g.delta === null || !g.punti.length) return "";
    const segno = g.delta > 0 ? "+" : "−";
    const dal = this.formattaGiorno(g.punti[0].data);
    return `${segno}${Math.abs(g.delta)} ${g.unita} dal ${dal}`;
  }

  primoGiorno(g: GraficoEsercizio): string {
    return g.punti.length ? this.formattaGiorno(g.punti[0].data) : "";
  }

  ultimoGiorno(g: GraficoEsercizio): string {
    return g.punti.length
      ? this.formattaGiorno(g.punti[g.punti.length - 1].data)
      : "";
  }

  private async caricaDettaglio(): Promise<void> {
    const id = Number(this.activatedRoute.snapshot.params["id"]);
    if (!id) {
      this.router.navigate(["/statistiche"]);
      return;
    }

    const spinnerId = this.spinnerService.showWithResult(
      "Recupero dati esercizio",
      {
        forceShow: false,
        successMessage: "Dati recuperati con successo",
        errorMessage: "Errore nel recupero dei dati",
        resultDuration: 250,
        minSpinnerDuration: 250,
      },
    );

    try {
      const risposta = await this.statisticsService
        .getDettaglioEsercizio(id)
        .toPromise();

      if (risposta) {
        this.dettaglio.set(risposta);
        // Il titolo dell'header e' il nome dell'esercizio: si sa solo ora.
        this.menuConfigService.setBackToRoute(
          (history.state?.provenienza as string | undefined) ?? "/statistiche",
          "back",
          risposta.nomeEsercizio,
        );
        this.grafici = risposta.grafici.map((g) => this.costruisciGrafico(g));
      }
      this.spinnerService.setSuccess(spinnerId);
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "DettaglioEsercizio.caricaDettaglio",
      );
      this.spinnerService.setError(spinnerId);
    }
  }

  private costruisciGrafico(g: GraficoEsercizio) {
    const etichette = g.punti.map((p) => this.formattaGiorno(p.data));

    return {
      modello: g,
      data: {
        labels: etichette,
        datasets: [
          {
            data: g.punti.map((p) => p.valore),
            borderColor: "#ffffff",
            borderWidth: 2,
            // Solo l'ultimo punto pieno: e' quello "di adesso".
            pointBackgroundColor: g.punti.map((_, i) =>
              i === g.punti.length - 1 ? "#ffffff" : "#1a1a1a",
            ),
            pointBorderColor: "#ffffff",
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            tension: 0,
            fill: false,
          },
        ],
      } as ChartConfiguration<"line">["data"],

      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { top: 8, bottom: 0, left: 4, right: 4 } },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "rgba(0, 0, 0, 0.9)",
            titleFont: { family: "Poppins", size: 11 },
            bodyFont: { family: "Poppins", size: 11 },
            borderColor: "rgba(255, 255, 255, 0.2)",
            borderWidth: 1,
            displayColors: false,
            callbacks: {
              label: (ctx: any) => `${ctx.parsed.y} ${g.unita}`,
            },
          },
        },
        scales: {
          // L'asse X resta nascosto: le due date agli estremi le scrive il
          // template sotto al grafico, e su 340dp sei etichette non ci stanno.
          x: { display: false },
          // L'asse Y invece serve: senza numeri e unita' la curva mostra solo
          // che "sale", non di quanto.
          y: {
            display: true,
            grace: "15%",
            ticks: {
              color: "#808080",
              font: { family: "Poppins", size: 10, weight: 700 },
              maxTicksLimit: 4,
              padding: 4,
              callback: (valore: any) => `${valore} ${g.unita}`,
            },
            grid: { color: "rgba(255, 255, 255, 0.06)" },
            border: { display: false },
          },
        },
      } as ChartConfiguration<"line">["options"],

      plugins: [] as Plugin<"line">[],
    };
  }

  /** "17/06" */
  private formattaGiorno(iso: string): string {
    const d = new Date(iso);
    const gg = d.getDate().toString().padStart(2, "0");
    const mm = (d.getMonth() + 1).toString().padStart(2, "0");
    return `${gg}/${mm}`;
  }
}
