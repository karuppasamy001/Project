import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintResultComponent } from './print-result.component';

describe('PrintResultComponent', () => {
  let component: PrintResultComponent;
  let fixture: ComponentFixture<PrintResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrintResultComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrintResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
