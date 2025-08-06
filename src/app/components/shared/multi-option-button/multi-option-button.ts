import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from "@angular/core";
import { gsap } from "gsap";

@Component({
  selector: "app-multi-option-button",
  imports: [],
  templateUrl: "./multi-option-button.html",
  styleUrl: "./multi-option-button.scss",
})
export class MultiOptionButton implements OnInit, AfterViewInit {

@ViewChild('container', { static: false }) container!: ElementRef;
@ViewChild('transformButton', { static: false }) transformButton!: ElementRef;
@ViewChild('transformedContent', { static: false }) transformedContent!: ElementRef;
@ViewChild('basicContent', { static: false }) basicContent!: ElementRef;
@ViewChild('staticButton', { static: false }) staticButton!: ElementRef;
@ViewChild('staticButtonContent', { static: false }) staticButtonContent!: ElementRef;
@ViewChild('closeBtn', { static: false }) closeBtn!: ElementRef;

  public isExpanded = false;
  public isAnimating = false;
  public naturalHeight = 0;
  public naturalHeightbasicContent = 0;
  public initialWidth = 0;
  public targetWidth = 0;

  constructor() {}

  ngAfterViewInit(): void {
    try {
      this.isExpanded = false;
      this.isAnimating = false;
      this.naturalHeight = 0;
      this.naturalHeightbasicContent = 0;
      this.initialWidth = 0;
      this.targetWidth = 0;

      this.init();
    } catch (error) {}
  }

  ngOnInit() {}

  init() {
    // Calcola l'altezza naturale del contenuto e le larghezze
    this.calculateDimensions();

    // Event listeners

    this.transformButton.nativeElement.addEventListener("click", () => {
      if (!this.isExpanded && !this.isAnimating) {
        this.open();
      }
    });

    this.closeBtn.nativeElement.addEventListener("click", () => {
      if (this.isExpanded && !this.isAnimating) {
        this.close();
      }
    });

    // Inizializza lo stato
    gsap.set(this.transformedContent, { height: 0, opacity: 0 });
    gsap.set(this.basicContent, { opacity: 1 });
  }

  calculateDimensions() {
    // Salva la larghezza iniziale del buttonS
    this.initialWidth = this.transformButton.nativeElement.offsetWidth + 2;

    // Calcola la larghezza target (100% del contenitore padre)
    this.targetWidth = this.container.nativeElement.offsetWidth;

    // Temporaneamente mostra il contenuto per misurarne l'altezza
    gsap.set(this.transformedContent, { height: "auto", visibility: "hidden" });
    this.naturalHeight = this.transformedContent.nativeElement.offsetHeight;
    gsap.set(this.transformedContent, { height: 0, visibility: "visible" });

    this.naturalHeightbasicContent = this.basicContent.nativeElement.offsetHeight;
  }

  open() {
    this.isAnimating = true;
    this.transformButton.nativeElement.classList.add("transformed");
    this.transformButton.nativeElement.classList.remove("basic");

    // Timeline per coordinare le animazioni
    const tl = gsap.timeline({
      onComplete: () => {
        this.isExpanded = true;
        this.isAnimating = false;
      },
    });
    // Prima fade out del basic button
    tl.to(
      this.basicContent.nativeElement,
      {
        opacity: 0,
        duration: 0.1,
        ease: "power2.out",
        height: 0,
      },
      "opacityZero"
    )

      // Simultaneamente anima larghezza e altezza con bounce
      // Punto di sincronizzazione: espansione
      .add("expandPoint")
      .to(
        this.staticButtonContent.nativeElement,
        {
          opacity: 0,
          duration: 0.1,
          ease: "power2.out",
        },
        "expandPoint"
      )
      // Button si espande
      .to(
        this.transformButton.nativeElement,
        {
          width: this.targetWidth,
          duration: 1,
          ease: "back.out(1)",
        },
        "expandPoint"
      )

      // Static content si chiude
      .to(
        this.staticButton.nativeElement,
        {
          opacity: 0,
          duration: 1,
          padding: "8px 0",
          ease: "back.out(1)",
        },
        "expandPoint"
      )

      // Trasformed content si apre
      .to(
        this.transformedContent.nativeElement,
        {
          height: this.naturalHeight,
          duration: 1,
          ease: "back.out(1)",
        },
        "expandPoint"
      )

      // E fade-in finale del contenuto trasformato
      .to(
        this.transformedContent.nativeElement,
        {
          opacity: 1,
          duration: 0.4,
          ease: "power4.out",
        },
        "expandPoint+=0.4"
      );

    // Assicurati che l'altezza sia auto alla fine per il responsive
    tl.set(this.transformedContent.nativeElement, { height: "auto" });
  }

  close() {
    this.isAnimating = true;
    this.transformButton.nativeElement.classList.remove("transformed");
    this.transformButton.nativeElement.classList.add("basic");

    // Prima imposta un'altezza fissa se è 'auto'
    if (
      this.transformedContent.nativeElement.style.height === "auto" ||
      !this.transformedContent.nativeElement.style.height
    ) {
      gsap.set(this.transformedContent, {
        height: this.transformedContent.nativeElement.offsetHeight,
      });
    }

    // Timeline per coordinare le animazioni di chiusura
    const tl = gsap.timeline({
      onComplete: () => {
        this.isExpanded = false;
        this.isAnimating = false;
      },
    });
    // Prima fade out del contenuto
    tl.to(this.transformedContent.nativeElement, {
      opacity: 0,
      duration: 0.1,
      ease: "power2.out",
    })

      // Simultaneamente anima larghezza e altezza con leggero bounce
      .add("collapsePoint")
      .to(
        this.staticButtonContent.nativeElement,
        {
          opacity: 1,
          duration: 0.4,
          ease: "back.in(1)",
        },
        "collapsePoint"
      )
      .to(
        this.transformButton.nativeElement,
        {
          width: this.initialWidth,
          duration: 0.6,
          ease: "back.in(1)",
        },
        "collapsePoint"
      )
      .to(
        this.staticButton.nativeElement,
        {
          opacity: 1,
          duration: 0.6,
          padding: "8px 16px",
          ease: "back.in(1)",
        },
        "collapsePoint"
      )
      .to(
        this.transformedContent.nativeElement,
        {
          height: 0,
          duration: 0.6,
          ease: "back.in(1)",
        },
        "collapsePoint"
      )
      // StaticContent si apre contemporaneamente
      // Inizia insieme alla larghezza
      // E fade in del basic button
      .to(
        this.basicContent.nativeElement,
        {
          opacity: 1,
          duration: 0.4,
          ease: "power4.out",
          height: this.naturalHeightbasicContent,
        },
        "-=0.1"
      ); // Inizia durante l'animazione di chiusura
  }
}
