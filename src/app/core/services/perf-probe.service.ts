import { Injectable, NgZone, inject, signal } from "@angular/core";

/**
 * STRUMENTO DIAGNOSTICO TEMPORANEO — da rimuovere a indagine conclusa.
 *
 * Serve a misurare sul DISPOSITIVO REALE (iPhone/PWA) il freeze che si
 * verifica alla chiusura degli overlay, dove non è disponibile alcun
 * profiler: su iOS ogni browser è WebKit e le API `longtask` /
 * `long-animation-frame` non esistono.
 *
 * Principio: un "freeze" è per definizione un intervallo in cui il browser
 * non riesce a produrre frame. Registrando l'istante di ogni
 * requestAnimationFrame, un buco fra due frame consecutivi È il freeze,
 * misurato in millisecondi. Le `mark()` piazzate nel codice cadono dentro
 * quel buco e ne identificano la causa: ciò che è marcato dentro un gap è
 * ciò che stava bloccando il thread.
 *
 * Overhead: il loop rAF gira solo durante la registrazione e fuori dalla
 * zona Angular (nessuna change detection). Le mark scrivono in array
 * preallocati, senza toccare il DOM: il pannello si disegna solo a
 * registrazione ferma.
 */

interface ProbeMark {
  t: number;
  label: string;
  info: string;
}

/** Un frame più lungo di così è percepito come scatto/blocco. */
const LONG_FRAME_MS = 50;
/** Finestra di attribuzione dopo una chiusura overlay. */
const CLOSE_WINDOW_MS = 2500;
/** Tetti anti-crescita illimitata durante registrazioni lunghe. */
const MAX_FRAMES = 40000;
const MAX_MARKS = 5000;

@Injectable({ providedIn: "root" })
export class PerfProbeService {
  private zone = inject(NgZone);

  /** Esposto come signal così il pannello reagisce senza polling. */
  readonly recording = signal(false);

  private frames: number[] = [];
  private marks: ProbeMark[] = [];
  private rafId = 0;
  private t0 = 0;

  /**
   * Il pannello è visibile solo se esplicitamente abilitato: si attiva
   * aprendo l'app una volta con `?perf=1`. In una PWA installata basta
   * farlo dal browser, la preferenza resta in localStorage.
   */
  static isEnabled(): boolean {
    try {
      if (typeof window === "undefined") {
        return false;
      }
      if (new URLSearchParams(window.location.search).has("perf")) {
        localStorage.setItem("perfProbe", "1");
      }
      return localStorage.getItem("perfProbe") === "1";
    } catch {
      return false;
    }
  }

  static disable(): void {
    try {
      localStorage.removeItem("perfProbe");
    } catch {
      // Il pannello sparirà comunque al prossimo avvio
    }
  }

  start(): void {
    if (this.recording()) {
      return;
    }
    this.frames = [];
    this.marks = [];
    this.t0 = performance.now();
    this.recording.set(true);

    // Fuori da Angular: un rAF per frame dentro la zona farebbe scattare la
    // change detection a ogni frame, falsando proprio ciò che misuriamo.
    this.zone.runOutsideAngular(() => {
      const tick = () => {
        if (!this.recording()) {
          return;
        }
        if (this.frames.length < MAX_FRAMES) {
          this.frames.push(performance.now());
        }
        this.rafId = requestAnimationFrame(tick);
      };
      this.rafId = requestAnimationFrame(tick);
    });
  }

  stop(): void {
    if (!this.recording()) {
      return;
    }
    this.recording.set(false);
    cancelAnimationFrame(this.rafId);
  }

  /** Marca un istante. Costo: una push, nessun accesso al DOM. */
  mark(label: string, info = ""): void {
    if (!this.recording() || this.marks.length >= MAX_MARKS) {
      return;
    }
    this.marks.push({ t: performance.now(), label, info });
  }

  // =======================================================================
  // Analisi
  // =======================================================================

  /** Tutti i buchi fra frame consecutivi oltre la soglia. */
  private longFrames(): { start: number; end: number; gap: number }[] {
    const out: { start: number; end: number; gap: number }[] = [];
    for (let i = 1; i < this.frames.length; i++) {
      const gap = this.frames[i] - this.frames[i - 1];
      if (gap > LONG_FRAME_MS) {
        out.push({ start: this.frames[i - 1], end: this.frames[i], gap });
      }
    }
    return out;
  }

  private marksBetween(start: number, end: number): ProbeMark[] {
    return this.marks.filter((m) => m.t >= start && m.t <= end);
  }

  private fmt(t: number): string {
    return (t - this.t0).toFixed(0) + "ms";
  }

  private describe(m: ProbeMark): string {
    return m.label + (m.info ? "(" + m.info + ")" : "");
  }

  /**
   * Report testuale. Le due sezioni che contano:
   *  - CHIUSURE: per ogni chiusura di overlay, il frame più lungo che la
   *    segue e cosa c'era dentro. È la risposta diretta alla domanda.
   *  - SCANSIONI: la ripartizione letture/scritture della scansione aptica,
   *    che discrimina il layout thrashing dal costo delle scritture DOM.
   */
  buildReport(): string {
    if (this.frames.length < 2) {
      // Distinzione importante: se ci sono mark ma zero frame, la misura non
      // è "vuota", è INVALIDA — requestAnimationFrame non viene servito
      // quando la pagina è nascosta, quindi non esistono gap da misurare.
      return this.marks.length > 0
        ? "MISURA NON VALIDA: " +
            this.marks.length +
            " eventi registrati ma nessun frame.\n" +
            "La pagina era in background (requestAnimationFrame non gira se document.hidden).\n" +
            "Ripeti tenendo l'app in primo piano e lo schermo acceso."
        : "Nessun dato: avvia la registrazione, apri e chiudi un overlay, poi ferma.";
    }

    const total = this.frames[this.frames.length - 1] - this.frames[0];
    const longs = this.longFrames();
    const lines: string[] = [];

    lines.push(
      "DURATA " +
        (total / 1000).toFixed(1) +
        "s | frame " +
        this.frames.length +
        " | frame lunghi (>" +
        LONG_FRAME_MS +
        "ms) " +
        longs.length,
    );
    lines.push("");

    // ---- Sezione decisiva: cosa succede dopo ogni chiusura ----
    const closes = this.marks.filter((m) => m.label === "overlay:close");
    lines.push("=== CHIUSURE OVERLAY (" + closes.length + ") ===");
    if (closes.length === 0) {
      lines.push("  nessuna chiusura registrata");
    }
    for (const close of closes) {
      const inWindow = longs.filter(
        (l) => l.start >= close.t - 32 && l.start <= close.t + CLOSE_WINDOW_MS,
      );
      const worst = inWindow.slice().sort((a, b) => b.gap - a.gap)[0];
      lines.push("");
      lines.push("chiusura @ " + this.fmt(close.t));
      if (!worst) {
        lines.push(
          "  nessun frame lungo nei " +
            CLOSE_WINDOW_MS +
            "ms successivi -> chiusura FLUIDA",
        );
        continue;
      }
      // Il frame bloccante può iniziare poco PRIMA della mark di chiusura:
      // il blocco parte già durante il rendering che porta alla chiusura.
      const delta = worst.start - close.t;
      lines.push(
        "  BLOCCO di " +
          worst.gap.toFixed(0) +
          "ms, " +
          (delta >= 0
            ? "a +" + delta.toFixed(0) + "ms dalla chiusura"
            : "iniziato " + (-delta).toFixed(0) + "ms PRIMA della chiusura"),
      );
      const inside = this.marksBetween(worst.start, worst.end);
      if (inside.length === 0) {
        lines.push("  dentro il blocco: nessuna mark");
      } else {
        lines.push("  dentro il blocco:");
        for (const m of inside) {
          lines.push(
            "    +" + (m.t - worst.start).toFixed(0) + "ms  " + this.describe(m),
          );
        }
      }

      // Il verdetto NON può basarsi su `inside.length`: la mark di chiusura
      // cade quasi sempre dentro il blocco e maschererebbe il caso in cui il
      // tempo non è speso in JS nostro. Conta solo il lavoro marcato.
      if (inside.some((m) => m.label.startsWith("haptic:"))) {
        lines.push("  -> SOSPETTO PRINCIPALE: HapticTapService");
      } else {
        lines.push(
          "  -> nessun lavoro applicativo marcato dentro il blocco: il tempo se ne va",
        );
        lines.push(
          "     in stile/layout/paint del browser (sospetti: body.no-scroll,",
        );
        lines.push("     teardown dei layer backdrop-filter)");
      }
    }

    // ---- Ripartizione del costo delle scansioni aptiche ----
    lines.push("");
    lines.push("=== SCANSIONI HAPTIC ===");
    const scans = this.pairScans();
    if (scans.length === 0) {
      lines.push("  nessuna scansione (atteso fuori da iOS: il servizio esce subito)");
    }
    for (const s of scans) {
      lines.push(
        "  @" +
          this.fmt(s.start) +
          "  totale " +
          s.total.toFixed(0) +
          "ms  [letture " +
          s.reads.toFixed(0) +
          "ms | scritture " +
          s.writes.toFixed(0) +
          "ms]  " +
          s.info,
      );
    }
    if (scans.length > 0) {
      const reads = scans.reduce((a, s) => a + s.reads, 0);
      const writes = scans.reduce((a, s) => a + s.writes, 0);
      lines.push("");
      lines.push(
        "  TOTALE letture " +
          reads.toFixed(0) +
          "ms | scritture " +
          writes.toFixed(0) +
          "ms",
      );
      lines.push(
        reads > writes * 2
          ? "  -> dominano le LETTURE: layout thrashing (getBoundingClientRect / querySelector per candidato)"
          : writes > reads * 2
            ? "  -> dominano le SCRITTURE: costo di appendChild/style degli overlay switch"
            : "  -> costo ripartito fra letture e scritture",
      );
    }

    // ---- Tutti i frame lunghi, per completezza ----
    lines.push("");
    lines.push("=== TUTTI I FRAME LUNGHI ===");
    for (const l of longs.slice().sort((a, b) => b.gap - a.gap).slice(0, 20)) {
      const inside = this.marksBetween(l.start, l.end);
      lines.push(
        "  " +
          l.gap.toFixed(0).padStart(6) +
          "ms @" +
          this.fmt(l.start) +
          "  " +
          (inside.map((m) => this.describe(m)).join(" , ") || "(nessuna mark)"),
      );
    }

    return lines.join("\n");
  }

  /** Accoppia scan-start / reads-done / scan-end per separare le due fasi. */
  private pairScans(): {
    start: number;
    total: number;
    reads: number;
    writes: number;
    info: string;
  }[] {
    const out: {
      start: number;
      total: number;
      reads: number;
      writes: number;
      info: string;
    }[] = [];

    for (let i = 0; i < this.marks.length; i++) {
      if (this.marks[i].label !== "haptic:scan-start") {
        continue;
      }
      const start = this.marks[i];
      let readsDone: ProbeMark | undefined;
      let end: ProbeMark | undefined;

      for (let j = i + 1; j < this.marks.length; j++) {
        if (this.marks[j].label === "haptic:reads-done") {
          readsDone = this.marks[j];
        }
        if (this.marks[j].label === "haptic:scan-end") {
          end = this.marks[j];
          break;
        }
        if (this.marks[j].label === "haptic:scan-start") {
          break;
        }
      }
      if (!end) {
        continue;
      }

      out.push({
        start: start.t,
        total: end.t - start.t,
        reads: (readsDone ? readsDone.t : end.t) - start.t,
        writes: readsDone ? end.t - readsDone.t : 0,
        info: (start.info + " " + end.info).trim(),
      });
    }
    return out;
  }
}
