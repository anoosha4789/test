import { DecimalPipe } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { ValidationService } from '@core/services/validation.service';
import { GwNumberFormatterPipe } from '@shared/gateway-pipes/pipes/gw-number-formatter.pipe';

import { SurefloExGaugeDataComponent } from './sureflo-ex-gauge-data.component';

fdescribe('SurefloExGaugeDataComponent', () => {
  let component: SurefloExGaugeDataComponent;
  let fixture: ComponentFixture<SurefloExGaugeDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SurefloExGaugeDataComponent ],
      schemas:[CUSTOM_ELEMENTS_SCHEMA],
      imports:[FormsModule,ReactiveFormsModule,MatRadioModule],
      providers:[GwNumberFormatterPipe,DecimalPipe,ValidationService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SurefloExGaugeDataComponent);
    component = fixture.componentInstance;
    component.data ={
      fluidType: "string",
      technology: "string",
      calibrationFileName: "string",
      flowMeterDimensions: {ApplyDensityStaticCorrection:true,ApplyStaticCorrection: true,DensityStaticCorrection:1,InletDiameter:1,InletTolerance:1,OutletDiameter:1,OutletTolerance:1,RemoteDiameter:1,RemotePosition:"",RemoteTolerance:1,StaticCorrection:1},
      fluidPVTData: {
        CalculateDensity:true,
        CalculateViscosity:true,
        GasDensityCalibration:{CalibrationData:[],FileName:"",UseFile:true},
        GasOilRatio:1,
        GasOilRatioCalibration:{CalibrationData:[],FileName:"",UseFile:true},
        GasViscosityCalibration:{CalibrationData:[],FileName:"",UseFile:true},
        GasVolumeFactorCalibration:{CalibrationData:[],FileName:"",UseFile:true},
        OilDensityCalibration:{CalibrationData:[],FileName:"",UseFile:true},
        OilSurfaceViscosity:1,
        OilViscosityCalibration:{CalibrationData:[],FileName:"",UseFile:true},
        OilVolumeFactorCalibration:{CalibrationData:[],FileName:"",UseFile:true},
        SpecificGravityGas:1,
        SpecificGravityOil:1,
        SpecificGravityWater:1,
        UseCustomGasProperties:true,
        UseCustomOilProperties:true,
        UseCustomWaterProperties:true,
        WaterDensityCalibration:{CalibrationData:[],FileName:"",UseFile:true},
        WaterViscosityCalibration:{CalibrationData:[],FileName:"",UseFile:true},
        WaterVolumeFactorCalibration:{CalibrationData:[],FileName:"",UseFile:true},
      },
      additionalParameters: {
        CoefficientExpansion:2,
        Deviation:2,
        EmulsificationStability:2,
        MeasuredDepth:44,
        RoughnessFactor:5,
        SurfaceWaterCut:3,
        TrueVerticalDepth:3,
        WaterCutInversion:3
      },
      filterParameters: {
        FlowBufferLeftWeight:2,
        FlowBufferOrder:2,
        FlowBufferRightWeight:2,
        PTBufferLeftWeight:2,
        PTBufferOrder:2,
        PTBufferRightWeight:3,
        ThresholdHigh:2,
        ThresholdLow:2
      },
      useRemoteGauge: true,
      IsValid: true,
      IsDirty: true,
    };
    // component.surefloExGaugeForm = new FormGroup({});
    // component.surefloExGaugeForm.addControl('RemotePosition', new FormControl('Downstream'));
    // component.surefloExGaugeForm.addControl('InletDiameter', new FormControl('Downstream'));
    // component.surefloExGaugeForm.addControl('OutletDiameter', new FormControl('Downstream'));
    // component.surefloExGaugeForm.addControl('RemoteDiameter', new FormControl('Downstream'));
    // component.surefloExGaugeForm.addControl('InletTolerance', new FormControl('Downstream'));
    // component.surefloExGaugeForm.addControl('OutletTolerance', new FormControl('Downstream'));
    // component.surefloExGaugeForm.addControl('StaticCorrection', new FormControl('Downstream'));
    // component.surefloExGaugeForm.addControl('RemoteTolerance', new FormControl('Downstream'));
    // component.surefloExGaugeForm.addControl('DensityStaticCorrection', new FormControl('Downstream'));
    // component.surefloExGaugeForm.addControl('ApplyStaticCorrection', new FormControl('Downstream'));
    // component.surefloExGaugeForm.addControl('ApplyDensityStaticCorrection', new FormControl('Downstream'));
    // component.surefloExGaugeForm.addControl('RemotePosition', new FormControl('Downstream'));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
