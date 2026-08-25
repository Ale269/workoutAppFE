import { FormArray, FormControl, FormGroup } from "@angular/forms";
import { EsercizioForm, EsercizioFormModel } from "./exercise-form";
import { GruppoForm, GruppoFormModel } from "./group-form";
import { AllenamentoDTO } from "src/app/models/create-or-edit-template-or-entity-form-dto/allenamentodto";
import { EsercizioDTO } from "src/app/models/create-or-edit-template-or-entity-form-dto/eserciziodto";
import {
  GruppoDTO,
  TipoGruppo,
} from "src/app/models/create-or-edit-template-or-entity-form-dto/gruppodto";

export interface AllenamentoFormModel {
  identifier: FormControl<number | null>;
  id: FormControl<number | null>;
  idTemplate: FormControl<number | null>;
  dataEsecuzione: FormControl<Date | null>;
  nomeAllenamento: FormControl<string | null>;
  description: FormControl<string | null>;
  ordinamento: FormControl<number | null>;
  listaEsercizi: FormArray<FormGroup<EsercizioFormModel>>;
  listaGruppi: FormArray<FormGroup<GruppoFormModel>>;
}

/**
 * View-model di rendering: la pagina itera "units", dove ogni unit è un
 * esercizio sciolto oppure un gruppo (superset/circuito) con i suoi membri.
 */
export type AllenamentoUnit =
  | { kind: "esercizio"; esercizio: EsercizioForm }
  | {
      kind: "gruppo";
      gruppo: GruppoForm;
      esercizi: EsercizioForm[];
      numero: number;
    };

export interface ReorderUnitRef {
  kind: "esercizio" | "gruppo";
  identifier: number;
}

export class AllenamentoForm {
  public listaEserciziForm: EsercizioForm[] = [];
  public listaGruppiForm: GruppoForm[] = [];
  public identifier: number = 0;
  public groupIdentifier: number = 0;
  public form: FormGroup;

  public units: AllenamentoUnit[] = [];

  public availableExercisePositions: number[] = [];

  constructor(identifier: number, allenamentoDTO?: AllenamentoDTO) {
    this.form = new FormGroup<AllenamentoFormModel>({
      identifier: new FormControl<number | null>(identifier),
      id: new FormControl<number | null>(allenamentoDTO?.id || null),
      idTemplate: new FormControl<number | null>(allenamentoDTO?.idTemplate || null),
      dataEsecuzione: new FormControl<Date | null>(allenamentoDTO?.dataEsecuzione || new Date()),

      nomeAllenamento: new FormControl<string | null>(
        allenamentoDTO?.nomeAllenamento || null
      ),
      description: new FormControl<string | null>(
        allenamentoDTO?.description || null
      ),
      ordinamento: new FormControl<number | null>(
        allenamentoDTO?.ordinamento || null
      ),
      listaEsercizi: new FormArray<FormGroup<EsercizioFormModel>>([]),
      listaGruppi: new FormArray<FormGroup<GruppoFormModel>>([]),
    });

    // this.form.controls["listaEsercizi"].valueChanges.subscribe(() => {
    //   this.sanitizeExerciseOrdering();
    // });

    // Se ci sono dati DTO, popola prima i gruppi (mappa progressivo ->
    // identifier client) e poi gli esercizi, traducendo idGruppo
    const gruppoByProgressivo = new Map<number, GruppoForm>();
    if (allenamentoDTO?.listaGruppi) {
      allenamentoDTO.listaGruppi.forEach((gruppoDTO) => {
        const gruppoForm = this.addGruppoForm(gruppoDTO.tipoGruppo, gruppoDTO);
        gruppoByProgressivo.set(gruppoDTO.progressivo, gruppoForm);
      });
    }

    if (allenamentoDTO?.listaEsercizi) {
      allenamentoDTO.listaEsercizi.forEach((esercizioDTO) => {
        const gruppoForm =
          esercizioDTO.idGruppo != null
            ? gruppoByProgressivo.get(esercizioDTO.idGruppo)
            : undefined;
        this.addEsercizioForm(
          esercizioDTO,
          gruppoForm ? gruppoForm.identifier : null
        );
      });

      // Riordino correttamente gli esercizi
      this.sanitizeExerciseOrdering();
    }

    this.rebuildUnits();
  }

  addEsercizioForm(
    esercizioDTO?: EsercizioDTO,
    groupIdentifier: number | null = null
  ) {
    try {
      this.identifier = this.identifier + 1;

      // Determina l'ordinamento per il nuovo esercizio (ultima posizione)
      const nextOrdinamento = this.listaEserciziForm.length + 1;

      const newEsercizioForm: EsercizioForm = new EsercizioForm(
        this.identifier,
        esercizioDTO
      );

      // Se non ha già un ordinamento (nuovo esercizio), assegna l'ultima posizione
      if (!esercizioDTO?.ordinamento) {
        newEsercizioForm.form
          .get("ordinamento")
          ?.setValue(nextOrdinamento, { emitEvent: false });
      }

      // Aggancia al gruppo (superset/circuito) se richiesto
      if (groupIdentifier !== null) {
        newEsercizioForm.form
          .get("idGruppo")
          ?.setValue(groupIdentifier, { emitEvent: false });
      }

      this.listaEserciziForm.push(newEsercizioForm);

      const listaEserciziFormArray = this.form.controls[
        "listaEsercizi"
      ] as FormArray;
      listaEserciziFormArray.push(newEsercizioForm.form);

      // Aggiorna le posizioni disponibili senza riordinare
      this.updateAvailablePositions();
      this.form.markAsDirty();
      this.rebuildUnits();
    } catch (error) {
      throw new Error("AllenamentoForm.addEsercizioForm: " + error);
    }
  }

  private updateAvailablePositions(): void {
    const totalExercises = this.listaEserciziForm.length;
    this.availableExercisePositions = Array.from(
      { length: totalExercises },
      (_, i) => i + 1
    );
  }

  deleteEsercizio(identifier: number): boolean {
    try {
      // Trova l'indice dell'esercizio da eliminare
      const esercizioIndex = this.listaEserciziForm.findIndex(
        (esercizio) => esercizio.form.get("identifier")?.value === identifier
      );

      if (esercizioIndex === -1) {
        throw new Error("Esercizio con identifier ${identifier} non trovato)");
      }

      // Gruppo di appartenenza (per l'auto-rimozione dei gruppi svuotati)
      const idGruppo =
        this.listaEserciziForm[esercizioIndex].form.get("idGruppo")?.value ??
        null;

      // Rimuovi dall'array di EsercizioForm
      this.listaEserciziForm.splice(esercizioIndex, 1);

      // Rimuovi dal FormArray
      const listaEserciziFormArray = this.form.controls[
        "listaEsercizi"
      ] as FormArray;
      listaEserciziFormArray.removeAt(esercizioIndex);

      // Se il gruppo è rimasto vuoto lo rimuovo automaticamente
      if (idGruppo !== null) {
        const gruppoHaMembri = this.listaEserciziForm.some(
          (esercizio) => esercizio.form.get("idGruppo")?.value === idGruppo
        );
        if (!gruppoHaMembri) {
          this.removeGruppoForm(idGruppo);
        }
      }

      // Riassegna gli ordinamenti dopo l'eliminazione
      this.sanitizeExerciseOrdering();
      this.form.markAsDirty();

      return true;
    } catch (error) {
      throw new Error("AllenamentoForm.deleteEsercizio: " + error);
    }
  }

  findEsercizioByIdentifier(identifier: number): EsercizioForm | null {
    return (
      this.listaEserciziForm.find(
        (esercizio) => esercizio.form.get("identifier")?.value === identifier
      ) || null
    );
  }

  private sanitizeExerciseOrdering(): void {
    if (!this.listaEserciziForm || this.listaEserciziForm.length === 0) {
      this.availableExercisePositions = [];
      this.rebuildUnits();
      return;
    }

    // 1. Ordina gli esercizi per ordinamento corrente
    this.listaEserciziForm.sort((a, b) => {
      const ordinamentoA = a.form.get("ordinamento")?.value || 0;
      const ordinamentoB = b.form.get("ordinamento")?.value || 0;
      return ordinamentoA - ordinamentoB;
    });

    // 2. Riassegna gli ordinamenti da 1 a N per colmare i gap
    this.listaEserciziForm.forEach((esercizio, index) => {
      const newOrdinamento = index + 1;
      esercizio.form
        .get("ordinamento")
        ?.setValue(newOrdinamento, { emitEvent: false });
    });

    // 3. Aggiorna le posizioni disponibili
    const totalExercises = this.listaEserciziForm.length;
    this.availableExercisePositions = Array.from(
      { length: totalExercises },
      (_, i) => i + 1
    );

    // 4. Ricostruisci il FormArray nell'ordine corretto
    this.rebuildFormArray();

    // 5. Ricostruisci il view-model delle unit
    this.rebuildUnits();
  }

  private rebuildFormArray(): void {
    const listaEserciziFormArray = this.form.controls[
      "listaEsercizi"
    ] as FormArray;

    // Pulisce il FormArray senza emettere eventi per evitare loop infiniti
    while (listaEserciziFormArray.length !== 0) {
      listaEserciziFormArray.removeAt(0, { emitEvent: false });
    }

    // Riaggiunge al FormArray nell'ordine corretto
    this.listaEserciziForm.forEach((esercizio) => {
      listaEserciziFormArray.push(esercizio.form, { emitEvent: false });
    });
  }

  moveEsercizio(exerciseIdentifier: number, newPosition: number): boolean {
    try {
      const currentIndex = this.listaEserciziForm.findIndex(
        (e) => e.form.get("identifier")?.value === exerciseIdentifier
      );

      if (currentIndex === -1) {
        console.error("Esercizio da spostare non trovato");
        return false;
      }

      // L'indice dell'array è basato su 0, la posizione su 1
      const newIndex = newPosition - 1;

      // 1. Rimuovi l'esercizio dalla sua posizione attuale nel nostro array di supporto
      const [exerciseToMove] = this.listaEserciziForm.splice(currentIndex, 1);

      // 2. Inseriscilo nella nuova posizione
      this.listaEserciziForm.splice(newIndex, 0, exerciseToMove);

      // 3. Ora che l'ordine è stato modificato, chiama la sanificazione
      // per aggiornare i valori 'ordinamento' e ricostruire il FormArray.
      this.sanitizeExerciseOrdering();
      this.form.markAsDirty();

      return true;
    } catch (error) {
      console.error("Errore durante lo spostamento dell'esercizio:", error);
      return false;
    }
  }

  /**
   * Riordina tutti gli esercizi in base a un array di identificatori nell'ordine desiderato
   * @param orderedIdentifiers Array degli identifier degli esercizi nell'ordine desiderato
   * @returns true se il riordino è riuscito, false altrimenti
   */
  reorderExercisesByIdentifiers(orderedIdentifiers: number[]): boolean {
    try {
      // Crea una mappa per un accesso rapido agli esercizi per identifier
      const exerciseMap = new Map<number, EsercizioForm>();
      this.listaEserciziForm.forEach(exercise => {
        const identifier = exercise.form.get("identifier")?.value;
        if (identifier !== null && identifier !== undefined) {
          exerciseMap.set(identifier, exercise);
        }
      });

      // Verifica che tutti gli identifier siano validi
      const reorderedList: EsercizioForm[] = [];
      for (const identifier of orderedIdentifiers) {
        const exercise = exerciseMap.get(identifier);
        if (!exercise) {
          console.error(`Esercizio con identifier ${identifier} non trovato`);
          return false;
        }
        reorderedList.push(exercise);
      }

      // Se le lunghezze non corrispondono, c'è un problema
      if (reorderedList.length !== this.listaEserciziForm.length) {
        console.error("Il numero di esercizi nel nuovo ordine non corrisponde");
        return false;
      }

      // 1. Aggiorna i valori ordinamento PRIMA di sostituire l'array
      reorderedList.forEach((exercise, index) => {
        const newOrdinamento = index + 1;
        exercise.form.get("ordinamento")?.setValue(newOrdinamento, { emitEvent: false });
      });

      // 2. Sostituisci l'array
      this.listaEserciziForm = reorderedList;

      // 3. Aggiorna le posizioni disponibili
      this.updateAvailablePositions();

      // 4. Ricostruisci il FormArray nell'ordine corretto
      this.rebuildFormArray();

      // 5. Marca il form come dirty
      this.form.markAsDirty();

      // 6. Ricostruisci il view-model delle unit
      this.rebuildUnits();

      return true;
    } catch (error) {
      console.error("Errore durante il riordino degli esercizi:", error);
      return false;
    }
  }

  getDatiAllenamentoDaSalvare(): AllenamentoDTO {
    try {
      let allenamentoDaSalvare: AllenamentoDTO = {
        id: this.form.controls["id"].value ? this.form.controls["id"].value : 0,
        idTemplate: this.form.controls["idTemplate"].value ? this.form.controls["idTemplate"].value : 0,
        dataEsecuzione: this.form.controls["dataEsecuzione"].value ? this.form.controls["dataEsecuzione"].value : new Date(),
        nomeAllenamento: this.form.controls["nomeAllenamento"].value ? this.form.controls["nomeAllenamento"].value : "",
        description: this.form.controls["description"].value ? this.form.controls["description"].value : "",
        ordinamento: this.form.controls["ordinamento"].value ? this.form.controls["ordinamento"].value : 0,
        listaEsercizi: [],
        listaGruppi: [],
      };

      // Gruppi: il progressivo è assegnato per ordine di prima apparizione
      // dei membri nella lista globale. I gruppi vuoti non vengono emessi.
      const progressivoByGroupIdentifier = new Map<number, number>();
      let progressivo = 0;
      this.listaEserciziForm.forEach((esercizio) => {
        const idGruppo = esercizio.idGruppo;
        if (idGruppo !== null && !progressivoByGroupIdentifier.has(idGruppo)) {
          const gruppo = this.findGruppoByIdentifier(idGruppo);
          if (gruppo) {
            progressivo = progressivo + 1;
            progressivoByGroupIdentifier.set(idGruppo, progressivo);
            allenamentoDaSalvare.listaGruppi!.push(
              gruppo.getDatiGruppoDaSalvare(progressivo)
            );
          }
        }
      });

      this.listaEserciziForm.forEach((esercizio) => {
        const esercizioDTO = esercizio.getDatiEsercizioDaSalvare();
        const idGruppo = esercizio.idGruppo;
        esercizioDTO.idGruppo =
          idGruppo !== null
            ? progressivoByGroupIdentifier.get(idGruppo) ?? null
            : null;
        allenamentoDaSalvare.listaEsercizi.push(esercizioDTO);
      });

      return allenamentoDaSalvare;
    } catch (error) {
      throw new Error("SchedaForm.getDatiAllenamentoDaSalvare: " + error);
    }
  }

  public resetForm(): void {
    this.form.reset();
    this.listaEserciziForm = [];
    this.listaGruppiForm = [];
    this.units = [];
    this.identifier = 0;
    this.groupIdentifier = 0;
  }

  get listaEserciziFormArray(): FormArray<FormGroup<EsercizioFormModel>> {
    return this.form.controls["listaEsercizi"] as FormArray<
      FormGroup<EsercizioFormModel>
    >;
  }

  // ===========================================================================
  // GRUPPI (SUPERSET / CIRCUITI)
  // ===========================================================================

  /**
   * Crea un nuovo gruppo (da DTO in fase di init, o vuoto con i default da UI).
   */
  addGruppoForm(tipo: TipoGruppo, gruppoDTO?: GruppoDTO): GruppoForm {
    try {
      this.groupIdentifier = this.groupIdentifier + 1;
      const newGruppoForm = new GruppoForm(this.groupIdentifier, gruppoDTO);

      if (!gruppoDTO) {
        newGruppoForm.form
          .get("tipoGruppo")
          ?.setValue(tipo, { emitEvent: false });
        if (tipo === "SUPERSET") {
          newGruppoForm.form
            .get("tempoRecupero")
            ?.setValue(40, { emitEvent: false });
        } else {
          newGruppoForm.form
            .get("tempoRecupero")
            ?.setValue(30, { emitEvent: false });
          newGruppoForm.form
            .get("numeroGiri")
            ?.setValue(3, { emitEvent: false });
        }
      }

      // Ancora il gruppo (finché vuoto) alla posizione corrente di fine lista
      newGruppoForm.emptyAnchorIndex = this.listaEserciziForm.length;

      this.listaGruppiForm.push(newGruppoForm);
      const listaGruppiFormArray = this.form.controls[
        "listaGruppi"
      ] as FormArray;
      listaGruppiFormArray.push(newGruppoForm.form, { emitEvent: false });

      this.form.markAsDirty();
      this.rebuildUnits();
      return newGruppoForm;
    } catch (error) {
      throw new Error("AllenamentoForm.addGruppoForm: " + error);
    }
  }

  findGruppoByIdentifier(identifier: number): GruppoForm | null {
    return (
      this.listaGruppiForm.find(
        (gruppo) => gruppo.identifier === identifier
      ) || null
    );
  }

  /**
   * Aggiunge un nuovo esercizio vuoto in coda ai membri del gruppo
   * (inserimento esplicito a indice + rinumerazione, per mantenere
   * la contiguità del blocco).
   */
  addEsercizioToGruppo(groupIdentifier: number): boolean {
    try {
      const gruppo = this.findGruppoByIdentifier(groupIdentifier);
      if (!gruppo) {
        console.error(`Gruppo con identifier ${groupIdentifier} non trovato`);
        return false;
      }

      this.identifier = this.identifier + 1;
      const newEsercizioForm = new EsercizioForm(this.identifier, undefined);
      newEsercizioForm.form
        .get("idGruppo")
        ?.setValue(groupIdentifier, { emitEvent: false });

      // Inserisci dopo l'ultimo membro del gruppo; se il gruppo è ancora
      // vuoto, il primo membro prende la posizione di ancoraggio del gruppo
      // (così il gruppo resta dov'è nella pagina)
      let insertIndex = Math.min(
        Math.max(gruppo.emptyAnchorIndex, 0),
        this.listaEserciziForm.length
      );
      for (let i = this.listaEserciziForm.length - 1; i >= 0; i--) {
        if (this.listaEserciziForm[i].idGruppo === groupIdentifier) {
          insertIndex = i + 1;
          break;
        }
      }

      this.listaEserciziForm.splice(insertIndex, 0, newEsercizioForm);

      // Rinumerazione esplicita 1..N (senza sort: l'ordine è già corretto)
      this.renumberExercises();
      this.rebuildFormArray();
      this.updateAvailablePositions();
      this.form.markAsDirty();
      this.rebuildUnits();
      return true;
    } catch (error) {
      throw new Error("AllenamentoForm.addEsercizioToGruppo: " + error);
    }
  }

  /**
   * Elimina il gruppo: i membri restano nella lista, sganciati (idGruppo=null),
   * nelle stesse posizioni globali.
   */
  deleteGruppo(groupIdentifier: number): boolean {
    try {
      const gruppoIndex = this.listaGruppiForm.findIndex(
        (gruppo) => gruppo.identifier === groupIdentifier
      );
      if (gruppoIndex === -1) {
        console.error(`Gruppo con identifier ${groupIdentifier} non trovato`);
        return false;
      }

      // Sgancia i membri (restano esercizi sciolti nelle stesse posizioni)
      this.listaEserciziForm.forEach((esercizio) => {
        if (esercizio.idGruppo === groupIdentifier) {
          esercizio.form.get("idGruppo")?.setValue(null, { emitEvent: false });
        }
      });

      this.removeGruppoForm(groupIdentifier);
      this.form.markAsDirty();
      this.rebuildUnits();
      return true;
    } catch (error) {
      throw new Error("AllenamentoForm.deleteGruppo: " + error);
    }
  }

  /**
   * Riordina listaGruppiForm (e il relativo FormArray) secondo la sequenza
   * di identifier fornita; i gruppi non elencati restano in coda.
   */
  private reorderGruppiForms(orderedGroupIdentifiers: number[]): void {
    const byIdentifier = new Map<number, GruppoForm>();
    this.listaGruppiForm.forEach((gruppo) =>
      byIdentifier.set(gruppo.identifier, gruppo)
    );

    const reordered: GruppoForm[] = [];
    for (const identifier of orderedGroupIdentifiers) {
      const gruppo = byIdentifier.get(identifier);
      if (gruppo) {
        reordered.push(gruppo);
        byIdentifier.delete(identifier);
      }
    }
    byIdentifier.forEach((gruppo) => reordered.push(gruppo));

    this.listaGruppiForm = reordered;

    const listaGruppiFormArray = this.form.controls["listaGruppi"] as FormArray;
    while (listaGruppiFormArray.length !== 0) {
      listaGruppiFormArray.removeAt(0, { emitEvent: false });
    }
    this.listaGruppiForm.forEach((gruppo) => {
      listaGruppiFormArray.push(gruppo.form, { emitEvent: false });
    });
  }

  /**
   * Rimozione tecnica del GruppoForm (nessun effetto sui membri).
   */
  private removeGruppoForm(groupIdentifier: number): void {
    const gruppoIndex = this.listaGruppiForm.findIndex(
      (gruppo) => gruppo.identifier === groupIdentifier
    );
    if (gruppoIndex === -1) {
      return;
    }
    this.listaGruppiForm.splice(gruppoIndex, 1);
    const listaGruppiFormArray = this.form.controls["listaGruppi"] as FormArray;
    listaGruppiFormArray.removeAt(gruppoIndex, { emitEvent: false });
  }

  /**
   * Rinumerazione 1..N nell'ordine attuale dell'array (senza sort).
   */
  private renumberExercises(): void {
    this.listaEserciziForm.forEach((esercizio, index) => {
      esercizio.form
        .get("ordinamento")
        ?.setValue(index + 1, { emitEvent: false });
    });
  }

  /**
   * Ricostruisce il view-model "units": esercizi sciolti e gruppi nell'ordine
   * globale (un gruppo appare alla posizione del suo primo membro; i gruppi
   * vuoti appena creati vanno in coda). "numero" è il progressivo di
   * visualizzazione per tipo (Superset 1, Circuito 1, ...).
   */
  public rebuildUnits(): void {
    // Ogni unit riceve una chiave di ordinamento sull'asse degli indici
    // globali degli esercizi: esercizio sciolto = suo indice, gruppo con
    // membri = indice del primo membro, gruppo vuoto = ancoraggio - 0.5
    // (cioè "prima dell'esercizio con quell'indice"). Il sort è stabile.
    const keyedUnits: { unit: AllenamentoUnit; key: number }[] = [];
    const seenGroups = new Set<number>();

    this.listaEserciziForm.forEach((esercizio, index) => {
      const idGruppo = esercizio.idGruppo;
      if (idGruppo === null) {
        keyedUnits.push({ unit: { kind: "esercizio", esercizio }, key: index });
        return;
      }
      if (seenGroups.has(idGruppo)) {
        return;
      }
      const gruppo = this.findGruppoByIdentifier(idGruppo);
      if (!gruppo) {
        // gruppo mancante: tratta l'esercizio come sciolto
        keyedUnits.push({ unit: { kind: "esercizio", esercizio }, key: index });
        return;
      }
      seenGroups.add(idGruppo);
      const esercizi = this.listaEserciziForm.filter(
        (e) => e.idGruppo === idGruppo
      );
      keyedUnits.push({
        unit: { kind: "gruppo", gruppo, esercizi, numero: 0 },
        key: index,
      });
    });

    // Gruppi vuoti: mantengono la posizione di ancoraggio
    for (const gruppo of this.listaGruppiForm) {
      if (!seenGroups.has(gruppo.identifier)) {
        const anchor = Math.min(
          Math.max(gruppo.emptyAnchorIndex, 0),
          this.listaEserciziForm.length
        );
        keyedUnits.push({
          unit: { kind: "gruppo", gruppo, esercizi: [], numero: 0 },
          key: anchor - 0.5,
        });
      }
    }

    keyedUnits.sort((a, b) => a.key - b.key);

    // Numerazione di visualizzazione per tipo (Superset 1, Circuito 1, ...)
    const numeroPerTipo = new Map<TipoGruppo, number>();
    const units: AllenamentoUnit[] = keyedUnits.map(({ unit }) => {
      if (unit.kind === "gruppo") {
        const numero = (numeroPerTipo.get(unit.gruppo.tipoGruppo) || 0) + 1;
        numeroPerTipo.set(unit.gruppo.tipoGruppo, numero);
        unit.numero = numero;
      }
      return unit;
    });

    this.units = units;
  }

  /**
   * Riordino globale per unit: espande i gruppi nei rispettivi membri
   * (ordine interno preservato) e delega a reorderExercisesByIdentifiers.
   */
  reorderUnits(orderedUnits: ReorderUnitRef[]): boolean {
    try {
      const orderedIdentifiers: number[] = [];
      let runningIndex = 0;

      for (const unit of orderedUnits) {
        if (unit.kind === "esercizio") {
          orderedIdentifiers.push(unit.identifier);
          runningIndex = runningIndex + 1;
          continue;
        }

        const membri = this.listaEserciziForm.filter(
          (esercizio) => esercizio.idGruppo === unit.identifier
        );

        if (membri.length === 0) {
          // Gruppo vuoto: aggiorna l'ancoraggio alla nuova posizione
          const gruppo = this.findGruppoByIdentifier(unit.identifier);
          if (gruppo) {
            gruppo.emptyAnchorIndex = runningIndex;
          }
          continue;
        }

        membri.forEach((esercizio) =>
          orderedIdentifiers.push(esercizio.exerciseIdentifier)
        );
        runningIndex = runningIndex + membri.length;
      }

      // Allinea l'ordine dei GruppoForm a quello trascinato (tie-break per
      // gruppi vuoti con lo stesso ancoraggio)
      this.reorderGruppiForms(
        orderedUnits
          .filter((unit) => unit.kind === "gruppo")
          .map((unit) => unit.identifier)
      );

      return this.reorderExercisesByIdentifiers(orderedIdentifiers);
    } catch (error) {
      console.error("Errore durante il riordino delle unit:", error);
      return false;
    }
  }

  /**
   * Riordina SOLO i membri di un gruppo, mantenendo il blocco negli stessi
   * slot globali contigui.
   */
  reorderGroupMembers(
    groupIdentifier: number,
    orderedMemberIdentifiers: number[]
  ): boolean {
    try {
      const memberIndexes: number[] = [];
      const memberByIdentifier = new Map<number, EsercizioForm>();
      this.listaEserciziForm.forEach((esercizio, index) => {
        if (esercizio.idGruppo === groupIdentifier) {
          memberIndexes.push(index);
          memberByIdentifier.set(esercizio.exerciseIdentifier, esercizio);
        }
      });

      if (memberIndexes.length !== orderedMemberIdentifiers.length) {
        console.error("Il numero di membri del gruppo non corrisponde");
        return false;
      }

      const reorderedMembers: EsercizioForm[] = [];
      for (const memberIdentifier of orderedMemberIdentifiers) {
        const member = memberByIdentifier.get(memberIdentifier);
        if (!member) {
          console.error(
            `Membro con identifier ${memberIdentifier} non trovato nel gruppo`
          );
          return false;
        }
        reorderedMembers.push(member);
      }

      // Riposiziona i membri riordinati negli stessi slot globali
      reorderedMembers.forEach((member, k) => {
        this.listaEserciziForm[memberIndexes[k]] = member;
      });

      this.renumberExercises();
      this.rebuildFormArray();
      this.updateAvailablePositions();
      this.form.markAsDirty();
      this.rebuildUnits();
      return true;
    } catch (error) {
      console.error("Errore durante il riordino dei membri del gruppo:", error);
      return false;
    }
  }

  get listaGruppiFormArray(): FormArray<FormGroup<GruppoFormModel>> {
    return this.form.controls["listaGruppi"] as FormArray<
      FormGroup<GruppoFormModel>
    >;
  }
}
