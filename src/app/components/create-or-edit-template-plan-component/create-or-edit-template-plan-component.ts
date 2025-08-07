import { Component, Input, OnInit } from "@angular/core";
import { ErrorHandlerService } from "src/app/core/services/error-handler.service";
import { AccordionBodyComponent } from "../shared/accordion/accordion-element/accordion-body/accordion-body.component";
import { AccordionGroupComponent } from "../shared/accordion/accordion-group/accordion-group.component";
import { AccordionComponent } from "../shared/accordion/accordion-element/accordion.component";
import { AccordionHeaderComponent } from "../shared/accordion/accordion-element/accordion-header/accordion-header.component";
import { CreateOrEditTemplatePlanService } from "./create-or-edit-template-plan-service";

@Component({
  selector: "app-create-or-edit-template-plan-component",
  imports: [
    AccordionGroupComponent,
  ],
  templateUrl: "./create-or-edit-template-plan-component.html",
  styleUrl: "./create-or-edit-template-plan-component.scss",
})
export class CreateOrEditTemplatePlanComponent implements OnInit {

  public idScheda : number = 0;

  constructor(
    private errorHandlerService: ErrorHandlerService,
    private createOrEditTemplatePlanService: CreateOrEditTemplatePlanService
  ) {}

  ngOnInit(): void {
    try {
      this.createOrEditTemplatePlanService.InitializeScheda(this.idScheda);
    } catch (error) {
      this.errorHandlerService.handleError(error, "CreateOrEditTemplatePlanComponent.ngOnInit");
    }
  }
}
