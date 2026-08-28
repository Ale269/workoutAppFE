import { Injectable, NgZone, inject } from "@angular/core";
import { HapticService } from "./haptic.service";
import { PerfProbeService } from "./perf-probe.service";

/**
 * Elenco degli elementi "tappabili" dell'app a cui va applicato il feedback
 * aptico: pulsanti, card cliccabili, voci dei menu di navigazione, chip.
 *
 * NB: sono volutamente ESCLUSI:
 * - i backdrop/overlay a tutto schermo (`.modal-overlay`, `.focus-overlay-backdrop`,
 *   `.popup-option-overlay`, `.fullscreen-menu-overlay`, ...): hanno un (click)
 *   solo per chiudersi, e un overlay aptico al loro interno intercetterebbe
 *   l'intera pagina;
 * - `.card-row` delle liste di riordino: sono elementi drag-first, un tap
 *   sintetico a fine trascinamento genererebbe vibrazioni spurie;
 * - `.left-button` / `.menu-trigger`: si usa il `.menu-btn-container` interno,
 *   che è il cerchio effettivamente visibile e che porta lo stile `:active`.
 *
 * Dove una classe è ambigua fra componenti diversi la si qualifica con il tag
 * del componente (es. `.exercise-container` esiste sia come card selezionabile
 * nel selector sia come card dell'editor, che invece è piena di form field).
 *
 * VINCOLO da rispettare quando si aggiunge un selettore: il binding `(click)`
 * deve stare sull'elemento che il selettore individua, MAI su un suo
 * discendente. L'overlay (`<label>` a tutta area, `inset: 0`) è figlio
 * dell'host: il click risale fino all'host e oltre, ma NON attraversa i figli
 * dell'host, che restano coperti. Un handler su un discendente non viene mai
 * raggiunto e il pulsante smette silenziosamente di funzionare — è quanto
 * successo a `.delete-action` nella pagina di modifica scheda.
 */
const TAPPABLE_SELECTORS = [
  // Pulsanti generici / globali
  ".small-inline-button",
  ".floating-static-button",
  ".button-confirm",
  ".button-danger",
  ".button-cancel",
  ".widget-button",
  ".btn-primary",
  ".btn-secondary",
  // Navigazione (menu alto e menu basso)
  ".menu-btn-container",
  ".bottom-menu-item",
  ".menu-item",
  ".back-icon-trigger",
  // Icone azione su esercizi / serie
  ".close-icon-trigger",
  ".delete-icon-element-container",
  ".delete-action",
  // Card cliccabili (home, liste, editing)
  ".allenamento-container",
  ".executed-scheda",
  ".template-scheda",
  ".scheda-corrente-container",
  ".widget-data",
  ".announcement-card",
  ".accordion-header-container",
  "app-workout-list-selector .exercise-container",
  "app-scheda-corrente .no-element",
  // Chip, tab, segmenti, toggle
  ".toggle-btn",
  ".filter-chip",
  ".scheda-chip",
  ".segment",
  ".tab-label",
  ".switch-trigger",
  ".theme-toggle-button",
  // Popup e modali (le singole voci, non i backdrop)
  ".confirm-popup-action",
  ".transformation-button",
  ".popup-option-container",
  // Varie
  ".toast-close",
  ".progressione-link",
  ".create-button",
  ".delete-button",
  ".cancel-button",
  ".cancel-input-button",
  ".close-btn",
  ".export-btn",
  ".register-button",
].join(", ");

/** Marker per non riprocessare lo stesso elemento a ogni scansione */
const ATTACHED_ATTR = "data-haptic-tap";

@Injectable({ providedIn: "root" })
export class HapticTapService {
  private hapticService = inject(HapticService);
  private zone = inject(NgZone);
  /** Diagnostica temporanea: no-op quando non si sta registrando. */
  private probe = inject(PerfProbeService);

  private observer?: MutationObserver;
  private scanScheduled = false;
  private started = false;
  /** Diagnostica temporanea: vedi setDiagnosticDisabled(). */
  private diagnosticDisabled = false;

  /**
   * Attiva il feedback aptico su tutti gli elementi tappabili dell'app.
   * Va chiamato una sola volta all'avvio (AppComponent).
   */
  init(): void {
    if (this.started || typeof document === "undefined") {
      return;
    }
    this.started = true;

    if (this.isIos()) {
      // iOS: serve un tap REALE su uno switch nativo (vedi attachSwitchOverlay)
      this.startIosOverlays();
    } else {
      // Android & co.: basta la Vibration API, con un solo listener delegato
      this.startDelegatedVibration();
    }
  }

  // =======================================================================
  // iOS — overlay switch per tap trusted
  // =======================================================================

  private startIosOverlays(): void {
    // Fuori da Angular: le mutazioni DOM sono continue e non devono
    // innescare change detection.
    this.zone.runOutsideAngular(() => {
      this.scanAndAttach();
      this.observe();
    });
  }

  private observe(): void {
    this.observer = new MutationObserver(() => this.scheduleScan());
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  /**
   * DIAGNOSTICA TEMPORANEA — comandata dal pannello perf.
   *
   * Spegne del tutto il feedback aptico e RIMUOVE dal DOM gli overlay già
   * iniettati. Serve a misurare non il costo della scansione (già noto, 1-2ms)
   * ma quello di ciò che la scansione lascia dietro: fino a 128
   * `<input type="checkbox" switch>`, che su Safari sono controlli NATIVI e
   * vanno gestiti a ogni render. È un costo che si paga in pittura, invisibile
   * a tutte le altre sonde.
   */
  setDiagnosticDisabled(disabled: boolean): void {
    this.diagnosticDisabled = disabled;

    if (disabled) {
      this.observer?.disconnect();
      this.observer = undefined;
      document
        .querySelectorAll('input[id^="haptic-switch-"]')
        .forEach((el) => el.remove());
      document
        .querySelectorAll('label[for^="haptic-switch-"]')
        .forEach((el) => el.remove());
      document
        .querySelectorAll("[" + ATTACHED_ATTR + "]")
        .forEach((el) => el.removeAttribute(ATTACHED_ATTR));
      return;
    }

    if (this.isIos()) {
      this.zone.runOutsideAngular(() => {
        this.scanAndAttach();
        this.observe();
      });
    }
  }

  /** Coalescing: al massimo una scansione in coda, solo se il DOM è cambiato */
  private scheduleScan(): void {
    if (this.scanScheduled) {
      return;
    }
    this.scanScheduled = true;
    // Questo è l'istante in cui, nelle misure su Safari, comincia il blocco:
    // il punto giusto per cronometrare uno style+layout sincrono.
    this.probe.markLayoutCost("haptic:mutation");
    // requestIdleCallback e NON requestAnimationFrame: con rAF la scansione
    // finiva dentro il frame successivo alla mutazione, cioè esattamente nei
    // frame in cui l'app sta animando (chiusura di un popup, ritorno dal
    // riordino) — il momento peggiore possibile. In idle il browser la
    // esegue quando ha tempo libero; il timeout garantisce che non slitti
    // all'infinito su una pagina sempre occupata.
    this.scheduleIdle(() => {
      this.probe.mark("haptic:idle-fire");
      this.scanScheduled = false;
      this.scanAndAttach();
    });
  }

  private scheduleIdle(fn: () => void): void {
    const idle = (
      window as unknown as {
        requestIdleCallback?: (
          cb: () => void,
          opts?: { timeout: number },
        ) => number;
      }
    ).requestIdleCallback;

    if (typeof idle === "function") {
      idle(fn, { timeout: 500 });
    } else {
      setTimeout(fn, 0);
    }
  }

  /**
   * Scansione in DUE FASI: prima tutte le letture, poi tutte le scritture.
   *
   * Prima erano interlacciate: per ogni elemento nuovo si leggeva
   * getBoundingClientRect() e getComputedStyle() (letture, che costringono il
   * browser a calcolare il layout) e subito dopo si scriveva style.position e
   * si facevano due appendChild() (scritture, che il layout lo invalidano).
   * Alla lettura successiva il layout andava quindi ricalcolato da capo: con
   * N elementi nuovi, N layout sincroni sull'INTERO documento — il classico
   * "layout thrashing", costo quadratico di fatto.
   *
   * Si vedeva solo in chiusura e mai in apertura, e il motivo è semplice:
   * passando a compact gli elementi SPARISCONO (nessun candidato nuovo, la
   * scansione non fa nulla), tornando a normale ne compaiono decine tutti
   * insieme. Da qui il blocco di oltre un secondo al ritorno dal riordino.
   *
   * Separando le fasi il layout viene calcolato UNA volta sola.
   */
  private scanAndAttach(): void {
    try {
      if (!this.isIos() || this.diagnosticDisabled) {
        return;
      }

      this.probe.mark("haptic:scan-start");

      const candidates =
        document.querySelectorAll<HTMLElement>(TAPPABLE_SELECTORS);

      // ---- FASE 1: sole letture ----
      // setAttribute su un data-attribute non invalida il layout (nessuna
      // regola CSS ci si aggancia), quindi marcare gli "skip" qui è sicuro.
      const viewportArea = window.innerWidth * window.innerHeight;
      const toAttach: HTMLElement[] = [];

      for (const candidate of Array.from(candidates)) {
        if (candidate.hasAttribute(ATTACHED_ATTR)) {
          continue;
        }
        if (this.shouldSkip(candidate, viewportArea)) {
          candidate.setAttribute(ATTACHED_ATTR, "skip");
          continue;
        }
        toAttach.push(candidate);
      }

      if (toAttach.length === 0) {
        this.probe.mark(
          "haptic:reads-done",
          "cand=" + candidates.length + " nuovi=0",
        );
        this.probe.mark("haptic:scan-end");
        return;
      }

      // Ultima lettura, ancora prima di qualsiasi scrittura
      const needsRelative = toAttach.map(
        (host) => getComputedStyle(host).position === "static",
      );

      this.probe.mark(
        "haptic:reads-done",
        "cand=" + candidates.length + " nuovi=" + toAttach.length,
      );

      // ---- FASE 2: sole scritture ----
      toAttach.forEach((host, i) => {
        host.setAttribute(ATTACHED_ATTR, "");
        this.attachSwitchOverlay(host, needsRelative[i]);
      });

      this.probe.mark("haptic:scan-end");
    } catch {
      // Il feedback aptico non è mai critico per il funzionamento dell'app
    }
  }

  /**
   * Applica l'overlay switch a un elemento. Idempotente: può essere chiamata
   * più volte sullo stesso elemento (anche dalla HapticSwitchDirective).
   * Percorso a elemento singolo: qui l'interlacciamento lettura/scrittura non
   * è un problema, è un solo layout.
   */
  attach(host: HTMLElement): void {
    // Gli overlay switch servono solo su iOS: altrove la Vibration API è
    // gestita dal listener delegato, senza toccare il DOM.
    if (!this.isIos() || host.hasAttribute(ATTACHED_ATTR)) {
      return;
    }

    if (this.shouldSkip(host, window.innerWidth * window.innerHeight)) {
      host.setAttribute(ATTACHED_ATTR, "skip");
      return;
    }

    host.setAttribute(ATTACHED_ATTR, "");
    this.attachSwitchOverlay(
      host,
      getComputedStyle(host).position === "static",
    );
  }

  private shouldSkip(host: HTMLElement, viewportArea: number): boolean {
    // 1. Contiene un altro elemento tappabile: l'overlay coprirebbe il figlio
    //    e ne ucciderebbe il click (l'overlay ha z-index e viene dopo nel DOM).
    //    Si aggancia quindi solo al match più interno.
    if (host.querySelector(TAPPABLE_SELECTORS)) {
      return true;
    }

    // 2. Contiene controlli di form: un overlay a tutta area li renderebbe
    //    intoccabili (es. le card dell'editor esercizio, piene di mat-form-field).
    if (host.querySelector("input, textarea, select, mat-form-field, mat-select")) {
      return true;
    }

    // 3. Occupa (quasi) tutto il viewport: è un backdrop, non un pulsante.
    const rect = host.getBoundingClientRect();
    if (viewportArea > 0 && rect.width * rect.height > viewportArea * 0.8) {
      return true;
    }

    return false;
  }

  /**
   * Da iOS 17.4 Safari emette il Taptic Engine quando un
   * `<input type="checkbox" switch>` viene attivato tramite la sua `<label>`.
   * Da iOS 26.5 un click generato da script (isTrusted: false) non basta più:
   * serve che il DITO tocchi davvero l'elemento. Inseriamo quindi un overlay
   * invisibile che copre l'host, così il tap reale attiva nativamente lo
   * switch. L'evento click continua a risalire verso l'host, quindi i binding
   * (click) già presenti continuano a funzionare invariati.
   *
   * L'overlay è FIGLIO dell'host (non fratello) di proposito: così l'host
   * resta antenato dell'elemento toccato e i suoi stili `:active`
   * (es. `transform: scale(0.95)`) continuano ad applicarsi.
   */
  private attachSwitchOverlay(host: HTMLElement, needsRelative: boolean): void {
    // needsRelative arriva già calcolato dal chiamante: la lettura di
    // getComputedStyle() deve avvenire nella fase di sola lettura, mai qui in
    // mezzo alle scritture (vedi scanAndAttach).
    if (needsRelative) {
      host.style.position = "relative";
    }

    const id = "haptic-switch-" + Math.random().toString(36).slice(2);

    const input = document.createElement("input");
    input.type = "checkbox";
    input.setAttribute("switch", "");
    input.id = id;
    input.tabIndex = -1;
    input.setAttribute("aria-hidden", "true");

    const label = document.createElement("label");
    label.htmlFor = id;
    label.setAttribute("aria-hidden", "true");

    for (const overlayEl of [input, label]) {
      const style = overlayEl.style;
      style.position = "absolute";
      style.inset = "0";
      style.width = "100%";
      style.height = "100%";
      style.margin = "0";
      style.opacity = "0";
      style.zIndex = "2";
      style.setProperty("-webkit-tap-highlight-color", "transparent");
    }

    // Solo la label riceve il tap reale: il click sull'input non deve mai
    // avvenire per interazione diretta, solo per "forwarding" dalla label.
    input.style.pointerEvents = "none";

    // Attivando una <label> il browser genera DUE eventi "click" che risalgono
    // fino all'host: quello sulla label e quello inoltrato nativamente al
    // control associato (l'input). Senza questo stop, ogni (click) sull'host
    // scatterebbe due volte per un solo tap. Blocchiamo solo l'eco sull'input.
    input.addEventListener("click", (event) => event.stopPropagation());

    host.appendChild(input);
    host.appendChild(label);
  }

  // =======================================================================
  // Android & co. — un solo listener delegato
  // =======================================================================

  private startDelegatedVibration(): void {
    this.zone.runOutsideAngular(() => {
      document.addEventListener(
        "click",
        (event) => {
          const target = event.target as HTMLElement | null;
          if (!target || typeof target.closest !== "function") {
            return;
          }
          if (!target.closest(TAPPABLE_SELECTORS)) {
            return;
          }
          this.hapticService.triggerTap();
        },
        true,
      );
    });
  }

  private isIosCache?: boolean;

  private isIos(): boolean {
    if (this.isIosCache !== undefined) {
      return this.isIosCache;
    }
    this.isIosCache = this.detectIos();
    return this.isIosCache;
  }

  private detectIos(): boolean {
    if (typeof navigator === "undefined") {
      return false;
    }
    const userAgent = navigator.userAgent || "";
    const isIphoneOrIpod = /iPhone|iPod/.test(userAgent);
    // iPadOS si presenta come "MacIntel" ma ha touch: lo distinguiamo da un Mac vero
    const isIpad =
      /iPad/.test(userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    return isIphoneOrIpod || isIpad;
  }
}
