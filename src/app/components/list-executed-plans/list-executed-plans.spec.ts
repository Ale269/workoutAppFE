import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListExecutedPlans } from './list-executed-plans';

describe('ListExecutedPlans', () => {
  let component: ListExecutedPlans;
  let fixture: ComponentFixture<ListExecutedPlans>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListExecutedPlans]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListExecutedPlans);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
