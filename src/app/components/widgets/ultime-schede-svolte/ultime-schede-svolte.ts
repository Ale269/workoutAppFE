import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { MatIconRegistry, MatIcon } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";
import { WidgetsService } from "src/app/core/services/widgets.service";
import {
  GetDatiUltimeSchedeSvolteRequestModel,
  GetDatiUltimeSchedeSvolteResponseModel,
} from "src/app/models/widgets/ultime-schede-svolte/GetDatiUltimeSchedeSvolte";
import { ultimeSchedeSvolteDTO } from "src/app/models/widgets/ultime-schede-svolte/ultimeSchedeSvolte";

@Component({
  selector: "app-ultime-schede-svolte",
  imports: [CommonModule, MatIcon],
  templateUrl: "./ultime-schede-svolte.html",
  styleUrl: "./ultime-schede-svolte.scss",
})
export class UltimeSchedeSvolte {
  public ultimeSchedeSvolteDTO: ultimeSchedeSvolteDTO[] = [];

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

  getDatiUltimeSchedeSvolteWidget(idUtente: number): Promise<null> {
    return new Promise((resolve, reject) => {
      try {
        const request: GetDatiUltimeSchedeSvolteRequestModel = {
          userId: idUtente,
        };

        this.widgetsService.getDatiUltimeSchedeSvolte(request).subscribe({
          next: (response: GetDatiUltimeSchedeSvolteResponseModel) => {
            if (!response.errore?.error) {
              this.ultimeSchedeSvolteDTO = response.ultimeSchedeSvolteDTO;
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

  mostraFunzionalitaInArrivo(): void {
    alert("Funzionalità in arrivo");
  }
}
