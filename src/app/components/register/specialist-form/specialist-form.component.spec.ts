import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecialistFormComponent } from './specialist-form.component';

describe('SpecialistFormComponent', () => {
  let component: SpecialistFormComponent;
  let fixture: ComponentFixture<SpecialistFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpecialistFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpecialistFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
