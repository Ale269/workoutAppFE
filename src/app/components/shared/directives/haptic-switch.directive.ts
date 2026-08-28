import { AfterViewInit, Directive, ElementRef, inject } from "@angular/core";
import { HapticTapService } from "src/app/core/services/haptic-tap.service";
import { HAPTIC_DISABLED } from "src/app/core/services/haptic.service";

/**
 * Feedback aptico reale su iOS via overlay "switch" nativo.
 *
 * NB: la logica vive ora in HapticTapService, che applica gli overlay a
 * TUTTI gli elementi tappabili dell'app (pulsanti, card, voci di menu)
 * tramite un MutationObserver globale — vedi TAPPABLE_SELECTORS.
 * `.small-inline-button` è già fra quei selettori, quindi questa direttiva
 * è di fatto ridondante; resta come aggancio esplicito per i componenti che
 * la importano già, e delega al service (la cui attach() è idempotente
 * grazie al marker data-haptic-tap, così non si creano overlay doppi).
 */
@Directive({
  selector: ".small-inline-button",
  standalone: true,
})
export class HapticSwitchDirective implements AfterViewInit {
  private elementRef: ElementRef<HTMLElement> = inject(ElementRef);
  private hapticTapService = inject(HapticTapService);

  ngAfterViewInit(): void {
    if (HAPTIC_DISABLED) {
      return;
    }
    this.hapticTapService.attach(this.elementRef.nativeElement);
  }
}
