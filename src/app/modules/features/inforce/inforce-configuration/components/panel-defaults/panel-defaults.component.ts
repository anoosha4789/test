import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AlarmsAndLimitsUIModel, FlowmeterTransmitterUIModel, PanelDefaultUIModel } from '@core/models/UIModels/panel-default.model';
import { ValidationService } from '@core/services/validation.service';
import { Store } from '@ngrx/store';
import { StateUtilities } from '@store/state/IState';
import { IPanelDefaultState } from '@store/state/panel-default.state';
import { IAlarmsAndLimitsState, initialAlarmsAndLimitsState } from '@store/state/alarms-and-limits.state';
import * as PANEL_DEFAULT_ACTIONS from '@store/actions/panel-default.action';
import * as ALARMS_AND_LIMITS_ACTIONS from '@store/actions/alarms-and-limits.action';
import * as FLOWMETER_TRASMITTER_ACTIONS from '@store/actions/flowmeterTransmitter.action';
import * as SHIFT_DEFAULTS_ACTIONS from '@store/actions/shift-default.action';
import * as WELL_ACTIONS from '@store/actions/well.entity.action';
import { Observable, Subscription } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
import { AlarmsAndLimitsModelSchema, PanelDefaultModelSchema } from '@core/models/schemaModels/PanelDefaultsDataModel.schema';
import { filter } from 'rxjs/operators';
import { FLOWMETER_TRASMITTER_TYPE, InForceGeneralSettingsTabOrder, isFloat, UICommon } from '@core/data/UICommon';
import { ErrorNotifierModel } from '@core/models/UIModels/error-notifier-model';
import { IFlowmeterTransmitterState } from '@store/state/flowmeterTransmitter.state';
import { IShiftDefaultState } from '@store/state/shift-default.state';
import { ShiftDefaultUIModel } from '@core/models/UIModels/shift-default.model';
import { IWellEntityState } from '@store/state/well.state';
import { selectAllWells, selectWellState } from '@store/reducers/well.entity.reducer';
import { INFORCE_WELL_ARCHITECTURE } from '@core/services/well.service';
import { InFORCEWellDataUIModel } from '@core/models/webModels/WellDataUIModel.model';
import * as _ from 'lodash';

@Component({
  selector: 'app-panel-defaults',
  templateUrl: './panel-defaults.component.html',
  styleUrls: ['./panel-defaults.component.scss']
})
export class PanelDefaultsComponent implements OnInit, OnDestroy, AfterViewInit {

  @Input()
  selectedTab: number;

  @Input()
  panelConfiguration: any;

  @Output()
  isFormValidEvent = new EventEmitter();

  @Output()
  panelDefaultStateEmmiter = new EventEmitter<IPanelDefaultState>();

  @Output() panelDefaultInValidEvent = new EventEmitter();

  @Output()
  alarmsAndLimitsStateEmmiter = new EventEmitter<IAlarmsAndLimitsState>();

  uiCommon = UICommon;

  panelDefaultState$: Observable<IPanelDefaultState>;
  alarmsAndLimitsState$: Observable<IAlarmsAndLimitsState>;
  flowmeterTransmitterTypesState$: Observable<IFlowmeterTransmitterState>;
  shiftDefaultState$: Observable<IShiftDefaultState>;
  wellState$: Observable<IWellEntityState>;
  wellEntity: any[];
  shiftDefaultData: ShiftDefaultUIModel;
  panelDefaultData: PanelDefaultUIModel;
  alarmsAndLimitsData: AlarmsAndLimitsUIModel;
  private TIME_BASED = "TimeBased";

  flowmeterList: FlowmeterTransmitterUIModel[] = [];

  @Output()
  flowMeterTransmitterTypewarningLabel: EventEmitter<string> = new EventEmitter<string>();

  private arrSubscriptions: Subscription[] = [];

  panelDefaultForm: FormGroup;
  formCtrlErrorMessage: any;
  private mapErrMessages: Map<string, string> = new Map<string, string>();

  constructor(private store: Store<{ panelDefaultState: IPanelDefaultState; alarmsAndLimitsState: IAlarmsAndLimitsState; flowmeterTransmitterState: IFlowmeterTransmitterState }>, private router: Router,
    private validationService: ValidationService) {
    this.panelDefaultState$ = this.store.select<IPanelDefaultState>((state: any) => state.panelDefaultState);
    this.alarmsAndLimitsState$ = this.store.select<IAlarmsAndLimitsState>((state: any) => state.alarmsAndLimitsState);
    this.flowmeterTransmitterTypesState$ = this.store.select<IFlowmeterTransmitterState>((state: any) => state.flowmeterTransmitterState);
    this.shiftDefaultState$ = this.store.select<IShiftDefaultState>((state: any) => state.shiftDefaultState);
    this.wellState$ = this.store.select<IWellEntityState>((state: any) => state.wellState);
  }

  private subscribeToWellEntityStore() {
    let wellSubscription = this.store.select<any>(selectWellState).subscribe((state: IWellEntityState) => {
      if (state && !state.isLoaded) {
        this.store.dispatch(WELL_ACTIONS.WELL_LOAD());
      }
      else {
        let wellDataSubscription = this.store.select<any>(selectAllWells).subscribe(wells => {
          const filteredWells = wells.filter(well => well.ControlArchitectureId != INFORCE_WELL_ARCHITECTURE.SURESENS);
          this.wellEntity = _.cloneDeep(filteredWells);
        });
        this.arrSubscriptions.push(wellDataSubscription);
      }
    });
    this.arrSubscriptions.push(wellSubscription);
  }

  private subscribeToShiftDefault(): void {
    const subscription = this.shiftDefaultState$.subscribe(
      (state: IShiftDefaultState) => {
        if (state !== undefined) {
          if (state.isLoaded === false && !StateUtilities.hasErrors(state)) {
            this.store.dispatch(SHIFT_DEFAULTS_ACTIONS.LOAD_SHIFT_DEFAULTS());
          } else {
            this.shiftDefaultData = new ShiftDefaultUIModel();
            Object.assign(this.shiftDefaultData, state.shiftDefaults);
          }
        }
      }
    );
    this.arrSubscriptions.push(subscription);
  }


  private subscribeToPanelDefault(): void {
    const subscription = this.panelDefaultState$.subscribe(
      (state: IPanelDefaultState) => {
        if (state !== undefined) {
          if (state.isLoaded === false && !StateUtilities.hasErrors(state)) {
            console.log('dispatch load panel defaults.....');
            this.store.dispatch(PANEL_DEFAULT_ACTIONS.LOAD_PANEL_DEFAULTS());
          } else {
            this.panelDefaultData = new PanelDefaultUIModel();
            Object.assign(this.panelDefaultData, state.panelDefaults);
            console.log('load panel defaults result.....', this.panelDefaultData);
            this.setFormData();
            if (this.panelDefaultData?.FlowMeterTransmitterType === FLOWMETER_TRASMITTER_TYPE.None) {
              this.changeToTimeBasedShifts();
            }
          }
        }
      }
    );
    this.arrSubscriptions.push(subscription);
  }

  private subscribeToFlowmeterTransmitterTypes(): void {
    const subscription = this.flowmeterTransmitterTypesState$.subscribe(
      (state: IFlowmeterTransmitterState) => {
        if (state !== undefined) {
          if (state.isLoaded === false && !StateUtilities.hasErrors(state)) {
            console.log('dispatch load flowmeter transmitter types.....');
            this.store.dispatch(FLOWMETER_TRASMITTER_ACTIONS.LOAD_FLOWMETER_TRANSMITTER_TYPES());
          } else {
            this.flowmeterList = [];
            Object.assign(this.flowmeterList, state.flowmeterTransmitterTypes);
            console.log('load flowmeter transmitter types result.....', this.panelDefaultData);
            this.setFormData();
          }
        }
      }
    );
    this.arrSubscriptions.push(subscription);
  }

  private subscribeToAlarmsAndLimits(): void {
    const subscription = this.alarmsAndLimitsState$.subscribe(
      (state: IAlarmsAndLimitsState) => {
        if (state !== undefined) {
          if (state.isLoaded === false && !StateUtilities.hasErrors(state)) {
            console.log('dispatch load alarms and limits.....');
            this.store.dispatch(ALARMS_AND_LIMITS_ACTIONS.LOAD_ALARMS_AND_LIMITS());
          } else {
            this.alarmsAndLimitsData = new AlarmsAndLimitsUIModel();
            Object.assign(this.alarmsAndLimitsData, state.alarmsAndLimits);
            console.log('load alarms and limits result.....', this.alarmsAndLimitsData);
            this.setFormData();
          }
        }
      }
    );
    this.arrSubscriptions.push(subscription);
  }

  createFormGroup() {
    this.panelDefaultForm = new FormGroup({});
    const alarmsAndLimitsGroup = new FormGroup({});
    const panelDefaultsGroup = new FormGroup({});

    for (const property in AlarmsAndLimitsModelSchema.properties) {
      if (AlarmsAndLimitsModelSchema.properties.hasOwnProperty(property)) {
        const formControl = new FormControl('');
        alarmsAndLimitsGroup.addControl(property, formControl);
      }
    }

    for (const property in PanelDefaultModelSchema.properties) {
      if (PanelDefaultModelSchema.properties.hasOwnProperty(property)) {
        const formControl = new FormControl('');
        panelDefaultsGroup.addControl(property, formControl);
      }
    }

    this.panelDefaultForm.addControl('alarmsAndLimits', alarmsAndLimitsGroup);
    this.panelDefaultForm.addControl('panelDefaults', panelDefaultsGroup);
    this.setFormData();
  }

  setFormData() {
    const alarmsAndLimitsGroup = this.panelDefaultForm.get('alarmsAndLimits');
    const panelDefaultsGroup = this.panelDefaultForm.get('panelDefaults');

    if (this.panelDefaultData) {
      panelDefaultsGroup.patchValue({
        HydraulicOutputs: this.panelDefaultData.HydraulicOutputs,
        TankLowLevel: this.panelDefaultData.TankLowLevel,
        MinSupplyPressure: this.panelDefaultData.MinSupplyPressure,
        MaxSupplyPressure: this.panelDefaultData.MaxSupplyPressure,
        MinPumpPressure: this.panelDefaultData.MinPumpPressure,
        MaxPumpPressure: this.panelDefaultData.MaxPumpPressure,
        MaxTimeForVentAll: this.panelDefaultData.MaxTimeForVentAll,
        DelayBeforeMeasuringReturns: this.panelDefaultData.DelayBeforeMeasuringReturns,
        HPUPassiveModeEnabled: this.panelDefaultData.HPUPassiveModeEnabled,
        HPUPassiveModeTimeout: this.panelDefaultData.HPUPassiveModeTimeout,
        EnableLinePrePressurization: this.panelDefaultData.EnableLinePrePressurization,
        DurationInSecondsToHoldPressure: this.panelDefaultData.DurationInSecondsToHoldPressure,
        TimeIntervalInHoursToApplyPrePressurizationAgain: this.panelDefaultData.TimeIntervalInHoursToApplyPrePressurizationAgain,
        FlowMeterTransmitterType: this.panelDefaultData.FlowMeterTransmitterType ?? FLOWMETER_TRASMITTER_TYPE.PrecisionDigital
      });
    } else {
      panelDefaultsGroup.patchValue({
        HydraulicOutputs: 0,
        TankLowLevel: 0,
        MinSupplyPressure: 0,
        MaxSupplyPressure: 0,
        MinPumpPressure: 0,
        MaxPumpPressure: 0,
        MaxTimeForVentAll: 0,
        DelayBeforeMeasuringReturns: 1,
        HPUPassiveModeEnabled: true,
        HPUPassiveModeTimeout: 1,
        EnableLinePrePressurization: true,
        DurationInSecondsToHoldPressure: 60,
        TimeIntervalInHoursToApplyPrePressurizationAgain: 1,
        FlowMeterTransmitterType: 1
      });
    }

    if (this.alarmsAndLimitsData) {
      alarmsAndLimitsGroup.patchValue({
        StartPumpPressure: this.alarmsAndLimitsData.StartPumpPressure.LimitValue,
        StopPumpPressure: this.alarmsAndLimitsData.StopPumpPressure.LimitValue,
        HighPumpPressure: this.alarmsAndLimitsData.HighPumpPressure.LimitValue,
        HighOutputXPressure: this.alarmsAndLimitsData.HighOutputXPressure.LimitValue,
        HighSupplyPressure: this.alarmsAndLimitsData.HighSupplyPressure.LimitValue,
        LowReservoirLevel: this.alarmsAndLimitsData.LowReservoirLevel.LimitValue,
      });
    } else {
      alarmsAndLimitsGroup.patchValue({
        StartPumpPressure: initialAlarmsAndLimitsState.alarmsAndLimits.StartPumpPressure.LimitValue,
        StopPumpPressure: initialAlarmsAndLimitsState.alarmsAndLimits.StopPumpPressure.LimitValue,
        HighPumpPressure: initialAlarmsAndLimitsState.alarmsAndLimits.HighPumpPressure.LimitValue,
        HighOutputXPressure: initialAlarmsAndLimitsState.alarmsAndLimits.HighOutputXPressure.LimitValue,
        HighSupplyPressure: initialAlarmsAndLimitsState.alarmsAndLimits.HighSupplyPressure.LimitValue,
        LowReservoirLevel: initialAlarmsAndLimitsState.alarmsAndLimits.LowReservoirLevel.LimitValue,
      });
    }
  }

  private subscribeToFormValidationEvent() {
    this.panelDefaultForm.statusChanges
      .pipe(filter(() => this.panelDefaultForm.valid)).subscribe(() => {
        if (this.panelDefaultForm && this.selectedTab == InForceGeneralSettingsTabOrder.PANEL_DEFAULTS)
          this.isFormValidEvent.emit(true);
      });

    this.panelDefaultForm.statusChanges
      .pipe(filter(() => this.panelDefaultForm.invalid)).subscribe(() => {
        if (this.panelDefaultForm && this.selectedTab == InForceGeneralSettingsTabOrder.PANEL_DEFAULTS)
          this.isFormValidEvent.emit(false);
      });
  }

  private subscribeToFormDataChanges() {
    this.panelDefaultForm.valueChanges.subscribe((val) => {
      this.validateFormControls();
      this.isFormValidEvent.emit(this.panelDefaultForm.valid);
      const alarmsAndLimitsGroup = this.panelDefaultForm.get('alarmsAndLimits') as FormGroup;
      const panelDefaultsGroup = this.panelDefaultForm.get('panelDefaults') as FormGroup;
      if (!panelDefaultsGroup.pristine && panelDefaultsGroup.valid) {
        this.panelDefaultData = panelDefaultsGroup.value;
        const panelDefaultState: IPanelDefaultState = {
          isLoaded: true,
          isLoading: false,
          isValid: true,
          isDirty: !panelDefaultsGroup.pristine,
          panelDefaults: this.panelDefaultData,
          error: '',
        };

        this.panelDefaultStateEmmiter.emit(panelDefaultState);
      }
      if (this.panelConfiguration?.Id !== undefined && this.panelConfiguration?.Id !== -1 && UICommon.IsConfigSaved) {
        if (!alarmsAndLimitsGroup.pristine && alarmsAndLimitsGroup.valid) {
          const alarmsAndLimitsObj = alarmsAndLimitsGroup.value;
          if (!this.alarmsAndLimitsData) {
            this.alarmsAndLimitsData = { ...initialAlarmsAndLimitsState.alarmsAndLimits };
          }
          for (const key in this.alarmsAndLimitsData) {
            this.alarmsAndLimitsData[key] = {
              ...this.alarmsAndLimitsData[key],
              LimitValue: alarmsAndLimitsObj[key]
            }
          }
          const alarmsAndLimitsState: IAlarmsAndLimitsState = {
            isLoaded: true,
            isLoading: false,
            isValid: true,
            isDirty: !alarmsAndLimitsGroup.pristine,
            alarmsAndLimits: this.alarmsAndLimitsData,
            error: '',
          };
          this.alarmsAndLimitsStateEmmiter.emit(alarmsAndLimitsState);
        }
      }
    });
  }

  onFlowmeterChange(event) {
    if (event && event.value !== undefined && event.value !== null) {
      this.panelDefaultData.FlowMeterTransmitterType = parseInt(event.value);
      if (this.panelDefaultData?.FlowMeterTransmitterType !== undefined && this.panelDefaultData?.FlowMeterTransmitterType === FLOWMETER_TRASMITTER_TYPE.None) {
        this.flowMeterTransmitterTypewarningLabel.emit('Time-Based shifting ONLY when Flowmeter Transmitter Type is "None".');
        this.changeToTimeBasedShifts();
      } else {
        this.flowMeterTransmitterTypewarningLabel.emit('');
      }
    }
  }

  validateFormControls(): void {
    this.panelDefaultForm.markAllAsTouched();
    this.validateAlarmsAndLimitsControls();
    this.validatePanelDefaultsControls();
    this.setFormControlStatus();
  }

  validateAlarmsAndLimitsControls(): void {
    const alarmsAndLimitsGroup = this.panelDefaultForm.get('alarmsAndLimits');
    alarmsAndLimitsGroup.markAllAsTouched();

    const startPumpPressureCtrl = alarmsAndLimitsGroup.get('StartPumpPressure');
    const stopPumpPressureCtrl = alarmsAndLimitsGroup.get('StopPumpPressure');
    const highPumpPressureCtrl = alarmsAndLimitsGroup.get('HighPumpPressure');
    const highOutputXPressureCtrl = alarmsAndLimitsGroup.get('HighOutputXPressure');
    const highSupplyPressureCtrl = alarmsAndLimitsGroup.get('HighSupplyPressure');
    const lowReservoirLevelCtrl = alarmsAndLimitsGroup.get('LowReservoirLevel');

    const startPumpPressureErrors = startPumpPressureCtrl.value === null ? { required: true } :
      isFloat(startPumpPressureCtrl.value) ? { notInteger: true } : null;
    startPumpPressureCtrl.setErrors(startPumpPressureErrors);

    const stopPumpPressureErrors = stopPumpPressureCtrl.value === null ? { required: true } :
      isFloat(stopPumpPressureCtrl.value) ? { notInteger: true } : null;
    stopPumpPressureCtrl.setErrors(stopPumpPressureErrors);

    const highPumpPressureErrors = highPumpPressureCtrl.value === null ? { required: true } :
      isFloat(highPumpPressureCtrl.value) ? { notInteger: true } : null;
    highPumpPressureCtrl.setErrors(highPumpPressureErrors);

    const highOutputXPressureErrors = highOutputXPressureCtrl.value === null ? { required: true } :
      isFloat(highOutputXPressureCtrl.value) ? { notInteger: true } : null;
    highOutputXPressureCtrl.setErrors(highOutputXPressureErrors);

    const highSupplyPressureErrors = highSupplyPressureCtrl.value === null ? { required: true } :
      isFloat(highSupplyPressureCtrl.value) ? { notInteger: true } : null;
    highSupplyPressureCtrl.setErrors(highSupplyPressureErrors);

    const lowReservoirLevelErrors = lowReservoirLevelCtrl.value === null ? { required: true } :
      isFloat(lowReservoirLevelCtrl.value) ? { notInteger: true } : null;
    lowReservoirLevelCtrl.setErrors(lowReservoirLevelErrors);
  }

  validatePanelDefaultsControls(): void {
    const panelDefaultsGroup = this.panelDefaultForm.get('panelDefaults');
    panelDefaultsGroup.markAllAsTouched();

    const tankLowLevelCtrl = panelDefaultsGroup.get('TankLowLevel');
    const minSupplyPressureCtrl = panelDefaultsGroup.get('MinSupplyPressure');
    const maxSupplyPressureCtrl = panelDefaultsGroup.get('MaxSupplyPressure');
    const minPumpPressureCtrl = panelDefaultsGroup.get('MinPumpPressure');
    const maxPumpPressureCtrl = panelDefaultsGroup.get('MaxPumpPressure');
    const maxTimeForVentAllCtrl = panelDefaultsGroup.get('MaxTimeForVentAll');
    const delayBeforeMeasuringCtrl = panelDefaultsGroup.get('DelayBeforeMeasuringReturns');
    const hpuPassiveModelCtrl = panelDefaultsGroup.get('HPUPassiveModeTimeout');
    const durationToHoldPressureCtrl = panelDefaultsGroup.get('DurationInSecondsToHoldPressure');
    const timeIntervalToPressureCtrl = panelDefaultsGroup.get('TimeIntervalInHoursToApplyPrePressurizationAgain');

    const tankLowLevelErrors = tankLowLevelCtrl.value === null ? { required: true } :
      isFloat(tankLowLevelCtrl.value) ? { notInteger: true } :
        tankLowLevelCtrl.value < 0 ? { invalidInput: true } : null;
    tankLowLevelCtrl.setErrors(tankLowLevelErrors);

    const minSupplyPressureErrors = minSupplyPressureCtrl.value === null ? { required: true } :
      isFloat(minSupplyPressureCtrl.value) ? { notInteger: true } :
        minSupplyPressureCtrl.value < 0 ? { invalidInput: true } : null;
    minSupplyPressureCtrl.setErrors(minSupplyPressureErrors);

    const maxSupplyPressureErrors = maxSupplyPressureCtrl.value === null ? { required: true } :
      isFloat(maxSupplyPressureCtrl.value) ? { notInteger: true } :
        maxSupplyPressureCtrl.value < 0 ? { invalidInput: true } : null;
    maxSupplyPressureCtrl.setErrors(maxSupplyPressureErrors);

    const minPumpPressureErrors = minPumpPressureCtrl.value === null ? { required: true } :
      isFloat(minPumpPressureCtrl.value) ? { notInteger: true } :
        minPumpPressureCtrl.value < 0 ? { invalidInput: true } : null;
    minPumpPressureCtrl.setErrors(minPumpPressureErrors);

    const maxPumpPressureErrors = maxPumpPressureCtrl.value === null ? { required: true } :
      isFloat(maxPumpPressureCtrl.value) ? { notInteger: true } :
        maxPumpPressureCtrl.value < 0 ? { invalidInput: true } : null;
    maxPumpPressureCtrl.setErrors(maxPumpPressureErrors);

    const maxTimeForVentAllErrors = maxTimeForVentAllCtrl.value === null ? { required: true } :
      isFloat(maxTimeForVentAllCtrl.value) ? { notInteger: true } :
        maxTimeForVentAllCtrl.value < 0 ? { invalidInput: true } : null;
    maxTimeForVentAllCtrl.setErrors(maxTimeForVentAllErrors);

    const delayBeforeMeasuringErrors = delayBeforeMeasuringCtrl.value === null ? { required: true } :
      isFloat(delayBeforeMeasuringCtrl.value) ? { notInteger: true } :
        delayBeforeMeasuringCtrl.value < 0 ? { invalidInput: true } : null;
    delayBeforeMeasuringCtrl.setErrors(delayBeforeMeasuringErrors);

    const hpuPassiveModelErrors = hpuPassiveModelCtrl.value === null ? { required: true } :
      isFloat(hpuPassiveModelCtrl.value) ? { notInteger: true } :
        hpuPassiveModelCtrl.value < 0 ? { invalidInput: true } : null;
    hpuPassiveModelCtrl.setErrors(hpuPassiveModelErrors);

    const durationToHoldPressureErrors = durationToHoldPressureCtrl.value === null ? { required: true } :
      isFloat(durationToHoldPressureCtrl.value) ? { notInteger: true } :
        durationToHoldPressureCtrl.value < 0 ? { invalidInput: true } : null;
    durationToHoldPressureCtrl.setErrors(durationToHoldPressureErrors);

    const timeIntervalToPressureErrors = timeIntervalToPressureCtrl.value === null ? { required: true } :
      isFloat(timeIntervalToPressureCtrl.value) ? { notInteger: true } :
        timeIntervalToPressureCtrl.value < 0 ? { invalidInput: true } : null;
    timeIntervalToPressureCtrl.setErrors(timeIntervalToPressureErrors);
  }

  private validateOnInit(): void {
    if (this.panelDefaultForm) {
      this.validateFormControls();
      this.isFormValidEvent.emit(this.panelDefaultForm.valid);
    }
  }

  private setFormControlStatus() {
    const alarmsAndLimitsGroup = this.panelDefaultForm.get('alarmsAndLimits') as FormGroup;
    const panelDefaultsGroup = this.panelDefaultForm.get('panelDefaults') as FormGroup;
    Object.keys(alarmsAndLimitsGroup.controls).forEach(key => {
      this.validateControl(key, alarmsAndLimitsGroup.controls[key]);
    });
    Object.keys(panelDefaultsGroup.controls).forEach(key => {
      this.validateControl(key, panelDefaultsGroup.controls[key]);
    });
    this.setErrorNotifierList();
  }

  validate(grpId, ctrlId) {
    let ctrl = this.panelDefaultForm.get(grpId).get(ctrlId);
    this.validateControl(ctrlId, ctrl);
  }

  private validateControl(ctrlId, ctrl) {
    if (ctrl) {
      if ((ctrl.dirty || ctrl.touched) && ctrl.invalid) {
        this.mapErrMessages.set(ctrlId, this.validationService.getValidationErrorMessage(ctrl.errors, ctrlId));
      }
      else {
        this.mapErrMessages.delete(ctrlId);
      }
    }
  }

  getError(fieldName: string) {
    return this.mapErrMessages.get(fieldName);
  }

  setErrorNotifierList() {
    const errorList = [...this.mapErrMessages].map(([name, value]) => ({
      name,
      value: this.setErrorDisplayLabel(name, value)
    }));
    if (errorList && errorList.length > 0) {
      const errorDetails: ErrorNotifierModel = {
        path: this.router.url,
        tabName: 'Panel Defaults',
        tabIndex: 4,
        errors: errorList
      };
      if (this.panelDefaultData) {
        this.panelDefaultData.error = errorDetails;
      }
      this.panelDefaultInValidEvent.emit(errorDetails);
    } else {
      if (this.panelDefaultData) {
        this.panelDefaultData.error = null;
      }
      this.panelDefaultInValidEvent.emit(null)
    }

  }

  setErrorDisplayLabel(name, value) {
    let displayName = null;
    switch (name) {
      case 'StartPumpPressure':
        displayName = `Start Pump Pressure : ${value}`
        break;
      case 'StopPumpPressure':
        displayName = `Stop Pump Pressure : ${value}`
        break;
      case 'HighPumpPressure':
        displayName = `High Pump Pressure : ${value}`
        break;
      case 'HighOutputXPressure':
        displayName = `High Output Pressure : ${value}`
        break;
      case 'HighSupplyPressure':
        displayName = `High Supply Pressure : ${value}`
        break;
      case 'LowReservoirLevel':
        displayName = `Low Reservoir Level : ${value}`
        break;
      case 'DelayBeforeMeasuringReturns':
        displayName = `Delay before measuring Returns : ${value}`
        break;
      case 'HPUPassiveModeEnabled':
        displayName = `Passive Mode : ${value}`
        break;
      case 'HPUPassiveModeTimeout':
        displayName = `Passive Mode Timeout : ${value}`
        break;
      case 'EnableLinePrePressurization':
        displayName = `Pre-Pressurization Settings : ${value}`
        break;
      case 'DurationInSecondsToHoldPressure':
        displayName = `Hold Pressure Time : ${value}`
        break;
      case 'TimeIntervalInHoursToApplyPrePressurizationAgain':
        displayName = `Waiting hours to apply Pressurization again : ${value}`
        break;
    }
    return displayName;
  }

  changeToTimeBasedShifts(): void {
    this.shiftDefaultData.ShiftMethod = this.TIME_BASED;
    const shiftDefaultState: IShiftDefaultState = {
      isLoaded: true,
      isLoading: false,
      isValid: !this.shiftDefaultData.returnBasedError && !this.shiftDefaultData.timeBasedError,
      isDirty: !this.panelDefaultForm.pristine,
      shiftDefaults: this.shiftDefaultData,
      error: '',
    };
    this.store.dispatch(SHIFT_DEFAULTS_ACTIONS.UPDATE_SHIFT_DEFAULTS({
      shiftDefaultState: shiftDefaultState
    }));

    if (this.wellEntity) {
      this.wellEntity.forEach(well => {
        let hasChanges = false;
        if (well.ShiftMethod !== this.TIME_BASED) {
          hasChanges = true;
          well.ShiftMethod = this.TIME_BASED;
        }
        if (well.IsPanelLevelShiftDefaultApplied === false) {
          hasChanges = true;
          well.IsPanelLevelShiftDefaultApplied = true;
        }
        if (well.Zones) {
          well.Zones.forEach(zone => {
            if (zone.ShiftMethod !== this.TIME_BASED) {
              hasChanges = true;
              zone.ShiftMethod = this.TIME_BASED;
            }
            if (zone.IsWellLevelShiftDefaultApplied === false) {
              hasChanges = true;
              zone.IsWellLevelShiftDefaultApplied = true;
            }
          });
        }
        if (hasChanges) {
          well.IsDirty = true;
          const action = { well: well };
          this.store.dispatch(WELL_ACTIONS.WELL_UPDATE(action));
        }
      });
    }
  }

  ngOnDestroy(): void {
    const panelDefaultObj = this.panelDefaultForm.get('panelDefaults').value;
    if(this.panelDefaultData !== undefined &&  panelDefaultObj !== null)
    Object.assign(this.panelDefaultData, panelDefaultObj);

    const panelDefaultState: IPanelDefaultState = {
      isLoaded: true,
      isLoading: false,
      isValid: !this.panelDefaultData?.error,
      isDirty: !this.panelDefaultForm?.pristine,
      panelDefaults: this.panelDefaultData,
      error: '',
    };
    this.panelDefaultStateEmmiter.emit(panelDefaultState);

    if (this.panelConfiguration?.Id !== undefined && this.panelConfiguration?.Id !== -1 && UICommon.IsConfigSaved) {
      const alarmsAndLimitsObj = this.panelDefaultForm.get('alarmsAndLimits').value;
      if (!this.alarmsAndLimitsData) {
        this.alarmsAndLimitsData = { ...initialAlarmsAndLimitsState.alarmsAndLimits };
      }
      for (const key in this.alarmsAndLimitsData) {
        this.alarmsAndLimitsData[key] = {
          ...this.alarmsAndLimitsData[key],
          LimitValue: alarmsAndLimitsObj[key]
        }
      }
      const alarmsAndLimitsState: IAlarmsAndLimitsState = {
        isLoaded: true,
        isLoading: false,
        isValid: !this.panelDefaultData?.error,
        isDirty: !this.panelDefaultForm.pristine,
        alarmsAndLimits: this.alarmsAndLimitsData,
        error: '',
      };
      this.alarmsAndLimitsStateEmmiter.emit(alarmsAndLimitsState);
    }
    if (this.arrSubscriptions != null && this.arrSubscriptions.length > 0) {
      this.arrSubscriptions.forEach((subscription) => {
        if (subscription != null) {
          subscription.unsubscribe();
          subscription = null;
        }
      });
    }
    this.arrSubscriptions = [];
    this.validationService.clearError();
  }

  ngOnInit(): void {
    this.subscribeToShiftDefault();
    this.createFormGroup();
    this.subscribeToWellEntityStore();
    setTimeout(() => {
      this.subscribeToPanelDefault();
      if (this.panelDefaultData?.FlowMeterTransmitterType !== undefined && this.panelDefaultData?.FlowMeterTransmitterType === FLOWMETER_TRASMITTER_TYPE.None) {
        this.flowMeterTransmitterTypewarningLabel.emit('Time-Based shifting ONLY when Flowmeter Transmitter Type is "None".');
      } else {
        // this.flowMeterwarningLabel="";
        this.flowMeterTransmitterTypewarningLabel.emit('');
      }
    }, 1000);   
    this.subscribeToFlowmeterTransmitterTypes();



    // UICommon.IsConfigSaved
    if (this.panelConfiguration?.Id !== undefined && this.panelConfiguration?.Id !== -1 && UICommon.IsConfigSaved) {
      this.subscribeToAlarmsAndLimits();
    }
    this.mapErrMessages.clear();
  }

  ngAfterViewInit(): void {
    this.subscribeToFormValidationEvent();
    this.subscribeToFormDataChanges();
    this.validateOnInit();
  }
}
