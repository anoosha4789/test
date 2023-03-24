import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { provideMockStore } from '@ngrx/store/testing';

import { SurefloStepperExGaugeDataComponent } from './sureflo-stepper-ex-gauge-data.component';

fdescribe('SurefloStepperExGaugeDataComponent', () => {
  let component: SurefloStepperExGaugeDataComponent;
  let fixture: ComponentFixture<SurefloStepperExGaugeDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SurefloStepperExGaugeDataComponent ],
      schemas:[CUSTOM_ELEMENTS_SCHEMA],
      imports:[FormsModule,ReactiveFormsModule,MatDialogModule,HttpClientTestingModule,MatSlideToggleModule],
      providers:[provideMockStore({})]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SurefloStepperExGaugeDataComponent);
    component = fixture.componentInstance;
    component.data ={
      Active:true,
      CalibrationFileName:"sdf",
      DeviceId:1,
      DeviceName:"ss",
      flowMeterPTMapping:{
        InletPressureSource:{
          DataPointIndex: 1,
          DataType:2,
          DeviceId:2,
          RawValue:3,
          ReadOnly:true,
          TagName:"ss0",
          UnitQuantityType:"sda",
          UnitSymbol:"asda",
          DataPointType:2
        },
        InletTemperatureSource:{
          DataPointIndex: 1,
          DataType:2,
          DeviceId:2,
          RawValue:3,
          ReadOnly:true,
          TagName:"ss0",
          UnitQuantityType:"sda",
          UnitSymbol:"asda",
          DataPointType:2
        },
        OutletPressureSource:{
          DataPointIndex: 1,
          DataType:2,
          DeviceId:2,
          RawValue:3,
          ReadOnly:true,
          TagName:"ss0",
          UnitQuantityType:"sda",
          UnitSymbol:"asda",
          DataPointType:2
        },
        OutletTemperatureSource:{
          DataPointIndex: 1,
          DataType:2,
          DeviceId:2,
          RawValue:3,
          ReadOnly:true,
          TagName:"ss0",
          UnitQuantityType:"sda",
          UnitSymbol:"asda",
          DataPointType:1
        },
        RemotePressureSource:{
          DataPointIndex: 1,
          DataType:2,
          DeviceId:2,
          RawValue:3,
          ReadOnly:true,
          TagName:"ss0",
          UnitQuantityType:"sda",
          UnitSymbol:"asda",
          DataPointType:2
        },
        RemoteTemperatureSource:{
          DataPointIndex: 1,
          DataType:2,
          DeviceId:2,
          RawValue:3,
          ReadOnly:true,
          TagName:"ss0",
          UnitQuantityType:"sda",
          UnitSymbol:"asda",
          DataPointType:1
        },
        UseRemoteGauge:true
      },
      FluidType:"DF",
      IsDirty:true,
      IsValid:true,
      Serial:"DF",
      Technology:"Sdf0",
      WellId:2,
      flowMeterDimensions: {ApplyDensityStaticCorrection:true,ApplyStaticCorrection: true,DensityStaticCorrection:1,InletDiameter:1,InletTolerance:1,OutletDiameter:1,OutletTolerance:1,RemoteDiameter:1,RemotePosition:"",RemoteTolerance:1,StaticCorrection:1},
      fluidPVTData: {CalculateDensity:true,
        CalculateViscosity:true,
        GasDensityCalibration:{
          CalibrationData:["asd"],
          FileName:"sf",
          UseFile:true
        },
        GasOilRatio:1,
        GasOilRatioCalibration:{CalibrationData:["ss"],FileName:"test",UseFile:true},
        OilDensityCalibration:{CalibrationData:["SD"],FileName:"test",UseFile:true},
        OilViscosityCalibration:{CalibrationData:["sa"],FileName:"test",UseFile:true},
        OilVolumeFactorCalibration:{CalibrationData:["D"],FileName:"test",UseFile:true},
        GasViscosityCalibration:{CalibrationData:["D"],FileName:"test",UseFile:true},
        GasVolumeFactorCalibration:{CalibrationData:["D"],FileName:"test",UseFile:true},
        OilSurfaceViscosity:1,
       // OilViscosityCalibration:{CalibrationData:[],FileName:"",UseFile:true},
        //OilVolumeFactorCalibration:{CalibrationData:[],FileName:"",UseFile:true},
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
     
    }
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
