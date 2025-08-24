import {
  AfterViewInit,
  Component,
  Input,
  OnInit,
  ViewChild,
} from "@angular/core";
import { ErrorHandlerService } from "src/app/core/services/error-handler.service";
import { AccordionGroupComponent } from "../shared/accordion/accordion-group/accordion-group.component";
import { CreateOrEditTemplatePlanService } from "./create-or-edit-template-plan-service";
import { MatTabGroup } from "@angular/material/tabs";
import { CustomTabContainerComponent } from "../shared/tabs/custom-tab-container/custom-tab-container";
import { CustomTabComponent } from "../shared/tabs/custom-tab-components/custom-tab-components";
import { WorkoutComponent } from "./workout-component/workout-component";
import { ReactiveFormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import {
  MatLabel,
  MatError,
  MatFormField,
  MatInput,
} from "@angular/material/input";
import { ExerciseComponent } from "./workout-component/exercise-component/exercise-component";

@Component({
  selector: "app-create-or-edit-template-plan-component",
  imports: [
    CustomTabComponent,
    CustomTabContainerComponent,
    WorkoutComponent,
    ReactiveFormsModule,
    MatLabel,
    MatFormField,
    MatInput,
    MatFormFieldModule,
  ],
  templateUrl: "./create-or-edit-template-plan-component.html",
  styleUrl: "./create-or-edit-template-plan-component.scss",
})
export class CreateOrEditTemplatePlanComponent implements OnInit {
  @ViewChild(MatTabGroup) tabGroup!: MatTabGroup;

  public activeTabId = "";

  public idScheda: number = 0;

  constructor(
    private errorHandlerService: ErrorHandlerService,
    public createOrEditTemplatePlanService: CreateOrEditTemplatePlanService
  ) {}

  ngOnInit(): void {
    try {
      this.createOrEditTemplatePlanService.InitializeScheda(1);
    } catch (error) {
      this.errorHandlerService.handleError(
        error,
        "CreateOrEditTemplatePlanComponent.ngOnInit"
      );
    }
  }

  deleteWorkout(identifier: number) {
    try {
      this.createOrEditTemplatePlanService.DeleteWorkout(identifier);
    } catch (error) {
      this.errorHandlerService.handleError(
        error,
        "WorkoutComponent.deleteEexercise"
      );
    }
  }

  addWorkout(nomeWorkout: string) {
    try {
      this.createOrEditTemplatePlanService.AddWorkout(nomeWorkout);
    } catch (error) {
      this.errorHandlerService.handleError(
        error,
        "WorkoutComponent.addWorkout"
      );
    }
  }

  //  ngAfterViewInit() {
  //   this.tabGroup.selectedIndexChange.subscribe(() => {
  //     setTimeout(() => {
  //       const tabHeader = this.tabGroup._elementRef.nativeElement.querySelector('.mat-mdc-tab-header');
  //       if (tabHeader) {
  //         tabHeader.scrollLeft = 0; // blocca lo scroll a sinistra
  //       }
  //     }, 100);
  //   });
  // }

  onTabChange(event: any) {
    console.log(event);
  }
}
