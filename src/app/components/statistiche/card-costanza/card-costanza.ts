import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { BaseChartDirective } from "ng2-charts";
import { ChartConfiguration } from "chart.js";
import { CostanzaCard } from "src/app/models/statistics/statistiche-overview-models";

@Component({
  selector: "app-card-costanza",
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: "./card-costanza.html",
  styleUrl: "./card-costanza.scss",
})
export class CardCostanza {
  private _dati: CostanzaCard | null = null;

  /** Null = card assente (meno di 2 settimane di storico). */
  @Input() set dati(value: CostanzaCard | null) {
    this._dati = value;
    this.aggiornaGrafico(value);
  }
  get dati(): CostanzaCard | null {
    return this._dati;
  }

  /**
   * Sotto le 2 settimane di storico l'istogramma non si mostra: un trend su
   * due punti è rumore presentato come informazione (§6.1 del documento UX).
   */
  get mostraIstogramma(): boolean {
    return (this._dati?.settimane?.length ?? 0) >= 2;
  }

  barChartData: ChartConfiguration<"bar">["data"] = {
    labels: [],
    datasets: [],
  };

  barChartOptions: ChartConfiguration<"bar">["options"] = {
    responsive: true,
    maintainAspectRatio: false,
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
          label: (ctx) =>
            `${ctx.parsed.y} ${ctx.parsed.y === 1 ? "allenamento" : "allenamenti"}`,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#808080",
          font: { family: "Poppins", size: 10, weight: 700 },
          // 12 etichette non ci stanno su 360dp: Chart.js ne salta quante
          // servono invece di sovrapporle o ruotarle.
          autoSkip: true,
          maxRotation: 0,
        },
        grid: { display: false },
        border: { color: "rgba(255, 255, 255, 0.1)" },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: "#808080",
          font: { family: "Poppins", size: 10, weight: 700 },
          stepSize: 1,
          precision: 0,
        },
        grid: { color: "rgba(255, 255, 255, 0.06)" },
        border: { display: false },
      },
    },
  };

  private aggiornaGrafico(dati: CostanzaCard | null): void {
    if (!dati?.settimane?.length) {
      this.barChartData = { labels: [], datasets: [] };
      return;
    }

    this.barChartData = {
      labels: dati.settimane.map((s) => this.etichettaSettimana(s.inizioSettimana)),
      datasets: [
        {
          data: dati.settimane.map((s) => s.allenamenti),
          backgroundColor: "#d9d9d9",
          hoverBackgroundColor: "#ffffff",
          borderRadius: 6,
          borderSkipped: false,
          // Barre spesse e ravvicinate, come nel resto del linguaggio visivo.
          categoryPercentage: 0.8,
          barPercentage: 0.9,
        },
      ],
    };
  }

  /** "dd/MM" del lunedì della settimana. */
  private etichettaSettimana(isoDate: string): string {
    const d = new Date(isoDate);
    const gg = d.getDate().toString().padStart(2, "0");
    const mm = (d.getMonth() + 1).toString().padStart(2, "0");
    return `${gg}/${mm}`;
  }
}
