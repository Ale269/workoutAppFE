import { Component, Input, ElementRef, OnInit } from "@angular/core";

@Component({
  selector: "custom-tab",
  templateUrl: "./custom-tab-components.html",
  styleUrls: ["./custom-tab-components.scss"],
})
export class CustomTabComponent implements OnInit {
  @Input() id: string = "";
  @Input() label: string = "";
  @Input() disabled: boolean = false;

  isActive: boolean = false;

  constructor(public elementRef: ElementRef) {
    // Genera un ID unico se non fornito
    if (!this.id) {
      this.id = "tab-" + Math.random().toString(36).substr(2, 9);
    }
  }

  ngOnInit() {
    // Verifica che l'ID sia presente
    if (!this.id) {
      this.id = "tab-" + Math.random().toString(36).substr(2, 9);
      console.warn(
        "CustomTab: ID non fornito, generato automaticamente:",
        this.id
      );
    }

    // Inizializzazione base
    if (!this.isActive) {
      this.elementRef.nativeElement.style.display = "none";
    }
  }
}
