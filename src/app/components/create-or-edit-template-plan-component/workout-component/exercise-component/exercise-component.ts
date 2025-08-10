import { Component } from '@angular/core';
import { AccordionBodyComponent } from 'src/app/components/shared/accordion/accordion-element/accordion-body/accordion-body.component';
import { AccordionHeaderComponent } from 'src/app/components/shared/accordion/accordion-element/accordion-header/accordion-header.component';
import { AccordionComponent } from 'src/app/components/shared/accordion/accordion-element/accordion.component';


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
