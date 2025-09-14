import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProssimoAllenamento } from './prossimo-allenamento';

describe('ProssimoAllenamento', () => {
  let component: ProssimoAllenamento;
  let fixture: ComponentFixture<ProssimoAllenamento>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProssimoAllenamento]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProssimoAllenamento);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
