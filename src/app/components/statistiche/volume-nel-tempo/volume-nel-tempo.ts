import { Component, Input, OnChanges } from "@angular/core";
import { CommonModule } from "@angular/common";
import { BaseChartDirective } from "ng2-charts";
import { ChartConfiguration } from "chart.js";
import { VolumeDataPoint } from "src/app/models/statistics/statistics-models";

@Component({
  selector: "app-volume-nel-tempo",
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: "./volume-nel-tempo.html",
  styleUrls: ["./volume-nel-tempo.scss"],
})
export class VolumeNelTempo implements OnChanges {
  @Input() dati: VolumeDataPoint[] = [];

  lineChartData: ChartConfiguration<"line">["data"] = {
    labels: [],
    datasets: [],
  };

  lineChartOptions: ChartConfiguration<"line">["options"] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleFont: { family: "Poppins" },
        bodyFont: { family: "Poppins" },
        borderColor: "rgba(0, 255, 225, 0.3)",
        borderWidth: 1,
        callbacks: {
          label: (ctx) => `${(ctx.parsed.y ?? 0).toLocaleString("it-IT")} kg`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: "#808080", font: { family: "Poppins", size: 10 } },
        grid: { color: "rgba(255, 255, 255, 0.05)" },
        border: { color: "rgba(255, 255, 255, 0.1)" },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: "#808080",
          font: { family: "Poppins", size: 10 },
          callback: (value) => {
            const v = value as number;
            return v >= 1000 ? (v / 1000).toFixed(0) + "k" : v;
          },
        },
        grid: { color: "rgba(255, 255, 255, 0.05)" },
        border: { color: "rgba(255, 255, 255, 0.1)" },
      },
    },
  };

  ngOnChanges(): void {
    this.aggiornaGrafico();
  }

  private aggiornaGrafico(): void {
    this.lineChartData = {
      labels: this.dati.map((d) => this.formatLabel(d.periodo)),
      datasets: [
        {
          data: this.dati.map((d) => d.volumeKg),
          borderColor: "#00ffe1",
          backgroundColor: "rgba(0, 255, 225, 0.1)",
          pointBackgroundColor: "#00ffe1",
          pointBorderColor: "#00ffe1",
          pointRadius: 3,
          pointHoverRadius: 5,
          tension: 0.3,
          fill: true,
        },
      ],
    };
  }

  private formatLabel(periodo: string): string {
    if (periodo.includes("W")) return periodo.split("-")[1];
    const parts = periodo.split("-");
    if (parts.length === 2) {
      const mesi = ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"];
      return `${mesi[parseInt(parts[1]) - 1]} ${parts[0].slice(2)}`;
    }
    return periodo;
  }
}
