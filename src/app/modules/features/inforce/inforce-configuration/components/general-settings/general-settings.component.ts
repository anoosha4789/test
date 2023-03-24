import { ActivatedRoute, Router } from '@angular/router';
import {
  Component,
  OnInit,
  ViewEncapsulation,
  OnDestroy,
} from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';

import * as PANELCONFIG_COMMON_ACTIONS from '@store/actions/panelConfigurationCommon.action';
import * as ERROR_HANDLING_SETTINGS_STATE_ACTIONS from '@store/actions/errorHandlingSettings.action';
import * as UNITSYSTEM_ACTIONS from '@store/actions/unit-system.action';
import * as SHIFT_DEFAULTS_ACTIONS from '@store/actions/shift-default.action';
import * as PANEL_DEFAULTS_ACTIONS from '@store/actions/panel-default.action';
import * as ALARMS_AND_LIMITS_ACTIONS from '@store/actions/alarms-and-limits.action';

import { UtilityService } from '@core/services/utility.service';
import { IErrorHandlingSettingsState } from '@store/state/errorHandlingSettings.state';
import { IUnitSystemState } from '@store/state/unit-system.state';
import { InForceGeneralSettingsTabOrder, UICommon } from '@core/data/UICommon';
import { GatewayPanelBase, IGatewayPanelBase } from '@comp/GatewayPanelBase.component';
import { IPanelConfigurationCommonState } from '@store/state/panelConfigurationCommon.state';
import { PanelConfigurationFacade } from '@core/facade/panelConfigFacade.service';
import { InforcePanelUIModel } from '@core/models/UIModels/inforce-panel-config-common.model';
// import { PanelConfigurationCommonUIModel } from '@core/models/UIModels/panel-configuration-common.model';
import { ErrorNotifierModel } from '@core/models/UIModels/error-notifier-model';
import { inforcePanelConfigSchema } from '@core/models/schemaModels/InForcePanelModel.schema';
import { IShiftDefaultState } from '@store/state/shift-default.state';
import { IPanelDefaultState } from '@store/state/panel-default.state';
import { IAlarmsAndLimitsState } from '@store/state/alarms-and-limits.state';


@Component({
  selector: 'inforce-general-settings',
  templateUrl: './general-settings.component.html',
  styleUrls: ['./general-settings.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class GeneralSettingsComponent extends GatewayPanelBase implements OnInit, OnDestroy, IGatewayPanelBase {
  
  generalSettingsTabOrder = InForceGeneralSettingsTabOrder;
  isPanelValid = true;
  isErrorHandlingValid = true;
  isUnitSystemsValid = true;
  isShiftDefaultsValid = true;
  isPanelDefaultsValid = true;
  isUserAccountsValid = true;
  isLeavingWorkflow: boolean = true;
  panelType: number;
  panelSchema: any;
  errorNotifierList = [];
  panelConfigurationCommon: InforcePanelUIModel = new InforcePanelUIModel();

  generalSettingError: ErrorNotifierModel;
  errorHandlingError: ErrorNotifierModel;
  
  private arrSubscriptions: Subscription[] = [];
  hasPanelChanged: boolean;
  isDirty: boolean;
  clearUsers: boolean;
  selectedTabIndex = InForceGeneralSettingsTabOrder.GENERAL;
  btnNextText = 'Next';
  panelDefaultFlowMeterTransmitterType: string ='';

  // Unit System variables
  unitSystemState: IUnitSystemState;
  errorHandlingState: IErrorHandlingSettingsState;
  shiftDefaultState: IShiftDefaultState;
  panelDefaultState: IPanelDefaultState;
  alarmsAndLimitsState: IAlarmsAndLimitsState;

  constructor(
    protected store: Store,
    private router: Router,
    protected activatedRoute: ActivatedRoute,
    private panelConfigFacade: PanelConfigurationFacade,
    private utilityService: UtilityService
  ) {
    super(store, panelConfigFacade, null, null, null, null, null);
  }

  private updatePanelonTabChange(): void {
    switch(this.selectedTabIndex) {
      case InForceGeneralSettingsTabOrder.GENERAL:
        this.updatePanelSettings();
        break;

      case InForceGeneralSettingsTabOrder.UNIT_SYSTEM:
        this.updateUnitSystem();
        break;
    }
  }

  onTabChanged(index): void {
    this.updatePanelonTabChange();
    this.selectedTabIndex = index;
    this.btnNextText = this.selectedTabIndex === InForceGeneralSettingsTabOrder.USER_ACCOUNT ? 'Done' : 'Next';
  }

   // IGatewayPanelBase methods
   postCallGetPanelConfigurationCommon(): void {
    this.panelConfigurationCommon = new InforcePanelUIModel();
    const inforcepanelConfiguration = this.panelConfigurationCommonState.panelConfigurationCommon as InforcePanelUIModel;
    Object.assign(this.panelConfigurationCommon, inforcepanelConfiguration);
    this.isDirty = this.panelConfigurationCommonState.isDirty;
    if (this.panelConfigurationCommon.PanelTypeId === -1) { // No Panel configured
      this.panelConfigurationCommon.PanelTypeId = this.panelType;
    }
    this.panelConfigurationCommon.HydraulicOutputs = this.panelConfigurationCommon.HydraulicOutputs !== undefined ? this.panelConfigurationCommon.HydraulicOutputs : 6;
  }

  isFormValidEvent(isFormValid: boolean, tabIndex: InForceGeneralSettingsTabOrder) {
    if (tabIndex === InForceGeneralSettingsTabOrder.GENERAL) {
      this.isPanelValid = isFormValid;
    } else if (tabIndex === InForceGeneralSettingsTabOrder.ERROR_HANDLING) {
      this.isErrorHandlingValid = isFormValid;
    } else if (tabIndex === InForceGeneralSettingsTabOrder.UNIT_SYSTEM) {
      this.isUnitSystemsValid = isFormValid;
    } else if (tabIndex === InForceGeneralSettingsTabOrder.SHIFT_DEFAULTS) {
      this.isShiftDefaultsValid = isFormValid;
    } else if (tabIndex === InForceGeneralSettingsTabOrder.PANEL_DEFAULTS) {
      this.isPanelDefaultsValid = isFormValid;
    } else if (tabIndex === InForceGeneralSettingsTabOrder.USER_ACCOUNT) {
      this.isUserAccountsValid = isFormValid;
    }
  }

  hasPanelChangedEvent(hasChanged: boolean) {
    this.hasPanelChanged = hasChanged;
  }

  generalSettingInvalidEvent(error: ErrorNotifierModel) {
    this.generalSettingError = error;
  }

  errorHandlingInvalidEvent(error: ErrorNotifierModel) {
    if(this.errorHandlingState) { 
      this.errorHandlingState.errorHandlingSettings.error = error;
    }
  }

  unitSystemStateChange(unitSystemState: IUnitSystemState) {
    this.unitSystemState = unitSystemState;
  }

  errorHandlingStateChange(errorHandlingSettings: IErrorHandlingSettingsState) {
    this.errorHandlingState = errorHandlingSettings;
  }

  shiftDefaultStateChange(shiftDefaultState: IShiftDefaultState) {
    this.shiftDefaultState = shiftDefaultState;
  }

  panelDefaultStateChange(panelDefaultState: IPanelDefaultState) {
    this.panelDefaultState = panelDefaultState;
    console.log('panelDefaultStateChange.....', panelDefaultState);
  }

  alarmsAndLimitsStateChange(alarmsAndLimitsState: IAlarmsAndLimitsState) {
    this.alarmsAndLimitsState = alarmsAndLimitsState;
    console.log('alarmsAndLimitsStateChange.....', alarmsAndLimitsState);
  }

  isCurrentTabValid() {
    if (this.selectedTabIndex === InForceGeneralSettingsTabOrder.GENERAL) {
      return this.isPanelValid;
    } else if (this.selectedTabIndex === InForceGeneralSettingsTabOrder.ERROR_HANDLING) {
      return this.isErrorHandlingValid;
    } else if (this.selectedTabIndex === InForceGeneralSettingsTabOrder.UNIT_SYSTEM) {
      return this.isUnitSystemsValid;
    } else if (this.selectedTabIndex === InForceGeneralSettingsTabOrder.SHIFT_DEFAULTS) {
      return this.isShiftDefaultsValid;
    } else if (this.selectedTabIndex === InForceGeneralSettingsTabOrder.PANEL_DEFAULTS) {
      return this.isPanelDefaultsValid;
    } else if (this.selectedTabIndex === InForceGeneralSettingsTabOrder.USER_ACCOUNT) {
      return this.isUserAccountsValid;
    }
  }

  // Save data -  Stepper Inital Configuration
  onSubmit(): void {
    this.updateGeneralSettings();
    if (this.selectedTabIndex < InForceGeneralSettingsTabOrder.USER_ACCOUNT) {
      this.selectedTabIndex += 1;
    }
  }

  // Back button click - navigate to previous tab
  onBackBtnClick(): void {
    if (this.selectedTabIndex > InForceGeneralSettingsTabOrder.GENERAL) {
      this.selectedTabIndex -= 1;
    }
  }

  private updatePanelSettings() {
    // if (this.hasPanelChanged) {
      const errors = this.generalSettingError ? this.generalSettingError : null;  // GATE- 1237 General Setting Error Validation
      this.panelConfigurationCommon.error = errors;
      this.panelConfigurationCommon.isPageVisited = true;
      const upDateState: IPanelConfigurationCommonState = {
        panelConfigurationCommon: this.panelConfigurationCommon,
        isLoaded: true,
        isLoading: false,
        isDirty: this.hasPanelChanged || this.panelConfigurationCommonState.isDirty,  //GATE-1803
        isValid: this.isPanelValid,
        error: ''
      };
      this.store.dispatch(PANELCONFIG_COMMON_ACTIONS.PANELCONFIG_COMMON_UPDATE({panelState: upDateState}));
    // }
  }

  private updateErrorHandling() {
    if (this.errorHandlingState && this.errorHandlingState.isDirty) {
      this.store.dispatch(ERROR_HANDLING_SETTINGS_STATE_ACTIONS.UPDATE_ERROR_HANDLING_SETTINGS({errorHandlingState: this.errorHandlingState}));
    }
  }

  private updateUnitSystem() {
    if (this.unitSystemState && this.unitSystemState.isDirty) {
      this.store.dispatch(UNITSYSTEM_ACTIONS.UNITSYSTEM_SAVE({ unitSystemState: this.unitSystemState }));
    }
  }

  private updateShiftDefaults() {
    if (this.shiftDefaultState && this.shiftDefaultState.isDirty) {
      this.store.dispatch(SHIFT_DEFAULTS_ACTIONS.UPDATE_SHIFT_DEFAULTS({
        shiftDefaultState: this.shiftDefaultState
      }));
    }
  }

  private updatePanelDefaults() {
    if (this.panelDefaultState && this.panelDefaultState.isDirty) {
      this.store.dispatch(PANEL_DEFAULTS_ACTIONS.UPDATE_PANEL_DEFAULTS({
        panelDefaultState: this.panelDefaultState
      }));
    }
    if (this.panelConfigurationCommon?.Id !== undefined && this.panelConfigurationCommon?.Id !== -1 && UICommon.IsConfigSaved) {
      if (this.alarmsAndLimitsState && this.alarmsAndLimitsState.isDirty) {
        this.store.dispatch(ALARMS_AND_LIMITS_ACTIONS.UPDATE_ALARMS_AND_LIMITS({
          alarmsAndLimitsState: this.alarmsAndLimitsState
        }));
      }
    }
  }

  // Data By Tab Level to local state
  private updateGeneralSettings() {
    switch (this.selectedTabIndex) {
      case InForceGeneralSettingsTabOrder.GENERAL: // Panel Configuration
        this.updatePanelSettings();
        break;

      case InForceGeneralSettingsTabOrder.ERROR_HANDLING:
        this.updateErrorHandling();
        break;

      case InForceGeneralSettingsTabOrder.UNIT_SYSTEM: // Unit System
        this.updateUnitSystem();
        break;

      case InForceGeneralSettingsTabOrder.SHIFT_DEFAULTS: // Shift Defaults
        this.updateShiftDefaults();
        break;

      case InForceGeneralSettingsTabOrder.PANEL_DEFAULTS: // Panel Defaults
        this.updatePanelDefaults();
        break;

      case InForceGeneralSettingsTabOrder.USER_ACCOUNT: // Users
        this.isLeavingWorkflow = false;
        this.utilityService.setForwardStepper(0);
        if (GatewayPanelBase.ShowNavigation) {
          this.router.navigate(['inforce-configuration/dashboard']);
        } else {
          this.router.navigate(['inforce-configuration/well']);
        }
        break;
    }
  }

  canDeactivate(): Observable<boolean> | boolean {
    return true;
  }

  // Unsubscribe
  ngOnDestroy(): void {
    this.updatePanelSettings();
    this.updateErrorHandling();
    this.updateUnitSystem();
    this.updateShiftDefaults();
    this.updatePanelDefaults();
    if (this.isLeavingWorkflow)
      GatewayPanelBase.ShowNavigation = true;

    if (this.arrSubscriptions != null && this.arrSubscriptions.length > 0) {
      this.arrSubscriptions.forEach((subscription) => {
        if (subscription !== null) {
          subscription.unsubscribe();
        }
      });
    }

    this.arrSubscriptions = [];
    super.ngOnDestroy();
  }

  // GATE- 1237 General Setting Error Validation
  setActiveTab() {
    if(history.state && history.state.tabIndex) {
      this.selectedTabIndex = history.state.tabIndex;
    }
  }

  parseFlowMeterTransmitterType(data){
    this.panelDefaultFlowMeterTransmitterType = data;
  }

  // Initilization
  ngOnInit(): void {
    super.ngOnInit();
    this.panelType = 1;
    this.panelSchema = inforcePanelConfigSchema;
    this.initPanelConfigurationCommon();
    this.setActiveTab(); // GATE - 1237
    
  }
}
