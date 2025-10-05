import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoBackEnd } from './info-back-end';

describe('InfoBackEnd', () => {
  let component: InfoBackEnd;
  let fixture: ComponentFixture<InfoBackEnd>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoBackEnd]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InfoBackEnd);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
