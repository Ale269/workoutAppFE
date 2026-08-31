/**
 * Infinite scroll per le liste paginate.
 *
 * Si aggancia al `.page-scroller` della pagina — lo stesso contenitore che
 * usano BottomMenuService e SwipeToDeleteController — e chiede la pagina
 * successiva quando l'utente si avvicina al fondo.
 *
 * Tre regole che tengono in piedi il meccanismo:
 *
 * 1. UNA RICHIESTA ALLA VOLTA. Lo scroll emette decine di eventi al secondo:
 *    senza il flag `caricando` partirebbero N chiamate per la stessa pagina e
 *    la lista si riempirebbe di duplicati.
 *
 * 2. LA FINE LA DECIDE IL SERVER, tramite `ultimaPagina`. Dedurla dal numero
 *    di record ricevuti sbaglia quando il totale e' un multiplo esatto della
 *    dimensione pagina.
 *
 * 3. IL CONTENITORE PUO' CAMBIARE. Il `.page-scroller` viene ricreato dai
 *    `@if` del template, quindi il listener va riagganciato: `attach()` e'
 *    idempotente e si puo' richiamare quando la lista cambia.
 */
export interface InfiniteScrollOptions {
  /**
   * Distanza dal fondo, in px, alla quale far partire la pagina successiva.
   * Abbastanza da nascondere la latenza, non tanto da caricare tutto subito.
   */
  soglia?: number;
  /** Cosa fare quando serve la pagina successiva. */
  onCaricaProssimaPagina: () => void;
}

export class InfiniteScrollController {
  private scroller: Element | null = null;
  private rimuoviListener: (() => void) | null = null;
  private readonly soglia: number;
  private readonly onCarica: () => void;

  private caricando = false;
  private ultimaPagina = false;

  constructor(options: InfiniteScrollOptions) {
    this.soglia = options.soglia ?? 300;
    this.onCarica = options.onCaricaProssimaPagina;
  }

  /** (Ri)aggancia il listener al page-scroller corrente. */
  attach(): void {
    const scroller = document.querySelector(".page-scroller");
    if (!scroller || scroller === this.scroller) return;

    this.detach();
    this.scroller = scroller;

    const handler = () => this.valuta();
    scroller.addEventListener("scroll", handler, { passive: true });
    this.rimuoviListener = () => scroller.removeEventListener("scroll", handler);

    // Se la prima pagina non riempie lo schermo non arriverebbe mai un evento
    // di scroll, e la lista resterebbe corta con altri record disponibili.
    this.valuta();
  }

  detach(): void {
    this.rimuoviListener?.();
    this.rimuoviListener = null;
    this.scroller = null;
  }

  /** Da chiamare prima di far partire una richiesta di pagina. */
  segnalaCaricamentoIniziato(): void {
    this.caricando = true;
  }

  /**
   * Da chiamare a richiesta conclusa, sia in caso di successo sia di errore:
   * se lo si dimentica sul ramo di errore, il flag resta alzato e l'infinite
   * scroll non riparte piu' per il resto della sessione.
   */
  segnalaCaricamentoFinito(ultimaPagina: boolean): void {
    this.caricando = false;
    this.ultimaPagina = ultimaPagina;
    // Il contenuto appena aggiunto potrebbe non bastare a riempire lo schermo.
    if (!ultimaPagina) {
      setTimeout(() => this.valuta(), 0);
    }
  }

  /** Torna alla condizione iniziale (ricaricamento completo della lista). */
  reset(): void {
    this.caricando = false;
    this.ultimaPagina = false;
  }

  get inCaricamento(): boolean {
    return this.caricando;
  }

  get haFinito(): boolean {
    return this.ultimaPagina;
  }

  private valuta(): void {
    if (this.caricando || this.ultimaPagina || !this.scroller) return;

    const el = this.scroller as HTMLElement;
    const distanzaDalFondo = el.scrollHeight - el.scrollTop - el.clientHeight;

    if (distanzaDalFondo <= this.soglia) {
      this.onCarica();
    }
  }
}
