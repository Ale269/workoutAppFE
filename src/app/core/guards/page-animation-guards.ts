// fade.guard.ts
import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { AnimationService } from '../services/page-animation-service';

@Injectable({ providedIn: 'root' })
export class FadeGuard implements CanDeactivate<unknown> {
  constructor(private animation: AnimationService) {}

  canDeactivate(): Promise<boolean> {
    // esegui fadeOut e poi consenti la navigazione
    return this.animation.playFadeOut().then(() => true);
  }
}