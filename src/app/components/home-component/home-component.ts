import {Component, ElementRef, HostListener, Inject, OnInit, PLATFORM_ID, Renderer2, ViewChild} from '@angular/core';
import {CommonModule, NgIf, NgFor, DecimalPipe, SlicePipe, isPlatformBrowser} from '@angular/common'; // Aggiungi DecimalPipe e SlicePipe
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CreateOrEditWorkoutExecution } from '../create-or-edit-workout-execution/create-or-edit-workout-execution';
import { CreateOrEditTemplatePlanComponent } from '../create-or-edit-template-plan-component/create-or-edit-template-plan-component';
import { ViewTemplatePlan } from '../view-template-plan/view-template-plan';
import { ListTemplatePlans } from '../list-template-plans/list-template-plans';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, CreateOrEditWorkoutExecution, CreateOrEditTemplatePlanComponent, ViewTemplatePlan, ListTemplatePlans], // Assicurati di includere FormsModule e i Pipes
  templateUrl: './home-component.html',
  styleUrls: ['./home-component.scss']
})
export class HomeComponent {


}


