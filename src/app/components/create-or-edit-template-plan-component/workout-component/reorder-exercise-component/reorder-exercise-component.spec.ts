import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReorderExerciseComponent } from './reorder-exercise-component';

describe('ReorderExerciseComponent', () => {
  let component: ReorderExerciseComponent;
  let fixture: ComponentFixture<ReorderExerciseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReorderExerciseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReorderExerciseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
