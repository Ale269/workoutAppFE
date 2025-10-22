import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListExecutedWorkouts } from './list-executed-workouts';

describe('ListExecutedWorkouts', () => {
  let component: ListExecutedWorkouts;
  let fixture: ComponentFixture<ListExecutedWorkouts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListExecutedWorkouts]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListExecutedWorkouts);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
