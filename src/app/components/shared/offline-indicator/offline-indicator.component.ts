import { Component, inject } from '@angular/core';
import { SwUpdateService } from '../../../core/services/sw-update.service';

@Component({
  selector: 'app-offline-indicator',
  standalone: true,
  template: `
    @if (!swUpdate.isOnline()) {
      <div class="offline-badge">
        <svg width="16" height="16" viewBox="0 0 16 16">
          <path fill="currentColor" d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm0 14c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6z"/>
        </svg>
        Offline
      </div>
    }
  `,
  styles: [`
    .offline-badge {
      position: fixed;
      bottom: 16px;
      right: 16px;
      background: #f44336;
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      z-index: 1000;
    }
  `]
})
export class OfflineIndicatorComponent {
  swUpdate = inject(SwUpdateService);
}