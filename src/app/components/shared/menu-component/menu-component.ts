// menu-component.ts
import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { AuthService } from "../../../core/services/auth.service";
import { Subscription } from "rxjs";
import {
  MenuConfig,
  MenuConfigService,
} from "src/app/core/services/menu-config.service";
import { MatIconModule, MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";
import { HapticService } from "src/app/core/services/haptic.service";

@Component({
  selector: "app-menu-component",
  imports: [CommonModule, MatIconModule],
  templateUrl: "./menu-component.html",
  styleUrl: "./menu-component.scss",
})
export class MenuComponent implements OnInit, OnDestroy {
  isMenuOpen = false;
  isAnimating = false;
  menuConfig: MenuConfig = { leftButton: "none" };
  private configSubscription?: Subscription;
  private animationTimeout?: ReturnType<typeof setTimeout>;

  constructor(
    private router: Router,
    private authService: AuthService,
    private menuConfigService: MenuConfigService,
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer,
    private hapticService: HapticService,
  ) {
    iconRegistry.addSvgIcon(
      "google-menu",
      sanitizer.bypassSecurityTrustResourceUrl(
        "assets/recollect/svg/google-menu.svg",
      ),
    );
    iconRegistry.addSvgIcon(
      "google-close",
      sanitizer.bypassSecurityTrustResourceUrl(
        "assets/recollect/svg/google-close-icon.svg",
      ),
    );
    iconRegistry.addSvgIcon(
      "google-arrow",
      sanitizer.bypassSecurityTrustResourceUrl(
        "assets/recollect/svg/google-arrow.svg",
      ),
    );
  }

  ngOnInit() {
    this.configSubscription = this.menuConfigService.config$.subscribe(
      (config) => {
        this.menuConfig = config;
      },
    );
  }

  ngOnDestroy() {
    this.configSubscription?.unsubscribe();
    clearTimeout(this.animationTimeout);
  }

  toggleMenu() {
    this.hapticService.trigger("light");
    this.isMenuOpen = !this.isMenuOpen;
    this.lockDuringAnimation();
  }

  closeMenu() {
    this.isMenuOpen = false;
    this.lockDuringAnimation();
  }

  private lockDuringAnimation() {
    this.isAnimating = true;
    clearTimeout(this.animationTimeout);
    this.animationTimeout = setTimeout(() => {
      this.isAnimating = false;
    }, 500);
  }

  onLeftButtonClick() {
    if (this.menuConfig.onLeftButtonClick) {
      this.hapticService.trigger("light");
      this.menuConfig.onLeftButtonClick();
    }
  }

  navigateToTemplateSchede() {
    this.hapticService.trigger("light");

    this.closeMenu();
    setTimeout(() => {
      this.router.navigate(["/le-mie-schede"]);
    }, 100);
  }

  navigateToAccount() {
    this.hapticService.trigger("light");
    this.closeMenu();
    setTimeout(() => {
      alert("Funzionalità in arrivo");
    }, 100);
  }

  navigateToSchedeSvolte() {
    this.hapticService.trigger("light");

    this.closeMenu();
    setTimeout(() => {
      alert("Funzionalità in arrivo");
    }, 100);
  }

  navigateToAllenamentiSvolti() {
    this.hapticService.trigger("light");

    this.closeMenu();
    setTimeout(() => {
      this.router.navigate(["/allenamenti-svolti"]);
    }, 100);
  }

  navigateToInfo() {
    this.hapticService.trigger("light");

    this.closeMenu();
    setTimeout(() => {
      this.router.navigate(["/info"]);
    }, 100);
  }

  navigateToInfoServer() {
    this.hapticService.trigger("light");

    this.closeMenu();
    setTimeout(() => {
      this.router.navigate(["/info-server"]);
    }, 100);
  }

  navigateToImpostazioni() {
    this.hapticService.trigger("light");

    this.closeMenu();
    setTimeout(() => {
      this.router.navigate(["/impostazioni"]);
    }, 100);
  }

  navigateToAdminUsers() {
    this.hapticService.trigger("light");

    this.closeMenu();
    setTimeout(() => {
      this.router.navigate(["/admin/users"]);
    }, 100);
  }

  navigateToAdminExercises() {
    this.closeMenu();
    setTimeout(() => {
      this.router.navigate(['/admin/exercises']);
    }, 100);
  }

  isAdmin(): boolean {
    const currentUser = this.authService.getCurrentUser();
    return currentUser?.role === "ADMIN";
  }

  callLogout(): void {
    this.hapticService.trigger("light");
    setTimeout(() => {
      this.authService.logout();
    }, 100);
  }
}
