// animation.service.ts
import { Injectable } from "@angular/core";
import { gsap } from "gsap";

@Injectable({ providedIn: "root" })
export class AnimationService {
  private mainEl?: HTMLElement;

  public setMainElement(el: HTMLElement | null) {
    this.mainEl = el ?? undefined;
    // assicurati stato iniziale
    if (this.mainEl) {
      gsap.set(this.mainEl, {
        autoAlpha: 1,
        clearProps: "visibility,pointerEvents",
      });
    }
  }

  public playFadeOut(duration = 0.28): Promise<void> {
    return new Promise((resolve) => {
      if (!this.mainEl) {
        resolve();
        return;
      }

      gsap.to(this.mainEl, {
        autoAlpha: 0,
        duration,
        ease: "power1.in",
        onComplete: () => {
          resolve();
        },
      });
    });
  }

  public playFadeIn(duration = 0.28): Promise<void> {
    return new Promise((resolve) => {
      if (!this.mainEl) {
        resolve();
        return;
      }

      gsap.to(this.mainEl, {
        autoAlpha: 1,
        duration,
        ease: "power1.out",
        onComplete: () => {
          resolve();
        },
      });
    });
  }
}
