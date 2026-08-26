import {
  AfterViewInit,
  Directive,
  ElementRef,
  OnDestroy,
  Renderer2,
} from "@angular/core";

/**
 * Feedback aptico reale su iOS via overlay "switch" nativo.
 *
 * Contesto: da iOS 17.4 Safari emette il Taptic Engine quando un
 * `<input type="checkbox" switch>` viene attivato tramite la sua
 * `<label>` associata. Fino a iOS 26.4 bastava creare l'elemento al volo
 * e chiamare `label.click()` via JavaScript (vedi HapticService.iosFallback).
 * Da iOS 26.5 Apple ha patchato questo comportamento: un click generato
 * da script (isTrusted: false) non emette più l'haptic — serve che il
 * DITO dell'utente tocchi DAVVERO l'elemento switch.
 *
 * Questa direttiva inserisce, una volta sola, un overlay invisibile
 * (checkbox+label "switch") che copre l'intero elemento host, così il
 * tap reale dell'utente attiva nativamente lo switch (evento trusted) e
 * fa scattare l'haptic, indipendentemente da qualunque chiamata JS.
 * L'evento click continua a propagarsi (bubbling) verso l'host e i suoi
 * antenati: i binding (click)/(touchstart) già presenti sull'host
 * continuano a funzionare invariati.
 *
 * Si applica automaticamente a ogni elemento con classe
 * ".small-inline-button" (il contenitore generico usato per "Aggiungi",
 * "Duplica", "Riordina", ecc. in tutta l'app) — nessuna modifica ai
 * template necessaria.
 *
 * NB: non va applicata a elementi <button> nativi (non possono
 * validamente contenere figli interattivi come <input>/<label>).
 */
@Directive({
  selector: ".small-inline-button",
  standalone: true,
})
export class HapticSwitchDirective implements AfterViewInit, OnDestroy {
  private overlayInput?: HTMLInputElement;
  private overlayLabel?: HTMLLabelElement;

  constructor(
    private elementRef: ElementRef<HTMLElement>,
    private renderer: Renderer2,
  ) {}

  ngAfterViewInit(): void {
    try {
      if (!this.isIos()) {
        return;
      }
      this.attachSwitchOverlay();
    } catch {
      // Il feedback aptico non è mai critico per il funzionamento dell'app
    }
  }

  ngOnDestroy(): void {
    this.overlayInput?.remove();
    this.overlayLabel?.remove();
  }

  private isIos(): boolean {
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

  private attachSwitchOverlay(): void {
    const host = this.elementRef.nativeElement;

    if (getComputedStyle(host).position === "static") {
      this.renderer.setStyle(host, "position", "relative");
    }

    const id = "haptic-switch-" + Math.random().toString(36).slice(2);

    const input = this.renderer.createElement("input") as HTMLInputElement;
    this.renderer.setAttribute(input, "type", "checkbox");
    this.renderer.setAttribute(input, "switch", "");
    this.renderer.setAttribute(input, "id", id);
    this.renderer.setAttribute(input, "tabindex", "-1");
    this.renderer.setAttribute(input, "aria-hidden", "true");

    const label = this.renderer.createElement("label") as HTMLLabelElement;
    this.renderer.setAttribute(label, "for", id);
    this.renderer.setAttribute(label, "aria-hidden", "true");

    for (const overlayEl of [input, label]) {
      this.renderer.setStyle(overlayEl, "position", "absolute");
      this.renderer.setStyle(overlayEl, "inset", "0");
      this.renderer.setStyle(overlayEl, "width", "100%");
      this.renderer.setStyle(overlayEl, "height", "100%");
      this.renderer.setStyle(overlayEl, "margin", "0");
      this.renderer.setStyle(overlayEl, "opacity", "0");
      this.renderer.setStyle(overlayEl, "z-index", "2");
      this.renderer.setStyle(overlayEl, "-webkit-tap-highlight-color", "transparent");
    }

    // Solo la label riceve il tap reale: il click sull'input non deve mai
    // avvenire per interazione diretta, solo per "forwarding" dalla label.
    this.renderer.setStyle(input, "pointer-events", "none");

    // Attivando una <label> il browser genera DUE eventi "click" che
    // risalgono (bubbling) fino a questo host: quello sulla label stessa
    // e quello "inoltrato" nativamente al control associato (l'input) —
    // è il comportamento standard di attivazione label→control, non un
    // bug. Senza questo stop, ogni (click) sull'host scatterebbe due
    // volte per un solo tap reale. Blocchiamo solo l'eco sull'input:
    // il click "vero" della label continua a risalire normalmente.
    this.renderer.listen(input, "click", (event: Event) => {
      event.stopPropagation();
    });

    this.renderer.appendChild(host, input);
    this.renderer.appendChild(host, label);

    this.overlayInput = input;
    this.overlayLabel = label;
  }
}
