import { Component, inject, OnInit } from "@angular/core";
import { Switch } from "../shared/switch/switch";
import { UserConfigService } from "src/app/core/services/user-config.service";
import { UserConfigModel } from "src/app/models/user-config/user-config-model";
import { MenuConfigService } from "src/app/core/services/menu-config.service";

@Component({
  selector: "app-impostazioni",
  standalone: true,
  imports: [Switch],
  templateUrl: "./impostazioni.html",
  styleUrl: "./impostazioni.scss",
})
export class Impostazioni implements OnInit {
  private userConfigService = inject(UserConfigService);
  private menuConfigService = inject(MenuConfigService);

  config!: UserConfigModel;

  ngOnInit(): void {
    this.menuConfigService.setConfig({ leftButton: "none" });
    this.config = this.userConfigService.getConfig();

    this.userConfigService.config$.subscribe((config) => {
      this.config = config;
    });
  }

  onToggle(key: keyof UserConfigModel, value: boolean): void {
    this.userConfigService.updateConfig({ [key]: value });
  }
}
