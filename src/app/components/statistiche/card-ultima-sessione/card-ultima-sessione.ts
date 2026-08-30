import { Component, Input, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatIcon, MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";
import { UltimaSessioneCard } from "src/app/models/statistics/statistiche-overview-models";

@Component({
  selector: "app-card-ultima-sessione",
  standalone: true,
  imports: [CommonModule, MatIcon],
  templateUrl: "./card-ultima-sessione.html",
  styleUrl: "./card-ultima-sessione.scss",
})
export class CardUltimaSessione {
  /** Null = card assente (0 sessioni). Il chiamante non la renderizza affatto. */
  @Input() dati: UltimaSessioneCard | null = null;

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

  onClick(): void {
    if (this.dati) {
      this.apri.emit(this.dati.idAllenamentoSvolto);
    }
  }
}
