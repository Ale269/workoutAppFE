import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { MatIconRegistry, MatIcon } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { ErrorHandlerService } from "src/app/core/services/error-handler.service";
import { HapticService } from "src/app/core/services/haptic.service";
import { WidgetsService } from "src/app/core/services/widgets.service";
import {
  GetDatiSchedaCorrenteRequestModel,
  GetDatiSchedaCorrenteResponseModel,
} from "src/app/models/widgets/scheda-corrente/getDatiSchedaCorrente";

@Component({
  selector: "app-scheda-corrente",
  imports: [CommonModule, MatIcon],
  templateUrl: "./scheda-corrente.html",
  styleUrl: "./scheda-corrente.scss",
})
export class SchedaCorrente {
  public idScheda: number = 0;
  public datiRecuperati: boolean = false;
  public titoloScheda: string | null = null;
  public descrizioneAllenamentoPrecedente: string | null = null;
  public descrizioneProssimoAllenamento: string | null = null;
  public descrizioneScheda: string | null = null;
  public dataInizio: Date | null = null;
  public numeroAllenamentiEffettuati: number | null = null;

  private router = inject(Router);
  private errorHandlerService = inject(ErrorHandlerService);
  private hapticService = inject(HapticService);

  constructor(
    private widgetsService: WidgetsService,
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

  ngOnInit() { }

  getDatiSchedaCorrenteWidget(idUtente: number): Promise<null> {
    return new Promise((resolve, reject) => {
      try {
        const request: GetDatiSchedaCorrenteRequestModel = {
          userId: idUtente,
        };

        this.widgetsService.getDatiSchedaCorrente(request).subscribe({
          next: (response: GetDatiSchedaCorrenteResponseModel) => {
            if (!response.errore?.error) {
              this.setDatiScheda(response);

              resolve(null);
            } else {
              this.clear();
              reject(response.errore.error);
            }
          },
          error: (error) => {
            reject(error);
          },
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  setDatiScheda(response: GetDatiSchedaCorrenteResponseModel) {
    this.idScheda = response.idScheda;
    this.titoloScheda = response.titoloScheda;
    this.descrizioneAllenamentoPrecedente =
      response.descrizioneAllenamentoPrecedente;
    this.descrizioneProssimoAllenamento =
      response.descrizioneProssimoAllenamento;
    this.descrizioneScheda = response.descrizioneScheda;
    this.dataInizio = response.dataInizio;
    this.numeroAllenamentiEffettuati = response.numeroAllenamentiEffettuati;
    this.datiRecuperati = true;
  }

  clear() {
    this.titoloScheda = null;
    this.descrizioneAllenamentoPrecedente = null;
    this.descrizioneProssimoAllenamento = null;
    this.dataInizio = null;
    this.numeroAllenamentiEffettuati = null;
    this.datiRecuperati = false;
  }

  visualizzaDatiScheda(idScheda: number) {
    try {
      this.hapticService.trigger('light');
      this.router.navigate(["/le-mie-schede/visualizza-scheda", idScheda]);
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "SchedaCorrente.VisualizzaDatiScheda",
      );
    }
  }

  NavigaAElencoTemplateSchede() {
    try {
      this.hapticService.trigger('light');
      this.router.navigate(["/le-mie-schede"]);
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "SchedaCorrente.NavigaAElencoTemplateSchede",
      );
    }
  }
}
