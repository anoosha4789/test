import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ValidationService } from '@core/services/validation.service';
import { provideMockStore } from '@ngrx/store/testing';

import { SurefloGeneralInformationComponent } from './sureflo-general-information.component';

fdescribe('SurefloGeneralInformationComponent', () => {
  let component: SurefloGeneralInformationComponent;
  let fixture: ComponentFixture<SurefloGeneralInformationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SurefloGeneralInformationComponent ],
      schemas:[CUSTOM_ELEMENTS_SCHEMA],
      imports:[FormsModule,ReactiveFormsModule,MatSelectModule,MatInputModule,BrowserAnimationsModule],
      providers:[provideMockStore({}),ValidationService]
      //   { provide: MAT_DIALOG_DATA, useValue: {} },]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SurefloGeneralInformationComponent);
    component = fixture.componentInstance;
    component.data = {
       "Active": true,
       "Serial": "string",
       "DeviceId": 1,
       "WellId": 1,
       "FluidType": "string",
       "Technology": "string",
       "DeviceName": "string",
       "CalibrationFileName": "string",
       IsDirty:true,
      IsValid:true
    }

    component.surefloGeneralInfoForm = new FormGroup({
      Name: new FormControl(''),
      Serial: new FormControl(''),
      FluidType: new FormControl(''), 
      Technology: new FormControl(''),
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
