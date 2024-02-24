import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffEnrollComponent } from './staff-enroll.component';

describe('StaffEnrollComponent', () => {
  let component: StaffEnrollComponent;
  let fixture: ComponentFixture<StaffEnrollComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StaffEnrollComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StaffEnrollComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
