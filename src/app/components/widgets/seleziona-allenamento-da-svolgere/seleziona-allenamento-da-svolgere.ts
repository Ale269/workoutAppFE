import { Component, ViewChild } from "@angular/core";
import { ProssimoAllenamento } from "../prossimo-allenamento/prossimo-allenamento";
import { WidgetsService } from "src/app/core/services/widgets.service";
import { MatIcon, MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { ErrorHandlerService } from "src/app/core/services/error-handler.service";

@Component({
  selector: "app-seleziona-allenamento-da-svolgere",
  imports: [ProssimoAllenamento, MatIcon],
  templateUrl: "./seleziona-allenamento-da-svolgere.html",
  styleUrl: "./seleziona-allenamento-da-svolgere.scss",
})
export class SelezionaAllenamentoDaSvolgere {
  @ViewChild(ProssimoAllenamento) prossimoAllenamento!: ProssimoAllenamento;

  constructor(
    private widgetsService: WidgetsService,
    private errorHandlerService: ErrorHandlerService,
    private router: Router,
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer,
  ) {
    iconRegistry.addSvgIcon(
      "google-arrow",
      sanitizer.bypassSecurityTrustResourceUrl(
        "assets/recollect/svg/google-arrow.svg",
      ),
    );
  }
}
