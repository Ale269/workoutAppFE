import { Component, Input } from "@angular/core";
import { EsercizioForm } from "../../exercise-form";
import { GruppoForm } from "../../group-form";
import { ExerciseIconColorPipe } from "src/app/core/pipes/exercise-icon-color";
import { ExerciseService } from "src/app/core/services/exercise.service";

/**
 * Card compatta di un gruppo (superset/circuito), usata:
 * - nella pagina quando è attiva la modalità compatta (riordino globale)
 * - come riga nel reorder overlay delle unit
 * Mostra: titolo colorato, tempo (e giri per il circuito), icone circolari
 * sovrapposte degli esercizi e chip con i nomi.
 */
@Component({
  selector: "app-group-compact-card",
  imports: [ExerciseIconColorPipe],
  templateUrl: "./group-compact-card.html",
  styleUrl: "./group-compact-card.scss",
})
export class GroupCompactCard {
  @Input() gruppo!: GruppoForm;
  @Input() esercizi: EsercizioForm[] = [];
  @Input() numero: number = 1;

  constructor(private exerciseService: ExerciseService) {}

  get isCircuit(): boolean {
    return this.gruppo.tipoGruppo === "CIRCUIT";
  }

  get titolo(): string {
    return this.isCircuit ? `Circuito ${this.numero}` : `Superset ${this.numero}`;
  }

  get tempoRecupero(): number | null {
    return this.gruppo.form.get("tempoRecupero")?.value ?? null;
  }

  get numeroGiri(): number | null {
    return this.gruppo.form.get("numeroGiri")?.value ?? null;
  }

  getExerciseIconPath(esercizioForm: EsercizioForm): string {
    return this.exerciseService.getExerciseIconPathByExerciseId(
      esercizioForm.form.controls["idTipoEsercizio"].value,
    );
  }

  getExerciseName(esercizioForm: EsercizioForm): string {
    return this.exerciseService.getExerciseName(
      esercizioForm.form.controls["idTipoEsercizio"].value,
    );
  }
}
