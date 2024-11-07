import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PacientFormComponent } from './pacient-form.component';

describe('PacientFormComponent', () => {
  let component: PacientFormComponent;
  let fixture: ComponentFixture<PacientFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PacientFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PacientFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
