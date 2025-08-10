import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomTabContainer } from './custom-tab-container';

describe('CustomTabContainer', () => {
  let component: CustomTabContainer;
  let fixture: ComponentFixture<CustomTabContainer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomTabContainer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomTabContainer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
