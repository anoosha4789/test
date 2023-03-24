import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';

import { SurefloStepperComponent } from './sureflo-stepper.component';

fdescribe('SurefloStepperComponent', () => {
  let component: SurefloStepperComponent;
  let fixture: ComponentFixture<SurefloStepperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SurefloStepperComponent ],
      schemas:[CUSTOM_ELEMENTS_SCHEMA],
      imports:[HttpClientTestingModule],
      providers:[provideMockStore({})]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SurefloStepperComponent);
    component = fixture.componentInstance;
    component.flowMeterData ={
      Active:true,
      CalibrationFileName:"name",
      DeviceId:1,
      DeviceName:"name",
      FluidType:"test",
      IsDirty:true,
      IsValid:true,
      Serial:"test",
      Technology:"test",
      WellId:1
    }
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
