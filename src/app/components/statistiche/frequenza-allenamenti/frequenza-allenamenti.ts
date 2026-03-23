import { Component, Input, OnChanges } from "@angular/core";
import { CommonModule } from "@angular/common";
import { BaseChartDirective } from "ng2-charts";
import { ChartConfiguration } from "chart.js";
import { FrequenzaData } from "src/app/models/statistics/statistics-models";

@Component({
  selector: "app-frequenza-allenamenti",
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: "./frequenza-allenamenti.html",
  styleUrls: ["./frequenza-allenamenti.scss"],
})
export class FrequenzaAllenamenti implements OnChanges {
  @Input() dati: FrequenzaData[] = [];
  @Input() periodo: "settimana" | "mese" = "settimana";

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
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleFont: { family: "Poppins" },
        bodyFont: { family: "Poppins" },
        borderColor: "rgba(0, 255, 225, 0.3)",
        borderWidth: 1,
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
          stepSize: 1,
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
    this.barChartData = {
      labels: this.dati.map((d) => d.label),
      datasets: [
        {
          data: this.dati.map((d) => d.count),
          backgroundColor: "rgba(0, 255, 225, 0.3)",
          hoverBackgroundColor: "rgba(0, 255, 225, 0.5)",
          borderColor: "#00ffe1",
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    };
  }
}
