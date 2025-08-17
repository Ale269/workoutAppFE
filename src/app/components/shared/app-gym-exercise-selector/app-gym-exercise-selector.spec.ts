import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GymExerciseSelectorComponent } from './app-gym-exercise-selector';

describe('AppGymExerciseSelector', () => {
  let component: GymExerciseSelectorComponent;
  let fixture: ComponentFixture<GymExerciseSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GymExerciseSelectorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GymExerciseSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
