import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RiepilogoResponse } from "src/app/models/statistics/statistics-models";

@Component({
  selector: "app-riepilogo-generale",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./riepilogo-generale.html",
  styleUrls: ["./riepilogo-generale.scss"],
})
export class RiepilogoGenerale {
  @Input() dati: RiepilogoResponse | null = null;

  formatVolume(kg: number): string {
    if (kg >= 1000000) return (kg / 1000000).toFixed(1) + "M";
    if (kg >= 1000) return (kg / 1000).toFixed(1) + "k";
    return kg.toString();
  }
}
