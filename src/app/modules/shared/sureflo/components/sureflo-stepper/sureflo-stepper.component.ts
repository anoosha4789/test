import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatStepper } from '@angular/material/stepper';
import { DeviceDataPointsFacade } from '@core/facade/deviceDataPointsFacade.service';
import { SureFLOFlowMeterUIModel } from '@core/models/UIModels/sureflo.model';
import { FlowMeterTypes } from '@core/models/webModels/SureFLODataModel.model';
import { UtilityService } from '@core/services/utility.service';
import { SurefloGeneralInformationComponent } from '@shared/sureflo/components/sureflo-general-information/sureflo-general-information.component';
import { SurefloStepperExGaugeDataComponent } from '@shared/sureflo/components/sureflo-stepper-ex-gauge-data/sureflo-stepper-ex-gauge-data.component';
import { SurefloStepperGaugeDataComponent } from '@shared/sureflo/components/sureflo-stepper-gauge-data/sureflo-stepper-gauge-data.component';


@Component({
  selector: 'sureflo-stepper',
  templateUrl: './sureflo-stepper.component.html',
  styleUrls: ['./sureflo-stepper.component.scss']
})
export class SurefloStepperComponent implements OnInit, AfterViewInit {

  @ViewChild('surefloStepper', { static: false }) surefloStepper: MatStepper;
  @ViewChild('surefloGenInfo', { static: false }) surefloGenInfo: SurefloGeneralInformationComponent;
  @ViewChild('surefloGaugeData', { static: false }) surefloGaugeData: SurefloStepperGaugeDataComponent;
  @ViewChild('surefloExGaugeData', { static: false }) surefloExGaugeData: SurefloStepperExGaugeDataComponent;
  
  @Input() flowMeterData: SureFLOFlowMeterUIModel;
  @Output() isFormValidEvent = new EventEmitter();
  @Output() onFlowMeterDataChange = new EventEmitter();
  @Output() onStepperSelChange = new EventEmitter();

  @Input() set selectedIndex(value: number) {
    this._selectedIndex = value;
    if(this.surefloStepper) {
      this.setActiveStep();
    }
  };

  get selectedIndex(): number { return this._selectedIndex; }

  isSureflo298EXSelected = false;
  private _selectedIndex: number;
  isLinear = true;
  completed: boolean = false;
  state: string;
  data: SureFLOFlowMeterUIModel;
  stepperData : stepperData;
  
  steps = [
    {
      'label': 'step1',
      'state': 'number',
      'completed': false
    },
    {
      'label': 'step2',
      'state': 'number',
      'completed': false
    }
  ];

  constructor(private utilityService: UtilityService, private deviceDataPointsFacade: DeviceDataPointsFacade) { }

  // Sureflo => General Information
  get step1() {
    if (this.surefloGenInfo?.surefloGeneralInfoForm) {
      this.isFormValidEvent.emit(this.surefloGenInfo.surefloGeneralInfoForm.valid);
      this.stepperData = {
        activeIdx: 0,
        deviceId: this.flowMeterData ? this.flowMeterData.DeviceId : -1
      };
    }
    this.utilityService.setSurefloStepperData(this.stepperData);
    return this.surefloGenInfo ? this.surefloGenInfo.surefloGeneralInfoForm : null;
  }

  // Sureflo => Gauge Data
  get step2() {
    
    this.isSureflo298EXSelected = this.flowMeterData?.Technology && parseInt(this.flowMeterData.Technology) === FlowMeterTypes.SureFLO298EX ? true : false;
    if(this.isSureflo298EXSelected) {
      if (this.surefloExGaugeData?.surefloPTForm) {
        const isFormValid =  this.surefloExGaugeData.surefloPTForm.valid && this.flowMeterData?.CalibrationFileName !== null; 
        this.isFormValidEvent.emit(isFormValid);
          this.stepperData = {
            activeIdx: 1,
            deviceId: this.flowMeterData ? this.flowMeterData.DeviceId : -1
          };
        }
        this.utilityService.setSurefloStepperData(this.stepperData);
        return this.surefloExGaugeData ? this.surefloExGaugeData.surefloPTForm : null;
    } else {
      if (this.surefloGaugeData?.surefloPTForm) {
        const isFormValid =  this.surefloGaugeData.surefloPTForm.valid && this.flowMeterData?.CalibrationFileName !== null; 
        this.isFormValidEvent.emit(isFormValid);
          this.stepperData = {
            activeIdx: 1,
            deviceId: this.flowMeterData ? this.flowMeterData.DeviceId : -1
          };
        }
        this.utilityService.setSurefloStepperData(this.stepperData);
        return this.surefloGaugeData ? this.surefloGaugeData.surefloPTForm : null;

    }
    
  }

  goBack(stepper: MatStepper) {
    stepper.previous();
  }

  goForward(stepper: MatStepper) {
    stepper.next();
  }

  selectionChange(event) {
    if (this.isSureflo298EXSelected) {
      this.steps[event.previouslySelectedIndex].state = event.previouslySelectedIndex === 1 ? (this.surefloExGaugeData?.surefloPTForm.valid ? 'done' : 'number') : 'done';
      this.steps[event.previouslySelectedIndex].completed = event.previouslySelectedIndex === 1 ? (this.surefloExGaugeData?.surefloPTForm.valid ? true : false) : true;
    } else {
      this.steps[event.previouslySelectedIndex].state = event.previouslySelectedIndex === 1 ? (this.surefloGaugeData?.surefloPTForm.valid ? 'done' : 'number') : 'done';
      this.steps[event.previouslySelectedIndex].completed = event.previouslySelectedIndex === 1 ? (this.surefloGaugeData?.surefloPTForm.valid ? true : false) : true;
    }
    
    this.steps[event.selectedIndex].state = 'none';
    this.steps[event.selectedIndex].completed = false;
    if (event.selectedIndex !== this.steps.length-1) {
      this.state="";
    }
    this.onStepperSelChange.emit(event.selectedIndex);
  }

  updateFlowMeterData(data: SureFLOFlowMeterUIModel) {
    this.flowMeterData = data; 
    this.onFlowMeterDataChange.emit(this.flowMeterData);
  }
  
  resetStepper(): void {
    if(this.surefloStepper) {
      this.surefloStepper.reset();
      this.surefloStepper.selectedIndex = 0;
    }
  }

  setActiveStep() {
    this.surefloStepper.selectedIndex = this._selectedIndex;
  }

  ngAfterViewInit(): void {
    // this.setActiveStep();
  }

  ngOnInit(): void {
    this.resetStepper();
    this.deviceDataPointsFacade.initDeviceDataPoints();
  }

}

export interface stepperData {
  activeIdx: number,
  deviceId: number
}

