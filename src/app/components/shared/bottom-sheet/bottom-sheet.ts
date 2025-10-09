import {
  Component,
  Input,
  ViewContainerRef,
  ViewChild,
  OnInit,
  ComponentRef,
  inject,
  AfterViewInit,
  ElementRef,
  Injector,
  EnvironmentInjector,
} from "@angular/core";
import { CommonModule } from "@angular/common";

import gsap from "gsap";
import { BottomSheetController } from "./bottom-sheet-controller";
import { BottomSheetInstance } from "./bottom-sheet-model";
import { BottomSheetService } from "./bottom-sheet-service";

@Component({
  selector: "app-bottom-sheet-wrapper",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./bottom-sheet.html",
  styleUrls: ["./bottom-sheet.scss"],
})
export class BottomSheetWrapperComponent implements OnInit, AfterViewInit {
 @Input({ required: true }) instance!: BottomSheetInstance;
  @ViewChild('dynamicComponent', { read: ViewContainerRef }) 
  dynamicComponent!: ViewContainerRef;
  @ViewChild('backdrop', { read: ElementRef })
  backdrop!: ElementRef<HTMLDivElement>;
  @ViewChild('container', { read: ElementRef })
  container!: ElementRef<HTMLDivElement>;

  private bottomSheetService = inject(BottomSheetService);
  private injector = inject(Injector);
  private environmentInjector = inject(EnvironmentInjector);
  
  private isAnimating = false;
  private pendingClose = false;
  private componentRef?: ComponentRef<any>;

  ngOnInit(): void {
    document.body.style.overflow = "hidden";
  }

  ngAfterViewInit(): void {
    this.loadComponent();
    this.openBottomSheet();
  }

  private loadComponent(): void {
    if (this.dynamicComponent && this.instance.component) {
      // Crea un controller specifico per questo bottom sheet
      const controller = new BottomSheetController();
      controller.setBottomSheetId(this.instance.id);

      // Crea un injector che fornisce il controller
      const componentInjector = Injector.create({
        providers: [
          { provide: BottomSheetController, useValue: controller }
        ],
        parent: this.injector
      });

      // Crea il componente con l'injector personalizzato
      this.componentRef = this.dynamicComponent.createComponent(
        this.instance.component,
        {
          injector: componentInjector,
          environmentInjector: this.environmentInjector
        }
      );
      
      // Passa i dati al componente dinamico (senza il controller, che viene iniettato)
      if (this.instance.data) {
        Object.assign(this.componentRef.instance, this.instance.data);
      }
    }
  }

  private openBottomSheet(): void {
    if (this.isAnimating) return;
    
    this.isAnimating = true;
    this.pendingClose = false;

    const tl = gsap.timeline({
      onComplete: () => {
        this.isAnimating = false;
      }
    });

    tl.set(this.backdrop.nativeElement, { visibility: "visible" })
      .to(this.backdrop.nativeElement, {
        opacity: 0.3,
        duration: 0.3,
        ease: "power2.out"
      })
      .to(this.container.nativeElement, {
        y: 0,
        opacity: 1,
        duration: 0.6,
        ease: "back.out(1.7)"
      }, "-=0.2");
  }

  private closeBottomSheet(data?: any): void {
    if (this.isAnimating) return;
    
    this.isAnimating = true;
    this.pendingClose = true;

    const tl = gsap.timeline({
      onComplete: () => {
        this.isAnimating = false;
        this.pendingClose = false;
        document.body.style.overflow = "auto";
        gsap.set(this.backdrop.nativeElement, { visibility: "hidden" });
        this.bottomSheetService.dismiss(this.instance.id, data);
      }
    });

    tl.to(this.container.nativeElement, {
      y: 100,
      opacity: 0,
      duration: 0.4,
      ease: "back.in(1.4)"
    })
    .to(this.backdrop.nativeElement, {
      opacity: 0,
      duration: 0.2,
      ease: "power2.in"
    }, "-=0.1");
  }

  onBackdropClick(): void {
    if (this.instance.backdropDismiss && this.instance.dismissible) {
      this.close();
    }
  }

  async close(data?: any): Promise<void> {
    this.closeBottomSheet(data);
  }
}
