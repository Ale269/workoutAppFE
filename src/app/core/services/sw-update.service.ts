import { Injectable, inject, signal } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter, interval } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SwUpdateService {
  private swUpdate = inject(SwUpdate);
  
  updateAvailable = signal(false);
  isOnline = signal(navigator.onLine);

  constructor() {
    if (this.swUpdate.isEnabled) {
      this.checkForUpdates();
      this.listenForUpdates();
      this.trackOnlineStatus();
    }
  }

  private checkForUpdates() {
    interval(6 * 60 * 60 * 1000) // 6 ore
      .subscribe(() => this.swUpdate.checkForUpdate());
  }

  private listenForUpdates() {
    this.swUpdate.versionUpdates
      .pipe(filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'))
      .subscribe(() => {
        this.updateAvailable.set(true);
      });
  }

  private trackOnlineStatus() {
    window.addEventListener('online', () => this.isOnline.set(true));
    window.addEventListener('offline', () => this.isOnline.set(false));
  }

  applyUpdate() {
    this.swUpdate.activateUpdate()
      .then(() => document.location.reload());
  }
}