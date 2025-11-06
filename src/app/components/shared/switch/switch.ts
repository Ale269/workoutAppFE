import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormControl } from "@angular/forms";

@Component({
  selector: "app-switch",
  imports: [],
  templateUrl: "./switch.html",
  styleUrl: "./switch.scss",
})
export class Switch {
  @Input() IsActive: boolean = false;
  @Input() Descrizione: string | null = null;

  @Output() stateChange = new EventEmitter<boolean>();

  isActiveInternal: boolean = false;

  constructor() {}

  ngOnInit() {
    // Inizializza lo stato interno basandosi sull'input
    this.isActiveInternal = this.IsActive;
  }

  toggleSwitch() {
    // Cambia lo stato
    this.isActiveInternal = !this.isActiveInternal;

    // Emetti il nuovo stato
    this.stateChange.emit(this.isActiveInternal);
  }

  setValue(newValue : boolean) {
    this.isActiveInternal = newValue;
  }
}
