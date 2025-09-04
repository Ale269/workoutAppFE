import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateOrEditWorkoutExecution } from './create-or-edit-workout-execution';

describe('CreateOrEditWorkoutExecution', () => {
  let component: CreateOrEditWorkoutExecution;
  let fixture: ComponentFixture<CreateOrEditWorkoutExecution>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateOrEditWorkoutExecution]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateOrEditWorkoutExecution);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
