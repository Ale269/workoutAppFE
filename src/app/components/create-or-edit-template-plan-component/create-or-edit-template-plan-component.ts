import {
  AfterViewInit,
  Component,
  Input,
  OnInit,
  ViewChild,
  OnDestroy,
} from "@angular/core";
import { ErrorHandlerService } from "src/app/core/services/error-handler.service";
import { AccordionGroupComponent } from "../shared/accordion/accordion-group/accordion-group.component";
import { CreateOrEditTemplatePlanService } from "./create-or-edit-template-plan-service";
import { MatTabGroup, MatTabsModule, MatTabChangeEvent } from "@angular/material/tabs";
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
import { Subscription } from "rxjs";

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
    MatTabsModule
  ],
  templateUrl: "./create-or-edit-template-plan-component.html",
  styleUrl: "./create-or-edit-template-plan-component.scss",
})
export class CreateOrEditTemplatePlanComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatTabGroup) tabGroup!: MatTabGroup;

  public selectedTabIndex: number = 0;
  public idScheda: number = 0;

  private selectedIndexSubscription?: Subscription;

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

  ngAfterViewInit(): void {
    // Sottoscrivi ai cambi di tab per gestire lo scroll automatico
    if (this.tabGroup) {
      this.selectedIndexSubscription = this.tabGroup.selectedIndexChange.subscribe((newIndex: number) => {
        this.selectedTabIndex = newIndex;
        // Delay per assicurarsi che il DOM sia aggiornato
        setTimeout(() => {
          this.scrollToActiveTab(newIndex);
        }, 150);
      });
    }
  }

  ngOnDestroy(): void {
    // Pulisci la sottoscrizione per evitare memory leak
    if (this.selectedIndexSubscription) {
      this.selectedIndexSubscription.unsubscribe();
    }
  }

  /**
   * Effettua uno scroll smooth per rendere visibile la tab attiva
   */
  private scrollToActiveTab(tabIndex: number): void {
    try {
      const tabGroupElement = this.tabGroup._elementRef.nativeElement;
      const tabList = tabGroupElement.querySelector('.mat-mdc-tab-list') as HTMLElement;
      const tabLabels = tabGroupElement.querySelectorAll('.mat-mdc-tab');
      
      if (!tabList || !tabLabels || !tabLabels[tabIndex]) {
        console.warn('Elementi tab non trovati per lo scroll');
        return;
      }

      const activeTabElement = tabLabels[tabIndex] as HTMLElement;
      const tabListRect = tabList.getBoundingClientRect();
      const activeTabRect = activeTabElement.getBoundingClientRect();

      // Calcola la posizione relativa della tab attiva rispetto al container
      const tabLeftRelative = activeTabElement.offsetLeft;
      const tabRightRelative = tabLeftRelative + activeTabElement.offsetWidth;
      
      // Posizione corrente dello scroll
      const currentScrollLeft = tabList.scrollLeft;
      const containerWidth = tabList.clientWidth;
      
      // Calcola se la tab è visibile completamente
      const tabLeftVisible = tabLeftRelative >= currentScrollLeft;
      const tabRightVisible = tabRightRelative <= (currentScrollLeft + containerWidth);

      let targetScrollPosition = currentScrollLeft;

      if (!tabLeftVisible) {
        // La tab è tagliata a sinistra, scroll verso sinistra
        targetScrollPosition = tabLeftRelative - 20; // 20px di padding
      } else if (!tabRightVisible) {
        // La tab è tagliata a destra, scroll verso destra
        targetScrollPosition = tabRightRelative - containerWidth + 20; // 20px di padding
      } else {
        // La tab è già completamente visibile, non fare nulla
        return;
      }

      // Assicurati che il target non sia negativo
      targetScrollPosition = Math.max(0, targetScrollPosition);

      // Effettua lo scroll smooth
      this.smoothScrollTo(tabList, targetScrollPosition);

    } catch (error) {
      console.error('Errore durante lo scroll automatico delle tab:', error);
    }
  }

  /**
   * Implementazione custom dello smooth scroll
   */
  private smoothScrollTo(element: HTMLElement, targetPosition: number, duration: number = 300): void {
    const startPosition = element.scrollLeft;
    const distance = targetPosition - startPosition;
    const startTime = performance.now();

    const animateScroll = (currentTime: number) => {
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      element.scrollLeft = startPosition + (distance * easeOut);

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };

    requestAnimationFrame(animateScroll);
  }

  deleteWorkout(identifier: number): void {
    try {
      const currentTabsCount = this.createOrEditTemplatePlanService.formScheda.listaAllenamentiForm.length;
      
      this.createOrEditTemplatePlanService.DeleteWorkout(identifier);
      
      // Gestisci l'indice dopo la cancellazione
      setTimeout(() => {
        const newTabsCount = this.createOrEditTemplatePlanService.formScheda.listaAllenamentiForm.length;
        
        if (newTabsCount === 0) {
          this.selectedTabIndex = 0;
        } else if (this.selectedTabIndex >= newTabsCount) {
          this.selectedTabIndex = newTabsCount - 1;
          // Forza l'aggiornamento del MatTabGroup
          if (this.tabGroup) {
            this.tabGroup.selectedIndex = this.selectedTabIndex;
          }
        }
      }, 100);
      
    } catch (error) {
      this.errorHandlerService.handleError(
        error,
        "WorkoutComponent.deleteExercise"
      );
    }
  }

  addWorkout(nomeWorkout: string): void {
    try {
      this.createOrEditTemplatePlanService.AddWorkout(nomeWorkout);
      
      // Vai all'ultima tab (quella appena creata)
      const newTabIndex = this.createOrEditTemplatePlanService.formScheda.listaAllenamentiForm.length - 1;
      
      setTimeout(() => {
        this.selectedTabIndex = newTabIndex;
        if (this.tabGroup) {
          this.tabGroup.selectedIndex = newTabIndex;
        }
      }, 100);
      
    } catch (error) {
      this.errorHandlerService.handleError(
        error,
        "WorkoutComponent.addWorkout"
      );
    }
  }

  onTabChange(event: MatTabChangeEvent): void {
    console.log('Tab change event:', event);
    // Questo metodo verrà chiamato automaticamente dal template
    // Lo scroll verrà gestito dalla sottoscrizione in ngAfterViewInit
  }

  /**
   * Metodo pubblico per navigare programmaticamente a una tab specifica
   */
  public goToTab(index: number): void {
    if (index >= 0 && index < this.createOrEditTemplatePlanService.formScheda.listaAllenamentiForm.length) {
      if (this.tabGroup) {
        this.tabGroup.selectedIndex = index;
      }
    }
  }
}