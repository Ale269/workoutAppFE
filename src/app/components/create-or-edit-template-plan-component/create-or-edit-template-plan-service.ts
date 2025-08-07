import { Injectable } from "@angular/core";
import { ErrorHandlerService } from "src/app/core/services/error-handler.service";
import { SchedaForm } from "./template-plan-form";
import { Observable } from "rxjs";
import { SchedaDTO } from "src/app/models/modifica-scheda/schedadto";
import { EsercizioDTO } from "src/app/models/modifica-scheda/eserciziodto";
import { SerieDTO } from "src/app/models/modifica-scheda/seriedto";
import { FormArray } from "@angular/forms";

@Injectable({
  providedIn: "root",
})
export class CreateOrEditTemplatePlanService {
  public formScheda!: SchedaForm;

  constructor(private errorHandlerService: ErrorHandlerService) {}

  InitializeScheda(idScheda: number) {
    try {
      if (idScheda && idScheda > 0) {
        // Simulazione chiamata API con dati mock
        const schedaDTO: SchedaDTO = this.getSchedaById(idScheda);
        this.formScheda = new SchedaForm(schedaDTO);
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

  AddEsercizio(esercizioData?: Partial<EsercizioDTO>): void {
    try {
      if (!this.formScheda) {
        throw new Error(
          "FormScheda non inizializzato. Chiamare prima InitializeScheda()"
        );
      }

      // Calcola il prossimo ordinamento
      const nextOrdinamento = this.formScheda?.listaEserciziForm?.length || 0;

      // Se sono forniti dati parziali, crea un DTO completo con valori di default
      const esercizioDTO: EsercizioDTO | undefined = esercizioData
        ? {
            id: esercizioData.id || 0,
            idEsercizio: esercizioData.idEsercizio || 0,
            nomeEsercizio: esercizioData.nomeEsercizio || "",
            nomeIcona: esercizioData.nomeIcona || "",
            idTipoEsercizio: esercizioData.idTipoEsercizio || 0,
            idIconaEsercizio: esercizioData.idIconaEsercizio || 0,
            ordinamento: esercizioData.ordinamento || nextOrdinamento, // Usa l'ordinamento fornito o il prossimo disponibile
            listaSerie: esercizioData.listaSerie || [],
          }
        : undefined;

      // Se non sono forniti dati, crea comunque un DTO con l'ordinamento corretto
      if (!esercizioDTO) {
        const emptyEsercizioDTO: EsercizioDTO = {
          id: 0,
          idEsercizio: 0,
          nomeEsercizio: "",
          nomeIcona: "",
          idTipoEsercizio: 0,
          idIconaEsercizio: 0,
          ordinamento: nextOrdinamento,
          listaSerie: [],
        };

        // Chiama il metodo del form per aggiungere l'esercizio
        this.formScheda.addEsercizioForm(emptyEsercizioDTO);
      } else {
        // Chiama il metodo del form per aggiungere l'esercizio
        this.formScheda.addEsercizioForm(esercizioDTO);
      }
    } catch (error) {
      this.errorHandlerService.handleError(
        error,
        "CreateOrEditTemplatePlanService.AddEsercizio"
      );
      throw new Error("CreateOrEditTemplatePlanService.AddEsercizio: " + error);
    }
  }

  AddSerie(esercizioIdentifier: number, serieData?: Partial<SerieDTO>): void {
    try {
      if (!this.formScheda) {
        this.errorHandlerService.handleError(
          "FormScheda non inizializzato. Chiamare prima InitializeScheda()"
        );
        return;
      }

      if (esercizioIdentifier == null || esercizioIdentifier == 0) {
        this.errorHandlerService.handleError(
          `Identifier non valido: ${esercizioIdentifier}`,
          "CreateOrEditTemplatePlanService.AddEsercizio"
        );
        return;
      }

      // Ottieni il form dell'esercizio specifico
      const esercizioForm = this.formScheda.listaEserciziForm.find(
        (es) => es.form.controls["identifier"]?.value == esercizioIdentifier
      );

      if (esercizioForm == null || esercizioForm == undefined) {
        this.errorHandlerService.handleError(
          `Esercizio con identifier ${esercizioIdentifier} non trovato`,
          "CreateOrEditTemplatePlanService.AddSerie"
        );
        return;
      }

      // Se sono forniti dati parziali, crea un DTO completo con valori di default
      const serieDTO: SerieDTO | undefined = serieData
        ? {
            id: serieData.id || 0,
            idSerie: serieData.idSerie || 0,
            ripetizioni: serieData.ripetizioni || 0,
            carico: serieData.carico || 0,
          }
        : undefined;

      // Chiama il metodo del form esercizio per aggiungere la serie
      esercizioForm.addSerieForm(serieDTO);
    } catch (error) {
      this.errorHandlerService.handleError(
        error,
        "CreateOrEditTemplatePlanService.AddSerie"
      );
    }
  }

  DeleteEsercizio(esercizioIdentifier: number): void {
    try {
      if (!this.formScheda) {
        this.errorHandlerService.handleError(
          "FormScheda non inizializzato. Chiamare prima InitializeScheda()"
        );
        return;
      }

      // Trova l'indice dell'esercizio da eliminare
      const indexToDelete = this.formScheda.listaEserciziForm.findIndex(
        (esercizio) =>
          esercizio.form.controls["identifier"]?.value === esercizioIdentifier
      );

      if (indexToDelete === -1) {
        this.errorHandlerService.handleError(
          `Esercizio con identifier ${esercizioIdentifier} non trovato`
        );
        return;
      }

      // Rimuovi l'esercizio dalla lista
      this.formScheda.listaEserciziForm.splice(indexToDelete, 1);

      // Rimuovi il controllo dal FormArray
      this.formScheda.listaEserciziFormArray.removeAt(indexToDelete);

      // Riassegna gli ordinamenti corretti
      this.reassignOrdinamenti();
    } catch (error) {
      this.errorHandlerService.handleError(
        error,
        "CreateOrEditTemplatePlanService.DeleteEsercizio"
      );
      throw new Error(
        "CreateOrEditTemplatePlanService.DeleteEsercizio: " + error
      );
    }
  }

  /**
   * Elimina una serie da un esercizio specifico
   * @param esercizioIdentifier - Identifier dell'esercizio
   * @param serieIdentifier - Identifier della serie da eliminare
   */
  DeleteSerie(esercizioIdentifier: number, serieIdentifier: number): void {
    try {
      if (!this.formScheda) {
        this.errorHandlerService.handleError(
          "FormScheda non inizializzato. Chiamare prima InitializeScheda()"
        );
        return;
      }

      // Trova l'esercizio tramite identifier
      const esercizioForm = this.formScheda.listaEserciziForm.find(
        (es) => es.form.controls["identifier"]?.value == esercizioIdentifier
      );

      if (!esercizioForm) {
        this.errorHandlerService.handleError(
          `Esercizio con identifier ${esercizioIdentifier} non trovato`
        );
        return;
      }

      // Trova l'indice della serie da eliminare
      const serieIndexToDelete = esercizioForm.listaSerieForm.findIndex(
        (serie) => serie.form.controls["identifier"]?.value === serieIdentifier
      );

      if (serieIndexToDelete === -1) {
        this.errorHandlerService.handleError(
          `Serie con identifier ${serieIdentifier} non trovata nell'esercizio ${esercizioIdentifier}`
        );
        return;
      }

      // Rimuovi la serie dalla lista
      esercizioForm.listaSerieForm.splice(serieIndexToDelete, 1);

      // Rimuovi il controllo dal FormArray
      const listaSerieFormArray = esercizioForm.form.controls[
        "listaSerie"
      ] as FormArray;
      listaSerieFormArray.removeAt(serieIndexToDelete);
    } catch (error) {
      this.errorHandlerService.handleError(
        error,
        "CreateOrEditTemplatePlanService.DeleteSerie"
      );
      throw new Error("CreateOrEditTemplatePlanService.DeleteSerie: " + error);
    }
  }

  private reassignOrdinamenti(): void {
    if (!this.formScheda.listaEserciziForm) {
      this.errorHandlerService.handleError("Nessun esercizio trovato");
      return;
    }

    // Ordina gli esercizi per ordinamento corrente per mantenere l'ordine logico
    const eserciziOrdinati = [...this.formScheda.listaEserciziForm].sort(
      (a, b) => {
        const ordinamentoA = a.form.get("Ordinamento")?.value || 0;
        const ordinamentoB = b.form.get("Ordinamento")?.value || 0;
        return ordinamentoA - ordinamentoB;
      }
    );

    // Riassegna gli ordinamenti da 1 a N
    eserciziOrdinati.forEach((esercizio, index) => {
      const newOrdinamento = index + 1;
      esercizio.form.get("Ordinamento")?.setValue(newOrdinamento);
    });

    // Riordina anche l'array principale per mantenere la coerenza
    this.formScheda.listaEserciziForm = eserciziOrdinati;
  }

  // Simulazione chiamata API con dati mock
  private getSchedaById(id: number): SchedaDTO {
    // Dati mock per simulare risposta del server
    const mockSchedaDTO: SchedaDTO = {
      id: id,
      nomeScheda: "Scheda Push/Pull/Legs",
      listaEsercizi: [
        {
          id: 1,
          idEsercizio: 101,
          nomeEsercizio: "Panca Piana",
          nomeIcona: "bench-press-icon",
          idTipoEsercizio: 1, // es: 1=Pettorali, 2=Spalle, ecc.
          idIconaEsercizio: 10,
          ordinamento: 1, // NUOVO CAMPO
          listaSerie: [
            { id: 1, idSerie: 1001, ripetizioni: 8, carico: 80 },
            { id: 2, idSerie: 1002, ripetizioni: 8, carico: 80 },
            { id: 3, idSerie: 1003, ripetizioni: 6, carico: 85 },
          ],
        },
        {
          id: 2,
          idEsercizio: 102,
          nomeEsercizio: "Squat",
          nomeIcona: "squat-icon",
          idTipoEsercizio: 3, // Gambe
          idIconaEsercizio: 20,
          ordinamento: 2, // NUOVO CAMPO
          listaSerie: [
            { id: 4, idSerie: 2001, ripetizioni: 10, carico: 100 },
            { id: 5, idSerie: 2002, ripetizioni: 8, carico: 110 },
            { id: 6, idSerie: 2003, ripetizioni: 6, carico: 120 },
          ],
        },
      ],
    };

    // Simula delay della chiamata HTTP
    return mockSchedaDTO;
  }
}
