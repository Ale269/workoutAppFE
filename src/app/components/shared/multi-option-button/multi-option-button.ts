import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from "@angular/core";
import { gsap } from "gsap";
import { MatIcon, MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";
import { HapticService } from "src/app/core/services/haptic.service";

export interface buttonOption {
  optionId: number;
  description: string;
  color?: string;
  iconPath?: string;
}

export interface multiOptionGroup {
  id: number;
  label: string;
  options: buttonOption[];
}

export interface OptionSelectedEvent {
  groupId: number;
  optionId: number;
  side: MenuSide;
}

export type MenuSide = "left" | "right";

@Component({
  selector: "app-multi-option-button",
  imports: [MatIcon],
  templateUrl: "./multi-option-button.html",
  styleUrl: "./multi-option-button.scss",
})
export class MultiOptionButton implements OnInit, OnChanges, AfterViewInit {
  @Input() leftGroups: multiOptionGroup[] = [];
  @Input() rightGroups: multiOptionGroup[] = [];

  @Input() leftButtonLabel: string = "Left Option";
  @Input() rightButtonLabel: string = "Right Option";

  /**
   * Tinta del pulsante e del pannello espanso, in esadecimale (es. "#00ffe1").
   * Lasciato null resta il bianco traslucido di default.
   *
   * Passa per variabili CSS invece che per classi: cosi' il chiamante sceglie
   * un colore qualsiasi senza che il componente debba conoscerlo in anticipo.
   */
  @Input() accentColor: string | null = null;

  @Output() optionSelected = new EventEmitter<OptionSelectedEvent>();

  @ViewChild("allButtonsWrapper") allButtonsWrapper!: ElementRef;
  @ViewChild("leftTransformButton") leftTransformButton?: ElementRef;
  @ViewChild("leftTransformedContent") leftTransformedContent?: ElementRef;
  @ViewChild("leftBasicContent") leftBasicContent?: ElementRef;
  @ViewChild("rightTransformButton") rightTransformButton?: ElementRef;
  @ViewChild("rightTransformedContent") rightTransformedContent?: ElementRef;
  @ViewChild("rightBasicContent") rightBasicContent?: ElementRef;
  @ViewChild("staticButton") staticButton!: ElementRef;

  public expandedSide: MenuSide | null = null;
  public isAnimating = false;

  private originalWidths = new Map<HTMLElement, number>();
  private naturalHeights = { left: 0, right: 0 };

  /**
   * Timeline in corso e che tipo di animazione e'. Servono per poter
   * interrompere un'apertura a meta' quando l'utente tocca fuori, senza
   * lasciare due timeline che animano le stesse proprieta'.
   */
  private activeTimeline: gsap.core.Timeline | null = null;
  private animationKind: "open" | "close" | null = null;

  constructor(
    private hapticService: HapticService,
    private hostRef: ElementRef<HTMLElement>,
    iconRegistry: MatIconRegistry,
    sanitizer: DomSanitizer,
  ) {
    iconRegistry.addSvgIcon(
      "google-close-icon",
      sanitizer.bypassSecurityTrustResourceUrl(
        "assets/recollect/svg/google-close-icon.svg",
      ),
    );
  }

  ngOnInit() {
    this.applicaAccento();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["accentColor"]) {
      this.applicaAccento();
    }
  }

  private applicaAccento(): void {
    const host = this.hostRef.nativeElement;
    if (!this.accentColor) {
      host.style.removeProperty("--mob-sfondo");
      host.style.removeProperty("--mob-bordo");
      host.style.removeProperty("--mob-sfondo-espanso");
      return;
    }

    const rgb = this.hexToRgb(this.accentColor);
    if (!rgb) return;

    host.style.setProperty("--mob-sfondo", `rgba(${rgb}, 0.2)`);
    host.style.setProperty("--mob-bordo", `rgba(${rgb}, 0.4)`);
    host.style.setProperty("--mob-sfondo-espanso", `rgba(${rgb}, 0.16)`);
  }

  private hexToRgb(hex: string): string | null {
    const pulito = hex.trim().replace("#", "");
    const esteso =
      pulito.length === 3
        ? pulito
            .split("")
            .map((c) => c + c)
            .join("")
        : pulito;
    if (esteso.length !== 6) return null;
    const n = parseInt(esteso, 16);
    if (Number.isNaN(n)) return null;
    return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.calculateNaturalHeights();
      this.setInitialState();
    }, 100);
  }

  /**
   * Tap fuori dal pannello.
   *
   * Prima era condizionato a `!isAnimating`, e siccome `expandedSide` veniva
   * valorizzato solo alla FINE dell'animazione di apertura, il tap esterno
   * cadeva quasi sempre in una finestra morta: o l'overlay non esisteva
   * ancora, o esisteva ma il gestore usciva subito. Da qui il pannello che
   * "non si chiude cliccando fuori".
   *
   * Ora la chiusura puo' interrompere l'apertura: se l'utente tocca fuori
   * mentre si sta ancora aprendo, l'intenzione e' chiara.
   */
  onOverlayClick(event?: Event): void {
    // Impedisce che il click sintetico generato dal tocco finisca
    // sull'elemento che si trova sotto l'overlay una volta rimosso.
    event?.preventDefault();
    event?.stopPropagation();

    if (this.expandedSide) {
      this.collapseButton(this.expandedSide);
    }
  }

  private calculateNaturalHeights() {
    if (this.leftTransformedContent) {
      this.naturalHeights.left = this.getHiddenHeight(
        this.leftTransformedContent.nativeElement,
      );
    }
    if (this.rightTransformedContent) {
      this.naturalHeights.right = this.getHiddenHeight(
        this.rightTransformedContent.nativeElement,
      );
    }
  }

  private getHiddenHeight(el: HTMLElement): number {
    const original = {
      display: el.style.display,
      visibility: el.style.visibility,
      position: el.style.position,
      height: el.style.height,
    };

    gsap.set(el, {
      display: "block",
      visibility: "hidden",
      position: "absolute",
      height: "auto",
    });

    const height = el.scrollHeight;

    gsap.set(el, original);
    gsap.set(el, { height: 0, opacity: 0 });

    return height;
  }

  private setInitialState() {
    if (this.leftTransformedContent) {
      gsap.set(this.leftTransformedContent.nativeElement, {
        height: 0,
        opacity: 0,
      });
    }
    if (this.rightTransformedContent) {
      gsap.set(this.rightTransformedContent.nativeElement, {
        height: 0,
        opacity: 0,
      });
    }
  }

  /**
   * Selezione di una voce.
   *
   * Sta su "pointerdown" e non su "click" perche' il click su touch e' un
   * evento SINTETIZZATO dopo il rilascio: basta un preventDefault a monte
   * (l'overlay, o il browser durante la disambiguazione del gesto) e non
   * viene mai generato. Il risultato e' il primo tap che sembra andare a
   * vuoto e il secondo che funziona. Il resto del componente e' gia' guidato
   * da pointerdown, quindi qui si allinea.
   *
   * stopPropagation: senza, l'evento risalirebbe a ".transformation-button",
   * che sullo stesso pointerdown chiama expandButton().
   */
  onOptionClick(
    groupId: number,
    optionId: number,
    side: MenuSide,
    event?: Event,
  ) {
    event?.stopPropagation();
    // Evita che il browser sintetizzi anche il click, che rifarebbe partire
    // tutto una seconda volta.
    event?.preventDefault();

    if (this.animationKind === "close") return;

    this.hapticService.trigger("light");
    this.optionSelected.emit({
      groupId: groupId,
      optionId: optionId,
      side: side,
    });
    this.collapseButton(side);
  }

  expandButton(side: MenuSide) {
    if (this.expandedSide || this.animationKind) return;

    this.hapticService.trigger("light");
    this.animationKind = "open";
    this.isAnimating = true;

    // Subito, non alla fine dell'animazione: l'overlay che cattura i tap
    // esterni e' reso da "@if (expandedSide)", quindi finche' questa riga
    // stava dentro onComplete il pannello si apriva senza nulla che
    // intercettasse il tocco fuori.
    this.expandedSide = side;

    const wrapper = this.allButtonsWrapper.nativeElement;

    const activeBtn =
      side === "left"
        ? this.leftTransformButton!.nativeElement
        : this.rightTransformButton!.nativeElement;
    const activeContent =
      side === "left"
        ? this.leftTransformedContent!.nativeElement
        : this.rightTransformedContent!.nativeElement;
    const activeBasic =
      side === "left"
        ? this.leftBasicContent!.nativeElement
        : this.rightBasicContent!.nativeElement;
    const activeNaturalHeight =
      side === "left" ? this.naturalHeights.left : this.naturalHeights.right;

    // Elementi da nascondere (tutti tranne quello attivo)
    const toHide: HTMLElement[] = [];
    if (side === "left") {
      if (this.rightTransformButton)
        toHide.push(this.rightTransformButton.nativeElement);
      toHide.push(this.staticButton.nativeElement);
    } else {
      if (this.leftTransformButton)
        toHide.push(this.leftTransformButton.nativeElement);
      toHide.push(this.staticButton.nativeElement);
    }

    // Salva le larghezze originali
    toHide.forEach((el) => {
      this.originalWidths.set(el, el.offsetWidth);
    });

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(activeContent, { height: "auto" });
        this.activeTimeline = null;
        this.animationKind = null;
        this.isAnimating = false;
      },
    });
    this.activeTimeline = tl;

    // FASE 1: Nascondi completamente gli altri elementi PRIMA di tutto
    tl.to(toHide, {
      opacity: 0,
      duration: 0.075,
      ease: "power2.inOut",
    })
      .to(toHide, {
        width: 0,
        duration: 0.075,
        ease: "power2.inOut",
        onComplete: () => {
          toHide.forEach((el) => (el.style.pointerEvents = "none"));
        },
      })

      // FASE 2: Rimuovi il gap del wrapper
      .call(() => {
        wrapper.style.gap = "0";
      })

      // FASE 3: Nascondi il contenuto base
      .to(
        activeBasic,
        {
          opacity: 0,
          height: 0,
          duration: 0.075,
          ease: "power2.in",
        },
        "-=0.05",
      )

      // FASE 4: Espandi il wrapper e la larghezza del pulsante con bounce
      .to(
        wrapper,
        {
          flexGrow: 1,
          duration: 0.15,
          ease: "back.out(1.3)",
        },
        "-=0.05",
      )
      .to(
        activeBtn,
        {
          width: "100%",
          duration: 0.16,
          ease: "back.out(1.4)",
        },
        "<",
      )

      // FASE 5: Aggiungi classe transformed DOPO che la larghezza è completa
      .call(() => {
        activeBtn.classList.add("transformed");
      })

      // FASE 6: Mostra il contenuto trasformato subito dopo con bounce
      .to(
        activeContent,
        {
          height: activeNaturalHeight,
          opacity: 1,
          duration: 0.175,
          ease: "back.out(1.5)",
        },
        "+=0.02",
      );
  }

  collapseButton(side: MenuSide) {
    if (!this.expandedSide) return;
    // Gia' in chiusura: un secondo tap non deve avviare una seconda timeline.
    if (this.animationKind === "close") return;

    // Chiusura richiesta mentre si sta ancora aprendo: interrompo l'apertura
    // invece di ignorare il tap. Le due timeline animano le stesse proprieta',
    // quindi lasciarle convivere lascerebbe il pannello a mezz'aria.
    if (this.animationKind === "open") {
      this.activeTimeline?.kill();
      this.activeTimeline = null;
    }

    this.hapticService.trigger("light");
    this.animationKind = "close";
    this.isAnimating = true;

    const wrapper = this.allButtonsWrapper.nativeElement;

    const activeBtn =
      side === "left"
        ? this.leftTransformButton!.nativeElement
        : this.rightTransformButton!.nativeElement;
    const activeContent =
      side === "left"
        ? this.leftTransformedContent!.nativeElement
        : this.rightTransformedContent!.nativeElement;
    const activeBasic =
      side === "left"
        ? this.leftBasicContent!.nativeElement
        : this.rightBasicContent!.nativeElement;

    // Elementi da ripristinare
    const toRestore: HTMLElement[] = [];
    if (side === "left") {
      if (this.rightTransformButton)
        toRestore.push(this.rightTransformButton.nativeElement);
      toRestore.push(this.staticButton.nativeElement);
    } else {
      if (this.leftTransformButton)
        toRestore.push(this.leftTransformButton.nativeElement);
      toRestore.push(this.staticButton.nativeElement);
    }

    // Fixa l'altezza corrente prima di collassare
    if (activeContent.style.height === "auto") {
      gsap.set(activeContent, { height: activeContent.scrollHeight });
    }

    // Calcola la larghezza target PRIMA di rimuovere la classe
    const hadTransformed = activeBtn.classList.contains("transformed");
    activeBtn.classList.remove("transformed");

    const currentWidth = activeBtn.offsetWidth;
    activeBtn.style.width = "auto";
    const targetWidth = activeBtn.offsetWidth;
    activeBtn.style.width = `${currentWidth}px`;

    // Rimetti la classe per l'animazione
    if (hadTransformed) {
      activeBtn.classList.add("transformed");
    }

    const tl = gsap.timeline({
      onComplete: () => {
        this.expandedSide = null;
        this.activeTimeline = null;
        this.animationKind = null;
        this.isAnimating = false;

        // Reset completo
        activeBtn.classList.remove("transformed");
        wrapper.style.gap = "";
        gsap.set([activeBtn, wrapper], { clearProps: "all" });
        gsap.set(activeContent, { height: 0, opacity: 0 });
        gsap.set(activeBasic, { clearProps: "all" });
        toRestore.forEach((el) => {
          gsap.set(el, { clearProps: "all" });
          el.style.pointerEvents = "";
        });

        this.originalWidths.clear();
      },
    });
    this.activeTimeline = tl;

    // FASE 1: Nascondi il contenuto trasformato mantenendo il pulsante largo con bounce
    tl.to(activeContent, {
      height: 0,
      opacity: 0,
      duration: 0.125,
      ease: "back.in(1.3)",
    })

      // FASE 2: Rimuovi la classe transformed
      .call(() => {
        activeBtn.classList.remove("transformed");
      })

      // FASE 3: Riduci la larghezza del pulsante con bounce
      .to(
        activeBtn,
        {
          width: targetWidth,
          duration: 0.14,
          ease: "back.in(1.4)",
        },
        "+=0.02",
      )

      // FASE 4: Riduci il wrapper contemporaneamente con bounce
      .to(
        wrapper,
        {
          flexGrow: 0,
          duration: 0.14,
          ease: "back.in(1.3)",
        },
        "<",
      )

      // FASE 5: Mostra il contenuto base
      .to(
        activeBasic,
        {
          height: "auto",
          opacity: 1,
          duration: 0.075,
          ease: "power2.out",
        },
        "-=0.12",
      )

      // FASE 6: Ripristina il gap del wrapper
      .call(() => {
        wrapper.style.gap = "";
      })

      // FASE 7: Ripristina gli elementi nascosti ALLA FINE con bounce
      .to(
        toRestore,
        {
          width: (i, target) => this.originalWidths.get(target)!,
          duration: 0.09,
          ease: "back.out(1.3)",
          onStart: () => {
            toRestore.forEach((el) => (el.style.pointerEvents = ""));
          },
        },
        "-=0.05",
      )
      .to(
        toRestore,
        {
          opacity: 1,
          duration: 0.075,
          ease: "power2.out",
        },
        "<0.05",
      )
      .call(() => {
        gsap.set(toRestore, { clearProps: "width" });
      });
  }
}
