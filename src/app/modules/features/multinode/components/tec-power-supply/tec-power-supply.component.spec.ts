import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { ValidationService } from '@core/services/validation.service';

import { TecPowerSupplyComponent } from './tec-power-supply.component';

fdescribe('TecPowerSupplyComponent', () => {
  let component: TecPowerSupplyComponent;
  let fixture: ComponentFixture<TecPowerSupplyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TecPowerSupplyComponent ],
      schemas:[CUSTOM_ELEMENTS_SCHEMA],
      imports:[FormsModule,ReactiveFormsModule,RouterTestingModule],
      providers:[ValidationService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TecPowerSupplyComponent);
    component = fixture.componentInstance;
    component.wellName = "test"
    component.tecPowerSupplyData ={
      MaxCurrent:3,
      MaxVoltage:2,
      RampRate:3,
      SettleRampRate:3,
      SettleVoltage:3,
      TargetVoltage:4
    }
    fixture.detectChanges(false);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
