import { CommonModule } from '@angular/common';
import { 
  Component, 
  EventEmitter, 
  Input, 
  Output, 
  ViewChild, 
  ElementRef, 
  AfterViewInit,
  OnDestroy 
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

  constructor() { }

  ngAfterViewInit(): void {
    // Inizializza GSAP timeline
    this.initializeGSAP();
    
    // Imposta lo stato iniziale
    this.setInitialState();
  }

  ngOnDestroy(): void {
    // Pulisci le animazioni GSAP
    if (this.tl) {
      this.tl.kill();
    }
  }

  private initializeGSAP(): void {
    // Crea una timeline GSAP
    this.tl = gsap.timeline({ paused: true });
  }

  private setInitialState(): void {
    if (this.Aperto) {
      this.openAccordion(false); // false = senza animazione
    } else {
      this.closeAccordion(false); // false = senza animazione
    }
  }

  public toggleApriChiudi(): void {
    if (this.isAnimating) return;

    this.Aperto = !this.Aperto;
    
    if (this.Aperto) {
      this.openAccordion(true);
    } else {
      this.closeAccordion(true);
    }

    this.openStateChange.emit(this.Aperto);
  }

  private openAccordion(animate: boolean = true): void {
    if (!this.accordionContent || !this.accordionBody || !this.arrow) return;

    // Calcola l'altezza effettiva del contenuto
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
      
      // Anima l'apertura
      this.tl
        .to(body, {
          height: contentHeight,
          duration: 0.5,
          ease: "power2.out"
        })
        .to(arrow, {
          rotation: -90, // Freccia verso l'alto (aperto)
          duration: 0.4,
          ease: "power2.out"
        }, "<") // "<" significa che inizia contemporaneamente all'animazione precedente
        .set(body, { 
          height: 'auto', 
          overflow: 'visible' 
        }) // Alla fine imposta height: auto per la responsività
        .call(() => {
          this.isAnimating = false;
        });

      this.tl.play();
    } else {
      // Imposta direttamente senza animazione
      gsap.set(body, { height: 'auto', overflow: 'visible' });
      gsap.set(arrow, { rotation: -90 }); // Freccia verso l'alto
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
      
      // Anima la chiusura
      this.tl
        .to(body, {
          height: 0,
          duration: 0.5,
          ease: "power2.out"
        })
        .to(arrow, {
          rotation: 90, // Freccia verso il basso (chiuso)
          duration: 0.4,
          ease: "power2.out"
        }, "<")
        .call(() => {
          this.isAnimating = false;
        });

      this.tl.play();
    } else {
      // Imposta direttamente senza animazione
      gsap.set(body, { height: 0, overflow: 'hidden' });
      gsap.set(arrow, { rotation: 90, overflow: 'hidden' }); // Freccia verso il basso
    }
  }

  public refresh(event: any): void {
    // Implementazione per il refresh se necessaria
    this.refreshAccordion.emit(this.Key);
    event.stopPropagation();
  }
}

export enum ArrowPosition {
  NoArrow = 0,
  Left = 1,
  Right = 2
}