import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { WidgetsService } from "src/app/core/services/widgets.service";
import {
  GetDatiSchedaCorrenteRequestModel,
  GetDatiSchedaCorrenteResponseModel,
} from "src/app/models/widgets/scheda-corrente/getDatiSchedaCorrente";

@Component({
  selector: "app-scheda-corrente",
  imports: [CommonModule],
  templateUrl: "./scheda-corrente.html",
  styleUrl: "./scheda-corrente.scss",
})
export class SchedaCorrente {
  public datiRecuperati: boolean = false;
  public titoloScheda: string | null = null;
  public descrizioneAllenamentoPrecedente: string | null = null;
  public descrizioneProssimoAllenamento: string | null = null;
  public dataInizio: Date | null = null;
  public numeroAllenamentiEffettuati: number | null = null;

  constructor(private widgetsService: WidgetsService) {}

  ngOnInit() {}

  getDatiSchedaCorrenteWidget(idUtente: number): Promise<null> {
    return new Promise((resolve, reject) => {
      try {
        const request: GetDatiSchedaCorrenteRequestModel = {
          idUser: idUtente,
        };

        this.widgetsService.getDatiSchedaCorrente(request).subscribe({
          next: (response: GetDatiSchedaCorrenteResponseModel) => {
            if (!response.errore?.error) {
              this.titoloScheda = response.titoloScheda;
              this.descrizioneAllenamentoPrecedente =
                response.descrizioneAllenamentoPrecedente;
              this.descrizioneProssimoAllenamento =
                response.descrizioneProssimoAllenamento;
              this.dataInizio = response.dataInizio;
              this.numeroAllenamentiEffettuati =
                response.numeroAllenamentiEffettuati;
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
}
