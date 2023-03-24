import { DecimalPipe } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ValidationService } from '@core/services/validation.service';
import { GwNumberFormatterPipe } from '@shared/gateway-pipes/pipes/gw-number-formatter.pipe';

import { SurefloAdditionalParamComponent } from './sureflo-additional-param.component';

fdescribe('SurefloAdditionalParamComponent', () => {
  let component: SurefloAdditionalParamComponent;
  let fixture: ComponentFixture<SurefloAdditionalParamComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SurefloAdditionalParamComponent ],
      imports:[FormsModule,ReactiveFormsModule,MatInputModule,BrowserAnimationsModule],
      schemas:[CUSTOM_ELEMENTS_SCHEMA],
      providers:[GwNumberFormatterPipe,DecimalPipe,ValidationService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SurefloAdditionalParamComponent);
    component = fixture.componentInstance;
    component.data = {
      fluidType: "string",
      technology: "string",
      calibrationFileName: "string",
      flowMeterDimensions: {InletDiameter:1,RemoteDiameter:1,StaticCorrection:1,LengthP1toP3:2,RGCPosition:2,ThroatDiameter:2},
      fluidPVTData: {
        GasOilRatioCalibration:{CalibrationData:["ss"],FileName:"test",UseFile:true},
        OilDensityCalibration:{CalibrationData:["SD"],FileName:"test",UseFile:true},
        OilViscosityCalibration:{CalibrationData:["sa"],FileName:"test",UseFile:true},
        OilVolumeFactorCalibration:{CalibrationData:["D"],FileName:"test",UseFile:true},
        UseCustomWaterProperties:true,
        WaterDensityCalibration:{CalibrationData:["S"],FileName:"test",UseFile:true},
        WaterViscosityCalibration:{CalibrationData:["SD"],FileName:"tee",UseFile:true},
        WaterVolumeFactorCalibration:{CalibrationData:["asd"],FileName:"eee",UseFile:true},
        OilDensity:1,
        OilFVF:3,
        OilViscosity:3,
        SolutionGOR:3,
        WaterDensity:3,
        WaterFVF:3,
        WaterSpecificGravity:1,
        WaterViscosity:2
      },
      additionalParameters: {
        Deviation:2,
        CD:4,
        DeltaThreshold:2,
        DHWaterCutPercent:3,
        FrictionFactor:2,
        ProducedGasGravity:3,
        SurfaceWaterCutPercent:3
      },
      useRemoteGauge: true,
      IsValid: true,
      IsDirty: true,
     };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
