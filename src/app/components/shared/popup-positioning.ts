export type VerticalAnchor = "top" | "bottom";
export type HorizontalAnchor = "left" | "right";

export interface CornerAnchor {
  vertical: VerticalAnchor;
  horizontal: HorizontalAnchor;
}

/** Distanza minima dal bordo opposto dello schermo rispetto a dove il pannello si espande */
const EDGE_MARGIN = 8;
/** Cap "di design" della larghezza, indipendente dallo spazio disponibile */
const MAX_PANEL_WIDTH = 340;
/** Sotto questa altezza il pannello non è più leggibile: meglio sforare di poco */
const MIN_PANEL_HEIGHT = 120;

/**
 * Logica di posizionamento condivisa dai popup ancorati stile Apple
 * (app-confirm-popup, il popup cronologia in app-exercise-component, ecc.):
 * il pannello DEVE sovrapporsi al trigger che lo ha aperto, con lo spigolo
 * scelto che combacia esattamente con lo spigolo corrispondente del trigger
 * (nessun gap), espandendosi dalla parte opposta dove c'è più spazio nel
 * viewport. getBoundingClientRect() è già relativo al viewport, quindi lo
 * scroll non richiede calcoli aggiuntivi.
 *
 * IMPORTANTE — ordine dei calcoli: la larghezza va decisa PRIMA
 * dell'altezza. Il testo va a capo in modo diverso a seconda della
 * larghezza disponibile, quindi misurare panelRect.height prima di aver
 * applicato la larghezza definitiva dà un'altezza sbagliata (in genere
 * troppo bassa) — la direzione verticale scelta su quella misura può poi
 * far fuoriuscire il pannello dallo schermo una volta che il testo va a
 * capo su più righe con la larghezza corretta.
 * Uso previsto: computeHorizontalAnchor -> applica maxWidth al pannello ->
 * misura panel.offsetHeight (ora accurata) -> computeVerticalAnchor.
 * Vedi positionPopupPanel(), che orchestra la sequenza.
 */

/**
 * Fase 1 (orizzontale, non richiede misurare il pannello): decide da che
 * lato si espande e quanto può essere largo al massimo, mantenendo almeno
 * EDGE_MARGIN dal bordo opposto dello schermo.
 */
export function computeHorizontalAnchor(triggerRect: DOMRect): {
  horizontal: HorizontalAnchor;
  maxWidth: number;
} {
  // "right": il pannello cresce a sinistra dal bordo destro del trigger,
  // deve restare ad almeno EDGE_MARGIN dal bordo SINISTRO dello schermo.
  const maxWidthIfRight = triggerRect.right - EDGE_MARGIN;
  // "left": il pannello cresce a destra dal bordo sinistro del trigger,
  // deve restare ad almeno EDGE_MARGIN dal bordo DESTRO dello schermo.
  const maxWidthIfLeft = window.innerWidth - EDGE_MARGIN - triggerRect.left;

  const horizontal: HorizontalAnchor =
    maxWidthIfRight >= maxWidthIfLeft ? "right" : "left";
  const availableWidth = horizontal === "right" ? maxWidthIfRight : maxWidthIfLeft;

  return {
    horizontal,
    maxWidth: Math.max(0, Math.min(availableWidth, MAX_PANEL_WIDTH)),
  };
}

/**
 * Fase 2 (verticale): chiamare SOLO dopo aver applicato il maxWidth di
 * computeHorizontalAnchor e misurato panelHeight di conseguenza.
 */
export function computeVerticalAnchor(
  triggerRect: DOMRect,
  panelHeight: number,
): VerticalAnchor {
  // "bottom" = spigolo inferiore del pannello = spigolo inferiore del
  // trigger, si espande verso l'alto (copre il trigger e continua sopra).
  // "top" = spigolo superiore combacia, si espande in basso.
  const roomToGrowUpward = triggerRect.bottom;
  const roomToGrowDownward = window.innerHeight - triggerRect.top;
  return roomToGrowUpward >= panelHeight || roomToGrowUpward >= roomToGrowDownward
    ? "bottom"
    : "top";
}

export function applyCornerAnchor(
  panel: HTMLElement,
  triggerRect: DOMRect,
  anchor: CornerAnchor,
): void {
  if (anchor.vertical === "bottom") {
    panel.style.bottom = `${window.innerHeight - triggerRect.bottom}px`;
    panel.style.top = "auto";
  } else {
    panel.style.top = `${triggerRect.top}px`;
    panel.style.bottom = "auto";
  }

  if (anchor.horizontal === "right") {
    panel.style.right = `${window.innerWidth - triggerRect.right}px`;
    panel.style.left = "auto";
  } else {
    panel.style.left = `${triggerRect.left}px`;
    panel.style.right = "auto";
  }
}

export function cornerTransformOrigin(anchor: CornerAnchor): string {
  return `${anchor.vertical} ${anchor.horizontal}`;
}

/**
 * Esegue l'intera sequenza in due fasi (larghezza -> altezza -> verticale)
 * e applica la posizione al pannello. Il pannello deve già essere nel DOM
 * (visibility:hidden va bene, display:none no) perché serve misurarne le
 * dimensioni reali.
 */
export function positionPopupPanel(
  panel: HTMLElement,
  triggerElement: HTMLElement,
): { anchor: CornerAnchor; transformOrigin: string } {
  const triggerRect = triggerElement.getBoundingClientRect();

  const { horizontal, maxWidth } = computeHorizontalAnchor(triggerRect);
  panel.style.maxWidth = `${maxWidth}px`;

  // Altezza dal box di LAYOUT, non da getBoundingClientRect(): quest'ultimo
  // restituisce il box TRASFORMATO, quindi se un tween di scale è in corso
  // (es. il popup viene riposizionato mentre l'animazione di ingresso da
  // scale 0.4 sta ancora girando) l'altezza risulterebbe fino al 60% più
  // piccola del reale, e computeVerticalAnchor sceglierebbe la direzione
  // sbagliata. offsetHeight ignora i transform ed è quello che ci serve.
  // Leggerlo forza anche il reflow con la larghezza appena impostata, quindi
  // il wrapping del testo è già quello definitivo.
  const vertical = computeVerticalAnchor(triggerRect, panel.offsetHeight);

  // Garanzia dura contro la fuoriuscita dallo schermo: qualunque direzione sia
  // stata scelta, il pannello non può superare lo spazio realmente disponibile
  // da quel lato. Se il contenuto è più alto, scrolla internamente
  // (.history-popup-panel ha overflow-y: auto) invece di uscire dal viewport.
  const availableHeight =
    vertical === "bottom"
      ? triggerRect.bottom
      : window.innerHeight - triggerRect.top;
  panel.style.maxHeight = `${Math.max(
    MIN_PANEL_HEIGHT,
    availableHeight - EDGE_MARGIN,
  )}px`;

  const anchor: CornerAnchor = { vertical, horizontal };
  applyCornerAnchor(panel, triggerRect, anchor);

  return { anchor, transformOrigin: cornerTransformOrigin(anchor) };
}
