import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription, Subject } from 'rxjs';
import { Store } from '@ngrx/store';

import * as PANEL_COMMON_CONFIG_ACTIONS from '@store/actions/panelConfigurationCommon.action';
import * as ERROR_HANDLING_SETTINGS_STATE_ACTIONS from '@store/actions/errorHandlingSettings.action';
import * as UNITSYSTEM_ACTIONS from '@store/actions/unit-system.action';

import { suresensPanelConfigSchema } from '@core/models/schemaModels/SureSENSPanelModel.schema';
import { UtilityService } from '@core/services/utility.service';
import { IErrorHandlingSettingsState } from '@store/state/errorHandlingSettings.state';
import { IUnitSystemState } from '@store/state/unit-system.state';
import { GeneralSettingsTabOrder, UICommon } from '@core/data/UICommon';
import { GatewayPanelBase, IGatewayPanelBase } from '@comp/GatewayPanelBase.component';
import { IPanelConfigurationCommonState } from '@store/state/panelConfigurationCommon.state';
import { PanelConfigurationFacade } from '@core/facade/panelConfigFacade.service';
import { ErrorNotifierModel } from '@core/models/UIModels/error-notifier-model';
import { SuresensPanelConfigurationCommonUIModel } from '@core/models/UIModels/suresens-panel-config-common.model';

@Component({
  selector: 'suresens-general-setting',
  templateUrl: './general-setting.component.html',
  styleUrls: ['./general-setting.component.scss']
})
export class GeneralSettingComponent extends GatewayPanelBase implements OnInit, OnDestroy, IGatewayPanelBase {

  isFormValid = true;
  isPanelValid = true;
  isLeavingWorkflow: boolean = true;
  panelType: number;
  panelSchema: any;
  errorNotifierList = [];
  generalSettingError: ErrorNotifierModel;
  errorHandlingError: ErrorNotifierModel;
  navigateAwaySelection$: Subject<boolean> = new Subject<boolean>();
  panelConfigurationCommon: SuresensPanelConfigurationCommonUIModel = new SuresensPanelConfigurationCommonUIModel();

  private arrSubscriptions: Subscription[] = [];
  hasPanelChanged: boolean;
  isDirty: boolean;
  clearUsers: boolean;
  selectedTabIndex = GeneralSettingsTabOrder.GENERAL;
  btnNextText = 'Next';

  // Unit System variables
  unitSystemState: IUnitSystemState;
  errorHandlingState: IErrorHandlingSettingsState;

  constructor(
    protected store: Store,
    private router: Router,
    protected activatedRoute: ActivatedRoute,
    private panelConfigFacade: PanelConfigurationFacade,
    private utilityService: UtilityService
  ) {
    super(store, panelConfigFacade, null, null, null, null, null);
  }

  onTabChanged(index): void {
    this.selectedTabIndex = index;
    this.btnNextText = this.selectedTabIndex === GeneralSettingsTabOrder.USER_ACCOUNT ? 'Done' : 'Next';
    if (this.selectedTabIndex > GeneralSettingsTabOrder.ERROR_HANDLING) {
      this.isFormValid = true;
    }
  }

  isFormValidEvent(isFormValid: boolean) {
    this.isFormValid = isFormValid;
    if (this.selectedTabIndex === GeneralSettingsTabOrder.GENERAL) {
      this.isPanelValid = isFormValid;
    }
  }

  hasPanelChangedEvent(hasChanged: boolean) {
    this.hasPanelChanged = hasChanged;
  }

  generalSettingInvalidEvent(error: ErrorNotifierModel) {
    this.generalSettingError = error;
  }

  errorHandlingInvalidEvent(error: ErrorNotifierModel) {
    if (this.errorHandlingState) {
      this.errorHandlingState.errorHandlingSettings.error = error;
    }
  }

  unitSystemStateChange(unitSystemState: IUnitSystemState) {
    this.unitSystemState = unitSystemState;
  }

  errorHandlingStateChange(errorHandlingSettings: IErrorHandlingSettingsState) {
    this.errorHandlingState = errorHandlingSettings;
  }

  // IGatewayPanelBase methods
  postCallGetPanelConfigurationCommon(): void {
    this.panelConfigurationCommon = new SuresensPanelConfigurationCommonUIModel();
    const suresenspanelConfiguration = this.panelConfigurationCommonState.panelConfigurationCommon as SuresensPanelConfigurationCommonUIModel;
    Object.assign(this.panelConfigurationCommon, suresenspanelConfiguration);
    this.panelConfigurationCommon.ToggleEnabled = this.panelConfigurationCommon.ToggleEnabled || false;
    this.panelConfigurationCommon.ToggleIntervalInSec = this.panelConfigurationCommon.ToggleIntervalInSec !== undefined ? this.panelConfigurationCommon.ToggleIntervalInSec : 10;
    
    this.isDirty = this.panelConfigurationCommonState.isDirty;
    if (this.panelConfigurationCommon.PanelTypeId === -1) { // No Panel configured
      this.panelConfigurationCommon.PanelTypeId = this.panelType;
    }
    this.panelConfigurationCommon.isPageVisited = this.panelConfigurationCommon.isPageVisited !== undefined ? this.panelConfigurationCommon.isPageVisited : false;
  }

  // Save data -  Stepper Inital Configuration
  onSubmit(): void {
    this.updateGeneralSettings();
    if (this.selectedTabIndex < GeneralSettingsTabOrder.USER_ACCOUNT) {
      this.selectedTabIndex += 1;
    }
  }

  // Back button click - navigate to previous tab
  onBackBtnClick(): void {
    if (this.selectedTabIndex > GeneralSettingsTabOrder.GENERAL) {
      this.selectedTabIndex -= 1;
    }
  }

  private updatePanelSettings() {
    //if (this.hasPanelChanged) {
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
    this.store.dispatch(PANEL_COMMON_CONFIG_ACTIONS.PANELCONFIG_COMMON_UPDATE({ panelState: upDateState }));
    // }
  }

  private updateErrorHandling() {
    if (this.errorHandlingState && this.errorHandlingState.isDirty) {
      this.store.dispatch(ERROR_HANDLING_SETTINGS_STATE_ACTIONS.UPDATE_ERROR_HANDLING_SETTINGS({ errorHandlingState: this.errorHandlingState }));
    }
  }

  private updateUnitSystem() {
    if (this.unitSystemState && this.unitSystemState.isDirty) {
      this.store.dispatch(UNITSYSTEM_ACTIONS.UNITSYSTEM_SAVE({ unitSystemState: this.unitSystemState }));
    }
  }

  // Data By Tab Level to local state
  private updateGeneralSettings() {
    switch (this.selectedTabIndex) {
      case GeneralSettingsTabOrder.GENERAL: // Panel Configuration
        this.updatePanelSettings();
        break;

      case GeneralSettingsTabOrder.ERROR_HANDLING:
        this.updateErrorHandling();
        break;

      case GeneralSettingsTabOrder.UNIT_SYSTEM: // Unit System
        this.updateUnitSystem();
        break;

      case GeneralSettingsTabOrder.USER_ACCOUNT: // Users
        this.isLeavingWorkflow = false;
        this.utilityService.setForwardStepper(0);
        if (GatewayPanelBase.ShowNavigation) {
          this.router.navigate(['suresens/dashboard']);
        } else {
          this.router.navigate(['suresens/well']);
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
    if (history.state && history.state.tabIndex) {
      this.selectedTabIndex = history.state.tabIndex;
    }
  }

  // Initilization
  ngOnInit(): void {
    super.ngOnInit();
    this.panelType = 4;
    this.panelSchema = suresensPanelConfigSchema;
    this.initPanelConfigurationCommon();
    this.setActiveTab(); // GATE - 1237

  }

}
