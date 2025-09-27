import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { ProssimoAllenamento } from "../widgets/prossimo-allenamento/prossimo-allenamento";
import { ErrorHandlerService } from "src/app/core/services/error-handler.service";
import { SpinnerService } from "src/app/core/services/spinner.service";
import { CreateOrEditWorkoutExecution } from "../create-or-edit-workout-execution/create-or-edit-workout-execution";
import { AuthService } from "src/app/core/services/auth.service";
import { SchedaCorrente } from "../widgets/scheda-corrente/scheda-corrente";
import { UltimiAllenamentiSvolti } from "../widgets/ultimi-allenamenti-svolti/ultimi-allenamenti-svolti";
import { UltimeSchedeSvolte } from "../widgets/ultime-schede-svolte/ultime-schede-svolte";

@Component({
  selector: "app-home",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ProssimoAllenamento,
    SchedaCorrente,
    UltimiAllenamentiSvolti,
    UltimeSchedeSvolte
  ],
  templateUrl: "./home-component.html",
  styleUrls: ["./home-component.scss"],
})
export class HomeComponent implements OnInit, AfterViewInit {
  @ViewChild(ProssimoAllenamento) prossimoAllenamento!: ProssimoAllenamento;
  @ViewChild(SchedaCorrente) SchedaCorrente!: SchedaCorrente;
  @ViewChild(UltimiAllenamentiSvolti)
  UltimiAllenamentiSvolti!: UltimiAllenamentiSvolti;
  @ViewChild(UltimeSchedeSvolte)
  UltimeSchedeSvolte!: UltimeSchedeSvolte;

  private currentSpinnerId: string | null = null;

  constructor(
    private cdr: ChangeDetectorRef,
    private errorHandlerService: ErrorHandlerService,
    private spinnerService: SpinnerService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    try {
    } catch (error) {
      this.errorHandlerService.handleError(error, "HomeComponent.ngOnInit");
    }
  }

  async ngAfterViewInit() {
    try {
      this.initializeWidgets();
    } catch (error) {
      this.errorHandlerService.handleError(
        error,
        "HomeComponent.ngAfterViewInit"
      );
    }
  }

  async initializeWidgets() {
    try {
      const user = this.authService.getCurrentUser();
      if (user) {
        await this.getWidgetsData(user.usedId);
      } else {
        this.errorHandlerService.handleError(
          "nessun user trovato",
          "HomeComponent.initializeWidgets"
        );
      }
    } catch (error) {
      this.errorHandlerService.handleError(
        error,
        "HomeComponent.initializeWidgets"
      );
    }
  }

  async getWidgetsData(idUser: number) {
    try {
      // Mostra lo spinner di inizializzazione
      this.currentSpinnerId = this.spinnerService.showWithResult(
        "Caricamento dati widgets",
        {
          successMessage: "Caricamento completato",
          errorMessage: "Errore nel processo di caricamento",
          resultDuration: 250,
          minSpinnerDuration: 250,
        }
      );

      // Gestione errori per singolo widget
      const results = await Promise.allSettled([
        this.prossimoAllenamento
          .getDatiProssimoAllenamentoWidget(idUser)
          .catch((error) => {
            this.errorHandlerService.handleError(
              error,
              "Widget ProssimoAllenamento"
            );
            return null;
          }),
        this.SchedaCorrente.getDatiSchedaCorrenteWidget(idUser).catch(
          (error) => {
            this.errorHandlerService.handleError(
              error,
              "Widget SchedaCorrente"
            );
            return null;
          }
        ),
        this.UltimiAllenamentiSvolti.getDatiUltimiAllenamentiSvoltiWidget(
          idUser
        ).catch((error) => {
          this.errorHandlerService.handleError(error, "Widget UltimiAllenamentiSvolti");
          return null;
        }),
        this.UltimeSchedeSvolte.getDatiUltimeSchedeSvolteWidget(
          idUser
        ).catch((error) => {
          this.errorHandlerService.handleError(error, "Widget UltimeSchedeSvolte");
          return null;
        }),

        // Altri widget...
        // this.altroWidget.getDatiWidget().catch(...)
      ])

      // Controlla quali widget sono andati in errore
      results.forEach((result, index) => {
        if (result.status === "rejected") {
          console.error(`Widget ${index} fallito:`, result.reason);
        }
      });
    } catch (error) {
      this.errorHandlerService.handleError(
        error,
        "HomeComponent.getWidgetsData"
      );
    } finally {
      setTimeout(() => {
        if (this.currentSpinnerId) {
          this.spinnerService.setSuccess(this.currentSpinnerId);
        }
      }, 100);
    }
  }

  // Metodo per ricaricare i dati (utile per refresh button)
  async refreshWidgets() {
    this.initializeWidgets();
  }
}
