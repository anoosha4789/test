import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { provideMockStore } from '@ngrx/store/testing';

import { SurefloStepperGaugeDataComponent } from './sureflo-stepper-gauge-data.component';

fdescribe('SurefloStepperGaugeDataComponent', () => {
  let component: SurefloStepperGaugeDataComponent;
  let fixture: ComponentFixture<SurefloStepperGaugeDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SurefloStepperGaugeDataComponent ],
      schemas:[CUSTOM_ELEMENTS_SCHEMA],
      imports:[FormsModule,ReactiveFormsModule,MatDialogModule,HttpClientTestingModule,MatSlideToggleModule],
      providers:[provideMockStore({})]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SurefloStepperGaugeDataComponent);
    component = fixture.componentInstance;
    let fluidPVTData =       {
      GasOilRatioCalibration:null,
      OilDensityCalibration:null,
      OilViscosityCalibration:null,
      OilVolumeFactorCalibration:null,
      UseCustomWaterProperties:true,
      WaterDensityCalibration:null,
      WaterViscosityCalibration:null,
      WaterVolumeFactorCalibration:null,
      OilDensity:2,
      OilFVF:2,
      OilViscosity:3,
      SolutionGOR:3,
      WaterDensity:3,
      WaterFVF:3,
      WaterSpecificGravity:4,
      WaterViscosity:1,
    };
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
        TemperatureSource:{
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
        ThroatPressureSource:{
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
       
        UseRemoteGauge:{
          DataPointIndex: 1,
          DataType:2,
          DeviceId:2,
          RawValue:3,
          ReadOnly:true,
          TagName:"ss0",
          UnitQuantityType:"sda",
          UnitSymbol:"asda",
          DataPointType:2
        }
      },
      FluidType:"DF",
      IsDirty:true,
      IsValid:true,
      Serial:"DF",
      Technology:"Sdf0",
      WellId:2,
      flowMeterDimensions: {LengthP1toP3:2,RGCPosition:3,ThroatDiameter:3,
        InletDiameter:1,RemoteDiameter:1,StaticCorrection:1},
      additionalParameters: {
        Deviation:2,
        CD:2,
        DeltaThreshold:3,
        DHWaterCutPercent:1,
        FrictionFactor:4,
        ProducedGasGravity:3,
        SurfaceWaterCutPercent:4,
      },
      fluidPVTData:null
    };
    // component.surefloPTForm = new FormGroup({
    //   InletPressureSource: new FormControl(null,),
    //   ThroatPressureSource: new FormControl(null,),
    //   TemperatureSource: new FormControl(null,),
    //   RemotePressureSource: new FormControl(null),
    //   UseRemoteGauge: new FormControl(false)
    // });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
