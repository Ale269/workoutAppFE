import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewDataExecutedWorkout } from './view-data-executed-workout';

describe('ViewDataExecutedWorkout', () => {
  let component: ViewDataExecutedWorkout;
  let fixture: ComponentFixture<ViewDataExecutedWorkout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewDataExecutedWorkout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewDataExecutedWorkout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
