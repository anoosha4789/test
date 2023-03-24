import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { RouterTestingModule } from '@angular/router/testing';
import { ValidationService } from '@core/services/validation.service';

import { EfcvPositionsSettingsComponent } from './efcv-positions-settings.component';

fdescribe('EfcvPositionsSettingsComponent', () => {
  let component: EfcvPositionsSettingsComponent;
  let fixture: ComponentFixture<EfcvPositionsSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EfcvPositionsSettingsComponent ],
      imports:[ ReactiveFormsModule, MatFormFieldModule,RouterTestingModule],
      schemas:[CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        ValidationService,
        ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EfcvPositionsSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
