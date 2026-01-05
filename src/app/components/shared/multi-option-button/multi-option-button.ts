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

export interface buttonOption {
  optionId: number;
  description: string;
  color?: string;
  iconPath?: string; // Path SVG o immagine
}

export interface multiOptionGroup {
  label: string;
  options: buttonOption[];
}
export interface OptionSelectedEvent {
  id: number;
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

  @Output() optionSelected = new EventEmitter<{ id: number; side: MenuSide }>();

  // Wrappers
  @ViewChild("leftWrapper") leftWrapper!: ElementRef;
  @ViewChild("rightWrapper") rightWrapper!: ElementRef;

  // Elements Left
  @ViewChild("leftTransformButton") leftTransformButton?: ElementRef;
  @ViewChild("leftTransformedContent") leftTransformedContent?: ElementRef;
  @ViewChild("leftBasicContent") leftBasicContent?: ElementRef;

  // Elements Right
  @ViewChild("rightTransformButton") rightTransformButton?: ElementRef;
  @ViewChild("rightTransformedContent") rightTransformedContent?: ElementRef;
  @ViewChild("rightBasicContent") rightBasicContent?: ElementRef;

  // Static
  @ViewChild("staticButton") staticButton!: ElementRef;

  public expandedSide: MenuSide | null = null;
  public isAnimating = false;

  // Cache dimensioni originali per evitare scatti al ripristino
  private originalWidths = new Map<HTMLElement, number>();
  private naturalHeights = { left: 0, right: 0 };

  constructor() {}

  ngOnInit() {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.calculateNaturalHeights();
      this.setInitialState();
    }, 100);
  }

  private calculateNaturalHeights() {
    // Calcola altezza menu a tendina
    if (this.leftTransformedContent)
      this.naturalHeights.left = this.getHiddenHeight(
        this.leftTransformedContent.nativeElement
      );
    if (this.rightTransformedContent)
      this.naturalHeights.right = this.getHiddenHeight(
        this.rightTransformedContent.nativeElement
      );
  }

  private getHiddenHeight(el: HTMLElement): number {
    gsap.set(el, { height: "auto", display: "block", visibility: "hidden" });
    const h = el.scrollHeight;
    gsap.set(el, {
      height: 0,
      display: "block",
      visibility: "visible",
      opacity: 0,
    });
    return h;
  }

  private setInitialState() {
    // Reset pulito
    if (this.leftTransformButton)
      gsap.set(this.leftTransformButton.nativeElement, { clearProps: "all" });
    if (this.rightTransformButton)
      gsap.set(this.rightTransformButton.nativeElement, { clearProps: "all" });
    gsap.set(this.staticButton.nativeElement, { clearProps: "all" });
  }

  onOptionClick(optionId: number, side: MenuSide) {
    this.optionSelected.emit({ id: optionId, side });
    this.collapseButton(side);
  }

  expandButton(side: MenuSide) {
    if (this.expandedSide || this.isAnimating) return;
    this.isAnimating = true;

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
    const activeWrapper =
      side === "left"
        ? this.leftWrapper.nativeElement
        : this.rightWrapper.nativeElement;
    const activeNaturalHeight =
      side === "left" ? this.naturalHeights.left : this.naturalHeights.right;

    // Elementi da nascondere
    const toHide =
      side === "left"
        ? [this.rightWrapper.nativeElement]
        : [this.leftWrapper.nativeElement, this.staticButton.nativeElement];

    // Lock delle larghezze correnti
    toHide.forEach((el) => {
      this.originalWidths.set(el, el.offsetWidth);
      el.style.width = `${el.offsetWidth}px`;
    });

    activeBtn.classList.add("transformed");

    const tl = gsap.timeline({
      onComplete: () => {
        this.expandedSide = side;
        this.isAnimating = false;
      },
    });

    tl.to(toHide, {
      opacity: 0,
      width: 0,
      margin: 0,
      padding: 0,
      duration: 0.4,
      ease: "power2.inOut",
    })
      .to(
        activeBasic,
        {
          opacity: 0,
          height: 0,
          duration: 0.2,
        },
        "<"
      )
      .to(
        activeWrapper,
        {
          flexGrow: 1, // Il wrapper ora accetta di occupare tutto lo spazio
          duration: 0.4,
          ease: "power2.inOut",
        },
        "<"
      )
      .to(
        activeBtn,
        {
          width: "100%", // Ora si espande fluidamente perché il wrapper glielo permette
          duration: 0.5,
          ease: "back.out(1.1)",
        },
        "-=0.2"
      )
      .to(
        activeContent,
        {
          height: activeNaturalHeight,
          opacity: 1,
          duration: 0.4,
        },
        "-=0.2"
      )
      .set(activeContent, { height: "auto" });
  }

  collapseButton(side: MenuSide) {
    if (!this.expandedSide || this.isAnimating) return;
    this.isAnimating = true;

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
    const activeWrapper =
      side === "left"
        ? this.leftWrapper.nativeElement
        : this.rightWrapper.nativeElement;

    const toRestore =
      side === "left"
        ? [this.rightWrapper.nativeElement]
        : [this.leftWrapper.nativeElement, this.staticButton.nativeElement];

    activeBtn.classList.remove("transformed");

    if (activeContent.style.height === "auto") {
      gsap.set(activeContent, { height: activeContent.scrollHeight });
    }

    const tl = gsap.timeline({
      onComplete: () => {
        this.expandedSide = null;
        this.isAnimating = false;
        gsap.set([activeBtn, activeWrapper, ...toRestore], {
          clearProps: "all",
        });
        this.originalWidths.clear();
      },
    });

    tl.to(activeContent, {
      height: 0,
      opacity: 0,
      duration: 0.3,
    })
      .to(
        activeBtn,
        {
          width: "fit-content", // Torna alla sua dimensione naturale
          duration: 0.4,
          ease: "power2.inOut",
        },
        "<"
      )
      .to(
        activeWrapper,
        {
          flexGrow: 0, // Rilascia lo spazio extra
          duration: 0.4,
          ease: "power2.inOut",
        },
        "<"
      )
      .to(
        toRestore,
        {
          width: (i, target) => `${this.originalWidths.get(target)}px`,
          opacity: 1,
          duration: 0.4,
          ease: "power2.out",
        },
        "-=0.2"
      )
      .to(
        activeBasic,
        {
          height: "auto",
          opacity: 1,
          duration: 0.2,
        },
        "-=0.2"
      );
  }
}
