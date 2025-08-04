import {Component, OnInit} from '@angular/core';
import {TranslatePipe} from "@ngx-translate/core";

@Component({
  selector: 'app-footer',
  imports: [
    TranslatePipe
  ],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class Footer implements OnInit {
  currentYear: number = new Date().getFullYear();
  appVersion: string = '0.0.1'; // Puoi recuperare dinamicamente la versione se necessario

  constructor() { }

  ngOnInit(): void {
  }
}
