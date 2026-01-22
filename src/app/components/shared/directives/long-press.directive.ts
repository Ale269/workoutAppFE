import {
  Directive,
  EventEmitter,
  HostListener,
  Output,
  Input,
} from '@angular/core';

@Directive({
  selector: '[appLongPress]',
  standalone: true,
})
export class LongPressDirective {
  @Output() mouseLongPress = new EventEmitter<Event>();
  @Input() duration: number = 500;
  @Input() threshold: number = 30;

  private pressTimeout: any;
  private isPressed = false;

  // Coordinate iniziali del tocco
  private startX = 0;
  private startY = 0;

  constructor() { }

  @HostListener('mousedown', ['$event'])
  @HostListener('touchstart', ['$event'])
  onPress(event: Event): void {
    this.isPressed = true;

    // Se è un evento touch, salviamo le coordinate iniziali
    if (event instanceof TouchEvent) {
      this.startX = event.touches[0].clientX;
      this.startY = event.touches[0].clientY;
    } else if (event instanceof MouseEvent) {
      // Opzionale: gestire anche il movimento del mouse se necessario
      this.startX = event.clientX;
      this.startY = event.clientY;
    }

    this.pressTimeout = setTimeout(() => {
      if (this.isPressed) {
        this.mouseLongPress.emit(event);
      }
    }, this.duration);
  }

  // Ascoltiamo il movimento per rilevare lo scroll
  @HostListener('touchmove', ['$event'])
  @HostListener('mousemove', ['$event'])
  onMove(event: Event): void {
    if (!this.isPressed) return;

    let x = 0;
    let y = 0;

    // Estraiamo le coordinate correnti
    if (event instanceof TouchEvent) {
      x = event.touches[0].clientX;
      y = event.touches[0].clientY;
    } else if (event instanceof MouseEvent) {
      x = event.clientX;
      y = event.clientY;
    }

    // Calcoliamo la distanza percorsa (delta)
    const deltaX = Math.abs(x - this.startX);
    const deltaY = Math.abs(y - this.startY);

    // Se il movimento supera la soglia, è uno scroll o un trascinamento: annulla tutto
    if (deltaX > this.threshold || deltaY > this.threshold) {
      this.cancel();
    }
  }

  @HostListener('contextmenu', ['$event'])
  onContextMenu(event: Event): void {
    // Questo blocca il menu a comparsa (tasto destro / long tap)
    event.preventDefault();
    event.stopPropagation();
  }

  @HostListener('mouseup')
  @HostListener('mouseleave')
  @HostListener('touchend')
  onRelease(): void {
    this.cancel();
  }

  // Metodo helper per pulire lo stato
  private cancel(): void {
    this.isPressed = false;
    clearTimeout(this.pressTimeout);
  }
}