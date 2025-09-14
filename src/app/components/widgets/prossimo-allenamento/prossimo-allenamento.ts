import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-prossimo-allenamento",
  imports: [],
  templateUrl: "./prossimo-allenamento.html",
  styleUrl: "./prossimo-allenamento.scss",
})
export class ProssimoAllenamento implements OnInit {
  constructor() {}

  ngOnInit() {}

  getDatiProssimoAllenamentoWidget(): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        resolve(null);
      } catch (error) {
        reject(error);
      }
    });
  }
}
