import { Component, OnInit, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { MenuConfigService } from "src/app/core/services/menu-config.service";
import { SpinnerService } from "src/app/core/services/spinner.service";
import { AuthService } from "src/app/core/services/auth.service";
import { ErrorHandlerService } from "src/app/core/services/error-handler.service";
import { StatisticsService } from "src/app/core/services/statistics.service";
import { ForzaCompletaResponse } from "src/app/models/statistics/statistiche-overview-models";
import { CardForza } from "../card-forza/card-forza";

/**
 * Elenco completo degli esercizi con trend, dietro "Tutti" nella card Forza.
 *
 * Riusa CardForza invece di riscrivere le righe: sono le stesse card
 * dell'anteprima, e tenerle in un solo componente evita che le due viste
 * divergano alla prima modifica di stile.
 */
@Component({
  selector: "app-forza-completa",
  standalone: true,
  imports: [CommonModule, CardForza],
  templateUrl: "./forza-completa.html",
  styleUrl: "./forza-completa.scss",
})
export class ForzaCompleta implements OnInit {
  private menuConfigService = inject(MenuConfigService);
  private spinnerService = inject(SpinnerService);
  private authService = inject(AuthService);
  private errorHandlerService = inject(ErrorHandlerService);
  private statisticsService = inject(StatisticsService);
  private router = inject(Router);

  dati = signal<ForzaCompletaResponse | null>(null);

  ngOnInit(): void {
    this.menuConfigService.setBackToRoute("/statistiche", "back", "Forza");
    this.caricaElenco();
  }

  apriDettaglioEsercizio(idTipoEsercizio: number): void {
    // La provenienza dice alla pagina di destinazione dove riportare la
    // freccia indietro: da qui si torna a questo elenco, non a Statistiche.
    this.router.navigate(["/statistiche/esercizio", idTipoEsercizio], {
      state: { provenienza: "/statistiche/forza" },
    });
  }

  private async caricaElenco(): Promise<void> {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    const spinnerId = this.spinnerService.showWithResult("Recupero esercizi", {
      forceShow: false,
      successMessage: "Dati recuperati con successo",
      errorMessage: "Errore nel recupero dei dati",
      resultDuration: 250,
      minSpinnerDuration: 250,
    });

    try {
      const risposta = await this.statisticsService
        .getForzaCompleta(user.userId, "scheda-attiva")
        .toPromise();

      if (risposta) {
        this.dati.set(risposta);
      }
      this.spinnerService.setSuccess(spinnerId);
    } catch (error) {
      this.errorHandlerService.logError(error, "ForzaCompleta.caricaElenco");
      this.spinnerService.setError(spinnerId);
    }
  }
}
