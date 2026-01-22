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
import { Draggable } from "gsap/Draggable";
import { BottomSheetController } from "./bottom-sheet-controller";
import { BottomSheetInstance } from "./bottom-sheet-model";
import { BottomSheetService } from "./bottom-sheet-service";

gsap.registerPlugin(Draggable);

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
  @ViewChild('handle', { read: ElementRef })
  handle!: ElementRef<HTMLDivElement>;

  private bottomSheetService = inject(BottomSheetService);
  private injector = inject(Injector);
  private environmentInjector = inject(EnvironmentInjector);
  
  private isAnimating = false;
  private pendingClose = false;
  private componentRef?: ComponentRef<any>;
  private draggableInstance?: Draggable[];
  private closeThreshold = 150;

  ngOnInit(): void {
    document.body.style.overflow = "hidden";
  }

  ngAfterViewInit(): void {
    // Registra il callback per gestire la richiesta di chiusura
    this.instance.onDismissRequested = (result) => {
      console.log('🎬 Animation callback triggered with result:', result);
      this.closeBottomSheet(result.data, result.role);
    };
    
    this.loadComponent();
    this.openBottomSheet();
    this.setupDraggable();
  }

  ngOnDestroy(): void {
    if (this.draggableInstance) {
      this.draggableInstance[0].kill();
    }
    document.body.style.overflow = "auto";
  }

  private loadComponent(): void {
    if (this.dynamicComponent && this.instance.component) {
      const controller = new BottomSheetController();
      controller.setBottomSheetId(this.instance.id);
      controller.setBottomSheetService(this.bottomSheetService);

      console.log('🟡 Created controller with ID:', this.instance.id);

      const componentInjector = Injector.create({
        providers: [
          { provide: BottomSheetController, useValue: controller }
        ],
        parent: this.injector
      });

      this.componentRef = this.dynamicComponent.createComponent(
        this.instance.component,
        {
          injector: componentInjector,
          environmentInjector: this.environmentInjector
        }
      );
      
      if (this.instance.data) {
        Object.assign(this.componentRef.instance, this.instance.data);
      }
    }
  }

  private setupDraggable(): void {
    if (!this.instance.dismissible || !this.handle) return;

    const container = this.container.nativeElement;
    const backdrop = this.backdrop.nativeElement;
    const vh20 = window.innerHeight * 0.2;

    this.draggableInstance = Draggable.create(container, {
      type: "y",
      trigger: this.handle.nativeElement,
      bounds: { minY: vh20, maxY: window.innerHeight + vh20 },
      inertia: true,
      zIndexBoost: false,
      onDrag: function() {
        const dragAmount = this["y"] - vh20;
        const maxDrag = window.innerHeight * 0.3;
        const opacity = Math.max(0, 1 - (dragAmount / maxDrag));
        gsap.set(backdrop, { opacity });
      },
      onDragEnd: () => {
        const dragAmount = (gsap.getProperty(container, "y") as number) - vh20;
        
        if (dragAmount > this.closeThreshold) {
          this.close();
        } else {
          this.snapBack();
        }
      }
    });
  }

  private snapBack(): void {
    const tl = gsap.timeline();
    
    tl.to(this.container.nativeElement, {
      y: "20vh",
      duration: 0.4,
      ease: "back.out(1.7)"
    })
    .to(this.backdrop.nativeElement, {
      opacity: 1,
      duration: 0.3,
      ease: "power2.out"
    }, "<");
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

    const containerHeight = this.container.nativeElement.offsetHeight;
    const backdropEl = this.backdrop.nativeElement;
    
    // Abilita pointer-events e imposta opacity a 0
    backdropEl.classList.add('visible');
    gsap.set(backdropEl, { opacity: 0 });
    
    gsap.set(this.container.nativeElement, { 
      y: containerHeight,
      opacity: 1
    });

    tl.to(backdropEl, {
        opacity: 1,
        duration: 0.3,
        ease: "power2.out"
      })
      .to(this.container.nativeElement, {
        y: "20vh",
        duration: 0.6,
        ease: "back.out(1.7)"
      }, "-=0.2");
  }

  private closeBottomSheet(data?: any, role?: string): void {
    if (this.isAnimating) return;
    
    console.log('🔵 Starting close animation...');
    this.isAnimating = true;
    this.pendingClose = true;

    const containerHeight = this.container.nativeElement.offsetHeight;
    
    const tl = gsap.timeline({
      onComplete: () => {
        console.log('✅ Close animation completed, now dismissing...');
        this.isAnimating = false;
        this.pendingClose = false;
        document.body.style.overflow = "auto";
        
        // Rimuovi pointer-events
        this.backdrop.nativeElement.classList.remove('visible');
        
        // IMPORTANTE: Chiama dismiss DOPO che l'animazione è finita
        // Usa setTimeout per assicurarti che l'animazione sia completamente finita
        setTimeout(() => {
          this.bottomSheetService.dismiss(this.instance.id, data, role);
        }, 50);
      }
    });

    // Anima prima il container verso il basso
    tl.to(this.container.nativeElement, {
      y: containerHeight,
      duration: 0.4,
      ease: "power2.in"
    })
    // Poi dissolvi il backdrop
    .to(this.backdrop.nativeElement, {
      opacity: 0,
      duration: 0.3,
      ease: "power2.in"
    }, "<");
  }

  onBackdropClick(): void {
    if (this.instance.backdropDismiss && this.instance.dismissible) {
      this.close();
    }
  }

  async close(data?: any, role?: string): Promise<void> {
    this.closeBottomSheet(data, role);
  }
}