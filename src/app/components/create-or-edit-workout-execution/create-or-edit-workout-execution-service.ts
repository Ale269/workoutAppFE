import { Injectable } from "@angular/core";
import { ErrorHandlerService } from "src/app/core/services/error-handler.service";
import { SchedaDTO } from "src/app/models/modifica-scheda/schedadto";
import { AllenamentoDTO } from "src/app/models/modifica-scheda/allenamentodto";
import { WorkoutService } from "../../core/services/workout.service";
import { AllenamentoForm } from "../create-or-edit-template-plan-component/workout-form";
import { altriAllenamentiSelectDTO } from "src/app/models/esecuzione-allenamento/altri-allenamenti-select-dto";
import { InitializeWorkoutResponse } from "src/app/models/esecuzione-allenamento/get-allenamento-dto";

@Injectable({
  providedIn: "root",
})
export class CreateOrEditWorkoutExecutionService {
  public AllenamentoForm!: AllenamentoForm;

  constructor(
    private errorHandlerService: ErrorHandlerService,
    private workoutService: WorkoutService
  ) {}

  InitializeScheda(idAllenamento: number): InitializeWorkoutResponse {
    try {
      if (idAllenamento && idAllenamento > 0) {
        const allenamentoDTO: AllenamentoDTO =
          this.getAllenamentoById(idAllenamento);
        const opzioni: altriAllenamentiSelectDTO[] =
          this.getOpzioniAltriAllenamenti(idAllenamento);

        this.AllenamentoForm = new AllenamentoForm(0, allenamentoDTO);

        return {
          allenamentoCorrente: allenamentoDTO,
          opzioniAltriAllenamenti: opzioni,
        };
      } else {
        this.AllenamentoForm = new AllenamentoForm(0);

        // Crea un DTO vuoto con le proprietà di default
        const allenamentoVuoto: AllenamentoDTO = {
          id: 0,
          nomeAllenamento: "",
          ordinamento: 0,
          listaEsercizi: [],
        };

        return {
          allenamentoCorrente: allenamentoVuoto,
          opzioniAltriAllenamenti: this.getOpzioniAltriAllenamenti(),
        };
      }
    } catch (error) {
      throw new Error(
        "CreateOrEditTemplatePlanService.InitializeScheda: " + error
      );
    }
  }

  // Nuovo metodo per ottenere le opzioni degli altri allenamenti
  private getOpzioniAltriAllenamenti(
    idAllenamentoCorrente?: number
  ): altriAllenamentiSelectDTO[] {
    // Dati mock per simulare le opzioni degli altri allenamenti
    const tuttiAllenamenti: altriAllenamentiSelectDTO[] = [
      { id: 1, description: "Push Day componente" },
      { id: 2, description: "Pull Day componente" },
      { id: 3, description: "Leg Day componente" },
      { id: 4, description: "Full Body" },
      { id: 5, description: "Upper Body" },
    ];

    // Se è specificato un ID, escludiamo l'allenamento corrente dalle opzioni
    if (idAllenamentoCorrente) {
      return tuttiAllenamenti.filter(
        (allenamento) => allenamento.id !== idAllenamentoCorrente
      );
    }

    return tuttiAllenamenti;
  }

  // Il metodo getAllenamentoById rimane invariato
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
}
