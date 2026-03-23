import { Component, Input, OnChanges } from "@angular/core";
import { CommonModule } from "@angular/common";
import { BaseChartDirective } from "ng2-charts";
import { ChartConfiguration } from "chart.js";
import { DistribuzioneMuscoloItem } from "src/app/models/statistics/statistics-models";

@Component({
  selector: "app-distribuzione-muscoli",
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: "./distribuzione-muscoli.html",
  styleUrls: ["./distribuzione-muscoli.scss"],
})
export class DistribuzioneMuscoli implements OnChanges {
  @Input() dati: DistribuzioneMuscoloItem[] = [];

  doughnutChartData: ChartConfiguration<"doughnut">["data"] = {
    labels: [],
    datasets: [],
  };

  doughnutChartOptions: ChartConfiguration<"doughnut">["options"] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "65%",
    plugins: {
      legend: {
        display: true,
        position: "right",
        labels: {
          color: "#e0e0e0",
          font: { family: "Poppins", size: 11 },
          boxWidth: 12,
          padding: 8,
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleFont: { family: "Poppins" },
        bodyFont: { family: "Poppins" },
        borderColor: "rgba(0, 255, 225, 0.3)",
        borderWidth: 1,
        callbacks: {
          label: (ctx) => ` ${ctx.label}: ${ctx.parsed}%`,
        },
      },
    },
  };

  private colori = [
    "#00ffe1",
    "#f48fb1",
    "#64b5f6",
    "#ffb74d",
    "#81c784",
    "#ce93d8",
    "#ff8a65",
    "#4dd0e1",
    "#aed581",
    "#fff176",
    "#90a4ae",
    "#e57373",
  ];

  ngOnChanges(): void {
    this.aggiornaGrafico();
  }

  private aggiornaGrafico(): void {
    if (!this.dati || this.dati.length === 0) return;

    this.doughnutChartData = {
      labels: this.dati.map((d) => d.nomeMuscolo),
      datasets: [
        {
          data: this.dati.map((d) => d.percentuale),
          backgroundColor: this.dati.map(
            (_, i) => this.colori[i % this.colori.length]
          ),
          borderColor: "rgba(0, 0, 0, 0.3)",
          borderWidth: 1,
          hoverOffset: 4,
        },
      ],
    };
  }
}
