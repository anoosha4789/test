import { DecimalPipe } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ValidationService } from '@core/services/validation.service';
import { GwNumberFormatterPipe } from '@shared/gateway-pipes/pipes/gw-number-formatter.pipe';

import { SurefloGaugeDataComponent } from './sureflo-gauge-data.component';

describe('SurefloGaugeDataComponent', () => {
  let component: SurefloGaugeDataComponent;
  let fixture: ComponentFixture<SurefloGaugeDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SurefloGaugeDataComponent ],
      schemas:[CUSTOM_ELEMENTS_SCHEMA],
      imports:[FormsModule,ReactiveFormsModule],
      providers:[GwNumberFormatterPipe,DecimalPipe,ValidationService]

    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SurefloGaugeDataComponent);
    component = fixture.componentInstance;
    component.data={    fluidType: "wasd",
      technology: "string",
      calibrationFileName: "string",
      flowMeterDimensions: {InletDiameter:2, LengthP1toP3:3,RemoteDiameter:5,RGCPosition:3,StaticCorrection:2,ThroatDiameter:3},
      fluidPVTData: { OilDensity:2,OilFVF:3,OilViscosity:3,SolutionGOR:3,WaterDensity:3,WaterFVF:3,WaterSpecificGravity:3,WaterViscosity:3,
        GasOilRatioCalibration:{CalibrationData:[],FileName:"",UseFile:true},
        OilDensityCalibration:{CalibrationData:[],FileName:"",UseFile:true},
        OilViscosityCalibration:{CalibrationData:[],FileName:"",UseFile:true},
        OilVolumeFactorCalibration:{CalibrationData:[],FileName:"",UseFile:true},
        UseCustomWaterProperties:true,
        WaterDensityCalibration:{CalibrationData:[],FileName:"",UseFile:true},
        WaterViscosityCalibration:{CalibrationData:[],FileName:"",UseFile:true},
        WaterVolumeFactorCalibration:{CalibrationData:[],FileName:"",UseFile:true},},
      additionalParameters: {
        CD:2,DeltaThreshold:3,Deviation:3,DHWaterCutPercent:3,FrictionFactor:3,ProducedGasGravity:3,SurfaceWaterCutPercent:3
      },
      useRemoteGauge: true,
      IsValid: true,
      IsDirty: true
    }
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
