import { Component, Input, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatIcon, MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";
import { ExerciseIconColorPipe } from "src/app/core/pipes/exercise-icon-color";
import { ExerciseIconPipe } from "src/app/core/pipes/exercise-icon";
import { ForzaEsercizioItem } from "src/app/models/statistics/statistiche-overview-models";

@Component({
  selector: "app-card-forza",
  standalone: true,
  imports: [CommonModule, MatIcon, ExerciseIconColorPipe, ExerciseIconPipe],
  templateUrl: "./card-forza.html",
  styleUrl: "./card-forza.scss",
})
export class CardForza {
  @Input() esercizi: ForzaEsercizioItem[] = [];

  @Output() apri = new EventEmitter<number>();

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

  /**
   * Il numero non sta mai solo: accanto c'è sempre il riferimento.
   * "stabile" è un'informazione, "+0 kg" no.
   */
  etichettaDelta(item: ForzaEsercizioItem): string {
    if (item.trend === "stabile" || !item.deltaCarico) return "stabile";
    const segno = item.deltaCarico > 0 ? "+" : "−";
    return `${segno}${Math.abs(item.deltaCarico)} kg`;
  }
}
