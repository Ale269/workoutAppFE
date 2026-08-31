import { Component, OnInit, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { MatIcon, MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";
import { MenuConfigService } from "src/app/core/services/menu-config.service";
import { SpinnerService } from "src/app/core/services/spinner.service";
import { ErrorHandlerService } from "src/app/core/services/error-handler.service";
import { StatisticsService } from "src/app/core/services/statistics.service";
import { ExerciseIconPipe } from "src/app/core/pipes/exercise-icon";
import { ExerciseIconColorPipe } from "src/app/core/pipes/exercise-icon-color";
import {
  DettaglioSessioneResponse,
  EsercizioSessione,
} from "src/app/models/statistics/statistiche-sessione-models";

@Component({
  selector: "app-dettaglio-sessione",
  standalone: true,
  imports: [CommonModule, MatIcon, ExerciseIconPipe, ExerciseIconColorPipe],
  templateUrl: "./dettaglio-sessione.html",
  styleUrl: "./dettaglio-sessione.scss",
})
export class DettaglioSessione implements OnInit {
  private menuConfigService = inject(MenuConfigService);
  private spinnerService = inject(SpinnerService);
  private errorHandlerService = inject(ErrorHandlerService);
  private statisticsService = inject(StatisticsService);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);

  dettaglio = signal<DettaglioSessioneResponse | null>(null);

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

  ngOnInit(): void {
    this.menuConfigService.setBackToRoute(
      "/statistiche",
      "back",
      "Ultima sessione",
    );
    this.caricaDettaglio();
  }

  /**
   * Il numero non sta mai solo: accanto c'è sempre il riferimento, che qui è
   * la media a 4 settimane sullo stesso esercizio.
   */
  etichettaDelta(esercizio: EsercizioSessione): string {
    if (esercizio.delta === null) return "";
    if (esercizio.trend === "stabile" || esercizio.delta === 0) {
      return "in media";
    }
    const segno = esercizio.delta > 0 ? "+" : "−";
    return `${segno}${Math.abs(esercizio.delta)} ${esercizio.unitaDelta} sulla media`;
  }

  apriDettaglioEsercizio(idTipoEsercizio: number): void {
    const idSessione = this.dettaglio()?.idAllenamentoSvolto;
    this.router.navigate(["/statistiche/esercizio", idTipoEsercizio], {
      state: { provenienza: "/statistiche/sessione/" + idSessione },
    });
  }

  private async caricaDettaglio(): Promise<void> {
    const id = Number(this.activatedRoute.snapshot.params["id"]);
    if (!id) {
      this.router.navigate(["/statistiche"]);
      return;
    }

    const spinnerId = this.spinnerService.showWithResult(
      "Recupero dati sessione",
      {
        forceShow: false,
        successMessage: "Dati recuperati con successo",
        errorMessage: "Errore nel recupero dei dati",
        resultDuration: 250,
        minSpinnerDuration: 250,
      },
    );

    try {
      const risposta = await this.statisticsService
        .getDettaglioSessione(id)
        .toPromise();

      if (risposta) {
        this.dettaglio.set(risposta);
      }
      this.spinnerService.setSuccess(spinnerId);
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "DettaglioSessione.caricaDettaglio",
      );
      this.spinnerService.setError(spinnerId);
    }
  }
}
