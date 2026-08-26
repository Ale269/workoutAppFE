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
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { BottomSheetController } from "./bottom-sheet-controller";
import { BottomSheetInstance } from "./bottom-sheet-model";
import { BottomSheetService } from "./bottom-sheet-service";

gsap.registerPlugin(Draggable, InertiaPlugin);

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
    if (this.container?.nativeElement) {
      InertiaPlugin.untrack(this.container.nativeElement, "y");
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

    // Tracciamo "y" esplicitamente per poter leggere la velocità reale del
    // dito al rilascio. NB: inertia è volutamente DISATTIVATA sul Draggable —
    // altrimenti al rilascio GSAP lancerebbe un proprio tween di inerzia
    // (fino a bounds.maxY) che entra in conflitto con il tween di chiusura
    // gestito qui in onDragEnd: i due si sovrascrivono a vicenda e la sheet
    // "rimbalza" tornando visibile prima di sparire.
    InertiaPlugin.track(container, "y");

    this.draggableInstance = Draggable.create(container, {
      type: "y",
      trigger: this.handle.nativeElement,
      bounds: { minY: vh20, maxY: window.innerHeight + vh20 },
      inertia: false,
      zIndexBoost: false,
      onDrag: function() {
        const dragAmount = this["y"] - vh20;
        const maxDrag = window.innerHeight * 0.3;
        const opacity = Math.max(0, 1 - (dragAmount / maxDrag));
        gsap.set(backdrop, { opacity });
      },
      onDragEnd: () => {
        const dragAmount = (gsap.getProperty(container, "y") as number) - vh20;
        // Velocità reale del dito al rilascio (px/s): Draggable con
        // inertia:true traccia "y" con InertiaPlugin internamente, quindi è
        // già disponibile qui senza bisogno di calcoli manuali.
        const velocityY = InertiaPlugin.getVelocity(container, "y");
        // Proietta dove finirebbe lo swipe continuando con l'inerzia attuale
        // per ~0.2s, invece di guardare solo la posizione al momento del
        // rilascio: così uno swipe veloce lasciato a metà schermo chiude
        // comunque il pannello invece di "pensarci" e fermarsi.
        const projectedDragAmount = dragAmount + velocityY * 0.2;

        if (projectedDragAmount > this.closeThreshold) {
          this.close(undefined, undefined, velocityY);
        } else {
          this.snapBack(velocityY);
        }
      }
    });
  }

  private snapBack(velocityY: number = 0): void {
    const container = this.container.nativeElement;
    const backdrop = this.backdrop.nativeElement;
    const vh20 = window.innerHeight * 0.2;
    const startY = (gsap.getProperty(container, "y") as number) || 0;
    const startOpacity = (gsap.getProperty(backdrop, "opacity") as number) ?? 0;
    const span = startY - vh20 || 1;

    gsap.to(container, {
      inertia: {
        duration: { min: 0.25, max: 0.6 },
        y: {
          velocity: velocityY,
          end: vh20,
        },
      },
      onUpdate: () => {
        const y = gsap.getProperty(container, "y") as number;
        const progress = gsap.utils.clamp(0, 1, (startY - y) / span);
        gsap.set(backdrop, { opacity: startOpacity + (1 - startOpacity) * progress });
      },
    });
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

  private closeBottomSheet(data?: any, role?: string, velocityY: number = 0): void {
    if (this.isAnimating) return;

    this.isAnimating = true;
    this.pendingClose = true;

    const container = this.container.nativeElement;
    const backdrop = this.backdrop.nativeElement;
    const containerHeight = container.offsetHeight;
    const startY = (gsap.getProperty(container, "y") as number) || 0;
    const startOpacity = (gsap.getProperty(backdrop, "opacity") as number) ?? 1;
    const span = containerHeight - startY || 1;

    // Chiusura con inerzia MA senza overshoot. Un tween "inertia" può
    // superare il punto finale e poi rientrarci: dato che il punto finale è
    // già fuori schermo, il rientro rendeva la sheet di nuovo visibile per
    // un frame (il "flash"). Usiamo invece un ease monotono (power2.out, che
    // non torna mai indietro) e ricaviamo la DURATA dalla velocità reale del
    // dito: per power2.out la velocità iniziale è 2*distanza/durata, quindi
    // durata = 2*distanza/velocità mantiene la continuità col gesto.
    const duration =
      velocityY > 0
        ? gsap.utils.clamp(0.18, 0.45, (2 * span) / velocityY)
        : 0.45;

    gsap.to(container, {
      y: containerHeight,
      duration,
      ease: "power2.out",
      onUpdate: () => {
        const y = gsap.getProperty(container, "y") as number;
        const progress = gsap.utils.clamp(0, 1, (y - startY) / span);
        gsap.set(backdrop, { opacity: startOpacity * (1 - progress) });
      },
      onComplete: () => {
        this.isAnimating = false;
        this.pendingClose = false;
        document.body.style.overflow = "auto";

        backdrop.classList.remove("visible");

        // IMPORTANTE: Chiama dismiss DOPO che l'animazione è finita
        // Usa setTimeout per assicurarti che l'animazione sia completamente finita
        setTimeout(() => {
          this.bottomSheetService.dismiss(this.instance.id, data, role);
        }, 50);
      },
    });
  }

  onBackdropClick(): void {
    if (this.instance.backdropDismiss && this.instance.dismissible) {
      this.close();
    }
  }

  async close(data?: any, role?: string, velocityY: number = 0): Promise<void> {
    this.closeBottomSheet(data, role, velocityY);
  }
}