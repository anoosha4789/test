import { DecimalPipe } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ValidationService } from '@core/services/validation.service';
import { GwNumberFormatterPipe } from '@shared/gateway-pipes/pipes/gw-number-formatter.pipe';

import { SurefloExAdditionalParamComponent } from './sureflo-ex-additional-param.component';

fdescribe('SurefloExAdditionalParamComponent', () => {
  let component: SurefloExAdditionalParamComponent;
  let fixture: ComponentFixture<SurefloExAdditionalParamComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SurefloExAdditionalParamComponent],
      imports:[FormsModule,ReactiveFormsModule],
      schemas:[CUSTOM_ELEMENTS_SCHEMA],
      providers:[GwNumberFormatterPipe,DecimalPipe,ValidationService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SurefloExAdditionalParamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
