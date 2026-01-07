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
  @Output() mouseLongPress = new EventEmitter();
  @Input() duration: number = 500; // Durata in ms per il long press

  private pressTimeout: any;
  private isPressed = false;

  constructor() {}

  @HostListener('mousedown', ['$event'])
  @HostListener('touchstart', ['$event'])
  onPress(event: Event): void {
    // Evita conflitti con click normali se necessario
    // event.preventDefault(); 
    this.isPressed = true;
    this.pressTimeout = setTimeout(() => {
      if (this.isPressed) {
        this.mouseLongPress.emit(event);
      }
    }, this.duration);
  }

  @HostListener('mouseup')
  @HostListener('mouseleave')
  @HostListener('touchend')
  onRelease(): void {
    this.isPressed = false;
    clearTimeout(this.pressTimeout);
  }
}