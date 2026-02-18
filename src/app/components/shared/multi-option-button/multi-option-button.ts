import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { gsap } from "gsap";
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
  imports: [],
  templateUrl: "./multi-option-button.html",
  styleUrl: "./multi-option-button.scss",
})
export class MultiOptionButton implements OnInit, AfterViewInit {
  @Input() leftGroups: multiOptionGroup[] = [];
  @Input() rightGroups: multiOptionGroup[] = [];

  @Input() leftButtonLabel: string = "Left Option";
  @Input() rightButtonLabel: string = "Right Option";

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

  constructor(private hapticService: HapticService) {}

  ngOnInit() {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.calculateNaturalHeights();
      this.setInitialState();
    }, 100);
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

  onOptionClick(groupId: number, optionId: number, side: MenuSide) {
    this.hapticService.trigger("light");
    this.optionSelected.emit({
      groupId: groupId,
      optionId: optionId,
      side: side,
    });
    this.collapseButton(side);
  }

  expandButton(side: MenuSide) {
    this.hapticService.trigger("light");

    if (this.expandedSide || this.isAnimating) return;
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
        this.expandedSide = side;
        this.isAnimating = false;
      },
    });

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
    this.hapticService.trigger("light");

    if (!this.expandedSide || this.isAnimating) return;
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
