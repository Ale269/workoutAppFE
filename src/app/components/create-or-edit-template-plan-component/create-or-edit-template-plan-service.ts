import { Injectable } from "@angular/core";
import { ErrorHandlerService } from "src/app/core/services/error-handler.service";
import { SchedaForm } from "./template-plan-form";
import { Observable } from "rxjs";
import { SchedaDTO } from "src/app/models/modifica-scheda/schedadto";
import { EsercizioDTO } from "src/app/models/modifica-scheda/eserciziodto";
import { SerieDTO } from "src/app/models/modifica-scheda/seriedto";
import { FormArray } from "@angular/forms";
import { AllenamentoDTO } from "src/app/models/modifica-scheda/allenamentodto";
import { AllenamentoForm } from "./workout-form";
import { WorkoutService } from "../../core/services/workout.service";

@Injectable({
  providedIn: "root",
})
export class CreateOrEditTemplatePlanService {
  public formScheda!: SchedaForm;

  constructor(
    private errorHandlerService: ErrorHandlerService,
    private workoutService: WorkoutService
  ) {}

  InitializeScheda(idScheda: number) {
    try {
      if (idScheda && idScheda > 0) {
        //dati mockati dalla componente

        const schedaDTO: SchedaDTO = this.getSchedaById(idScheda);
        this.formScheda = new SchedaForm(schedaDTO);
        /*
         */

        /*
        //dati mockati reali dal api service (if mocked==true va su assets senno BE)
        this.workoutService.getSingleWorkout(idScheda).subscribe({
          next: (response) => {
            console.log("RESPONSE WORKOUT: ", response);
            if(response.esito === "OK"){
              if (response.payload.workout){
                const workout: SchedaDTO[] = response.payload.workout;
                this.formScheda = new SchedaForm(workout[0]);
              }
            }else{
              //apri modale con errore stampato
            }
          }
        })
/*
         */
      } else {
        // Crea form vuoto per nuova scheda
        this.formScheda = new SchedaForm();
      }
    } catch (error) {
      throw new Error(
        "CreateOrEditTemplatePlanService.InitializeScheda: " + error
      );
    }
  }

  // AddAllenamento(allenamentoData?: Partial<AllenamentoDTO>): void {
  //   try {
  //     if (!this.formScheda) {
  //       throw new Error(
  //         "FormScheda non inizializzato. Chiamare prima InitializeScheda()"
  //       );
  //     }

  //     // Calcola il prossimo ordinamento
  //     const nextOrdinamento =
  //       this.formScheda?.listaAllenamentiForm?.length || 0;

  //     // Se sono forniti dati parziali, crea un DTO completo con valori di default
  //     const allenamentoDTO: AllenamentoDTO | undefined = allenamentoData
  //       ? {
  //           id: allenamentoData.id || 0,
  //           idAllenamento: allenamentoData.idAllenamento || 0,
  //           nomeAllenamento: allenamentoData.nomeAllenamento || "",
  //           ordinamento: allenamentoData.ordinamento || nextOrdinamento,
  //           listaEsercizi: allenamentoData.listaEsercizi || [],
  //         }
  //       : undefined;

  //     // Se non sono forniti dati, crea comunque un DTO con l'ordinamento corretto
  //     if (!allenamentoDTO) {
  //       const emptyAllenamentoDTO: AllenamentoDTO = {
  //         id: 0,
  //         idAllenamento: 0,
  //         nomeAllenamento: "",
  //         ordinamento: nextOrdinamento,
  //         listaEsercizi: [],
  //       };

  //       this.formScheda.addAllenamentoForm(emptyAllenamentoDTO);
  //     } else {
  //       this.formScheda.addAllenamentoForm(allenamentoDTO);
  //     }
  //   } catch (error) {
  //     this.errorHandlerService.handleError(
  //       error,
  //       "CreateOrEditTemplatePlanService.AddAllenamento"
  //     );
  //     throw new Error(
  //       "CreateOrEditTemplatePlanService.AddAllenamento: " + error
  //     );
  //   }
  // }

  // AddEsercizio(
  //   allenamentoIdentifier: number,
  //   esercizioData?: Partial<EsercizioDTO>
  // ): void {
  //   try {
  //     if (!this.formScheda) {
  //       throw new Error(
  //         "FormScheda non inizializzato. Chiamare prima InitializeScheda()"
  //       );
  //     }

  //     // Trova l'allenamento tramite identifier
  //     const allenamentoForm = this.findAllenamentoByIdentifier(
  //       allenamentoIdentifier
  //     );

  //     if (!allenamentoForm) {
  //       throw new Error(
  //         `Allenamento con identifier ${allenamentoIdentifier} non trovato`
  //       );
  //     }

  //     // Calcola il prossimo ordinamento per l'esercizio
  //     const nextOrdinamento = allenamentoForm.listaEserciziForm.length + 1;

  //     // Se sono forniti dati parziali, crea un DTO completo con valori di default
  //     const esercizioDTO: EsercizioDTO | undefined = esercizioData
  //       ? {
  //           id: esercizioData.id || 0,
  //           idEsercizio: esercizioData.idEsercizio || 0,
  //           idTipoEsercizio: esercizioData.idTipoEsercizio || 0,
  //           idIconaEsercizio: esercizioData.idIconaEsercizio || 0,
  //           ordinamento: esercizioData.ordinamento || nextOrdinamento,
  //           listaSerie: esercizioData.listaSerie || [],
  //         }
  //       : undefined;

  //     // Se non sono forniti dati, crea comunque un DTO con l'ordinamento corretto
  //     if (!esercizioDTO) {
  //       const emptyEsercizioDTO: EsercizioDTO = {
  //         id: 0,
  //         idEsercizio: 0,
  //         idTipoEsercizio: 0,
  //         idIconaEsercizio: 0,
  //         ordinamento: nextOrdinamento,
  //         listaSerie: [],
  //       };

  //       allenamentoForm.addEsercizioForm(emptyEsercizioDTO);
  //     } else {
  //       allenamentoForm.addEsercizioForm(esercizioDTO);
  //     }
  //   } catch (error) {
  //     this.errorHandlerService.handleError(
  //       error,
  //       "CreateOrEditTemplatePlanService.AddEsercizio"
  //     );
  //     throw new Error("CreateOrEditTemplatePlanService.AddEsercizio: " + error);
  //   }
  // }

  // AddSerie(
  //   allenamentoIdentifier: number,
  //   esercizioIdentifier: number,
  //   serieData?: Partial<SerieDTO>
  // ): void {
  //   try {
  //     if (!this.formScheda) {
  //       throw new Error(
  //         "FormScheda non inizializzato. Chiamare prima InitializeScheda()"
  //       );
  //     }

  //     // Trova l'allenamento tramite identifier
  //     const allenamentoForm = this.findAllenamentoByIdentifier(
  //       allenamentoIdentifier
  //     );

  //     if (!allenamentoForm) {
  //       throw new Error(
  //         `Allenamento con identifier ${allenamentoIdentifier} non trovato`
  //       );
  //     }

  //     // Trova l'esercizio tramite identifier
  //     const esercizioForm =
  //       allenamentoForm.findEsercizioByIdentifier(esercizioIdentifier);

  //     if (!esercizioForm) {
  //       throw new Error(
  //         `Esercizio con identifier ${esercizioIdentifier} non trovato nell'allenamento ${allenamentoIdentifier}`
  //       );
  //     }

  //     // Se sono forniti dati parziali, crea un DTO completo con valori di default
  //     const serieDTO: SerieDTO | undefined = serieData
  //       ? {
  //           id: serieData.id || 0,
  //           idSerie: serieData.idSerie || 0,
  //           ripetizioni: serieData.ripetizioni || 0,
  //           carico: serieData.carico || 0,
  //         }
  //       : undefined;

  //     // Chiama il metodo del form esercizio per aggiungere la serie
  //     esercizioForm.addSerieForm(serieDTO);
  //   } catch (error) {
  //     this.errorHandlerService.handleError(
  //       error,
  //       "CreateOrEditTemplatePlanService.AddSerie"
  //     );
  //     throw new Error("CreateOrEditTemplatePlanService.AddSerie: " + error);
  //   }
  // }

  // private findAllenamentoByIdentifier(
  //   identifier: number
  // ): AllenamentoForm | null {
  //   if (!this.formScheda?.listaAllenamentiForm) {
  //     return null;
  //   }

  //   return (
  //     this.formScheda.listaAllenamentiForm.find(
  //       (allenamento) =>
  //         allenamento.form.get("identifier")?.value === identifier
  //     ) || null
  //   );
  // }

  AddWorkout(nomeAllenamento?: string): void {
    try {
      if (!this.formScheda) {
        throw new Error(
          "FormScheda non inizializzato. Chiamare prima InitializeScheda()"
        );
      }

      // Calcola l'ordinamento per il nuovo allenamento (ultima posizione)
      const nextOrdinamento = this.formScheda.listaAllenamentiForm.length + 1;

      // Crea un AllenamentoDTO con il nome e l'ordinamento
      const nuovoAllenamentoDTO: AllenamentoDTO = {
        id: 0,
        nomeAllenamento: nomeAllenamento || `Giorno ${nextOrdinamento}`,
        ordinamento: nextOrdinamento,
        listaEsercizi: [], // Lista vuota per un nuovo allenamento
      };

      // Usa il metodo esistente per aggiungere l'allenamento
      this.formScheda.addAllenamentoForm(nuovoAllenamentoDTO);
    } catch (error) {
      throw new Error("CreateOrEditTemplatePlanService.AddWorkout: " + error);
    }
  }

  DeleteWorkout(allenamentoIdentifier: number): void {
    try {
      this.formScheda.DeleteAllenamento(allenamentoIdentifier);
    } catch (error) {
      throw new Error(
        "CreateOrEditTemplatePlanService.DeleteAllenamento: " + error
      );
    }
  }

  // DeleteEsercizio(
  //   allenamentoIdentifier: number,
  //   esercizioIdentifier: number
  // ): void {
  //   try {
  //     if (!this.formScheda) {
  //       throw new Error(
  //         "FormScheda non inizializzato. Chiamare prima InitializeScheda()"
  //       );
  //     }

  //     Trova l'allenamento tramite identifier
  //     const allenamentoForm = this.findAllenamentoByIdentifier(
  //       allenamentoIdentifier
  //     );

  //     if (!allenamentoForm) {
  //       throw new Error(
  //         `Allenamento con identifier ${allenamentoIdentifier} non trovato`
  //       );
  //     }

  //     Trova l'indice dell'esercizio da eliminare
  //     const indexToDelete = allenamentoForm.listaEserciziForm.findIndex(
  //       (esercizio) =>
  //         esercizio.form.controls["identifier"]?.value === esercizioIdentifier
  //     );

  //     if (indexToDelete === -1) {
  //       throw new Error(
  //         `Esercizio con identifier ${esercizioIdentifier} non trovato nell'allenamento ${allenamentoIdentifier}`
  //       );
  //     }

  //     Rimuovi l'esercizio dalla lista
  //     allenamentoForm.listaEserciziForm.splice(indexToDelete, 1);

  //     Rimuovi il controllo dal FormArray
  //     allenamentoForm.listaEserciziFormArray.removeAt(indexToDelete);

  //     Riassegna gli ordinamenti corretti per gli esercizi di questo allenamento
  //     allenamentoForm.reassignOrdinamentiEsercizi();
  //   } catch (error) {
  //     this.errorHandlerService.handleError(
  //       error,
  //       "CreateOrEditTemplatePlanService.DeleteEsercizio"
  //     );
  //     throw new Error(
  //       "CreateOrEditTemplatePlanService.DeleteEsercizio: " + error
  //     );
  //   }
  // }

  // DeleteSerie(
  //   allenamentoIdentifier: number,
  //   esercizioIdentifier: number,
  //   serieIdentifier: number
  // ): void {
  //   try {
  //     if (!this.formScheda) {
  //       throw new Error(
  //         "FormScheda non inizializzato. Chiamare prima InitializeScheda()"
  //       );
  //     }

  //     Trova l'allenamento tramite identifier
  //     const allenamentoForm = this.findAllenamentoByIdentifier(
  //       allenamentoIdentifier
  //     );

  //     if (!allenamentoForm) {
  //       throw new Error(
  //         `Allenamento con identifier ${allenamentoIdentifier} non trovato`
  //       );
  //     }

  //     Trova l'esercizio tramite identifier
  //     const esercizioForm =
  //       allenamentoForm.findEsercizioByIdentifier(esercizioIdentifier);

  //     if (!esercizioForm) {
  //       throw new Error(
  //         `Esercizio con identifier ${esercizioIdentifier} non trovato nell'allenamento ${allenamentoIdentifier}`
  //       );
  //     }

  //     Trova l'indice della serie da eliminare
  //     const serieIndexToDelete = esercizioForm.listaSerieForm.findIndex(
  //       (serie) => serie.form.controls["identifier"]?.value === serieIdentifier
  //     );

  //     if (serieIndexToDelete === -1) {
  //       throw new Error(
  //         `Serie con identifier ${serieIdentifier} non trovata nell'esercizio ${esercizioIdentifier}`
  //       );
  //     }

  //     Rimuovi la serie dalla lista
  //     esercizioForm.listaSerieForm.splice(serieIndexToDelete, 1);

  //     Rimuovi il controllo dal FormArray
  //     const listaSerieFormArray = esercizioForm.form.controls[
  //       "listaSerie"
  //     ] as FormArray;
  //     listaSerieFormArray.removeAt(serieIndexToDelete);
  //   } catch (error) {
  //     this.errorHandlerService.handleError(
  //       error,
  //       "CreateOrEditTemplatePlanService.DeleteSerie"
  //     );
  //     throw new Error("CreateOrEditTemplatePlanService.DeleteSerie: " + error);
  //   }
  // }

  // private reassignOrdinamentiAllenamenti(): void {
  //   if (!this.formScheda?.listaAllenamentiForm) {
  //     return;
  //   }

  //   Ordina gli allenamenti per ordinamento corrente
  //   const allenamentiOrdinati = [...this.formScheda.listaAllenamentiForm].sort(
  //     (a, b) => {
  //       const ordinamentoA = a.form.controls["ordinamento"]?.value || 0;
  //       const ordinamentoB = b.form.controls["ordinamento"]?.value || 0;
  //       return ordinamentoA - ordinamentoB;
  //     }
  //   );

  //   Riassegna gli ordinamenti da 1 a N
  //   allenamentiOrdinati.forEach((allenamento, index) => {
  //     const newOrdinamento = index + 1;
  //     allenamento.form.controls["ordinamento"]?.setValue(newOrdinamento);
  //   });

  //   Riordina anche l'array principale
  //   this.formScheda.listaAllenamentiForm = allenamentiOrdinati;
  // }

  // Simulazione chiamata API con dati mock

  private getSchedaById(id: number): SchedaDTO {
    // Dati mock per simulare risposta del server
    const mockSchedaDTO: SchedaDTO = {
      id: id,
      nomeScheda: "Scheda Push/Pull/Legs",
      listaAllenamenti: [
        {
          id: 1,
          nomeAllenamento: "Push Day componente",
          ordinamento: 1,
          listaEsercizi: [
            {
              id: 1,
              idEsercizio: 101,
              idMetodologia: 1,
              idTipoEsercizio: 1,
              idIconaEsercizio: 0,
              ordinamento: 1,
              listaSerie: [
                {
                  id: 1,
                  idSerie: 1001,
                  ripetizioni: 8,
                  carico: 80,
                  ordinamento: 1,
                },
                {
                  id: 2,
                  idSerie: 1002,
                  ripetizioni: 8,
                  carico: 80,
                  ordinamento: 2,
                },
                {
                  id: 3,
                  idSerie: 1003,
                  ripetizioni: 6,
                  carico: 85,
                  ordinamento: 3,
                },
              ],
            },
            {
              id: 2,
              idEsercizio: 102,
              idMetodologia: 1,
              idTipoEsercizio: 2,
              idIconaEsercizio: 2,
              ordinamento: 2,
              listaSerie: [
                {
                  id: 4,
                  idSerie: 2001,
                  ripetizioni: 10,
                  carico: 50,
                  ordinamento: 1,
                },
                {
                  id: 5,
                  idSerie: 2002,
                  ripetizioni: 8,
                  carico: 55,
                  ordinamento: 2,
                },
              ],
            },
          ],
        },
        {
          id: 2,
          nomeAllenamento: "Pull Day",
          ordinamento: 2,
          listaEsercizi: [
            {
              id: 3,
              idEsercizio: 103,
              idMetodologia: 1,
              idTipoEsercizio: 3,
              idIconaEsercizio: 1,
              ordinamento: 1,
              listaSerie: [
                {
                  id: 6,
                  idSerie: 3001,
                  ripetizioni: 5,
                  carico: 120,
                  ordinamento: 1,
                },
                {
                  id: 7,
                  idSerie: 3002,
                  ripetizioni: 5,
                  carico: 125,
                  ordinamento: 2,
                },
              ],
            },
          ],
        },
      ],
    };

    // Simula delay della chiamata HTTP
    return mockSchedaDTO;
  }
}
