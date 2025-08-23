// generic-modal.component.ts
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
  TemplateRef
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { gsap } from "gsap";

@Component({
  selector: "app-generic-modal",
  imports: [CommonModule],
  templateUrl: "./generic-modal.html",
  styleUrls: ["./generic-modal.scss"],
  host: {
    '[class.modal-active]': 'isVisible',
    '[class.modal-warning]': 'warning',
    '[style.position]': 'isVisible ? "fixed" : "static"',
    '[style.top]': 'isVisible ? "0" : "auto"',
    '[style.left]': 'isVisible ? "0" : "auto"',
    '[style.width]': 'isVisible ? "100%" : "auto"',
    '[style.height]': 'isVisible ? "100%" : "auto"',
    '[style.z-index]': 'isVisible ? "9997" : "auto"',
    '[style.pointer-events]': 'isVisible ? "auto" : "none"'
  }
})
export class GenericModal implements OnInit, OnDestroy, AfterViewInit, OnChanges {
  @ViewChild('modalOverlay', { static: false }) modalOverlay!: ElementRef;
  @ViewChild('modalContainer', { static: false }) modalContainer!: ElementRef;

  @Input() warning: boolean = false;
  @Input() isVisible: boolean = false;
  @Input() title?: string;
  @Input() showFooter: boolean = true;
  @Input() showConfirmButton: boolean = false;
  @Input() closeOnOverlayClick: boolean = true;
  @Input() confirmText: string = "Conferma";
  @Input() cancelText: string = "Annulla";
  @Input() hasCustomHeader: boolean = false;
  @Input() hasCustomFooter: boolean = false;
  
  // Nuove input per i template
  @Input() headerTemplate?: TemplateRef<any>;
  @Input() bodyTemplate?: TemplateRef<any>;
  @Input() footerCloseTemplate?: TemplateRef<any>;
  @Input() footerConfirmTemplate?: TemplateRef<any>;

  @Output() closed = new EventEmitter<void>();
  @Output() confirmed = new EventEmitter<void>();

  public isAnimating: boolean = false;
  private isInitialized: boolean = false;
  private pendingClose: boolean = false; // Flag per gestire la chiusura

  constructor() {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.initializeModal();
    this.isInitialized = true;
    
    if (this.isVisible) {
      this.openModal();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isVisible'] && this.isInitialized) {
      if (this.isVisible && !this.pendingClose) {
        this.openModal();
      } else if (!this.isVisible && !this.pendingClose) {
        this.closeModal();
      }
    }
  }

  ngOnDestroy(): void {
    document.body.style.overflow = "auto";
  }

  private initializeModal(): void {
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
    this.pendingClose = false;
    document.body.style.overflow = "hidden";

    const tl = gsap.timeline({
      onComplete: () => {
        this.isAnimating = false;
      }
    });

    tl.set(this.modalOverlay.nativeElement, { visibility: "visible" })
      .to(this.modalOverlay.nativeElement, {
        opacity: 1,
        duration: 0.3,
        ease: "power2.out"
      })
      .to(this.modalContainer.nativeElement, {
        scale: 1,
        y: 0,
        opacity: 1,
        duration: 0.6,
        ease: "back.out(1.7)"
      }, "-=0.2");
  }

  private closeModal(): void {
    if (this.isAnimating) return;
    
    this.isAnimating = true;
    this.pendingClose = true;

    const tl = gsap.timeline({
      onComplete: () => {
        this.isAnimating = false;
        this.pendingClose = false;
        document.body.style.overflow = "auto";
        gsap.set(this.modalOverlay.nativeElement, { visibility: "hidden" });
        // Emetti l'evento closed solo dopo che l'animazione è completata
        this.closed.emit();
      }
    });

    tl.to(this.modalContainer.nativeElement, {
      scale: 0.7,
      y: -50,
      opacity: 0,
      duration: 0.4,
      ease: "back.in(1.4)"
    })
    .to(this.modalOverlay.nativeElement, {
      opacity: 0,
      duration: 0.2,
      ease: "power2.in"
    }, "-=0.1");
  }

  onOverlayClick(event: Event): void {
    if (this.closeOnOverlayClick && !this.isAnimating) {
      this.close();
    }
  }

  close(): void {
    if (this.isAnimating || this.pendingClose) return;
    
    // NON settare isVisible qui - lascia che sia il parent a gestirlo
    this.closeModal();
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