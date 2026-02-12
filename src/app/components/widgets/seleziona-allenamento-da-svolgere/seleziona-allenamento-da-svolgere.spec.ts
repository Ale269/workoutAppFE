import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelezionaAllenamentoDaSvolgere } from './seleziona-allenamento-da-svolgere';

describe('SelezionaAllenamentoDaSvolgere', () => {
  let component: SelezionaAllenamentoDaSvolgere;
  let fixture: ComponentFixture<SelezionaAllenamentoDaSvolgere>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelezionaAllenamentoDaSvolgere]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelezionaAllenamentoDaSvolgere);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
