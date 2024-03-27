import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateFaceComponent } from './update-face.component';

describe('UpdateFaceComponent', () => {
  let component: UpdateFaceComponent;
  let fixture: ComponentFixture<UpdateFaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateFaceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateFaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
