import { Component, OnInit, Input, OnChanges, OnDestroy, Output, EventEmitter, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { PanelType } from '@core/models/UIModels/PanelType.model';
import { Store } from '@ngrx/store';
import { IPanelTypeState } from '@store/state/panelType.state';

import * as PANELTYPE_ACTIONS from '@store/actions/panelType.action';
import { PanelConfigurationModel } from '@core/models/webModels/PanelConfiguration.model';
import { suresensPanelConfigSchema } from '@core/models/schemaModels/SureSENSPanelModel.schema';

import { FormGroup, FormControl, Validators, ValidatorFn } from '@angular/forms';
import { filter } from 'rxjs/operators';
import { StateUtilities } from '@store/state/IState';
import { ValidationService } from '@core/services/validation.service';
import { ErrorMessages } from '@core/data/ErrorMessages';
import { GeneralSettingsTabOrder, UICommon, PanelTypeList } from '@core/data/UICommon';
import { GatewayPanelBase } from '@comp/GatewayPanelBase.component';
import { ErrorNotifierModel } from '@core/models/UIModels/error-notifier-model';

@Component({
  selector: 'suresens-general-setting-details',
  templateUrl: './suresens-general-setting-details.component.html',
  styleUrls: ['./suresens-general-setting-details.component.scss']
})
export class SuresensGeneralSettingDetailsComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {

  @Input()
  panelConfiguration: any;

  @Input()
  selectedTab: number;

  @Output()
  isFormValidEvent = new EventEmitter();

  @Output()
  hasFormChangedEvent = new EventEmitter();

  @Output()
  generalSettingInvalidEvent = new EventEmitter();

  panelTypesModels$: Observable<IPanelTypeState>;
  panelTypes: PanelType[] = [];

  private arrSubscriptions: Subscription[] = [];
  isPanelConfigured: boolean = true;

  panelConfigForm: FormGroup;
  private inputLabelMap = new Map();

  // Validation messages
  private mapErrMessages: Map<string, string> = new Map<string, string>();

  constructor(private store: Store<{ panelState: IPanelTypeState }>,
    private validationService: ValidationService,
    private router: Router) {
    this.panelTypesModels$ = this.store.select<any>((state: any) => state.panelState);
  }

  clearErrors(): void {
    this.store.dispatch(PANELTYPE_ACTIONS.PANELTYPES_CLEARERRORS());
  }

  private subscribeToFormValidationEvent() {
    this.panelConfigForm.statusChanges
      .pipe(filter(() => this.panelConfigForm.valid)).subscribe(() => {
        if (this.panelConfigForm && this.selectedTab == GeneralSettingsTabOrder.GENERAL)
          this.isFormValidEvent.emit(true);
      });

    this.panelConfigForm.statusChanges
      .pipe(filter(() => this.panelConfigForm.invalid)).subscribe(() => {
        if (this.panelConfigForm && this.selectedTab == GeneralSettingsTabOrder.GENERAL)
          this.isFormValidEvent.emit(false);
      });
  }

  private subscribeToValueChangeEvent() {
    this.panelConfigForm.valueChanges.subscribe((val) => {
      this.hasFormChangedEvent.emit(true);
    });
  }

  private subscribeToPanelTypes(): void {
    let subscription = this.panelTypesModels$.subscribe((state: IPanelTypeState) => {
      if (state !== undefined) {
        if (state.isLoaded === false && !StateUtilities.hasErrors(state))   // Dispatch Action if not loaded
          this.store.dispatch(PANELTYPE_ACTIONS.PANELTYPES_LOAD());
        else
          // this.panelTypes = state.panels;
          // Excluding 'InFORCE' Panel
          this.panelTypes = state.panels.filter(p => p.Id !== 1);
      }
    });

    this.arrSubscriptions.push(subscription);
  }

  private createFormGroup(): void {
    this.panelConfigForm = new FormGroup({});
    for (const property in suresensPanelConfigSchema.properties) {
      let formControl = new FormControl('');
      let validationFn: ValidatorFn[] = [];
      if (suresensPanelConfigSchema.required.includes(property))
        validationFn.push(Validators.required);

      if (suresensPanelConfigSchema.properties.hasOwnProperty(property)) {
        let prop = suresensPanelConfigSchema.properties[property];
        if (prop.minLength !== undefined)
          validationFn.push(Validators.minLength(prop.minLength));

        if (prop.maxLength !== undefined)
          validationFn.push(Validators.maxLength(prop.maxLength));

        if (prop.minimum !== undefined)
          validationFn.push(Validators.min(prop.minimum));

        if (prop.maximum !== undefined)
          validationFn.push(Validators.max(prop.maximum));

        if (prop.type !== undefined && prop.type === 'integer') {
          validationFn.push(this.validationService.ValidateInteger);
        }
      }
      formControl.setValidators(validationFn);
      this.panelConfigForm.addControl(property, formControl);
    }

    this.panelConfigForm.patchValue(
      {
        Id: this.panelConfiguration.Id
      }
    );
  }

  private initInputLabelMap(): void {
    if (
      suresensPanelConfigSchema !== undefined &&
      suresensPanelConfigSchema !== null &&
      suresensPanelConfigSchema.properties !== undefined &&
      suresensPanelConfigSchema.properties !== null) {
      for (const property in suresensPanelConfigSchema.properties) {
        if (suresensPanelConfigSchema.properties.hasOwnProperty(property)) {
          const prop = suresensPanelConfigSchema.properties[property];
          if (prop.title !== undefined) {
            this.inputLabelMap.set(property, prop.title);
          }
        }
      }
    }
  }

  private validateOnInit(): void {
    this.isPanelConfigured = (this.panelConfiguration && this.panelConfiguration.PanelTypeId != -1) ? true : false;

    if (this.panelConfigForm && this.selectedTab == GeneralSettingsTabOrder.GENERAL) {
      this.isFormValidEvent.emit(this.panelConfigForm.valid);
      if (this.panelConfiguration.isPageVisited || this.panelConfigForm.touched || GatewayPanelBase.ShowNavigation == true) {// page visited once
        this.panelConfigForm.markAllAsTouched();
        Object.keys(this.panelConfigForm.controls).forEach(key => {
          this.validateControl(key, this.panelConfigForm.controls[key]);
        });
      }
      if (this.panelConfigForm.pristine) {
        this.panelConfigForm.markAsTouched();
      }
    }
  }

  private validateControl(ctrlId, ctrl) {
    if (ctrl) {
      if (ctrl.touched && ctrl.invalid)
        this.mapErrMessages.set(ctrlId, this.validationService.getValidationErrorMessage(ctrl.errors, this.inputLabelMap.get(ctrlId)));
      else
        this.mapErrMessages.delete(ctrlId);
    }
    // GATE- 1237 General Setting Error Validation
    const errors = [...this.mapErrMessages].map(([name, value]) => ({ name, value }));
    if (errors && errors.length > 0) {
      const errorDetails: ErrorNotifierModel = {
        path: this.router.url,
        tabName: 'General',
        errors: [...this.mapErrMessages].map(([name, value]) => ({ name, value }))
      };
      errorDetails.errors.map(e => {
        const fieldName: string = this.inputLabelMap.get(e.name);
        e.value = `${fieldName} : ${e.value}`;
      });
      this.generalSettingInvalidEvent.emit(errorDetails);
    }
    else {
      this.generalSettingInvalidEvent.emit(null)
    }
  }

  validate(event) {
    let ctrl = this.panelConfigForm.get(event.currentTarget.id);
    this.validateControl(event.currentTarget.id, ctrl);
  }

  getError(fieldName: string) {
    return this.mapErrMessages.get(fieldName);
  }

  clearValidtions() {
    this.validationService.clearError();
  }

  ngOnDestroy(): void {
    if (this.arrSubscriptions != null && this.arrSubscriptions.length > 0) {
      this.arrSubscriptions.forEach(subscription => {
        if (subscription != null)
          subscription.unsubscribe();
      });
    }

    this.arrSubscriptions = [];
    this.clearErrors();
  }

  ngOnChanges() {
    this.validateOnInit();
  }

  ngOnInit(): void {

    this.subscribeToPanelTypes();
    this.mapErrMessages.clear();
    if (suresensPanelConfigSchema !== undefined) {
      this.createFormGroup();
    }
  }

  ngAfterViewInit(): void {
    if (suresensPanelConfigSchema !== undefined) {
      this.subscribeToFormValidationEvent();
      this.subscribeToValueChangeEvent();

      this.initInputLabelMap();
      this.validateOnInit();
    }
  }
}
