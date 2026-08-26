import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from "@angular/core";
import { MatIcon, MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";
import gsap from "gsap";
import { HapticService } from "src/app/core/services/haptic.service";
import { HapticSwitchDirective } from "src/app/components/shared/directives/haptic-switch.directive";

export interface popupOption {
  optionId: number;
  description: string;
  color?: string;
  iconPath?: string;
}

/**
 * Pulsante inline con popup di opzioni stile Apple: il pannello si apre SOPRA
 * il pulsante, allineato in basso a destra e sovrapposto ad esso, con lo
 * stesso linguaggio visivo (glass + GSAP) di app-multi-option-button.
 * Un overlay trasparente full-screen cattura i tap esterni per chiudere.
 */
@Component({
  selector: "app-popup-option-button",
  imports: [MatIcon, HapticSwitchDirective],
  templateUrl: "./popup-option-button.html",
  styleUrl: "./popup-option-button.scss",
})
export class PopupOptionButton {
  @Input() label: string = "Aggiungi";
  @Input() iconName: string = "google-add";
  @Input() options: popupOption[] = [];

  @Output() optionSelected = new EventEmitter<number>();

  @ViewChild("popupPanel") popupPanel?: ElementRef<HTMLElement>;

  public isOpen: boolean = false;
  public isAnimating: boolean = false;

  constructor(
    private hapticService: HapticService,
    iconRegistry: MatIconRegistry,
    sanitizer: DomSanitizer,
  ) {
    iconRegistry.addSvgIcon(
      "google-add",
      sanitizer.bypassSecurityTrustResourceUrl(
        "assets/recollect/svg/google-add.svg",
      ),
    );
  }

  openPopup(): void {
    if (this.isOpen || this.isAnimating) return;

    this.hapticService.trigger("light");
    this.isOpen = true;
    this.isAnimating = true;

    // Il pannello viene creato dall'@if: anima al frame successivo,
    // misurando ad ogni apertura (nessuna cache di altezza)
    requestAnimationFrame(() => {
      const panel = this.popupPanel?.nativeElement;
      if (!panel) {
        this.isAnimating = false;
        return;
      }

      gsap.fromTo(
        panel,
        {
          opacity: 0,
          scale: 0.4,
          transformOrigin: "bottom right",
        },
        {
          opacity: 1,
          scale: 1,
          duration: 0.25,
          ease: "back.out(1.4)",
          force3D: true,
          onComplete: () => {
            this.isAnimating = false;
          },
        },
      );
    });
  }

  closePopup(afterClose?: () => void): void {
    if (!this.isOpen || this.isAnimating) return;

    this.isAnimating = true;
    const panel = this.popupPanel?.nativeElement;

    if (!panel) {
      this.isOpen = false;
      this.isAnimating = false;
      if (afterClose) afterClose();
      return;
    }

    gsap.to(panel, {
      opacity: 0,
      scale: 0.4,
      transformOrigin: "bottom right",
      duration: 0.2,
      ease: "back.in(1.4)",
      force3D: true,
      onComplete: () => {
        this.isOpen = false;
        this.isAnimating = false;
        if (afterClose) afterClose();
      },
    });
  }

  onOverlayClick(): void {
    if (this.isOpen && !this.isAnimating) {
      this.hapticService.trigger("light");
      this.closePopup();
    }
  }

  onOptionClick(optionId: number): void {
    if (this.isAnimating) return;
    this.hapticService.trigger("light");
    this.closePopup(() => {
      this.optionSelected.emit(optionId);
    });
  }
}
