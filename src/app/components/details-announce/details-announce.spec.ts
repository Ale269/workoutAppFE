import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsAnnounce } from './details-announce';

describe('DetailsAnnounce', () => {
  let component: DetailsAnnounce;
  let fixture: ComponentFixture<DetailsAnnounce>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsAnnounce]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailsAnnounce);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
