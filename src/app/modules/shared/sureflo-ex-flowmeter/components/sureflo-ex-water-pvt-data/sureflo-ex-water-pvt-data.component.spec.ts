import { DecimalPipe } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ValidationService } from '@core/services/validation.service';
import { GwDisableControlDirective } from '@shared/gateway-directives/directives/gw-disable-control.directive';
import { GwNumberFormatterPipe } from '@shared/gateway-pipes/pipes/gw-number-formatter.pipe';

import { SurefloExWaterPvtDataComponent } from './sureflo-ex-water-pvt-data.component';

fdescribe('SurefloExWaterPvtDataComponent', () => {
  let component: SurefloExWaterPvtDataComponent;
  let fixture: ComponentFixture<SurefloExWaterPvtDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SurefloExWaterPvtDataComponent ,GwDisableControlDirective],
      schemas:[CUSTOM_ELEMENTS_SCHEMA],
      imports:[FormsModule,ReactiveFormsModule,MatSlideToggleModule],
      providers:[GwNumberFormatterPipe,DecimalPipe,ValidationService]

    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SurefloExWaterPvtDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
