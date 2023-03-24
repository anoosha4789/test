import { DecimalPipe } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ValidationService } from '@core/services/validation.service';
import { GwNumberFormatterPipe } from '@shared/gateway-pipes/pipes/gw-number-formatter.pipe';

import { SurefloExFilterParmComponent } from './sureflo-ex-filter-parm.component';

fdescribe('SurefloExFilterParmComponent', () => {
  let component: SurefloExFilterParmComponent;
  let fixture: ComponentFixture<SurefloExFilterParmComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SurefloExFilterParmComponent ],
      schemas:[CUSTOM_ELEMENTS_SCHEMA],
      imports: [FormsModule,ReactiveFormsModule],
      providers:[GwNumberFormatterPipe,DecimalPipe,ValidationService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SurefloExFilterParmComponent);
    component = fixture.componentInstance;
    component.data = {
      fluidType: "string",
      technology: "string",
      calibrationFileName: "string",
      flowMeterDimensions: {ApplyDensityStaticCorrection:true,ApplyStaticCorrection: true,DensityStaticCorrection:1,InletDiameter:1,InletTolerance:1,OutletDiameter:1,OutletTolerance:1,RemoteDiameter:1,RemotePosition:"",RemoteTolerance:1,StaticCorrection:1},
      fluidPVTData: {CalculateDensity:true,
        CalculateViscosity:true,
        GasDensityCalibration:{CalibrationData:["D"],FileName:"test",UseFile:true},
        GasOilRatio:1,
        GasOilRatioCalibration:{CalibrationData:["D"],FileName:"test",UseFile:true},
        GasViscosityCalibration:{CalibrationData:["D"],FileName:"test",UseFile:true},
        GasVolumeFactorCalibration:{CalibrationData:["D"],FileName:"test",UseFile:true},
        OilDensityCalibration:{CalibrationData:["D"],FileName:"test",UseFile:true},
        OilSurfaceViscosity:1,
        OilViscosityCalibration:{CalibrationData:["D"],FileName:"test",UseFile:true},
        OilVolumeFactorCalibration:{CalibrationData:["D"],FileName:"test",UseFile:true},
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
    }
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
