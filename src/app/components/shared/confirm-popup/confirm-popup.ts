import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  ViewChild,
} from "@angular/core";
import gsap from "gsap";
import {
  ConfirmPopupConfig,
  ConfirmPopupService,
} from "src/app/core/services/confirm-popup.service";
import { positionPopupPanel } from "src/app/components/shared/popup-positioning";

/**
 * Pannello del popup di conferma: si posiziona in "position: fixed" ancorato
 * al triggerElement passato in config, scegliendo l'angolo (alto/basso +
 * sinistra/destra) che tiene il pannello dentro il viewport, ricalcolando
 * in base allo spazio disponibile intorno al trigger (non allo scroll: le
 * coordinate di getBoundingClientRect() sono già relative al viewport).
 * Stessa animazione/stile glass di app-popup-option-button.
 */
@Component({
  selector: "app-confirm-popup",
  templateUrl: "./confirm-popup.html",
  styleUrl: "./confirm-popup.scss",
})
export class ConfirmPopup implements AfterViewInit {
  @Input() config!: ConfirmPopupConfig;

  @ViewChild("panel") panelRef?: ElementRef<HTMLElement>;

  public transformOrigin: string = "bottom right";

  constructor(private confirmPopupService: ConfirmPopupService) {}

  ngAfterViewInit(): void {
    requestAnimationFrame(() => {
      this.positionAndAnimateIn();
    });
  }

  private positionAndAnimateIn(): void {
    const panel = this.panelRef?.nativeElement;
    if (!panel || !this.config?.triggerElement) {
      return;
    }

    const { transformOrigin } = positionPopupPanel(panel, this.config.triggerElement);
    this.transformOrigin = transformOrigin;

    gsap.fromTo(
      panel,
      {
        autoAlpha: 0,
        scale: 0.4,
        transformOrigin: this.transformOrigin,
      },
      {
        autoAlpha: 1,
        scale: 1,
        duration: 0.25,
        ease: "back.out(1.4)",
      },
    );
  }

  private animateOutAndThen(afterClose: () => void): void {
    const panel = this.panelRef?.nativeElement;
    if (!panel) {
      afterClose();
      return;
    }

    gsap.to(panel, {
      autoAlpha: 0,
      scale: 0.4,
      transformOrigin: this.transformOrigin,
      duration: 0.2,
      ease: "back.in(1.4)",
      onComplete: afterClose,
    });
  }

  onOverlayClick(): void {
    this.animateOutAndThen(() => this.confirmPopupService.cancel());
  }

  onCancelClick(): void {
    this.animateOutAndThen(() => this.confirmPopupService.cancel());
  }

  onConfirmClick(): void {
    this.animateOutAndThen(() => this.confirmPopupService.confirm());
  }
}
