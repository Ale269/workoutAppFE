import { Component, Input, OnChanges } from "@angular/core";
import { CommonModule } from "@angular/common";
import { BaseChartDirective } from "ng2-charts";
import { ChartConfiguration } from "chart.js";
import { ProgressioneData } from "src/app/models/statistics/statistics-models";

@Component({
  selector: "app-progressione-esercizio",
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: "./progressione-esercizio.html",
  styleUrls: ["./progressione-esercizio.scss"],
})
export class ProgressioneEsercizio implements OnChanges {
  @Input() dati: ProgressioneData | null = null;
  @Input() nomeEsercizio: string = "";

  lineChartData: ChartConfiguration<"line">["data"] = {
    labels: [],
    datasets: [],
  };

  lineChartOptions: ChartConfiguration<"line">["options"] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          color: "#808080",
          font: { family: "Poppins", size: 11 },
          boxWidth: 12,
          padding: 16,
        },
      },
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
        position: "left",
        ticks: { color: "#00ffe1", font: { family: "Poppins", size: 10 } },
        grid: { color: "rgba(255, 255, 255, 0.05)" },
        border: { color: "rgba(255, 255, 255, 0.1)" },
      },
      y1: {
        beginAtZero: true,
        position: "right",
        ticks: { color: "#f48fb1", font: { family: "Poppins", size: 10 } },
        grid: { drawOnChartArea: false },
        border: { color: "rgba(255, 255, 255, 0.1)" },
      },
    },
  };

  ngOnChanges(): void {
    this.aggiornaGrafico();
  }

  private aggiornaGrafico(): void {
    if (!this.dati) return;

    this.lineChartData = {
      labels: this.dati.labels,
      datasets: [
        {
          data: this.dati.maxCarico,
          label: "Max carico (kg)",
          borderColor: "#00ffe1",
          backgroundColor: "rgba(0, 255, 225, 0.1)",
          pointBackgroundColor: "#00ffe1",
          pointRadius: 3,
          tension: 0.3,
          yAxisID: "y",
        },
        {
          data: this.dati.volume,
          label: "Volume (kg)",
          borderColor: "#f48fb1",
          backgroundColor: "rgba(244, 143, 177, 0.1)",
          pointBackgroundColor: "#f48fb1",
          pointRadius: 3,
          tension: 0.3,
          yAxisID: "y1",
        },
      ],
    };
  }
}
