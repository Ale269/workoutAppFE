import { Injectable } from "@angular/core";
import { ErrorHandlerService } from "src/app/core/services/error-handler.service";
import { SchedaDTO } from "src/app/models/modifica-scheda/schedadto";
import { AllenamentoDTO } from "src/app/models/modifica-scheda/allenamentodto";
import { WorkoutService } from "../../core/services/workout.service";
import { AllenamentoForm } from "../create-or-edit-template-plan-component/workout-form";

@Injectable({
  providedIn: "root",
})
export class CreateOrEditWorkoutExecutionService {
  public AllenamentoForm!: AllenamentoForm;

  constructor(
    private errorHandlerService: ErrorHandlerService,
    private workoutService: WorkoutService
  ) { }

  InitializeScheda(idAllenamento: number) {
    try {
      if (idAllenamento && idAllenamento > 0) {

        const allenamentoDTO: AllenamentoDTO = this.getAllenamentoById(idAllenamento);
        this.AllenamentoForm = new AllenamentoForm(0, allenamentoDTO);

      } else {
        this.AllenamentoForm = new AllenamentoForm(0);
      }
    } catch (error) {
      throw new Error(
        "CreateOrEditTemplatePlanService.InitializeScheda: " + error
      );
    }
  }


  async registraAllenamento(savePlanRequest: AllenamentoDTO): Promise<void> {
    // Bisogna anche avere il modello della response
    return new Promise((resolve, reject) => {
      try {
        // Esegui la chiamata mandando i dati necessari
        // Adesso come request ho messo la SchedaDTO ma potrebbe servire altro

        //per prova
        setInterval(() => {
          resolve();
        }, 2000);

   
      } catch (error) {
        throw new Error("CreateOrEditTemplatePlanService.savePlan: " + error);
      }
    });
  }

  private getAllenamentoById(id: number): AllenamentoDTO {
    // Dati mock per simulare risposta del server
    const mockAllenamentoDTO: AllenamentoDTO = {

      id: 1,
      nomeAllenamento: "Push Day componente",
      ordinamento: 1,
      listaEsercizi: [
        {
          id: 1,
          idMetodologia: 1,
          idTipoEsercizio: 1,
          idIconaEsercizio: 0,
          ordinamento: 1,
          listaSerie: [
            {
              id: 1,
              ripetizioni: 8,
              carico: 80,
              ordinamento: 1,
            },
            {
              id: 2,
              ripetizioni: 8,
              carico: 80,
              ordinamento: 2,
            },
            {
              id: 3,
              ripetizioni: 6,
              carico: 85,
              ordinamento: 3,
            },
          ],
        },
        {
          id: 2,
          idMetodologia: 1,
          idTipoEsercizio: 3,
          idIconaEsercizio: 1,
          ordinamento: 1,
          listaSerie: [
            {
              id: 6,
              ripetizioni: 5,
              carico: 120,
              ordinamento: 1,
            },
            {
              id: 7,
              ripetizioni: 5,
              carico: 125,
              ordinamento: 2,
            },
          ],
        },
      ],
    };

    // Simula delay della chiamata HTTP
    return mockAllenamentoDTO;
  }
}
