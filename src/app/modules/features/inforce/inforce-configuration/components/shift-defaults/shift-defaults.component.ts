import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';

import { Store } from '@ngrx/store';
import { StateUtilities } from '@store/state/IState';
import { IShiftDefaultState, initialShiftDefaultState } from '@store/state/shift-default.state';
import * as ACTIONS from '@store/actions/shift-default.action';
import * as PANEL_DEFAULT_ACTIONS from '@store/actions/panel-default.action';

import { ValidationService } from '@core/services/validation.service';
import { ShiftDefaultUIModel } from '@core/models/UIModels/shift-default.model';
import { ErrorNotifierModel } from '@core/models/UIModels/error-notifier-model';
import { PanelDefaultUIModel } from '@core/models/UIModels/panel-default.model';
import { IPanelDefaultState } from '@store/state/panel-default.state';
import { FLOWMETER_TRASMITTER_TYPE } from '@core/data/UICommon';

@Component({
  selector: 'gw-inforce-shift-defaults',
  templateUrl: './shift-defaults.component.html',
  styleUrls: ['./shift-defaults.component.scss']
})

export class ShiftDefaultsComponent implements OnInit, OnDestroy, OnChanges {
  @Input() panelDefaultData: PanelDefaultUIModel;
  @Output() isFormValidEvent = new EventEmitter();
  @Output() shiftDefaultStateEmmiter = new EventEmitter<IShiftDefaultState>();

  selectedShiftMethod: string = 'ReturnsBased';
  shiftMethods = ['ReturnsBased', 'TimeBased'];
  unitVal = 'mL'
  formCtrlErrorMessage: any;
  shiftDefaultState$: Observable<IShiftDefaultState>;
  panelDefaultState$: Observable<IPanelDefaultState>;
  shiftDefaultData: ShiftDefaultUIModel;
  panelDefault: PanelDefaultUIModel;
  isDirty: boolean = false;
  returnsBasedShiftForm: FormGroup;
  timeBasedShiftForm: FormGroup;
  private arrSubscriptions: Subscription[] = [];
  isDefShiftSettingChanged = false;
  isReturnBasedFormValid: boolean = true;
  isTimebasedFormValid: boolean = true;
  isFlowmeterTransmitterNone: boolean = false;

  constructor(private store: Store<{ shiftDefaultState: IShiftDefaultState; }>, private router: Router,
    private validationService: ValidationService) {
    this.shiftDefaultState$ = this.store.select<IShiftDefaultState>((state: any) => state.shiftDefaultState);
    this.panelDefaultState$ = this.store.select<IPanelDefaultState>((state: any) => state.panelDefaultState);
  }

  private subscribeToPanelDefault(): void {
    const subscription = this.panelDefaultState$.subscribe(
      (state: IPanelDefaultState) => {
        if (state !== undefined) {
          if (state.isLoaded === false && !StateUtilities.hasErrors(state)) {
            this.store.dispatch(PANEL_DEFAULT_ACTIONS.LOAD_PANEL_DEFAULTS());
          } else {
            this.panelDefault = new PanelDefaultUIModel();
            Object.assign(this.panelDefault, state.panelDefaults);
            this.isFlowmeterTransmitterNone = this.panelDefault.FlowMeterTransmitterType === FLOWMETER_TRASMITTER_TYPE.None;
          }
        }
      }
    );
    this.arrSubscriptions.push(subscription);
  }


  onDefShiftSettingChange(event) {
    this.shiftDefaultData.ShiftMethod = event.value;
    this.isDefShiftSettingChanged = true;
  }

  updateShiftDefaultEvent(shiftDefaultForm) {
    if (shiftDefaultForm?.data) {
      this.shiftDefaultData.ShiftMethod = this.shiftDefaultData.ShiftMethod;
      this.shiftDefaultData.ReturnsBasedShiftDefaults = shiftDefaultForm.data.ReturnsBasedShiftDefaults;
      this.shiftDefaultData.TimeBasedShiftDefaults = shiftDefaultForm.data.TimeBasedShiftDefaults;
    };
    this.isDirty = !this.isDefShiftSettingChanged && this.shiftDefaultData.ReturnsBasedShiftDefaults.IdShiftDefault !== -1 && this.shiftDefaultData.TimeBasedShiftDefaults.IdShiftDefault !== -1 ? shiftDefaultForm.dirty : true;
    const shiftDefaultState: IShiftDefaultState = {
      isLoaded: true,
      isLoading: false,
      isValid: true,
      isDirty: this.isDirty,
      shiftDefaults: this.shiftDefaultData,
      error: '',
    };
    this.shiftDefaultStateEmmiter.emit(shiftDefaultState);
  }

  private subscribeToShiftDefault(): void {
    const subscription = this.shiftDefaultState$.subscribe(
      (state: IShiftDefaultState) => {
        if (state !== undefined) {
          if (state.isLoaded === false && !StateUtilities.hasErrors(state)) {
            this.store.dispatch(ACTIONS.LOAD_SHIFT_DEFAULTS());
          } else {
            this.shiftDefaultData = new ShiftDefaultUIModel();
            Object.assign(this.shiftDefaultData, state.shiftDefaults);
            if (!this.shiftDefaultData.ShiftMethod || this.shiftDefaultData.ShiftMethod === 'NA') {
              this.shiftDefaultData.ShiftMethod = initialShiftDefaultState.shiftDefaults.ShiftMethod;
            }
            this.selectedShiftMethod = this.shiftDefaultData.ShiftMethod;
            if (!this.shiftDefaultData.ReturnsBasedShiftDefaults) {
              this.shiftDefaultData.ReturnsBasedShiftDefaults = initialShiftDefaultState.shiftDefaults.ReturnsBasedShiftDefaults;
            }
            if (!this.shiftDefaultData.TimeBasedShiftDefaults) {
              this.shiftDefaultData.TimeBasedShiftDefaults = initialShiftDefaultState.shiftDefaults.TimeBasedShiftDefaults;
            }
            this.isDirty = state.isDirty;
          }
        }
      }
    );
    this.arrSubscriptions.push(subscription);
  }

  returnBasedFormValidEvent(isFormValid: boolean) {
    this.isReturnBasedFormValid = isFormValid;
    this.formValidationEvent();
  }

  returnBasedFormInValidEvent(error: ErrorNotifierModel) {
    this.shiftDefaultData.returnBasedError = error;
  }

  timeBasedFormValidEvent(isFormValid: boolean) {
    this.isTimebasedFormValid = isFormValid;
    this.formValidationEvent();
  }

  timeBasedFormInValidEvent(error: ErrorNotifierModel) {
    this.shiftDefaultData.timeBasedError = error;
  }

  formValidationEvent() {
    if (this.isReturnBasedFormValid && this.isTimebasedFormValid) {
      this.isFormValidEvent.emit(true);
    } else {
      this.isFormValidEvent.emit(false);
    }
  }

  ngOnDestroy(): void {
    const shiftDefaultState: IShiftDefaultState = {
      isLoaded: true,
      isLoading: false,
      isValid: !this.shiftDefaultData?.returnBasedError && !this.shiftDefaultData?.timeBasedError,
      isDirty: this.isDirty,
      shiftDefaults: this.shiftDefaultData,
      error: '',
    };
    this.shiftDefaultStateEmmiter.emit(shiftDefaultState);
    if (this.arrSubscriptions != null && this.arrSubscriptions.length > 0) {
      this.arrSubscriptions.forEach((subscription) => {
        if (subscription != null) {
          subscription.unsubscribe();
        }
      });
    }
    this.validationService.clearError();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.panelDefaultData)
      this.isFlowmeterTransmitterNone = this.panelDefaultData.FlowMeterTransmitterType === FLOWMETER_TRASMITTER_TYPE.None;
  }

  ngOnInit(): void {
    this.subscribeToPanelDefault();
    this.subscribeToShiftDefault();
  }
}
