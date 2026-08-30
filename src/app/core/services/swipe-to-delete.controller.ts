import { ElementRef, QueryList } from "@angular/core";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";

gsap.registerPlugin(Draggable);

export interface SwipeToDeleteOptions {
  /** Selettore del contenitore che avvolge card e bottone (es. ".scheda-wrapper"). */
  wrapperSelector: string;
  /** Selettore del bottone che si scopre sotto la card. */
  actionSelector?: string;
  /** Quanto scorre la card, in px (valore positivo). */
  revealWidth?: number;
}

/**
 * Swipe-to-delete condiviso da tutte le liste dell'app.
 *
 * Nasce per risolvere il bug delle card che restavano "incastrate" a meta'
 * durante lo scroll. Le cause erano tre, tutte presenti in ognuna delle
 * quattro copie duplicate del codice:
 *
 * 1. NESSUN VINCOLO D'ASSE. Un movimento verticale con una componente
 *    orizzontale anche minima faceva partire il drag. Ora `lockAxis` decide
 *    l'asse dominante al primo movimento e `minimumMovement` ignora il
 *    tremolio del dito: se il gesto e' uno scroll, il drag non parte proprio.
 *
 * 2. RE-INIT DURANTE IL DRAG. La QueryList delle card emette `changes` a ogni
 *    re-render; il codice uccideva le Draggable e le ricreava, ma `kill()` non
 *    azzera la trasformazione — la card restava esattamente dove si trovava,
 *    senza piu' nessuno a riportarla a posto. Ora ogni (ri)creazione riazzera
 *    la posizione.
 *
 * 3. `inertia: true` SENZA IL PLUGIN. InertiaPlugin non e' registrato in questo
 *    progetto, quindi l'opzione era comunque inerte; dove avesse funzionato
 *    avrebbe litigato con il tween di snap dentro onDragEnd, che anima la
 *    stessa proprieta'. Rimossa.
 *
 * In piu': durante lo scroll le Draggable vengono disabilitate e le card
 * aperte rientrano da sole.
 */
export class SwipeToDeleteController {
  private instances: any[] = [];
  private cards: ElementRef[] = [];
  private options: Required<SwipeToDeleteOptions>;

  private scroller: Element | null = null;
  private scrollListener: (() => void) | null = null;
  private scrollIdleTimer: any = null;
  private isScrolling = false;

  /** Oltre questo spostamento il gesto e' considerato intenzionale. */
  private static readonly MINIMUM_MOVEMENT = 10;
  /** Quiete dopo l'ultimo evento di scroll prima di riabilitare il drag. */
  private static readonly SCROLL_IDLE_MS = 150;

  constructor(options: SwipeToDeleteOptions) {
    this.options = {
      actionSelector: ".delete-action",
      revealWidth: 80,
      ...options,
    };
  }

  /**
   * (Ri)costruisce le istanze sulle card correnti. Va richiamato sia in
   * ngAfterViewInit sia dalla sottoscrizione a `cards.changes`.
   */
  attach(cards: QueryList<ElementRef>): void {
    this.destroyInstances();
    this.cards = cards.toArray();
    this.ensureScrollListener();

    this.cards.forEach((cardRef, index) => {
      const card = cardRef.nativeElement as HTMLElement;
      const wrapper = card.closest(this.options.wrapperSelector);
      const actionButton = wrapper?.querySelector(
        this.options.actionSelector,
      ) as HTMLElement | null;

      if (!actionButton) return;

      // Punto 2: si riparte sempre da posizione chiusa. Senza questo, una card
      // sorpresa a meta' corsa da un re-render ci resta per sempre.
      gsap.set(card, { x: 0 });
      gsap.set(actionButton, { autoAlpha: 0, pointerEvents: "none" });

      const revealWidth = this.options.revealWidth;
      const threshold = -revealWidth;
      const controller = this;

      const [draggable] = Draggable.create(card, {
        type: "x",
        bounds: { minX: threshold, maxX: 0 },
        dragClickables: false,
        zIndexBoost: false,

        // Punto 1: il gesto verticale non deve mai trascinare la card.
        lockAxis: true,
        allowNativeTouchScrolling: true,
        minimumMovement: SwipeToDeleteController.MINIMUM_MOVEMENT,

        onPress: function (this: any) {
          // Dito appoggiato mentre la pagina sta ancora scorrendo: non e' un
          // tentativo di swipe, e' il gesto per fermare lo scroll.
          if (controller.isScrolling) {
            this.endDrag();
          }
        },
        onDragStart: function () {
          controller.closeOthers(index);
        },
        onDrag: function (this: any) {
          const alpha = Math.min(Math.abs(this.x) / revealWidth, 1);
          gsap.to(actionButton, {
            autoAlpha: alpha,
            duration: 0.1,
            overwrite: true,
          });
          gsap.set(actionButton, {
            pointerEvents: alpha > 0.5 ? "auto" : "none",
          });
        },
        onDragEnd: function (this: any) {
          if (this.x < threshold / 2) {
            controller.openSwipe(card, actionButton, this, threshold);
          } else {
            controller.closeSwipe(card, actionButton, this);
          }
        },
        onClick: function (this: any, e: MouseEvent) {
          if (this.vars["isOpen"]) {
            e.stopPropagation();
            controller.closeSwipe(card, actionButton, this);
          }
        },
      });

      draggable.vars["isOpen"] = false;
      this.instances.push(draggable);
    });
  }

  /** Riporta a posto tutte le card aperte. */
  closeAll(): void {
    this.closeOthers(-1);
  }

  destroy(): void {
    this.destroyInstances();
    this.detachScrollListener();
  }

  // ============================================
  // INTERNO
  // ============================================

  private openSwipe(
    card: HTMLElement,
    actionButton: HTMLElement,
    draggable: any,
    threshold: number,
  ): void {
    gsap.to(card, { x: threshold, duration: 0.3, ease: "power2.out" });
    gsap.to(actionButton, {
      autoAlpha: 1,
      duration: 0.3,
      overwrite: true,
      onComplete: () => {
        gsap.set(actionButton, { pointerEvents: "auto" });
      },
    });
    draggable.vars["isOpen"] = true;
  }

  private closeSwipe(
    card: HTMLElement,
    actionButton: HTMLElement,
    draggable: any,
  ): void {
    gsap.to(card, { x: 0, duration: 0.3, ease: "power2.out" });
    gsap.to(actionButton, {
      autoAlpha: 0,
      duration: 0.3,
      overwrite: true,
      onComplete: () => {
        gsap.set(actionButton, { pointerEvents: "none" });
      },
    });
    draggable.vars["isOpen"] = false;
  }

  private closeOthers(exceptIndex: number): void {
    this.cards.forEach((cardRef, index) => {
      if (index === exceptIndex) return;

      const draggable = this.instances[index];
      if (!draggable?.vars["isOpen"]) return;

      const card = cardRef.nativeElement as HTMLElement;
      const actionButton = card
        .closest(this.options.wrapperSelector)
        ?.querySelector(this.options.actionSelector) as HTMLElement | null;

      if (actionButton) {
        this.closeSwipe(card, actionButton, draggable);
      }
    });
  }

  /**
   * Aggancia lo scroller della pagina. Durante lo scroll le card aperte
   * rientrano e il drag resta disabilitato fino a SCROLL_IDLE_MS di quiete.
   */
  private ensureScrollListener(): void {
    const scroller = document.querySelector(".page-scroller");
    if (!scroller || scroller === this.scroller) return;

    this.detachScrollListener();
    this.scroller = scroller;

    const handler = () => {
      if (!this.isScrolling) {
        this.isScrolling = true;
        this.instances.forEach((instance) => instance.disable());
        this.closeAll();
      }

      clearTimeout(this.scrollIdleTimer);
      this.scrollIdleTimer = setTimeout(() => {
        this.isScrolling = false;
        this.instances.forEach((instance) => instance.enable());
      }, SwipeToDeleteController.SCROLL_IDLE_MS);
    };

    scroller.addEventListener("scroll", handler, { passive: true });
    this.scrollListener = () => scroller.removeEventListener("scroll", handler);
  }

  private detachScrollListener(): void {
    clearTimeout(this.scrollIdleTimer);
    this.scrollIdleTimer = null;
    this.isScrolling = false;

    if (this.scrollListener) {
      this.scrollListener();
      this.scrollListener = null;
    }
    this.scroller = null;
  }

  private destroyInstances(): void {
    this.instances.forEach((instance) => instance.kill());
    this.instances = [];
  }
}
