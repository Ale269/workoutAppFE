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
/** Sopra questa soglia una chiamata sincrona vale la pena di essere marcata. */
const SYNC_SLOW_MS = 4;

@Injectable({ providedIn: "root" })
export class PerfProbeService {
  private zone = inject(NgZone);

  /** Esposto come signal così il pannello reagisce senza polling. */
  readonly recording = signal(false);

  /**
   * Interruttori per esperimenti controllati a caldo: permettono di misurare
   * la STESSA chiusura con e senza un sospetto, sullo stesso dispositivo e
   * nello stesso stato, invece di confrontare due build diverse.
   *
   * A) no-scroll: non applica più `body.no-scroll` all'apertura/chiusura.
   * B) blur: azzera tutti i backdrop-filter via classe su <html>.
   */
  readonly suppressNoScroll = signal(false);
  readonly suppressBlur = signal(false);
  readonly suppressImages = signal(false);

  toggleNoScroll(): void {
    const next = !this.suppressNoScroll();
    this.suppressNoScroll.set(next);
    // Se lo si sopprime a overlay chiuso la classe non c'è già; se lo si
    // sopprime a overlay aperto va tolta subito, altrimenti resta appesa.
    if (next) {
      document.body.classList.remove("no-scroll");
    }
  }

  toggleBlur(): void {
    const next = !this.suppressBlur();
    this.suppressBlur.set(next);
    document.documentElement.classList.toggle("perf-no-blur", next);
  }

  /**
   * Toglie ogni <img> dal rendering: niente immagini da decodificare né da
   * dipingere. NB: `display:none` cambia anche il layout, quindi è un test
   * con una variabile in più — ma visto che lo style+layout misurato è di
   * 0ms, se il blocco crolla la causa è la decodifica/pittura, non il layout.
   */
  toggleImages(): void {
    const next = !this.suppressImages();
    this.suppressImages.set(next);
    document.documentElement.classList.toggle("perf-no-img", next);
  }

  private frames: number[] = [];
  /**
   * Secondo ticker, su setTimeout invece che su rAF. È il discriminante
   * decisivo: rAF è servito dal ciclo di rendering, setTimeout dalla coda
   * dei task. Se durante un buco nei frame i timer CONTINUANO a scattare,
   * il main thread è libero e lo stallo è nel rendering/compositing; se si
   * fermano entrambi, il main thread è occupato.
   */
  private timers: number[] = [];
  /**
   * Battito da un Web Worker, che ha un thread suo. Distingue due situazioni
   * che dall'interno del main thread sono indistinguibili:
   *  - il main thread è occupato ma la pagina vive  -> il worker continua
   *  - l'intera pagina è sospesa dal browser/OS     -> si ferma anche lui
   * I tick portano un wall-clock generato dal worker, quindi restano validi
   * anche se i messaggi arrivano tutti insieme a blocco finito.
   */
  private workerTicks: number[] = [];
  private worker: Worker | undefined;
  private dateOrigin = 0;
  private perfOrigin = 0;
  /** Ripristino delle API sincrone strumentate. */
  private restoreSync: (() => void)[] = [];
  private marks: ProbeMark[] = [];
  private rafId = 0;
  private timerId: ReturnType<typeof setTimeout> | undefined;
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
    this.timers = [];
    this.workerTicks = [];
    this.marks = [];
    this.t0 = performance.now();
    this.perfOrigin = this.t0;
    this.dateOrigin = Date.now();
    this.recording.set(true);
    this.startWorker();
    this.installSyncProbes();

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

      // Catena di setTimeout, non setInterval: se il thread si blocca i
      // tick non si accumulano per poi scattare tutti insieme, falsando la
      // ricostruzione.
      const timerTick = () => {
        if (!this.recording()) {
          return;
        }
        if (this.timers.length < MAX_FRAMES) {
          this.timers.push(performance.now());
        }
        this.timerId = setTimeout(timerTick, 16);
      };
      this.timerId = setTimeout(timerTick, 16);
    });
  }

  stop(): void {
    if (!this.recording()) {
      return;
    }
    this.recording.set(false);
    cancelAnimationFrame(this.rafId);
    clearTimeout(this.timerId);
    this.worker?.terminate();
    this.worker = undefined;
    // Le API globali vanno rimesse a posto SEMPRE: restare strumentate a
    // registrazione ferma falserebbe il resto della sessione.
    this.restoreSync.forEach((fn) => fn());
    this.restoreSync = [];
  }

  /** Battito su un thread separato: vedi il commento su `workerTicks`. */
  private startWorker(): void {
    try {
      const src = "setInterval(function(){postMessage(Date.now());},16);";
      const url = URL.createObjectURL(
        new Blob([src], { type: "text/javascript" }),
      );
      this.worker = new Worker(url);
      URL.revokeObjectURL(url);
      this.worker.onmessage = (e: MessageEvent<number>) => {
        if (this.workerTicks.length < MAX_FRAMES) {
          // Wall-clock del worker riportato sulla linea temporale della pagina.
          this.workerTicks.push(this.perfOrigin + (e.data - this.dateOrigin));
        }
      };
    } catch {
      // Worker non disponibile: la sonda semplicemente non riporterà nulla.
    }
  }

  /**
   * Strumenta le API SINCRONE che possono bloccare il main thread senza
   * comparire come JS applicativo, layout o change detection. `localStorage`
   * è il caso tipico: su iOS è appoggiato a SQLite e una lettura o scrittura
   * grossa costa centinaia di millisecondi, invisibile a ogni altra sonda.
   */
  private installSyncProbes(): void {
    // Serve un alias: dentro il wrapper `this` deve restare l'oggetto
    // originale (es. localStorage), altrimenti la chiamata fallisce.
    const probe = this;

    const wrap = (
      target: Record<string, unknown>,
      name: string,
      label: string,
    ): void => {
      const original = target[name];
      if (typeof original !== "function") {
        return;
      }
      const fn = original as (...args: unknown[]) => unknown;
      target[name] = function (this: unknown, ...args: unknown[]): unknown {
        const before = performance.now();
        const result = fn.apply(this, args);
        const cost = performance.now() - before;
        if (cost >= SYNC_SLOW_MS) {
          probe.mark("sync:" + label, cost.toFixed(0) + "ms");
        }
        return result;
      };
      this.restoreSync.push(() => {
        target[name] = original;
      });
    };

    const storage = Storage.prototype as unknown as Record<string, unknown>;
    wrap(storage, "getItem", "storage.getItem");
    wrap(storage, "setItem", "storage.setItem");
    wrap(storage, "removeItem", "storage.removeItem");
    const json = JSON as unknown as Record<string, unknown>;
    wrap(json, "parse", "JSON.parse");
    wrap(json, "stringify", "JSON.stringify");
  }

  /** Marca un istante. Costo: una push, nessun accesso al DOM. */
  mark(label: string, info = ""): void {
    if (!this.recording() || this.marks.length >= MAX_MARKS) {
      return;
    }
    this.marks.push({ t: performance.now(), label, info });
  }

  /**
   * Marca misurando anche il costo di uno STYLE+LAYOUT sincrono.
   *
   * È la sonda che distingue le due cose che "occupano il main thread":
   * leggere `offsetHeight` costringe il browser a ricalcolare stile e layout
   * subito, e a cronometrarlo. Se qui vengono fuori centinaia di
   * millisecondi, il blocco è stile/layout; se ne vengono fuori pochi, il
   * tempo se ne va altrove (paint, compositing, o JS non marcato).
   *
   * NB: forzare il layout ha un costo suo, ma è un costo che verrebbe pagato
   * comunque poche righe dopo — lo si sta solo anticipando per misurarlo.
   */
  markLayoutCost(label: string): void {
    if (!this.recording()) {
      return;
    }
    const before = performance.now();
    void document.body.offsetHeight;
    const layoutMs = performance.now() - before;

    // Statistiche immagini. Il peso del FILE non conta: una PNG 1024x1024
    // occupa 4 MB di RAM una volta decodificata, qualunque sia il peso su
    // disco. Se iOS scarta i bitmap sotto pressione di memoria, riaverli
    // significa ridecodificarli sul main thread — costo invisibile a ogni
    // altra sonda. `mpx` è la somma dei megapixel decodificati;
    // `oversize` conta le immagini servite ad almeno il triplo della
    // risoluzione a cui vengono disegnate.
    // I bitmap decodificati sono per SORGENTE, non per elemento: dieci <img>
    // con lo stesso src condividono un solo bitmap. Sommare per elemento
    // gonfierebbe la stima, quindi si deduplica su currentSrc.
    let pixels = 0;
    let oversize = 0;
    const seen = new Set<string>();
    const images = document.images;
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      const src = img.currentSrc || img.src;
      if (src && !seen.has(src)) {
        seen.add(src);
        pixels += img.naturalWidth * img.naturalHeight;
      }
      // Il layout è appena stato calcolato: queste letture non lo invalidano.
      const shown = img.getBoundingClientRect().width;
      if (shown > 0 && img.naturalWidth > shown * 3) {
        oversize++;
      }
    }

    this.mark(
      label,
      "layout=" +
        layoutMs.toFixed(0) +
        "ms nodi=" +
        document.getElementsByTagName("*").length +
        " img=" +
        images.length +
        " sorgenti=" +
        seen.size +
        " mpx=" +
        (pixels / 1e6).toFixed(1) +
        " ram=" +
        ((pixels * 4) / 1048576).toFixed(0) +
        "MB oversize=" +
        oversize,
    );
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

  /**
   * Quanti tick del timer sono scattati durante un buco nei frame, rispetto
   * a quanti sarebbero attesi. Vicino a 1 = main thread libero (stallo di
   * rendering); vicino a 0 = main thread occupato.
   */
  private timerHealth(start: number, end: number): { ticks: number; expected: number; ratio: number } {
    const ticks = this.timers.filter((t) => t > start && t < end).length;
    const expected = Math.max(1, Math.floor((end - start) / 16));
    return { ticks, expected, ratio: ticks / expected };
  }

  /** Millisecondi di scansione aptica effettivamente spesi dentro un blocco. */
  private hapticCostIn(start: number, end: number): number {
    return this.pairScans()
      .filter((s) => s.start >= start && s.start <= end)
      .reduce((a, s) => a + s.total, 0);
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
    // In testa alle condizioni dell'esperimento: senza questa riga è
    // impossibile ricostruire a posteriori sotto quale configurazione è
    // stata presa una registrazione.
    lines.push(
      "CONDIZIONI: no-scroll " +
        (this.suppressNoScroll() ? "SOPPRESSO" : "attivo") +
        " | backdrop-filter " +
        (this.suppressBlur() ? "SOPPRESSO" : "attivo") +
        " | immagini " +
        (this.suppressImages() ? "SOPPRESSE" : "attive"),
    );
    lines.push("");

    // ---- Sezione decisiva: cosa succede dopo ogni chiusura ----
    // Solo le chiusure VERE: l'effect() di AppComponent scatta una volta
    // all'avvio senza alcun overlay aperto e produce un "overlay:close"
    // fantasma, a cui verrebbero attribuiti blocchi che non c'entrano nulla.
    let seenOpen = false;
    const closes = this.marks.filter((m) => {
      if (m.label === "overlay:open") {
        seenOpen = true;
        return false;
      }
      if (m.label !== "overlay:close") {
        return false;
      }
      const real = seenOpen;
      seenOpen = false;
      return real;
    });
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

      // ---- Main thread bloccato o rendering in stallo? ----
      const health = this.timerHealth(worst.start, worst.end);
      lines.push(
        "  tick timer durante il blocco: " +
          health.ticks +
          "/" +
          health.expected +
          " attesi",
      );
      if (health.ratio > 0.5) {
        lines.push(
          "  -> MAIN THREAD LIBERO: i timer girano, i frame no. Lo stallo è nel",
        );
        lines.push(
          "     rendering/compositing (sospetti: teardown dei layer backdrop-filter,",
        );
        lines.push("     body.no-scroll che rifà il layout della pagina sotto)");
      } else if (health.ratio < 0.15) {
        // ATTENZIONE: "main thread occupato" NON vuol dire per forza
        // JavaScript. Style recalc, layout e paint girano sullo stesso
        // thread e fermano i timer allo stesso modo. Servono le due sonde
        // qui sotto per separarli.
        lines.push(
          "  -> MAIN THREAD OCCUPATO: si fermano anche i timer. Può essere JS/change",
        );
        lines.push("     detection OPPURE style/layout/paint del browser.");

        // Sonda 1: quanto è costato uno style+layout sincrono forzato.
        const layoutCosts = inside
          .map((m) => Number(/layout=(\d+)/.exec(m.info)?.[1] ?? -1))
          .filter((n) => n >= 0);
        const worstLayout = layoutCosts.length ? Math.max(...layoutCosts) : -1;

        // Sonda 2: quanto è DURATA la change detection dentro il blocco.
        // Non basta che `cd:start` cada nel blocco: la CD viene eseguita
        // tardi proprio perché il thread era occupato, quindi ci finisce
        // dentro anche quando dura 1ms ed è una vittima, non la causa.
        let cdCost = 0;
        for (let i = 0; i < inside.length; i++) {
          if (inside[i].label !== "cd:start") {
            continue;
          }
          const end = inside.slice(i + 1).find((m) => m.label === "cd:end");
          if (end) {
            cdCost += end.t - inside[i].t;
          }
        }

        if (worstLayout >= 0) {
          lines.push(
            "     style+layout sincrono misurato: " + worstLayout + "ms",
          );
        }
        lines.push("     change detection dentro il blocco: " + cdCost.toFixed(0) + "ms");

        // Quanto del blocco resta senza alcuna spiegazione.
        const explained = Math.max(worstLayout, 0) + cdCost;
        const unexplained = worst.gap - explained;

        if (worstLayout > worst.gap * 0.3) {
          lines.push("  -> COLPEVOLE: STYLE + LAYOUT");
        } else if (cdCost > worst.gap * 0.3) {
          lines.push("  -> COLPEVOLE: CHANGE DETECTION di Angular");
        } else {
          lines.push(
            "  -> NON SPIEGATO: " +
              unexplained.toFixed(0) +
              "ms su " +
              worst.gap.toFixed(0) +
              "ms senza JS, layout o CD.",
          );
          lines.push(
            "     Il thread è occupato da lavoro sincrono invisibile alle sonde:",
          );
          lines.push(
            "     paint/raster, decodifica immagini, GC, o API sincrone (storage).",
          );
        }

        // Sonda 3: la pagina era viva durante il blocco, o sospesa?
        const wTicks = this.workerTicks.filter(
          (t) => t > worst.start && t < worst.end,
        ).length;
        const wExpected = Math.max(1, Math.floor(worst.gap / 16));
        if (this.workerTicks.length === 0) {
          lines.push("     worker: nessun dato (non disponibile)");
        } else if (wTicks > wExpected * 0.5) {
          lines.push(
            "     worker: " +
              wTicks +
              "/" +
              wExpected +
              " tick -> la PAGINA VIVE, è bloccato solo il main thread",
          );
        } else {
          lines.push(
            "     worker: " +
              wTicks +
              "/" +
              wExpected +
              " tick -> si ferma anche un altro thread:",
          );
          lines.push(
            "       l'INTERA PAGINA è sospesa dal browser (memoria/snapshot/OS)",
          );
        }
      } else {
        lines.push(
          "  -> MAIN THREAD PARZIALMENTE OCCUPATO: i timer rallentano ma non si fermano",
        );
      }

      // ---- Attribuzione onesta del costo aptico ----
      // NON basta trovare mark `haptic:` dentro il blocco: requestIdleCallback
      // viene servito TARDI proprio perché il thread era occupato, quindi la
      // scansione finisce dentro il blocco anche quando ne è la vittima e non
      // la causa. Conta solo quanto tempo ha realmente consumato.
      const hapticCost = this.hapticCostIn(worst.start, worst.end);
      const firstHaptic = inside.find((m) => m.label === "haptic:scan-start");
      if (firstHaptic) {
        const share = hapticCost / worst.gap;
        if (share < 0.2) {
          lines.push(
            "  -> HapticTapService SCAGIONATO: la scansione è costata " +
              hapticCost.toFixed(0) +
              "ms su " +
              worst.gap.toFixed(0) +
              "ms di blocco,",
          );
          lines.push(
            "     ed è arrivata a +" +
              (firstHaptic.t - worst.start).toFixed(0) +
              "ms (starved da requestIdleCallback): è un testimone, non la causa",
          );
        } else {
          lines.push(
            "  -> HapticTapService RESPONSABILE: " +
              hapticCost.toFixed(0) +
              "ms su " +
              worst.gap.toFixed(0) +
              "ms di blocco",
          );
        }
      }
    }

    // ---- Chiamate sincrone lente (storage, JSON) ----
    const slowSync = this.marks.filter((m) => m.label.startsWith("sync:"));
    lines.push("");
    lines.push("=== CHIAMATE SINCRONE LENTE (>" + SYNC_SLOW_MS + "ms) ===");
    if (slowSync.length === 0) {
      lines.push("  nessuna -> storage e JSON non c'entrano");
    }
    for (const m of slowSync.slice(0, 25)) {
      lines.push("  @" + this.fmt(m.t) + "  " + m.label + "  " + m.info);
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
      // La ripartizione letture/scritture ha senso solo se il costo TOTALE è
      // rilevante: su pochi millisecondi è rumore, e presentarlo come
      // verdetto porta fuori strada.
      if (reads + writes < 50) {
        lines.push(
          "  -> costo totale trascurabile (" +
            (reads + writes).toFixed(0) +
            "ms sull'intera sessione): HapticTapService non è un problema",
        );
      } else {
        lines.push(
          reads > writes * 2
            ? "  -> dominano le LETTURE: layout thrashing (getBoundingClientRect / querySelector per candidato)"
            : writes > reads * 2
              ? "  -> dominano le SCRITTURE: costo di appendChild/style degli overlay switch"
              : "  -> costo ripartito fra letture e scritture",
        );
      }
    }

    // ---- Tutti i frame lunghi, per completezza ----
    lines.push("");
    lines.push("=== TUTTI I FRAME LUNGHI ===");
    for (const l of longs.slice().sort((a, b) => b.gap - a.gap).slice(0, 20)) {
      const inside = this.marksBetween(l.start, l.end);
      const h = this.timerHealth(l.start, l.end);
      lines.push(
        "  " +
          l.gap.toFixed(0).padStart(6) +
          "ms @" +
          this.fmt(l.start) +
          "  timer " +
          h.ticks +
          "/" +
          h.expected +
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
