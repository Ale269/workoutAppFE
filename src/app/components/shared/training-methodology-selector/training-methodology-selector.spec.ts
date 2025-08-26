import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingMethodologySelectorComponent } from './training-methodology-selector';

describe('TrainingMethodologySelectorComponent', () => {
  let component: TrainingMethodologySelectorComponent;
  let fixture: ComponentFixture<TrainingMethodologySelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainingMethodologySelectorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrainingMethodologySelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
