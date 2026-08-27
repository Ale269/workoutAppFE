import { Injectable, signal } from "@angular/core";
import { LastTrainingExerciseData } from "src/app/models/history/last-training-exercise";

export interface HistoryPopupConfig {
  /** Elemento (icona) che ha aperto il popup: ne determina l'ancoraggio */
  triggerElement: HTMLElement;
  lastNLimit: number;
  data: LastTrainingExerciseData[];
  error: boolean;
}

/**
 * Popup "Ultimi N allenamenti": stessa ricetta di ConfirmPopupService (signal
 * globale, componente sempre montato in app.component.html). Prima viveva
 * come stato locale di ExerciseComponent, annidato dentro .page-scroller —
 * questo lo rendeva un DISCENDENTE del vero contenitore di scroll della
 * pagina, e un tocco/scroll sul popup poteva "cadere" nello scroller nativo
 * sottostante nonostante position:fixed (la ricerca dello scroller da parte
 * del browser segue la catena di ANTENATI nel DOM, non lo stacking visivo).
 * Portandolo qui, alla radice dell'app come app-confirm-popup, quella catena
 * di antenati non passa più per .page-scroller: il problema sparisce alla
 * radice invece di dover essere arginato con un altro blocco scroll locale.
 */
@Injectable({ providedIn: "root" })
export class HistoryPopupService {
  public active = signal<HistoryPopupConfig | null>(null);

  open(config: HistoryPopupConfig): void {
    this.active.set(config);
  }

  close(): void {
    this.active.set(null);
  }
}
