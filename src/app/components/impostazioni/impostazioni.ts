import { Component, inject, OnInit } from "@angular/core";
import { Switch } from "../shared/switch/switch";
import { UserConfigService } from "src/app/core/services/user-config.service";
import { ExerciseVisibility, UserConfigModel } from "src/app/models/user-config/user-config-model";
import { MenuConfigService } from "src/app/core/services/menu-config.service";
import { ExerciseService } from "src/app/core/services/exercise.service";

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
  private exerciseService = inject(ExerciseService);

  config!: UserConfigModel;

  visibilityOptions: { value: ExerciseVisibility; label: string }[] = [
    { value: 'ALL', label: 'Tutti' },
    { value: 'STANDARD_ONLY', label: 'Standard' },
    { value: 'CUSTOM_ONLY', label: 'Custom' },
  ];

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

  onVisibilityChange(value: ExerciseVisibility): void {
    if (value === this.config.exerciseVisibility) return;
    this.userConfigService.updateConfig({ exerciseVisibility: value });
    this.exerciseService.reloadExercises(value);
  }
}
