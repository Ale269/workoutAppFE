import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  AfterViewInit,
  HostListener,
  ViewChild,
  ElementRef,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { gsap } from "gsap";

@Component({
  selector: "app-generic-modal",
  imports: [CommonModule],
  templateUrl: "./generic-modal.html",
  styleUrl: "./generic-modal.scss",
})
export class GenericModal implements OnInit, OnDestroy, AfterViewInit, OnChanges {
  @ViewChild('modalOverlay', { static: false }) modalOverlay!: ElementRef;
  @ViewChild('modalContainer', { static: false }) modalContainer!: ElementRef;

  @Input() isVisible: boolean = false;
  @Input() title?: string;
  @Input() showFooter: boolean = true;
  @Input() showConfirmButton: boolean = false;
  @Input() closeOnOverlayClick: boolean = true;
  @Input() confirmText: string = "Conferma";
  @Input() cancelText: string = "Annulla";
  @Input() hasCustomHeader: boolean = false;
  @Input() hasCustomFooter: boolean = false;

  @Output() closed = new EventEmitter<void>();
  @Output() confirmed = new EventEmitter<void>();

  public isAnimating: boolean = false;
  private isInitialized: boolean = false;

  constructor() {}

  ngOnInit(): void {
    // Non gestiamo più overflow qui, lo faremo nelle animazioni
  }

  ngAfterViewInit(): void {
    this.initializeModal();
    this.isInitialized = true;
    
    // Se il modal dovrebbe essere visibile all'inizializzazione
    if (this.isVisible) {
      this.openModal();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Reagisce ai cambiamenti di isVisible dopo l'inizializzazione
    if (changes['isVisible'] && this.isInitialized) {
      if (this.isVisible) {
        this.openModal();
      } else {
        this.closeModal();
      }
    }
  }

  ngOnDestroy(): void {
    document.body.style.overflow = "auto";
  }

  private initializeModal(): void {
    // Imposta lo stato iniziale degli elementi
    gsap.set(this.modalOverlay.nativeElement, {
      opacity: 0,
      visibility: "hidden"
    });

    gsap.set(this.modalContainer.nativeElement, {
      scale: 0.7,
      y: -50,
      opacity: 0
    });
  }

  private openModal(): void {
    if (this.isAnimating) return;
    
    this.isAnimating = true;
    document.body.style.overflow = "hidden";

    // Timeline per l'animazione di apertura
    const tl = gsap.timeline({
      onComplete: () => {
        this.isAnimating = false;
      }
    });

    // Prima mostra l'overlay
    tl.set(this.modalOverlay.nativeElement, { visibility: "visible" })
      
      // Anima l'overlay fade-in
      .to(this.modalOverlay.nativeElement, {
        opacity: 1,
        duration: 0.3,
        ease: "power2.out"
      })
      
      // Simultaneamente anima il modal container con bounce
      .to(this.modalContainer.nativeElement, {
        scale: 1,
        y: 0,
        opacity: 1,
        duration: 0.6,
        ease: "back.out(1.7)" // Effetto bounce come nel tuo pulsante
      }, "-=0.2"); // Inizia leggermente prima che l'overlay finisca
  }

  private closeModal(): void {
    if (this.isAnimating) return;
    
    this.isAnimating = true;

    // Timeline per l'animazione di chiusura
    const tl = gsap.timeline({
      onComplete: () => {
        this.isAnimating = false;
        document.body.style.overflow = "auto";
        gsap.set(this.modalOverlay.nativeElement, { visibility: "hidden" });
      }
    });

    // Anima il modal container con bounce inverso
    tl.to(this.modalContainer.nativeElement, {
      scale: 0.7,
      y: -30,
      opacity: 0,
      duration: 0.4,
      ease: "back.in(1.4)" // Bounce più leggero per la chiusura
    })
    
    // Poi l'overlay fade-out
    .to(this.modalOverlay.nativeElement, {
      opacity: 0,
      duration: 0.2,
      ease: "power2.in"
    }, "-=0.1"); // Inizia leggermente prima che il container finisca
  }

  onOverlayClick(event: Event): void {
    if (this.closeOnOverlayClick && !this.isAnimating) {
      this.close();
    }
  }

  close(): void {
    if (this.isAnimating) return;
    
    this.isVisible = false;
    this.closeModal();
    this.closed.emit();
  }

  confirm(): void {
    if (this.isAnimating) return;
    
    this.confirmed.emit();
  }

  @HostListener("document:keydown.escape", ["$event"])
  onEscapeKey(event: KeyboardEvent): void {
    if (this.isVisible && !this.isAnimating) {
      this.close();
    }
  }
}