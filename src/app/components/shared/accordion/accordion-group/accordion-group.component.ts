import {
  AfterContentInit,
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  QueryList,
  SimpleChanges,
} from "@angular/core";
import { AccordionComponent } from "../accordion-element/accordion.component";
import { ErrorHandlerService } from "src/app/core/services/error-handler.service";

@Component({
  selector: "accordion-group",
  templateUrl: "./accordion-group.component.html",
  styleUrls: ["./accordion-group.component.scss"],
})
export class AccordionGroupComponent
  implements OnInit, OnChanges, AfterContentInit
{
  @Input() Keys: string[] = [];

  @Output() KeysChange = new EventEmitter<string[]>();
  @Output() refreshAccordions: EventEmitter<string> =
    new EventEmitter<string>();

  @ContentChildren(AccordionComponent)
  public AccordionComponents: QueryList<AccordionComponent> =
    new QueryList<AccordionComponent>();

  constructor(private errorHandlerService: ErrorHandlerService) {}

  ngOnInit(): void {
    // console.log(this.Keys);
  }

  ngAfterContentInit() {
    this.AccordionComponents.forEach((Accordion) => {
      Accordion.openStateChange.subscribe((OpenState: boolean) =>
        this.onAccordionOpenStateChange(Accordion.Key, OpenState)
      );

      Accordion.refreshAccordion.subscribe((key: string) => {
        this.refreshAccordions.emit(key);
      });
    });

    this.AccordionComponents.changes.subscribe((evt) => {
      this.AccordionComponents.forEach((Accordion) => {
        Accordion.openStateChange.subscribe((OpenState: boolean) =>
          this.onAccordionOpenStateChange(Accordion.Key, OpenState)
        );

        Accordion.refreshAccordion.subscribe((key: string) => {
          this.refreshAccordions.emit(key);
        });
      });
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["Keys"]) {
      setTimeout(() => {
        this.ChangeState();
      }, 100);
    }
  }

  SetKeys(Keys: string[]) {
    this.Keys = Keys.filter(() => 1 === 1);
    setTimeout(() => {
      this.ChangeState();
    }, 100);
  }

  onAccordionOpenStateChange(Key: string, OpenState: boolean) {
    if (OpenState) {
      this.Keys.push(Key);
    } else {
      let index = this.Keys.indexOf(Key);
      if (index !== -1) {
        this.Keys.splice(index, 1);
      }
    }
    this.KeysChange.emit(this.Keys);
  }

  ChangeState() {
    this.AccordionComponents.forEach((element) => {
      if (this.Keys.includes(element.Key)) {
        element.Aperto = true;
      } else {
        element.Aperto = false;
      }
    });
  }

  ScrollToElement(Scroller: HTMLInputElement, key: number) {
    try {
      // scroller è l'elemento con la scrollbar
      Scroller.style.scrollBehavior = "smooth";
      const child = document.getElementById("accordion_" + key)!;
      Scroller.scroll(0, child.offsetTop);
    } catch (error) {
      this.errorHandlerService.logError(error, "AccordionGroupComponent.ScrollToElement");
    }
  }
}
