import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';

import { GwErrorNotifierComponent } from './gw-error-notifier.component';

fdescribe('GwErrorNotifierComponent', () => {
  let component: GwErrorNotifierComponent;
  let fixture: ComponentFixture<GwErrorNotifierComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GwErrorNotifierComponent ],
      imports:[MatDialogModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GwErrorNotifierComponent);
    component = fixture.componentInstance;
    component.errorsList = [];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
