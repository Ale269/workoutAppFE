import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { MatIconRegistry, MatIcon } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { ErrorHandlerService } from "src/app/core/services/error-handler.service";
import { WidgetsService } from "src/app/core/services/widgets.service";
import { ultimiAllenamentiSvoltiDTO } from "src/app/models/widgets/ultimi-allenamenti-svolti/allenamentiSvolti";
import {
  GetDatiUltimiAllenamentiSvoltiRequestModel,
  GetDatiUltimiAllenamentiSvoltiResponseModel,
} from "src/app/models/widgets/ultimi-allenamenti-svolti/getDatiUltimiAllenamentiSvolti";

@Component({
  selector: "app-ultimi-allenamenti-svolti",
  imports: [CommonModule, MatIcon],
  templateUrl: "./ultimi-allenamenti-svolti.html",
  styleUrl: "./ultimi-allenamenti-svolti.scss",
})
export class UltimiAllenamentiSvolti {
  public datiRecuperati: boolean = false;
  public ultimiAllenamentiSvoltiDTO: ultimiAllenamentiSvoltiDTO[] = [];

  private router = inject(Router);
  private errorHandlerService = inject(ErrorHandlerService);

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

  ngOnInit() {}

  getDatiUltimiAllenamentiSvoltiWidget(idUtente: number): Promise<null> {
    return new Promise((resolve, reject) => {
      try {
        const request: GetDatiUltimiAllenamentiSvoltiRequestModel = {
          userId: idUtente,
        };

        this.widgetsService.getDatiUltimiAllenamentiSvolti(request).subscribe({
          next: (response: GetDatiUltimiAllenamentiSvoltiResponseModel) => {
            if (!response.errore?.error) {
              this.ultimiAllenamentiSvoltiDTO =
                response.ultimiAllenamentiSvoltiDTO;
              this.datiRecuperati = true;
              resolve(null);
            } else {
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

  NavigaAElencoAllenamentiSchede() {
    try {
      this.router.navigate(["/allenamenti-svolti"]);
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "UltimiAllenamentiSvolti.NavigaAElencoAllenamentiSchede",
      );
    }
  }

  NavigaAElencoTemplateSchede() {
    try {
      this.router.navigate(["/le-mie-schede"]);
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "UltimiAllenamentiSvolti.NavigaAElencoTemplateSchede",
      );
    }
  }

  NavigaAVisualizzaAllenamento(idAllenamento: number) {
    try {
      this.router.navigate([
        "/allenamenti-svolti/visualizza-allenamento",
        idAllenamento,
      ]);
    } catch (error) {
      this.errorHandlerService.logError(
        error,
        "UltimiAllenamentiSvolti.NavigaAVisualizzaAllenamento",
      );
    }
  }
}
