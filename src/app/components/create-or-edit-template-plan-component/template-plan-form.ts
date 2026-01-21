import { FormArray, FormControl, FormGroup, Validators } from "@angular/forms";
import { AllenamentoForm, AllenamentoFormModel } from "./workout-form";
import { AllenamentoDTO } from "src/app/models/create-or-edit-template-or-entity-form-dto/allenamentodto";
import { SchedaDTO } from "src/app/models/create-or-edit-template-or-entity-form-dto/schedadto";

interface SchedaFormModel {
  id: FormControl<number | null>;
  isActive: FormControl<boolean | null>;
  idTemplate: FormControl<number | null>;
  nomeScheda: FormControl<string | null>;
  descrizioneScheda: FormControl<string | null>;
  listaAllenamenti: FormArray<FormGroup<AllenamentoFormModel>>;
}

export class SchedaForm {
  public listaAllenamentiForm: AllenamentoForm[] = [];
  public identifier: number = -1;
  public form: FormGroup;

  public availableWorkoutPositions: number[] = [];

  constructor() {
    // Inizializza il form con valori di default
    this.form = new FormGroup<SchedaFormModel>({
      id: new FormControl<number | null>(null),
      idTemplate: new FormControl<number | null>(null),
      isActive: new FormControl<boolean | null>(false),
      descrizioneScheda: new FormControl<string | null>(""),
      nomeScheda: new FormControl<string | null>("Scheda allenamento", [
        Validators.required,
      ]),
      listaAllenamenti: new FormArray<FormGroup<AllenamentoFormModel>>([]),
    });

    // Crea un DTO temporaneo per il primo allenamento
    const primoAllenamentoDTO: AllenamentoDTO = {
      id: 0,
      idTemplate: 0,
      dataEsecuzione: null,
      nomeAllenamento: "Giorno 1",
      ordinamento: 1,
      listaEsercizi: [], // o altri campi necessari per AllenamentoDTO
    };

    // Aggiunge il primo allenamento con nome di default "Giorno 1"
    this.addAllenamentoForm(primoAllenamentoDTO);
  }

  updateForm(schedaDTO: SchedaDTO): void {
    if (!schedaDTO) {
      return;
    }

    // Aggiorna i campi base
    this.form.patchValue({
      id: schedaDTO.id,
      idTemplate: schedaDTO.idTemplate,
      nomeScheda: schedaDTO.nomeScheda,
      isActive: schedaDTO.schedaAttiva
    });

    // Pulisce gli allenamenti esistenti
    this.listaAllenamentiForm = [];
    const listaAllenamentiArray = this.form.controls[
      "listaAllenamenti"
    ] as FormArray<FormGroup<AllenamentoFormModel>>;
    while (listaAllenamentiArray.length !== 0) {
      listaAllenamentiArray.removeAt(0);
    }

    // Aggiunge i nuovi allenamenti
    if (schedaDTO.listaAllenamenti) {
      schedaDTO.listaAllenamenti.forEach((allenamentoDTO) => {
        this.addAllenamentoForm(allenamentoDTO);
      });

      // Aggiorna le posizioni disponibili
      this.sanitizeWorkoutOrdering();
    }
  }

  addAllenamentoForm(allenamentoDTO?: AllenamentoDTO) {
    try {
      this.identifier = this.identifier + 1;

      // Determina l'ordinamento per il nuovo allenamento (ultima posizione)
      const nextOrdinamento = this.listaAllenamentiForm.length + 1;

      const newAllenamentoForm: AllenamentoForm = new AllenamentoForm(
        this.identifier,
        allenamentoDTO
      );

      // Se non ha già un ordinamento (nuovo allenamento), assegna l'ultima posizione
      if (!allenamentoDTO?.ordinamento) {
        newAllenamentoForm.form
          .get("ordinamento")
          ?.setValue(nextOrdinamento, { emitEvent: false });
      }

      this.listaAllenamentiForm.push(newAllenamentoForm);

      const listaAllenamentiFormArray = this.form.controls[
        "listaAllenamenti"
      ] as FormArray;
      listaAllenamentiFormArray.push(newAllenamentoForm.form);

      // Aggiorna le posizioni disponibili senza riordinare
      this.updateAvailableWorkoutPositions();
      this.form.markAsDirty();
    } catch (error) {
      throw new Error("SchedaForm.addAllenamentoForm: " + error);
    }
  }

  private updateAvailableWorkoutPositions(): void {
    const totalWorkouts = this.listaAllenamentiForm.length;
    this.availableWorkoutPositions = Array.from(
      { length: totalWorkouts },
      (_, i) => i + 1
    );
  }

  DeleteAllenamento(allenamentoIdentifier: number): boolean {
    try {
      if (!this.form) {
        throw new Error(
          "FormScheda non inizializzato. Chiamare prima InitializeScheda()"
        );
      }

      // Trova l'indice dell'allenamento da eliminare
      const indexToDelete = this.listaAllenamentiForm.findIndex(
        (allenamento) =>
          allenamento.form.controls["identifier"]?.value ===
          allenamentoIdentifier
      );

      if (indexToDelete === -1) {
        throw new Error(
          `Allenamento con identifier ${allenamentoIdentifier} non trovato`
        );
      }

      // Rimuovi l'allenamento dalla lista
      this.listaAllenamentiForm.splice(indexToDelete, 1);

      // Rimuovi il controllo dal FormArray
      this.listaAllenamentiFormArray.removeAt(indexToDelete);

      // Riassegna gli ordinamenti dopo l'eliminazione
      this.sanitizeWorkoutOrdering();
      this.form.markAsDirty();

      return true;
    } catch (error) {
      throw new Error("SchedaForm.DeleteAllenamento: " + error);
    }
  }

  findAllenamentoByIdentifier(identifier: number): AllenamentoForm | null {
    return (
      this.listaAllenamentiForm.find(
        (allenamento) =>
          allenamento.form.get("identifier")?.value === identifier
      ) || null
    );
  }

  private sanitizeWorkoutOrdering(): void {
    if (!this.listaAllenamentiForm || this.listaAllenamentiForm.length === 0) {
      this.availableWorkoutPositions = [];
      return;
    }

    // 1. Ordina gli allenamenti per ordinamento corrente
    this.listaAllenamentiForm.sort((a, b) => {
      const ordinamentoA = a.form.get("ordinamento")?.value || 0;
      const ordinamentoB = b.form.get("ordinamento")?.value || 0;
      return ordinamentoA - ordinamentoB;
    });

    // 2. Riassegna gli ordinamenti da 1 a N per colmare i gap
    this.listaAllenamentiForm.forEach((allenamento, index) => {
      const newOrdinamento = index + 1;
      allenamento.form
        .get("ordinamento")
        ?.setValue(newOrdinamento, { emitEvent: false });
    });

    // 3. Aggiorna le posizioni disponibili
    const totalWorkouts = this.listaAllenamentiForm.length;
    this.availableWorkoutPositions = Array.from(
      { length: totalWorkouts },
      (_, i) => i + 1
    );

    // 4. Ricostruisci il FormArray nell'ordine corretto
    this.rebuildFormArray();
  }

  private rebuildFormArray(): void {
    const listaAllenamentiFormArray = this.form.controls[
      "listaAllenamenti"
    ] as FormArray;

    // Pulisce il FormArray senza emettere eventi per evitare loop infiniti
    while (listaAllenamentiFormArray.length !== 0) {
      listaAllenamentiFormArray.removeAt(0, { emitEvent: false });
    }

    // Riaggiunge al FormArray nell'ordine corretto
    this.listaAllenamentiForm.forEach((allenamento) => {
      listaAllenamentiFormArray.push(allenamento.form, { emitEvent: false });
    });
  }

  moveAllenamento(workoutIdentifier: number, newPosition: number): boolean {
    try {
      const currentIndex = this.listaAllenamentiForm.findIndex(
        (a) => a.form.get("identifier")?.value === workoutIdentifier
      );

      if (currentIndex === -1) {
        console.error("Allenamento da spostare non trovato");
        return false;
      }

      // L'indice dell'array è basato su 0, la posizione su 1
      const newIndex = newPosition - 1;

      // 1. Rimuovi l'allenamento dalla sua posizione attuale nel nostro array di supporto
      const [workoutToMove] = this.listaAllenamentiForm.splice(currentIndex, 1);

      // 2. Inseriscilo nella nuova posizione
      this.listaAllenamentiForm.splice(newIndex, 0, workoutToMove);

      // 3. Ora che l'ordine è stato modificato, chiama la sanificazione
      // per aggiornare i valori 'ordinamento' e ricostruire il FormArray.
      this.sanitizeWorkoutOrdering();
      this.form.markAsDirty();

      return true;
    } catch (error) {
      console.error("Errore durante lo spostamento dell'allenamento:", error);
      return false;
    }
  }

  public toggleActiveState(newValue: boolean): void {
    this.form.controls['isActive'].setValue(newValue);
  }

  public resetForm(): void {
    this.form.reset();
    this.listaAllenamentiForm = [];
    this.identifier = 0;
    this.availableWorkoutPositions = [];
  }

  // Helper per ottenere il FormArray tipizzato
  get listaAllenamentiFormArray(): FormArray<FormGroup<AllenamentoFormModel>> {
    return this.form.controls["listaAllenamenti"] as FormArray<
      FormGroup<AllenamentoFormModel>
    >;
  }

  getDatiSchedaDaSalvare(): SchedaDTO {
    try {
      // Raccolgo i dati della scheda
      let schedaDaSalvare: SchedaDTO = {
        //TODO capire quale id passare, io a BE faccio query con scheda.id
        id: this.form.controls["idTemplate"].value || -1,
        idTemplate: this.form.controls["idTemplate"].value || 0,
        nomeScheda: this.form.controls["nomeScheda"].value || "",
        listaAllenamenti: [],
        schedaAttiva: this.form.controls['isActive'].value || false,
      };

      this.listaAllenamentiForm.forEach((allenamento) => {
        schedaDaSalvare.listaAllenamenti.push(
          allenamento.getDatiAllenamentoDaSalvare()
        );
      });

      return schedaDaSalvare;
    } catch (error) {
      throw new Error("SchedaForm.GetDatiSchedaDaSalvare: " + error);
    }
  }
}
