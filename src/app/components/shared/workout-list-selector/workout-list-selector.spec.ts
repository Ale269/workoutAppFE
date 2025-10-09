import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkoutListSelector } from './workout-list-selector';

describe('WorkoutListSelector', () => {
  let component: WorkoutListSelector;
  let fixture: ComponentFixture<WorkoutListSelector>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkoutListSelector]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkoutListSelector);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
