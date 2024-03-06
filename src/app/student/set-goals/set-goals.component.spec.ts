import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetGoalsComponent } from './set-goals.component';

describe('SetGoalsComponent', () => {
  let component: SetGoalsComponent;
  let fixture: ComponentFixture<SetGoalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SetGoalsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SetGoalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
