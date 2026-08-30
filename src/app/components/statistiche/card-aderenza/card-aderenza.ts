import { Component, Input, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatIcon, MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";
import { AderenzaCard } from "src/app/models/statistics/statistiche-overview-models";

@Component({
  selector: "app-card-aderenza",
  standalone: true,
  imports: [CommonModule, MatIcon],
  templateUrl: "./card-aderenza.html",
  styleUrl: "./card-aderenza.scss",
})
export class CardAderenza {
  /** Null = card assente (sotto le 3 sessioni). */
  @Input() dati: AderenzaCard | null = null;

  @Output() apri = new EventEmitter<void>();

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

  /** Il blocco diagnostico esiste solo se c'è almeno una delle due righe. */
  get haDiagnostica(): boolean {
    return !!(this.dati?.giornoMenoEseguito || this.dati?.sostituzioneFrequente);
  }
}
