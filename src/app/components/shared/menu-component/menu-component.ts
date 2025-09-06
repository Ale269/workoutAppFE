// menu-component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-menu-component',
  imports: [CommonModule],
  templateUrl: './menu-component.html',
  styleUrl: './menu-component.scss'
})
export class MenuComponent {
  isMenuOpen = false;

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }
}