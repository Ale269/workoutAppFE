import { Component, inject } from "@angular/core";
import { Router } from "@angular/router";
import { MatIcon, MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";
import {
  BottomMenuService,
  BottomMenuItem,
} from "src/app/core/services/bottom-menu.service";
import { HapticService } from "src/app/core/services/haptic.service";

@Component({
  selector: "app-bottom-menu",
  standalone: true,
  imports: [MatIcon],
  templateUrl: "./bottom-menu.html",
  styleUrl: "./bottom-menu.scss",
})
export class BottomMenuComponent {
  public bottomMenuService = inject(BottomMenuService);
  private router = inject(Router);
  private hapticService = inject(HapticService);

  constructor(
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer,
  ) {
    // Placeholder icons - replace with actual SVGs
    iconRegistry.addSvgIcon(
      "bottom-home",
      sanitizer.bypassSecurityTrustResourceUrl(
        "assets/recollect/svg/bottom-home.svg",
      ),
    );
    iconRegistry.addSvgIcon(
      "bottom-schede",
      sanitizer.bypassSecurityTrustResourceUrl(
        "assets/recollect/svg/bottom-schede.svg",
      ),
    );
    iconRegistry.addSvgIcon(
      "bottom-allenamenti",
      sanitizer.bypassSecurityTrustResourceUrl(
        "assets/recollect/svg/bottom-allenamenti.svg",
      ),
    );
    iconRegistry.addSvgIcon(
      "bottom-account",
      sanitizer.bypassSecurityTrustResourceUrl(
        "assets/recollect/svg/bottom-account.svg",
      ),
    );
  }

  onItemClick(item: BottomMenuItem): void {
    this.hapticService.trigger("light");
    if (item.action) {
      item.action();
    } else if (item.route) {
      this.router.navigate([item.route]);
    }
  }

  isActive(item: BottomMenuItem): boolean {
    if (!item.route) return false;
    return this.router.url.startsWith(item.route);
  }
}
