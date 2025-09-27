import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UltimeSchedeSvolte } from './ultime-schede-svolte';

describe('UltimeSchedeSvolte', () => {
  let component: UltimeSchedeSvolte;
  let fixture: ComponentFixture<UltimeSchedeSvolte>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UltimeSchedeSvolte]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UltimeSchedeSvolte);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
