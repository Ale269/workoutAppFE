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
import { altriAllenamentiSelectDTO } from "src/app/models/esecuzione-allenamento/altri-allenamenti-select-dto";


@Component({
  selector: "app-multi-option-button",
  imports: [],
  templateUrl: "./multi-option-button.html",
  styleUrl: "./multi-option-button.scss",
})
export class MultiOptionButton implements OnInit, AfterViewInit {

  @Input() options: altriAllenamentiSelectDTO[] = [];
  @Input() transformButtonLabel: string = 'Transform button';
  
  @Output() optionSelected = new EventEmitter<number>();

  @ViewChild('container', { static: false }) container!: ElementRef;
  @ViewChild('transformButton', { static: false }) transformButton!: ElementRef;
  @ViewChild('transformedContent', { static: false }) transformedContent!: ElementRef;
  @ViewChild('basicContent', { static: false }) basicContent!: ElementRef;
  @ViewChild('staticButton', { static: false }) staticButton!: ElementRef;
  @ViewChild('closeBtn', { static: false }) closeBtn!: ElementRef;

  public isExpanded = false;
  public isAnimating = false;
  private naturalHeight = 0;

  constructor() {}

  ngOnInit() {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initializeComponent();
    }, 0);
  }

  private initializeComponent() {
    this.isExpanded = false;
    this.isAnimating = false;
    
    this.setupEventListeners();
    this.calculateDimensions();
    this.setInitialState();
  }

  private setupEventListeners() {
    this.transformButton.nativeElement.addEventListener("click", () => {
      if (!this.isExpanded && !this.isAnimating) {
        this.expandButton();
      }
    });

    this.closeBtn.nativeElement.addEventListener("click", () => {
      if (this.isExpanded && !this.isAnimating) {
        this.collapseButton();
      }
    });
  }

  private calculateDimensions() {
    // Calcola l'altezza naturale del contenuto trasformato
    gsap.set(this.transformedContent.nativeElement, { 
      height: "auto", 
      visibility: "hidden",
      display: "block"
    });
    
    this.naturalHeight = this.transformedContent.nativeElement.scrollHeight;
    
    // Reset
    gsap.set(this.transformedContent.nativeElement, { 
      height: 0, 
      visibility: "visible",
      opacity: 0
    });
  }

  private setInitialState() {
    const childContainers = this.transformedContent.nativeElement.querySelectorAll(
      '.transformed-setting-option-container, .transformed-setting-close-button-container'
    );

    // Reset completo di tutti gli elementi
    gsap.set(this.transformButton.nativeElement, {
      clearProps: "all" // Rimuove tutti gli stili inline di GSAP
    });

    gsap.set(this.transformedContent.nativeElement, {
      height: 0,
      opacity: 0,
      display: "block"
    });

    gsap.set(childContainers, {
      width: 0,
      overflow: "hidden"
    });

    gsap.set(this.basicContent.nativeElement, {
      opacity: 1,
      height: "auto"
    });

    gsap.set(this.staticButton.nativeElement, {
      opacity: 1,
      scaleX: 1,
      width: "auto"
    });
  }

  onOptionClick(optionId: number) {
    this.optionSelected.emit(optionId);
    this.collapseButton();
  }

  private expandButton() {
    this.isAnimating = true;
    this.transformButton.nativeElement.classList.add("transformed");

    const childContainers = this.transformedContent.nativeElement.querySelectorAll(
      '.transformed-setting-option-container, .transformed-setting-close-button-container'
    );

    const timeline = gsap.timeline({
      onComplete: () => {
        this.isExpanded = true;
        this.isAnimating = false;
      }
    });

    timeline
      // Nascondi contenuti di base
      .to([this.basicContent.nativeElement, this.staticButton.nativeElement], {
        opacity: 0,
        duration: 0.2,
        ease: "power2.out"
      })
      .to(this.basicContent.nativeElement, {
        height: 0,
        duration: 0.2,
        ease: "power2.out"
      }, "<")
      .to(this.staticButton.nativeElement, {
        scaleX: 0,
        width: 0,
        duration: 0.2,
        ease: "power2.out"
      }, "<")
      
      // Espansione
      .to(this.transformButton.nativeElement, {
        width: "100%",
        duration: 0.4,
        ease: "back.out(1.2)"
      }, "+=0.1")
      .to(this.transformedContent.nativeElement, {
        height: this.naturalHeight,
        opacity: 1,
        duration: 0.4,
        ease: "back.out(1)"
      }, "<")
      .to(childContainers, {
        width: "100%",
        duration: 0.4,
        ease: "back.out(1)"
      }, "<")
      
      // Altezza auto per responsiveness
      .set(this.transformedContent.nativeElement, { height: "auto" });
  }

 private collapseButton() {
  this.isAnimating = true;
  this.transformButton.nativeElement.classList.remove("transformed");

  const childContainers = this.transformedContent.nativeElement.querySelectorAll(
    ".transformed-setting-option-container, .transformed-setting-close-button-container"
  );

  // se height è auto → fissalo al valore corrente
  if (this.transformedContent.nativeElement.style.height === "auto") {
    gsap.set(this.transformedContent.nativeElement, {
      height: this.transformedContent.nativeElement.scrollHeight,
    });
  }

  const timeline = gsap.timeline({
    onComplete: () => {
      this.isExpanded = false;
      this.isAnimating = false;

      // qui puoi fare il reset completo, incluso clearProps
      gsap.set(this.transformButton.nativeElement, { clearProps: "width" });
      this.setInitialState();
    },
  });

  timeline
    // Contrazione contenuto trasformato
    .to(this.transformedContent.nativeElement, {
      opacity: 0,
      height: 0,
      duration: 0.3,
      ease: "power2.out",
    })
    .to(
      childContainers,
      {
        width: 0,
        duration: 0.3,
        ease: "power2.out",
      },
      "<"
    )

    // Anima la larghezza del transformButton verso una misura minima
    .to(
      this.transformButton.nativeElement,
      {
        width: "auto", // oppure una width fissa che fa da base
        duration: 0.4,
        ease: "back.in(1.2)",
      },
      "<" // parte in parallelo
    )

    // Ripristino elementi base
    .to(
      this.staticButton.nativeElement,
      {
        opacity: 1,
        scaleX: 1,
        width: "auto",
        duration: 0.3,
        ease: "back.out(1)",
      },
      "+=0.1"
    )
    .to(
      this.basicContent.nativeElement,
      {
        height: "auto",
        opacity: 1,
        duration: 0.3,
        ease: "power2.out",
      },
      "<"
    );
}

}