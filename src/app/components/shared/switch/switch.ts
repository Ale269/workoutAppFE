import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormControl } from "@angular/forms";

@Component({
  selector: "app-switch",
  imports: [],
  templateUrl: "./switch.html",
  styleUrl: "./switch.scss",
})
export class Switch {
  @Input() set IsActive(value: boolean) {
    this.isActiveInternal = value;
  }
  @Input() Descrizione: string | null = null;

  @Output() stateChange = new EventEmitter<boolean>();

  isActiveInternal: boolean = false;

  toggleSwitch() {
    this.isActiveInternal = !this.isActiveInternal;
    this.stateChange.emit(this.isActiveInternal);
  }
}
