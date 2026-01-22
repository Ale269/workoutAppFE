import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReorderWorkoutComponent } from './reorder-workout-component';

describe('ReorderExerciseComponent', () => {
  let component: ReorderWorkoutComponent;
  let fixture: ComponentFixture<ReorderWorkoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReorderWorkoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReorderWorkoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
