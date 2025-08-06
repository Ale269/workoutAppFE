import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiOptionButton } from './multi-option-button';

describe('MultiOptionButton', () => {
  let component: MultiOptionButton;
  let fixture: ComponentFixture<MultiOptionButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultiOptionButton]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MultiOptionButton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
