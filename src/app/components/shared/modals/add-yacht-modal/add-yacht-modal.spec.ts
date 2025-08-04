import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddYachtModal } from './add-yacht-modal';

describe('AddYachtModal', () => {
  let component: AddYachtModal;
  let fixture: ComponentFixture<AddYachtModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddYachtModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddYachtModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
