import { Component, inject } from '@angular/core';
import { SwUpdateService } from '../../../core/services/sw-update.service';

@Component({
  selector: 'app-update-banner',
  standalone: true,
  template: `
    @if (swUpdate.updateAvailable()) {
      <div class="update-banner">
        <span>Nuovo aggiornamento disponibile!</span>
        <button (click)="swUpdate.applyUpdate()">Aggiorna ora</button>
      </div>
    }
  `,
  styles: [`
    .update-banner {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: #002b28;
      color: white;
      padding: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 100;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }
    
    button {
      background: white;
      color: #002b28;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      font-weight: 600;
      cursor: pointer;
    }
  `]
})
export class UpdateBannerComponent {
  swUpdate = inject(SwUpdateService);
}