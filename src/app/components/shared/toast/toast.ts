// toast.component.ts
import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { gsap } from "gsap";

export type ToastType = "success" | "error" | "warning" | "info";

@Component({
  selector: "app-toast",
  imports: [CommonModule],
  templateUrl: "./toast.html",
  styleUrl: "./toast.scss",
})
export class ToastComponent implements OnChanges, AfterViewInit {
  @ViewChild("toastElement", { static: false }) toastElement!: ElementRef;

  @Input() isVisible: boolean = false;
  @Input() message: string = "";
  @Input() type: ToastType = "info";
  @Input() duration: number = 3000; // Auto-close dopo 3 secondi
  @Input() showCloseButton: boolean = true;

  @Output() closed = new EventEmitter<void>();

  private isInitialized = false;
  private autoCloseTimer?: any;

  ngAfterViewInit() {
    this.isInitialized = true;
    if (this.isVisible) {
      this.showToast();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes["isVisible"] && this.isInitialized) {
      if (this.isVisible) {
        this.showToast();
      } else {
        this.hideToast();
      }
    }
  }

  private showToast() {
    if (!this.toastElement) return;

    // Clear existing timer
    if (this.autoCloseTimer) {
      clearTimeout(this.autoCloseTimer);
    }

    // Animate in
    gsap.fromTo(
      this.toastElement.nativeElement,
      {
        opacity: 0,
        visibility: "hidden",
        y: 50,
        scale: 0.9,
      },
      {
        opacity: 1,
        visibility: "visible",
        y: 0,
        scale: 1,
        duration: 0.4,
        ease: "back.out(1.7)",
      }
    );

    // Auto-close if duration > 0
    if (this.duration > 0) {
      this.autoCloseTimer = window.setTimeout(() => {
        this.close();
      }, this.duration);
    }
  }

  private hideToast() {
    if (!this.toastElement) return;

    gsap.to(this.toastElement.nativeElement, {
      opacity: 0,
      y: 20,
      scale: 0.95,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => {
        gsap.set(this.toastElement.nativeElement, { visibility: "hidden" });
      },
    });
  }

  close() {
    if (this.autoCloseTimer) {
      window.clearTimeout(this.autoCloseTimer);
    }
    this.isVisible = false;
    this.hideToast();
    this.closed.emit();
  }

  getIcon(): string {
    const icons = {
      success: "✓",
      error: "✕",
      warning: "⚠",
      info: "ℹ",
    };
    return icons[this.type];
  }
}
