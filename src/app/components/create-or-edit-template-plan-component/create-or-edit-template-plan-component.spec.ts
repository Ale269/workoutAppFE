import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateOrEditTemplatePlanComponent } from './create-or-edit-template-plan-component';

describe('CreateOrEditTemplatePlanComponent', () => {
  let component: CreateOrEditTemplatePlanComponent;
  let fixture: ComponentFixture<CreateOrEditTemplatePlanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateOrEditTemplatePlanComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateOrEditTemplatePlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
