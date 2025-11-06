import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ErrorHandlerService } from "src/app/core/services/error-handler.service";
import { WidgetsService } from "src/app/core/services/widgets.service";
import {
  GetDatiProssimoAllenamentoRequestModel,
  GetDatiProssimoAllenamentoResponseModel,
} from "src/app/models/widgets/prossimo-allenamento/getDatiProssimoAllenamento";
import { createOrEdit } from "../../create-or-edit-workout-execution/create-or-edit-workout-execution";

@Component({
  selector: "app-prossimo-allenamento",
  imports: [],
  templateUrl: "./prossimo-allenamento.html",
  styleUrl: "./prossimo-allenamento.scss",
})
export class ProssimoAllenamento implements OnInit {
  public datiRecuperati: boolean = false;
  public idTemplateAllenamento: number | null = null;
  public descrizioneAllenamentoCorrente: string | null = null;
  public numeroGiornoAllenamentoCorrente: number | null = null;
  public numeroGiornoAllenamentiTotali: number | null = null;

  public giorniArray: number[] = [];

  constructor(
    private widgetsService: WidgetsService,
    private errorHandlerService: ErrorHandlerService,
    private router: Router
  ) {}

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
              this.idTemplateAllenamento = response.idAllenamento;
              this.descrizioneAllenamentoCorrente =
                response.descrizioneAllenamentoCorrente;
              this.numeroGiornoAllenamentoCorrente =
                response.numeroGiornoAllenamentoCorrente;
              this.numeroGiornoAllenamentiTotali =
                response.numeroGiornoAllenamentiTotali;
              this.datiRecuperati = true;

              for (let i = 1; i <= this.numeroGiornoAllenamentiTotali; i++) {
                this.giorniArray.push(i);
              }
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

  NavigaARegistraAllenamento() {
    try {
      this.router.navigate(["/registra-allenamento/", this.idTemplateAllenamento], {
        state: {
          idAllenamento: null,
          idTemplateAllenamento: this.idTemplateAllenamento,
          createOrEdit: createOrEdit.create,
          //  idTemplateAllenamento: this.idTemplateAllenamento
        },
      });
    } catch (error) {
      this.errorHandlerService.handleError(
        error,
        "ProssimoAllenamento.NavigaARegistraAllenamento"
      );
    }
  }
}
