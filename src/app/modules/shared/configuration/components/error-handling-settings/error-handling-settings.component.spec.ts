import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { ValidationService } from '@core/services/validation.service';
import { provideMockStore } from '@ngrx/store/testing';

import { ErrorHandlingSettingsComponent } from './error-handling-settings.component';

fdescribe('ErrorHandlingSettingsComponent', () => {
  let component: ErrorHandlingSettingsComponent;
  let fixture: ComponentFixture<ErrorHandlingSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ErrorHandlingSettingsComponent ],
      imports:[ReactiveFormsModule,RouterTestingModule],
      schemas:[CUSTOM_ELEMENTS_SCHEMA],
      providers:[provideMockStore({}),ValidationService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ErrorHandlingSettingsComponent);
    component = fixture.componentInstance;
    fixture.componentInstance.ngOnInit();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
