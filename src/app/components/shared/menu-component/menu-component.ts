// menu-component.ts
import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import {AuthService} from "../../../core/services/auth.service";

@Component({
  selector: "app-menu-component",
  imports: [CommonModule],
  templateUrl: "./menu-component.html",
  styleUrl: "./menu-component.scss",
})
export class MenuComponent {
  isMenuOpen = false;

  constructor(
      private router: Router,
      private authService: AuthService) {}

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  navigateToHome() {
    this.closeMenu();
    // Piccolo delay per permettere all'animazione di chiusura di iniziare
    setTimeout(() => {
      this.router.navigate(["/home"]);
    }, 100);
  }

  navigateToTemplateSchede() {
    this.closeMenu();
    // Piccolo delay per permettere all'animazione di chiusura di iniziare
    setTimeout(() => {
      this.router.navigate(["/le-mie-schede"]);
    }, 100);
  }

  navigateToAccount() {
    this.closeMenu();
    setTimeout(() => {
      // Aggiungi qui la navigazione per Account se necessario
      // this.router.navigate(['/account']);
    }, 100);
  }

  navigateToSchedeSvolte() {
    this.closeMenu();
    setTimeout(() => {
      // Aggiungi qui la navigazione per Schede svolte se necessario
      // this.router.navigate(['/schede-svolte']);
    }, 100);
  }

  navigateToAllenamentiSvolti() {
    this.closeMenu();
    setTimeout(() => {
      this.router.navigate(['/allenamenti-svolti']);
    }, 100);
  }

  navigateToInfo() {
    this.closeMenu();
    setTimeout(() => {
      this.router.navigate(['/info']);
    }, 100);
  }

  navigateToInfoServer() {
    this.closeMenu();
    setTimeout(() => {
      this.router.navigate(['/info-server']);
    }, 100);
  }

  callLogout(): void {
    this.authService.logout();
  }
}
