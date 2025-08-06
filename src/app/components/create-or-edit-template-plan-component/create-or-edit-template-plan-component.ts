import { Component } from "@angular/core";
import { ErrorHandlerService } from "src/app/core/services/error-handler.service";
import { AccordionBodyComponent } from "../shared/accordion/accordion-element/accordion-body/accordion-body.component";
import { AccordionGroupComponent } from "../shared/accordion/accordion-group/accordion-group.component";
import { AccordionComponent } from "../shared/accordion/accordion-element/accordion.component";
import { AccordionHeaderComponent } from "../shared/accordion/accordion-element/accordion-header/accordion-header.component";
import { SchedaForm } from "./template-plan-form";

@Component({
  selector: "app-create-or-edit-template-plan-component",
  imports: [
    AccordionGroupComponent,
    AccordionComponent,
    AccordionBodyComponent,
    AccordionHeaderComponent,
  ],
  templateUrl: "./create-or-edit-template-plan-component.html",
  styleUrl: "./create-or-edit-template-plan-component.scss",
})
export class CreateOrEditTemplatePlanComponent {
 

  public formScheda! : SchedaForm 

  constructor(private errorHandlerService: ErrorHandlerService) {
    try {
      this.formScheda = new SchedaForm();
    } catch (error) { 
      this.errorHandlerService.handleError(error, "LoginComponent.constructor");
    }
  }


}
