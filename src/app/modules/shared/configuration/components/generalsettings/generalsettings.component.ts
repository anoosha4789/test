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
import { inchargePanelConfigSchema } from '@core/models/schemaModels/InChargePanelModel.schema';
import { inforcePanelConfigSchema } from '@core/models/schemaModels/InForcePanelModel.schema';
import { PanelConfigurationService } from '@core/services/panelConfiguration.service';
import { PanelConfigurationCommonModel } from '@core/models/webModels/PanelConfigurationCommon.model';
import { UtilityService } from '@core/services/utility.service';
import { multinodePanelConfigSchema } from '@core/models/schemaModels/MultinodePanelModel.schema';
@Component({
  selector: 'app-generalsettings',
  templateUrl: './generalsettings.component.html',
  styleUrls: ['./generalsettings.component.scss']
})
export class GeneralSettingsComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {

  @Input()
  panelConfiguration: any;

  @Input()
  panelSchema: any;

  @Input()
  selectedTab: number;

  @Output() 
  isFormValidEvent = new EventEmitter();

  @Output() 
  hasFormChangedEvent = new EventEmitter();

  @Output()
  generalSettingInvalidEvent = new EventEmitter();

  hydraulicSecVisibility = false;
  panelTypesModels$: Observable<IPanelTypeState>;
  panelTypes: PanelType[] = [];
  private arrSubscriptions: Subscription[] = [];
  isPanelConfigured: boolean = true;
  panelConfigForm: FormGroup;
  private inputLabelMap = new Map();
  isConfigSaved: boolean;

  hydraulicOptions: [] = [];

  // Validation messages
  private mapErrMessages: Map<string, string> = new Map<string, string>();

  constructor(private store: Store<{ panelState: IPanelTypeState}>, 
    private validationService: ValidationService,
    private panelConfigurationService: PanelConfigurationService,
    private router: Router
    ,private utilityService: UtilityService) { 
    this.panelTypesModels$ = this.store.select<any>((state: any) => state.panelState);
  }

  onPanelTypeSelChange(event) {
    switch (event.value) {
      case PanelTypeList.SURESENS:
        this.router.navigateByUrl('suresens/general');
        this.panelSchema = suresensPanelConfigSchema;
        this.panelConfigForm.reset(this.panelConfigForm.value);
        this.ngOnInit();
        break;
      case PanelTypeList.InCHARGE:
        this.router.navigateByUrl('incharge/general');
        this.panelSchema = inchargePanelConfigSchema;
        this.panelConfigForm.reset(this.panelConfigForm.value);
        this.createFormGroup();
        break;
      case PanelTypeList.INFORCE:
        this.router.navigateByUrl('inforce-configuration/general');
        this.panelSchema = inforcePanelConfigSchema;
        this.panelConfigForm.reset(this.panelConfigForm.value);
        this.createFormGroup();
        break;
        case PanelTypeList.MultiNode:
        this.router.navigateByUrl('multinode/general');
        this.panelSchema = multinodePanelConfigSchema;
        this.panelConfigForm.reset(this.panelConfigForm.value);
        this.createFormGroup();
        break;
    }
    
  }

  clearErrors(): void {
    this.store.dispatch(PANELTYPE_ACTIONS.PANELTYPES_CLEARERRORS());
  }

  private subscribeToFormValidationEvent() {
    this.panelConfigForm.statusChanges
    .pipe( filter(() => this.panelConfigForm.valid)).subscribe(() => {
      if (this.panelConfigForm && this.selectedTab == GeneralSettingsTabOrder.GENERAL)
        this.isFormValidEvent.emit(true);
    });

    this.panelConfigForm.statusChanges
    .pipe( filter(() => this.panelConfigForm.invalid)).subscribe(() => {
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
          console.log('state....', state)
          // this.panelTypes = state.panels.filter(p => p.Id !== 1);
          this.panelTypes = state.panels;
      }
    });

    this.arrSubscriptions.push(subscription);
  }
  private subscribeToConfigSaveStatus(): void {
      this.isConfigSaved  =this.utilityService.getConfigStatus();
  }
  private createFormGroup(): void {
    this.panelConfigForm = new FormGroup({});
    for (const property in this.panelSchema.properties) {
      let formControl = new FormControl('');
      let validationFn: ValidatorFn[] = [];
      if (this.panelSchema.required.includes(property))
        validationFn.push(Validators.required);

      if (this.panelSchema.properties.hasOwnProperty(property)) {
        let prop = this.panelSchema.properties[property];
        if (prop.minLength !== undefined)
          validationFn.push(Validators.minLength(prop.minLength));

        if (prop.maxLength !== undefined)
          validationFn.push(Validators.maxLength(prop.maxLength));

        if (prop.minimum !== undefined)
          validationFn.push(Validators.min(prop.minimum));

        if (prop.maximum !== undefined)
          validationFn.push(Validators.max(prop.maximum));
      }
      formControl.setValidators(validationFn); 
      this.panelConfigForm.addControl(property, formControl);
    }

  }

  private initInputLabelMap(): void {
    if (
      this.panelSchema !== undefined &&
      this.panelSchema !== null &&
      this.panelSchema.properties !== undefined &&
      this.panelSchema.properties !== null) {
        for (const property in this.panelSchema.properties) {
          if (this.panelSchema.properties.hasOwnProperty(property)) {
              const prop = this.panelSchema.properties[property];
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
      console.log("General Settings", this.panelConfiguration.isPageVisited, this.panelConfigForm.touched, GatewayPanelBase.ShowNavigation);
      
      if (this.panelConfiguration.isPageVisited || this.panelConfigForm.touched || GatewayPanelBase.ShowNavigation == true)  {// page visited once
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
      errorDetails.errors.map(e =>  { 
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

  private getHydraulicOutputOptions(): void {
    this.panelConfigurationService.getHydraulicOutputOptions().subscribe(options => {
      this.hydraulicOptions = options;
    },
    error => {
      console.log(error);
    });
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
    this.subscribeToConfigSaveStatus();
    if(this.panelConfiguration.PanelTypeId === PanelTypeList.INFORCE) {
      this.hydraulicSecVisibility = true;
      this.getHydraulicOutputOptions();
    }
    this.mapErrMessages.clear();
    if (this.panelSchema !== undefined)  {
      this.createFormGroup();
    }
  }
  
  ngAfterViewInit(): void {
    if (this.panelSchema !== undefined) {
      this.subscribeToFormValidationEvent();
      this.subscribeToValueChangeEvent();

      this.initInputLabelMap();
      this.validateOnInit();
    }
  }
}
