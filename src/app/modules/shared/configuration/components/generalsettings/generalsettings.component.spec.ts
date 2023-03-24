import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { ValidationService } from '@core/services/validation.service';
import { provideMockStore } from '@ngrx/store/testing';

import { GeneralSettingsComponent } from './generalsettings.component';

fdescribe('GenaralsettingsComponent', () => {
  let component: GeneralSettingsComponent;
  let fixture: ComponentFixture<GeneralSettingsComponent>;
  const formBuilder: FormBuilder = new FormBuilder();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GeneralSettingsComponent ],
      imports:[ReactiveFormsModule,MatTooltipModule,HttpClientTestingModule,RouterTestingModule,MatSelectModule,MatFormFieldModule,MatInputModule,BrowserAnimationsModule],
      schemas:[CUSTOM_ELEMENTS_SCHEMA],
      providers:[provideMockStore({}),ValidationService,
        { provide: FormBuilder, useValue: formBuilder } ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneralSettingsComponent);
    component = fixture.componentInstance;
    component.panelConfiguration = {
      "Id": 1,
      "PanelTypeId": 6,
      "SerialNumber": "admin",
      "CustomerName": "bhieng",
      "FieldName": "asd",
      "isPageVisited": false
  };
  component.panelConfigForm = formBuilder.group({
    'PanelTypeId':['PanelTypeId'],
    'SerialNumber':['SerialNumber'],
    'CustomerName':['CustomerName'],
    'FieldName':['FieldName']
  })
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
