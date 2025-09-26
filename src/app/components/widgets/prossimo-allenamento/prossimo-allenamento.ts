import { Component, OnInit } from "@angular/core";
import { WidgetsService } from "src/app/core/services/widgets.service";
import {
  GetDatiProssimoAllenamentoRequestModel,
  GetDatiProssimoAllenamentoResponseModel,
} from "src/app/models/widgets/prossimo-allenamento/getDatiProssimoAllenamento";

@Component({
  selector: "app-prossimo-allenamento",
  imports: [],
  templateUrl: "./prossimo-allenamento.html",
  styleUrl: "./prossimo-allenamento.scss",
})
export class ProssimoAllenamento implements OnInit {
  public datiRecuperati: boolean = false;
  public descrizioneAllenamentoCorrente: string | null = null;
  public numeroGiornoAllenamentoCorrente: number | null = null;
  public numeroGiornoAllenamentiTotali: number | null = null;

  constructor(private widgetsService: WidgetsService) {}

  ngOnInit() {}

  getDatiProssimoAllenamentoWidget(idUtente: number): Promise<null> {
    return new Promise((resolve, reject) => {
      try {
        const request: GetDatiProssimoAllenamentoRequestModel = {
          userId: idUtente,
        };

        this.widgetsService.getDatiProssimoAllenamento(request).subscribe({
          next: (response: GetDatiProssimoAllenamentoResponseModel) => {
            if (!response.errore?.error) {
              this.descrizioneAllenamentoCorrente =
                response.descrizioneAllenamentoCorrente;
              this.numeroGiornoAllenamentoCorrente =
                response.numeroGiornoAllenamentoCorrente;
              this.numeroGiornoAllenamentiTotali =
                response.numeroGiornoAllenamentiTotali;
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
