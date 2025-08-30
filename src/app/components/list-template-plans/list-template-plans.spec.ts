import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListTemplatePlans } from './list-template-plans';

describe('ListTemplatePlans', () => {
  let component: ListTemplatePlans;
  let fixture: ComponentFixture<ListTemplatePlans>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListTemplatePlans]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListTemplatePlans);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
