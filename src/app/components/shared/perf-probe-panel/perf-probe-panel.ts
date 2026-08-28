import { Component, inject, signal } from "@angular/core";
import { PerfProbeService } from "src/app/core/services/perf-probe.service";

/**
 * STRUMENTO DIAGNOSTICO TEMPORANEO — da rimuovere a indagine conclusa.
 *
 * Template e stili sono INLINE, in deroga alla convenzione del progetto
 * (name.ts / name.html / name.scss): è un file usa-e-getta, e tenerlo in un
 * pezzo unico significa cancellare un solo file quando avremo finito.
 *
 * Le classi usano tutte il prefisso `perf-probe-`: nessuna compare in
 * TAPPABLE_SELECTORS, così il pannello non viene toccato da HapticTapService
 * e non altera la misura.
 *
 * Il report si disegna SOLO a registrazione ferma: costruire il DOM del
 * report durante la registrazione muterebbe il body e falserebbe i dati.
 */
@Component({
  selector: "app-perf-probe-panel",
  standalone: true,
  template: `
    @if (visible) {
      <div class="perf-probe-root">
        @if (open()) {
          <div class="perf-probe-panel">
            <div class="perf-probe-bar">
              <button
                class="perf-probe-btn"
                [class.perf-probe-rec]="probe.recording()"
                (click)="toggleRecording()"
              >
                {{ probe.recording() ? "STOP" : "REC" }}
              </button>
              <button class="perf-probe-btn" (click)="copy()">
                {{ copied() ? "copiato" : "copia" }}
              </button>
              <button class="perf-probe-btn" (click)="open.set(false)">–</button>
              <button class="perf-probe-btn" (click)="disable()">off</button>
            </div>

            <!-- Esperimenti: si cambiano a caldo, così la stessa chiusura si
                 misura nelle due condizioni senza rifare la build. -->
            <div class="perf-probe-bar">
              <button
                class="perf-probe-btn"
                [class.perf-probe-on]="probe.suppressNoScroll()"
                (click)="probe.toggleNoScroll()"
              >
                no-scroll {{ probe.suppressNoScroll() ? "OFF" : "on" }}
              </button>
              <button
                class="perf-probe-btn"
                [class.perf-probe-on]="probe.suppressBlur()"
                (click)="probe.toggleBlur()"
              >
                blur {{ probe.suppressBlur() ? "OFF" : "on" }}
              </button>
            </div>

            @if (probe.recording()) {
              <div class="perf-probe-hint">
                Registrazione in corso. Apri e chiudi l'overlay, poi premi STOP.
              </div>
            } @else if (report()) {
              <pre class="perf-probe-report">{{ report() }}</pre>
            } @else {
              <div class="perf-probe-hint">
                Premi REC, poi apri e chiudi un overlay, poi STOP.
              </div>
            }
          </div>
        } @else {
          <button
            class="perf-probe-pill"
            [class.perf-probe-rec]="probe.recording()"
            (click)="open.set(true)"
          >
            {{ probe.recording() ? "REC" : "perf" }}
          </button>
        }
      </div>
    }
  `,
  styles: [
    `
      .perf-probe-root {
        position: fixed;
        left: 8px;
        bottom: 8px;
        /* Sopra ogni overlay dell'app, che sta ben sotto questa soglia. */
        z-index: 2147483000;
        font-family: ui-monospace, Menlo, Consolas, monospace;
      }
      .perf-probe-pill,
      .perf-probe-btn {
        background: #101418;
        color: #00ffe1;
        border: 1px solid #2b3640;
        border-radius: 6px;
        padding: 6px 10px;
        font: inherit;
        font-size: 11px;
        line-height: 1;
      }
      .perf-probe-rec {
        color: #ff4d4d;
        border-color: #ff4d4d;
      }
      /* Esperimento attivo: il sospetto è stato disattivato. */
      .perf-probe-on {
        color: #ffd24d;
        border-color: #ffd24d;
      }
      .perf-probe-panel {
        width: min(94vw, 560px);
        max-height: 72vh;
        display: flex;
        flex-direction: column;
        background: rgba(8, 11, 14, 0.97);
        border: 1px solid #2b3640;
        border-radius: 10px;
        padding: 8px;
      }
      .perf-probe-bar {
        display: flex;
        gap: 6px;
        margin-bottom: 6px;
      }
      .perf-probe-hint {
        color: #9fb0bd;
        font-size: 11px;
        padding: 6px 2px;
      }
      .perf-probe-report {
        margin: 0;
        overflow: auto;
        -webkit-overflow-scrolling: touch;
        color: #d7e3ec;
        font-size: 10px;
        line-height: 1.45;
        white-space: pre;
        /* Selezionabile: su iOS il long-press resta il fallback alla clipboard. */
        -webkit-user-select: text;
        user-select: text;
      }
    `,
  ],
})
export class PerfProbePanelComponent {
  readonly probe = inject(PerfProbeService);

  /** Letto una volta sola: il pannello non deve comparire in produzione. */
  readonly visible = PerfProbeService.isEnabled();

  readonly open = signal(false);
  readonly report = signal("");
  readonly copied = signal(false);

  toggleRecording(): void {
    if (this.probe.recording()) {
      this.probe.stop();
      this.report.set(this.probe.buildReport());
    } else {
      this.report.set("");
      this.copied.set(false);
      this.probe.start();
    }
  }

  async copy(): Promise<void> {
    const text = this.report();
    if (!text) {
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      this.copied.set(true);
    } catch {
      // Clipboard negata (contesto non sicuro o permesso rifiutato): il
      // testo resta selezionabile a mano con un long-press.
      this.copied.set(false);
    }
  }

  disable(): void {
    PerfProbeService.disable();
    this.open.set(false);
  }
}
