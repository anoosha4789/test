import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription, Subject } from 'rxjs';
import { Store } from '@ngrx/store';

import * as PANEL_COMMON_CONFIG_ACTIONS from '@store/actions/panelConfigurationCommon.action';
import * as ERROR_HANDLING_SETTINGS_STATE_ACTIONS from '@store/actions/errorHandlingSettings.action';
import * as eFCV_POSITION_SETTINGS_STATE_ACTIONS from '@store/actions/efcvPositionSettings.action';
import * as UNITSYSTEM_ACTIONS from '@store/actions/unit-system.action';

import { UtilityService } from '@core/services/utility.service';
import { IErrorHandlingSettingsState } from '@store/state/errorHandlingSettings.state';
import { IUnitSystemState } from '@store/state/unit-system.state';
import { DEFAULT_eFCV_POSITIONS, DEFAULT_eFCV_POSITIONS_ARRAY, eFCV_POSITION_POSITION_OWNERS, MultinodeGeneralSettingsTabOrder, PanelTypeList } from '@core/data/UICommon';
import { GatewayPanelBase, IGatewayPanelBase } from '@comp/GatewayPanelBase.component';
import { IPanelConfigurationCommonState } from '@store/state/panelConfigurationCommon.state';
import { PanelConfigurationFacade } from '@core/facade/panelConfigFacade.service';
import { ErrorNotifierModel } from '@core/models/UIModels/error-notifier-model';
import { MultiNodePanelConfigurationCommonUIModel } from '@core/models/UIModels/multinode-panel-config-common.model';
import { multinodePanelConfigSchema } from '@core/models/schemaModels/MultinodePanelModel.schema';
import { IeFCVPositionSettingsState } from '@store/state/efcvPositionSettings.state';
import { StateUtilities } from '@store/state/IState';
import { MultiNodePositionDefaultsDataUIModel } from '@core/models/UIModels/MultiNodePositionDefaultsDataUI.model';
import * as _ from 'lodash';
import { WellFacade } from '@core/facade/wellFacade.service';
import * as WELL_ACTIONS from '@store/actions/well.entity.action';

@Component({
  selector: 'app-multinode-general-settings',
  templateUrl: './general-settings.component.html',
  styleUrls: ['./general-settings.component.scss']
})
export class GeneralSettingsComponent extends GatewayPanelBase implements OnInit, OnDestroy, IGatewayPanelBase {

  isFormValid = true;
  isPanelValid = true;
  isLeavingWorkflow: boolean = true;
  panelType: number;
  panelSchema: any;
  errorNotifierList = [];
  generalSettingError: ErrorNotifierModel;
  errorHandlingError: ErrorNotifierModel;
  navigateAwaySelection$: Subject<boolean> = new Subject<boolean>();
  panelConfigurationCommon: MultiNodePanelConfigurationCommonUIModel = new MultiNodePanelConfigurationCommonUIModel();

  private arrSubscriptions: Subscription[] = [];
  hasPanelChanged: boolean;
  isDirty: boolean;
  clearUsers: boolean;
  selectedTabIndex = MultinodeGeneralSettingsTabOrder.GENERAL;
  btnNextText = 'Next';
  isMultinodePanel: boolean = true;
  eFCVPositionSettings: MultiNodePositionDefaultsDataUIModel;
  OldeFCVPositionSettings: MultiNodePositionDefaultsDataUIModel;
  IeFCVPositionSettingsState$: Observable<IeFCVPositionSettingsState>;

  // Unit System variables
  unitSystemState: IUnitSystemState;
  errorHandlingState: IErrorHandlingSettingsState;
  eFCVPositionState: IeFCVPositionSettingsState;

  constructor(
    protected store: Store,
    private router: Router,
    private wellDataFacade: WellFacade,
    protected activatedRoute: ActivatedRoute,
    private panelConfigFacade: PanelConfigurationFacade,
    private utilityService: UtilityService
  ) {
    super(store, panelConfigFacade, wellDataFacade, null, null, null, null);
    this.IeFCVPositionSettingsState$ = this.store.select<
      IeFCVPositionSettingsState
    >((state: any) => state.eFCVPositionSettingsState);
  }

  onTabChanged(index): void {
    this.selectedTabIndex = index;
    this.btnNextText = this.selectedTabIndex === MultinodeGeneralSettingsTabOrder.USER_ACCOUNT ? 'Done' : 'Next';
    if (this.selectedTabIndex != MultinodeGeneralSettingsTabOrder.GENERAL && this.selectedTabIndex != MultinodeGeneralSettingsTabOrder.EFCV_POSITIONS) {
      this.isFormValid = true;
    }
  }

  isFormValidEvent(isFormValid: boolean) {
    this.isFormValid = isFormValid;
    if (this.selectedTabIndex === MultinodeGeneralSettingsTabOrder.GENERAL) {
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

  efcvPositionFormInValidEvent(error: ErrorNotifierModel) {
    if (this.eFCVPositionState) {
      this.eFCVPositionState.eFCVPositionSettings.error = error;
    }
  }

  unitSystemStateChange(unitSystemState: IUnitSystemState) {
    this.unitSystemState = unitSystemState;
  }

  eFCVPositionStateChange(eFCVPositionState: IeFCVPositionSettingsState) {
    this.eFCVPositionState = eFCVPositionState;
  }

  errorHandlingStateChange(errorHandlingSettings: IErrorHandlingSettingsState) {
    this.errorHandlingState = errorHandlingSettings;
  }

  // IGatewayPanelBase methods
  postCallGetPanelConfigurationCommon(): void {
    this.panelConfigurationCommon = new MultiNodePanelConfigurationCommonUIModel();
    const multinodePanelConfiguration = this.panelConfigurationCommonState.panelConfigurationCommon as MultiNodePanelConfigurationCommonUIModel;
    Object.assign(this.panelConfigurationCommon, multinodePanelConfiguration);

    this.isDirty = this.panelConfigurationCommonState.isDirty;
    if (this.panelConfigurationCommon.PanelTypeId === -1) { // No Panel configured
      this.panelConfigurationCommon.PanelTypeId = this.panelType;
    }
    this.panelConfigurationCommon.isPageVisited = this.panelConfigurationCommon.isPageVisited !== undefined ? this.panelConfigurationCommon.isPageVisited : false;
  }

  // Save data -  Stepper Inital Configuration
  onSubmit(): void {
    this.updateGeneralSettings();
    if (this.selectedTabIndex < MultinodeGeneralSettingsTabOrder.USER_ACCOUNT) {
      this.selectedTabIndex += 1;
    }
  }

  // Back button click - navigate to previous tab
  onBackBtnClick(): void {
    if (this.selectedTabIndex > MultinodeGeneralSettingsTabOrder.GENERAL) {
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

  private updateeFCVPosition() {
    if (this.eFCVPositionState && this.eFCVPositionState.isDirty) {
      for (let i = 0; i < this.wellEnity.length; i++) {
        let result = this.wellEnity[i].PositionDescriptionData.filter(x1 => !this.OldeFCVPositionSettings.PositionDescriptionData.some(x2 => x1.Description === x2.Description));
        if (result.length === 0) {
          // Update well level Position description data
          this.wellEnity[i].PositionDescriptionData = _.cloneDeep(this.eFCVPositionState.eFCVPositionSettings.PositionDescriptionData);
          this.wellEnity[i].IsDirty = true;
          this.wellEnity[i].PositionDescriptionData?.forEach(descriptionData => {
            descriptionData.idPositionOwner = eFCV_POSITION_POSITION_OWNERS.WELL;
            descriptionData.Id = -1;
          }); 

          // Update zone level Position description data
          this.wellEnity[i].Zones?.forEach(zone => {
            zone.PositionDescriptionData = _.cloneDeep(this.eFCVPositionState.eFCVPositionSettings.PositionDescriptionData);
            zone.PositionDescriptionData?.forEach(descriptionData => {
              descriptionData.idPositionOwner = eFCV_POSITION_POSITION_OWNERS.eFCV;
              descriptionData.Id = -1;
            });
          });
          this.store.dispatch(WELL_ACTIONS.WELL_UPDATE({ well: this.wellEnity[i] }));
        }
      }

      this.store.dispatch(eFCV_POSITION_SETTINGS_STATE_ACTIONS.UPDATE_eFCV_POSITION_SETTINGS({ eFCVPositionState: this.eFCVPositionState }));
    }
  }

  private subscribeToeFCVPositionSettingState(): void {
    const subscription = this.IeFCVPositionSettingsState$.subscribe(
      (state: IeFCVPositionSettingsState) => {
        if (state !== undefined) {
          if (state.isLoaded === false && !StateUtilities.hasErrors(state)) {
            // Dispatch Action if not loaded
            this.store.dispatch(
              eFCV_POSITION_SETTINGS_STATE_ACTIONS.LOAD_eFCV_POSITION_SETTINGS()
            );
          } else {
            this.eFCVPositionSettings = new MultiNodePositionDefaultsDataUIModel();
            this.OldeFCVPositionSettings = new MultiNodePositionDefaultsDataUIModel();
            /* Object.assign(
              this.eFCVPositionSettings,
              state.eFCVPositionSettings
            ); */
            this.eFCVPositionSettings = _.cloneDeep(state.eFCVPositionSettings);
            this.OldeFCVPositionSettings = _.cloneDeep(state.eFCVPositionSettings);
            // // Need to remove once default value is available from API
            // this.eFCVPositionSettings?.PositionStagesData.forEach(PositionStagesData => {
            //   if (PositionStagesData.PositionStageDesc !== DEFAULT_eFCV_POSITIONS.NOTSET) {
            //     let default_description = DEFAULT_eFCV_POSITIONS_ARRAY.find(position => position.Id === PositionStagesData.Id)?.Description ?? "";
            //     let PositionDescriptionData = this.eFCVPositionSettings.PositionDescriptionData.find(data => data.PositionStage === PositionStagesData.PositionStage);
            //     if (PositionDescriptionData) {
            //       PositionDescriptionData.Description = PositionDescriptionData.Description ? PositionDescriptionData.Description : default_description;
            //     }
            //   }
            // });
            // let efcvPositionSettings: IeFCVPositionSettingsState = {
            //   eFCVPositionSettings: this.eFCVPositionSettings,
            //   isLoaded: true,
            //   isLoading: false,
            //   isDirty: true,
            //   isValid: true,
            //   error: '',
            // };
            // this.eFCVPositionStateChange(efcvPositionSettings);
            ////////////////
          }
        }
      }
    );

    this.arrSubscriptions.push(subscription);
  }

  // Data By Tab Level to local state
  private updateGeneralSettings() {
    switch (this.selectedTabIndex) {
      case MultinodeGeneralSettingsTabOrder.GENERAL: // Panel Configuration
        this.updatePanelSettings();
        break;

      case MultinodeGeneralSettingsTabOrder.ERROR_HANDLING:
        this.updateErrorHandling();
        break;

      case MultinodeGeneralSettingsTabOrder.UNIT_SYSTEM: // Unit System
        this.updateUnitSystem();
        break;

      case MultinodeGeneralSettingsTabOrder.EFCV_POSITIONS:
        this.updateeFCVPosition();
        break;

      case MultinodeGeneralSettingsTabOrder.USER_ACCOUNT: // Users
        this.isLeavingWorkflow = false;
        this.utilityService.setForwardStepper(0);
        if (GatewayPanelBase.ShowNavigation) {
          this.router.navigate(['multinode/dashboard']);
        } else {
          // SIE navigation route
          this.router.navigate(['multinode/sie']);
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
    this.updateeFCVPosition();
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
    this.panelType = PanelTypeList.MultiNode;
    this.panelSchema = multinodePanelConfigSchema;
    this.initPanelConfigurationCommon();
    this.initWells();
    this.subscribeToeFCVPositionSettingState();
    this.setActiveTab(); // GATE - 1237
  }

}
