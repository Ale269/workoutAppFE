import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  HostListener,
} from "@angular/core";
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from "@angular/animations";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-generic-modal",
  imports: [CommonModule],
  templateUrl: "./generic-modal.html",
  styleUrl: "./generic-modal.scss",
})
@Component({
  selector: "app-generic-modal",
  templateUrl: "./generic-modal.html",
  styleUrl: "./generic-modal.scss",
  imports: [],
  styleUrls: ["./modal.component.css"],
  animations: [
    trigger("fadeInOut", [
      state("in", style({ opacity: 1 })),
      state("out", style({ opacity: 0 })),
      transition("in => out", animate("300ms ease-out")),
      transition("out => in", animate("300ms ease-in")),
    ]),
    trigger("slideInOut", [
      state("in", style({ transform: "translateY(0)", opacity: 1 })),
      state("out", style({ transform: "translateY(-50px)", opacity: 0 })),
      transition("in => out", animate("300ms ease-out")),
      transition("out => in", animate("300ms ease-in")),
    ]),
  ],
})

export class GenericModal implements OnInit, OnDestroy {
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

  ngOnInit(): void {
    if (this.isVisible) {
      document.body.style.overflow = "hidden";
    }
  }

  ngOnDestroy(): void {
    document.body.style.overflow = "auto";
  }

  onOverlayClick(event: Event): void {
    if (this.closeOnOverlayClick) {
      this.close();
    }
  }

  close(): void {
    this.isVisible = false;
    document.body.style.overflow = "auto";
    this.closed.emit();
  }

  confirm(): void {
    this.confirmed.emit();
  }

  @HostListener("document:keydown.escape", ["$event"])
  onEscapeKey(event: KeyboardEvent): void {
    if (this.isVisible) {
      this.close();
    }
  }
}
