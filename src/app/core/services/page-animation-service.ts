import { Injectable } from '@angular/core';
import { 
  NavigationEnd, 
  NavigationCancel, 
  NavigationError, 
  Router,
  GuardsCheckEnd
} from '@angular/router';
import { filter } from 'rxjs/operators';
import { gsap } from 'gsap';

@Injectable({ providedIn: 'root' })
export class AnimationService {
  private mainElement: HTMLElement | null = null;
  private isNavigating = false;
  private fadeOutPromise: Promise<void> | null = null;

  constructor(private router: Router) {
    this.setupRouterAnimations();
  }

  setMainElement(element: HTMLElement | null): void {
    this.mainElement = element;
  }

  private setupRouterAnimations(): void {
    // Fade OUT solo DOPO che le guardie hanno dato l'OK
    this.router.events
      .pipe(filter(event => event instanceof GuardsCheckEnd))
      .subscribe((event: GuardsCheckEnd) => {
        // shouldActivate è true se tutte le guardie hanno permesso la navigazione
        if (event.shouldActivate && !this.isNavigating) {
          console.log('✅ Guardie passate: avvio fade out');
          this.playFadeOut();
        }
      });

    // Fade IN quando la navigazione è completata
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        console.log('✅ NavigationEnd: avvio fade in');
        this.playFadeIn();
      });

    // Annulla animazioni se la navigazione viene cancellata o fallisce
    this.router.events
      .pipe(
        filter(event => 
          event instanceof NavigationCancel || 
          event instanceof NavigationError
        )
      )
      .subscribe(() => {
        console.log('❌ Navigazione cancellata/fallita');
        this.cancelAnimations();
      });
  }

  playFadeOut(): Promise<void> {
    if (this.fadeOutPromise) {
      return this.fadeOutPromise;
    }

    if (!this.mainElement) {
      return Promise.resolve();
    }

    this.isNavigating = true;

    this.fadeOutPromise = new Promise((resolve) => {
      gsap.to(this.mainElement, {
        autoAlpha: 0,
        duration: 0.3,
        ease: 'power2.inOut',
        onComplete: () => {
          console.log('🌑 Fade out completato');
          this.fadeOutPromise = null;
          resolve();
        }
      });
    });

    return this.fadeOutPromise;
  }

  playFadeIn(): void {
    if (!this.mainElement) {
      return;
    }

    this.isNavigating = false;

    gsap.fromTo(
      this.mainElement,
      { autoAlpha: 0 },
      {
        autoAlpha: 1,
        duration: 0.3,
        ease: 'power2.inOut',
        onComplete: () => {
          console.log('🌕 Fade in completato');
        }
      }
    );
  }

  cancelAnimations(): void {
    console.log('🛑 Annullo animazioni in corso');
    
    this.isNavigating = false;
    this.fadeOutPromise = null;

    if (!this.mainElement) return;

    gsap.killTweensOf(this.mainElement);
    gsap.set(this.mainElement, { autoAlpha: 1 });
  }

  isAnimating(): boolean {
    return this.isNavigating;
  }
}