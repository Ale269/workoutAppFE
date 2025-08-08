import { Component } from '@angular/core';
import { AccordionBodyComponent } from "../../shared/accordion/accordion-element/accordion-body/accordion-body.component";
import { AccordionComponent } from '../../shared/accordion/accordion-element/accordion.component';
import { AccordionHeaderComponent } from '../../shared/accordion/accordion-element/accordion-header/accordion-header.component';

@Component({
  selector: 'app-exercise-component',
  imports: [
    AccordionComponent,
    AccordionBodyComponent,
    AccordionHeaderComponent,
  ],
  templateUrl: './exercise-component.html',
  styleUrl: './exercise-component.scss'
})
export class ExerciseComponent {

}
