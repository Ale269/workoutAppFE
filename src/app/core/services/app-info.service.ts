import { Injectable } from '@angular/core';
import { APP_INFO } from '../config/app-info.config';

@Injectable({
  providedIn: 'root'
})
export class AppInfoService {

  constructor() { }

  getAppVersion(): string {
    return APP_INFO.version;
  }

  getAppName(): string {
    return APP_INFO.name;
  }

  getBuildDate(): string {
    return new Date(APP_INFO.buildDate).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getAppInfo() {
    return {
      version: this.getAppVersion(),
      name: this.getAppName(),
      buildDate: this.getBuildDate()
    };
  }
}