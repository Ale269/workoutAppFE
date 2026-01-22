import { Injectable } from "@angular/core";
import { CanDeactivate } from "@angular/router";
import { Observable, firstValueFrom } from "rxjs";
import { AnimationService } from "../services/page-animation-service";

export interface CanComponentDeactivate {
  canDeactivate: () => Observable<boolean> | Promise<boolean> | boolean;
}

@Injectable({ providedIn: "root" })
export class PendingChangesGuard implements CanDeactivate<CanComponentDeactivate> {
  
  constructor(private animationService: AnimationService) {}
  
  async canDeactivate(
    component: CanComponentDeactivate,
  ): Promise<boolean> {
    
    if (!component.canDeactivate) {
      return true; // Nessun controllo, permetti navigazione
    }

    const result = component.canDeactivate();
    
    let canLeave: boolean;
    if (result instanceof Observable) {
      canLeave = await firstValueFrom(result);
    } else if (result instanceof Promise) {
      canLeave = await result;
    } else {
      canLeave = result;
    }
    
    // Se l'utente annulla, ferma le animazioni
    if (!canLeave) {
      this.animationService.cancelAnimations();
    }
    
    return canLeave;
  }
}