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
import {CreateOrEditWorkoutExecution} from "../create-or-edit-workout-execution/create-or-edit-workout-execution";

@Component({
  selector: "app-home",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ProssimoAllenamento, CreateOrEditWorkoutExecution],
  templateUrl: "./home-component.html",
  styleUrls: ["./home-component.scss"],
})
export class HomeComponent implements OnInit, AfterViewInit {
  @ViewChild(ProssimoAllenamento) prossimoAllenamento!: ProssimoAllenamento;

  private currentSpinnerId: string | null = null;

  constructor(
    private cdr: ChangeDetectorRef,
    private errorHandlerService: ErrorHandlerService,
    private spinnerService: SpinnerService
  ) {}

  ngOnInit() {
    try {
    } catch (error) {
      this.errorHandlerService.handleError(error, "HomeComponent.ngOnInit");
    }
  }

  async ngAfterViewInit() {
    try {
      await this.getWidgetsData();
    } catch (error) {
      this.errorHandlerService.handleError(
        error,
        "HomeComponent.ngAfterViewInit"
      );
    }
  }

  async getWidgetsData() {
    try {
      // Mostra lo spinner di inizializzazione
      this.currentSpinnerId = this.spinnerService.showWithResult(
        "Caricamento dati widgets",
        {
          successMessage: "Caricamento completato",
          errorMessage: "Errore nel processo di caricamento",
          resultDuration: 500,
          minSpinnerDuration: 500,
        }
      );

      // Gestione errori per singolo widget
      const results = await Promise.allSettled([
        this.prossimoAllenamento
          .getDatiProssimoAllenamentoWidget()
          .catch((error) => {
            this.errorHandlerService.handleError(
              error,
              "Widget ProssimoAllenamento"
            );
            return null;
          }),

        // Altri widget...
        // this.altroWidget.getDatiWidget().catch(...)
      ]);

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
    await this.getWidgetsData();
  }
}
