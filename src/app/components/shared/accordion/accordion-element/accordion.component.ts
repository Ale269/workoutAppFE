import { CommonModule } from '@angular/common';
import { 
  Component, 
  EventEmitter, 
  Input, 
  Output, 
  ViewChild, 
  ElementRef, 
  AfterViewInit,
  OnDestroy,
  NgZone
} from '@angular/core';
import { gsap } from 'gsap';

@Component({
  selector: 'accordion',
  templateUrl: './accordion.component.html',
  standalone: true, 
  imports: [CommonModule], 
  styleUrls: ['./accordion.component.scss']
})
export class AccordionComponent implements AfterViewInit, OnDestroy {

  @Input() Key!: string;
  @Input() Aperto: boolean = false;

  @Output() openStateChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() refreshAccordion: EventEmitter<string> = new EventEmitter<string>();

  @ViewChild('accordionBody', { static: true }) accordionBody!: ElementRef<HTMLElement>;
  @ViewChild('accordionContent', { static: true }) accordionContent!: ElementRef<HTMLElement>;
  @ViewChild('arrow', { static: true }) arrow!: ElementRef<HTMLElement>;

  private tl!: gsap.core.Timeline;
  private isAnimating = false;

  constructor(private ngZone: NgZone) { }

  ngAfterViewInit(): void {
    // ✅ Esegui fuori da Angular per evitare change detection
    this.ngZone.runOutsideAngular(() => {
      this.initializeGSAP();
      this.setInitialState();
    });
  }

  ngOnDestroy(): void {
    if (this.tl) {
      this.tl.kill();
    }
  }

  private initializeGSAP(): void {
    this.tl = gsap.timeline({ paused: true });
  }

  private setInitialState(): void {
    if (this.Aperto) {
      this.openAccordion(false);
    } else {
      this.closeAccordion(false);
    }
  }

  public toggleApriChiudi(): void {
    if (this.isAnimating) return;

    this.Aperto = !this.Aperto;
    
    // ✅ Esegui animazione fuori da Angular
    this.ngZone.runOutsideAngular(() => {
      if (this.Aperto) {
        this.openAccordion(true);
      } else {
        this.closeAccordion(true);
      }
    });

    // ✅ Emetti l'evento dentro Angular zone per il change detection
    this.ngZone.run(() => {
      this.openStateChange.emit(this.Aperto);
    });
  }

  private openAccordion(animate: boolean = true): void {
    if (!this.accordionContent || !this.accordionBody || !this.arrow) return;

    const content = this.accordionContent.nativeElement;
    const body = this.accordionBody.nativeElement;
    const arrow = this.arrow.nativeElement;

    // Temporaneamente rendi visibile il contenuto per misurarlo
    gsap.set(body, { height: 'auto', overflow: 'visible' });
    const contentHeight = content.offsetHeight;
    
    if (animate) {
      this.isAnimating = true;
      
      // Reset timeline
      this.tl.clear();
      
      // Imposta l'altezza iniziale a 0 e overflow hidden per l'animazione
      gsap.set(body, { height: 0, overflow: 'hidden' });
      
      // Anima l'apertura - ANIMAZIONE ORIGINALE
      this.tl
        .to(body, {
          height: contentHeight,
          duration: 0.5,
          ease: "power2.out",
          force3D: true // ✅ Aggiunto solo force3D
        })
        .to(arrow, {
          rotation: -90,
          duration: 0.4,
          ease: "power2.out",
          force3D: true // ✅ Aggiunto solo force3D
        }, "<")
        .set(body, { 
          height: 'auto', 
          overflow: 'visible' 
        })
        .call(() => {
          this.isAnimating = false;
        });

      this.tl.play();
    } else {
      // Imposta direttamente senza animazione
      gsap.set(body, { height: 'auto', overflow: 'visible' });
      gsap.set(arrow, { rotation: -90 });
    }
  }

  private closeAccordion(animate: boolean = true): void {
    if (!this.accordionContent || !this.accordionBody || !this.arrow) return;

    const body = this.accordionBody.nativeElement;
    const arrow = this.arrow.nativeElement;

    if (animate) {
      this.isAnimating = true;
      
      // Ottieni l'altezza corrente prima di chiudere
      const currentHeight = body.offsetHeight;
      
      // Reset timeline
      this.tl.clear();
      
      // Imposta l'altezza corrente e overflow hidden
      gsap.set(body, { height: currentHeight, overflow: 'hidden' });
      
      // Anima la chiusura - ANIMAZIONE ORIGINALE
      this.tl
        .to(body, {
          height: 0,
          duration: 0.5,
          ease: "power2.out",
          force3D: true // ✅ Aggiunto solo force3D
        })
        .to(arrow, {
          rotation: 90,
          duration: 0.4,
          ease: "power2.out",
          force3D: true // ✅ Aggiunto solo force3D
        }, "<")
        .call(() => {
          this.isAnimating = false;
        });

      this.tl.play();
    } else {
      // Imposta direttamente senza animazione
      gsap.set(body, { height: 0, overflow: 'hidden' });
      gsap.set(arrow, { rotation: 90 });
    }
  }

  public refresh(event: any): void {
    this.refreshAccordion.emit(this.Key);
    event.stopPropagation();
  }
}

export enum ArrowPosition {
  NoArrow = 0,
  Left = 1,
  Right = 2
}