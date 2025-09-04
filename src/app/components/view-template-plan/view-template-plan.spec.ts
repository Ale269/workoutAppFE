import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewTemplatePlan } from './view-template-plan';

describe('ViewTemplatePlan', () => {
  let component: ViewTemplatePlan;
  let fixture: ComponentFixture<ViewTemplatePlan>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewTemplatePlan]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewTemplatePlan);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
