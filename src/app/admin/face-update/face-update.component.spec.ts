import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaceUpdateComponent } from './face-update.component';

describe('FaceUpdateComponent', () => {
  let component: FaceUpdateComponent;
  let fixture: ComponentFixture<FaceUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FaceUpdateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FaceUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
