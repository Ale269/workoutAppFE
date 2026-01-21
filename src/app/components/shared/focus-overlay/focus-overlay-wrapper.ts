import {
  Component,
  Input,
  ViewChild,
  ViewContainerRef,
  OnInit,
  OnDestroy,
  ComponentRef,
  Injector,
  EnvironmentInjector,
  createComponent,
  ChangeDetectionStrategy,
  ElementRef,
  AfterViewInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FocusOverlayInstance } from './focus-overlay.service';
import { gsap } from 'gsap';
import { FocusOverlayController } from './focus-overlay.controller';

@Component({
  selector: 'app-focus-overlay-wrapper',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './focus-overlay-wrapper.html',
  styleUrls: ['./focus-overlay-wrapper.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FocusOverlayWrapperComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() instance!: FocusOverlayInstance;

  @ViewChild('dynamicComponent', { read: ViewContainerRef, static: true })
  dynamicComponentContainer!: ViewContainerRef;

  @ViewChild('backdrop', { read: ElementRef, static: true })
  backdropRef!: ElementRef<HTMLElement>;

  @ViewChild('content', { read: ElementRef, static: true })
  contentRef!: ElementRef<HTMLElement>;

  private componentRef?: ComponentRef<any>;
  private isAnimating = false;

  constructor(
    private injector: Injector,
    private environmentInjector: EnvironmentInjector
  ) { }

  ngOnInit(): void {
    // Registra le funzioni per il controllo del backdrop
    this.instance.controller.registerBackdropFns(
      () => this.showBackdrop(),
      () => this.hideBackdrop()
    );
    this.loadComponent();
  }

  ngAfterViewInit(): void {
    // Il backdrop parte invisibile, sarà la componente a controllarlo
    gsap.set(this.backdropRef.nativeElement, { opacity: 0 });
    gsap.set(this.contentRef.nativeElement, { opacity: 1, scale: 1 });
  }

  ngOnDestroy(): void {
    this.componentRef?.destroy();
  }

  private loadComponent(): void {
    if (!this.instance?.config?.component) {
      console.error('Nessuna componente specificata per il focus overlay');
      return;
    }

    // Crea un injector personalizzato che fornisce il controller
    const customInjector = Injector.create({
      parent: this.injector,
      providers: [
        {
          provide: FocusOverlayController,
          useValue: this.instance.controller
        }
      ]
    });

    // Crea e inserisce la componente dinamica
    this.componentRef = createComponent(
      this.instance.config.component,
      {
        environmentInjector: this.environmentInjector,
        elementInjector: customInjector
      }
    );

    // Passa i dati come @Input
    if (this.instance.config.data) {
      const dataObj = this.instance.config.data;
      Object.keys(dataObj).forEach(key => {
        this.componentRef!.setInput(key, dataObj[key]);
      });
    }

    // Salva il riferimento nell'instance
    this.instance.componentRef = this.componentRef;

    // Inserisce la componente nel ViewContainerRef
    this.dynamicComponentContainer.insert(this.componentRef.hostView);
  }

  private showBackdrop(): void {
    const backdrop = this.backdropRef.nativeElement;
    gsap.to(backdrop, {
      opacity: 1,
      duration: 0.3,
      ease: 'power2.out'
    });
  }

  private hideBackdrop(): void {
    const backdrop = this.backdropRef.nativeElement;
    gsap.to(backdrop, {
      opacity: 0,
      duration: 0.2,
      ease: 'power2.in'
    });
  }

  private animateOut(): Promise<void> {
    return new Promise((resolve) => {
      const backdrop = this.backdropRef.nativeElement;
      // Solo animazione del backdrop
      gsap.to(backdrop, {
        opacity: 0,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: () => resolve()
      });
    });
  }

  onBackdropClick(): void {
    // Il backdrop click avvia l'animazione di chiusura tramite la componente
    if (!this.isAnimating) {
      this.instance.controller.startCloseAnimation();
    }
  }

  onContentClick(event: Event): void {
    // Il click sul content avvia l'animazione di chiusura
    event.stopPropagation();
    if (!this.isAnimating) {
      // this.instance.controller.startCloseAnimation();
    }
  }

  private async dismiss(): Promise<void> {
    if (this.isAnimating) return;

    this.isAnimating = true;
    await this.animateOut();
    this.instance.controller.dismiss();
  }
}