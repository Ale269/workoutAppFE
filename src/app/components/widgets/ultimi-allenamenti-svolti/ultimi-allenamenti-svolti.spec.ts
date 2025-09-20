import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UltimiAllenamentiSvolti } from './ultimi-allenamenti-svolti';

describe('UltimiAllenamentiSvolti', () => {
  let component: UltimiAllenamentiSvolti;
  let fixture: ComponentFixture<UltimiAllenamentiSvolti>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UltimiAllenamentiSvolti]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UltimiAllenamentiSvolti);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
