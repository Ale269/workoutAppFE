import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchedaCorrente } from './scheda-corrente';

describe('SchedaCorrente', () => {
  let component: SchedaCorrente;
  let fixture: ComponentFixture<SchedaCorrente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SchedaCorrente]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SchedaCorrente);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
