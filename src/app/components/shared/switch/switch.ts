import { Component, Input } from "@angular/core";
import { FormControl } from "@angular/forms";

@Component({
  selector: "app-switch",
  imports: [],
  templateUrl: "./switch.html",
  styleUrl: "./switch.scss",
})
export class Switch {
  @Input() FormControl: FormControl<boolean> | null = null;
  @Input() Descrizione: string | null = null;

  constructor() {}
}
