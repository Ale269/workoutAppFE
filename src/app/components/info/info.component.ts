import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppInfoService } from '../../core/services/app-info.service';

@Component({
  selector: 'app-info',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.scss']
})
export class InfoComponent implements OnInit {
  appVersion = '';
  appName = '';
  buildDate = '';

  constructor(private appInfoService: AppInfoService) {}

  ngOnInit(): void {
    const appInfo = this.appInfoService.getAppInfo();
    this.appVersion = appInfo.version;
    this.appName = appInfo.name;
    this.buildDate = appInfo.buildDate;
  }
}