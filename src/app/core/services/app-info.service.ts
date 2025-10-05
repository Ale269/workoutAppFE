import { Injectable } from '@angular/core';
import { APP_INFO } from '../config/app-info.config';
import {ApiCatalogService} from "./api-catalog.service";
import {Observable} from "rxjs";
import {LoginResponseModel} from "../../models/auth/login-model";
import {ServerInfoModel} from "../../models/server-info/server-info-model";

@Injectable({
  providedIn: 'root'
})
export class AppInfoService {

  constructor(
      private apiCatalogService: ApiCatalogService,
  ) { }

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

  getServerInfo(): Observable<ServerInfoModel>{
    return this.apiCatalogService.executeApiCall('info','server', undefined, undefined);
  }
}