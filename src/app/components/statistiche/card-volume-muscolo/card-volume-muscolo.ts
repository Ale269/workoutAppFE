import { Component, Input, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatIcon, MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";
import { VolumeMuscoloItem } from "src/app/models/statistics/statistiche-overview-models";

@Component({
  selector: "app-card-volume-muscolo",
  standalone: true,
  imports: [CommonModule, MatIcon],
  templateUrl: "./card-volume-muscolo.html",
  styleUrl: "./card-volume-muscolo.scss",
})
export class CardVolumeMuscolo {
  private _distretti: VolumeMuscoloItem[] = [];

  @Input() set distretti(value: VolumeMuscoloItem[]) {
    this._distretti = value ?? [];
    this.massimo = this.calcolaMassimo(this._distretti);
  }
  get distretti(): VolumeMuscoloItem[] {
    return this._distretti;
  }

  @Output() apri = new EventEmitter<number>();

  /**
   * Scala comune a tutte le righe: le barre si confrontano tra distretti, non
   * ognuna con se stessa. Normalizzare riga per riga farebbe sembrare uguali
   * un distretto da 10 serie e uno da 3.
   */
  private massimo = 1;

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

  larghezza(valore: number | null): number {
    if (valore === null) return 0;
    return Math.round((valore / this.massimo) * 100);
  }

  etichettaDelta(item: VolumeMuscoloItem): string {
    if (item.trend === "stabile" || !item.deltaSerie) return "stabile";
    const segno = item.deltaSerie > 0 ? "+" : "−";
    return `${segno}${Math.abs(item.deltaSerie)}`;
  }

  private calcolaMassimo(distretti: VolumeMuscoloItem[]): number {
    const valori = distretti.flatMap((d) => [
      d.serie,
      d.mediaQuattroSettimane ?? 0,
    ]);
    return Math.max(...valori, 1);
  }
}
