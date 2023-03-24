import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { GatewayPanelBase } from '@comp/GatewayPanelBase.component';
import { deleteUIModal, eFCV_POSITION_POSITION_OWNERS, PANEL_ROUTES, UICommon } from '@core/data/UICommon';
import { ValidationService } from '@core/services/validation.service';
import { Observable, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { SIEConfigCommonSchema } from '@core/models/schemaModels/SIECongfigurationUIModel.schema';
import { ErrorNotifierModel } from '@core/models/UIModels/error-notifier-model';
import { ActivatedRoute, Router } from '@angular/router';
import { MultiNodePanelModel, PanelConfigurationCommonModel } from '@core/models/webModels/PanelConfigurationCommon.model';
import { cloneDeep as _cloneDeep } from 'lodash';
import * as _ from 'lodash';
import { String } from 'typescript-string-operations';

import * as PANELTYPE_ACTIONS from '@store/actions/panelType.action';
import * as ACTIONS from '@store/actions/sie.entity.action';
import * as eFCV_POSITION_SETTINGS_STATE_ACTIONS from '@store/actions/efcvPositionSettings.action';
import { IPanelTypeState } from '@store/state/panelType.state';
import { Store } from '@ngrx/store';
import { StateUtilities } from '@store/state/IState';
import { PanelType } from '@core/models/UIModels/PanelType.model';
import { UtilityService } from '@core/services/utility.service';
import { MultiNodePanelConfigurationCommonUIModel } from '@core/models/UIModels/multinode-panel-config-common.model';
import { PanelConfigurationFacade } from '@core/facade/panelConfigFacade.service';
import { RangeValidator } from '@core/customValidators/rangeValidator.validator';
import { SieFacade } from '@core/facade/sieFacade.service';
import { SieModel, SIEWellLinkModel } from '@core/models/webModels/Sie.model';
import { SieUIModel } from '@core/models/UIModels/sie.model';
import { MultiNodeWellDataUIModel, WellTypeEnum } from '@core/models/webModels/WellDataUIModel.model';
import { WellFacade } from '@core/facade/wellFacade.service';
import { MultiNodeWellUIModel } from '@core/models/UIModels/MultinodeWell.model';
import { faSleigh } from '@fortawesome/free-solid-svg-icons';
import { IeFCVPositionSettingsState } from '@store/state/efcvPositionSettings.state';
import { eFCVPositionUIModel } from '@core/models/UIModels/eFCVPosition.model';
import { MultiNodePositionDefaultsDataUIModel } from '@core/models/UIModels/MultiNodePositionDefaultsDataUI.model';
import { Description } from 'igniteui-angular-core';
import { GatewayModalService } from '@shared/gateway-dialogs/services/gatewayModal.service';
import { DataSourceFacade } from '@core/facade/dataSourceFacade.service';
import { DataLoggerFacade } from '@core/facade/dataLoggerFacade.service';
import { MultinodeAlarmsService } from '@features/multinode/services/multinode-alarms.service';
import { MultinodeWellStepper } from '../multinode-well/multinode-well.component';


@Component({
  selector: 'app-sie',
  templateUrl: './sie.component.html',
  styleUrls: ['./sie.component.scss']
})
export class SieComponent extends GatewayPanelBase implements OnInit, OnChanges, AfterViewInit, OnDestroy {

  @Input()
  panelSchema: any;

  well: MultiNodeWellUIModel;

  newWell: MultiNodeWellDataUIModel;
  sie: SieUIModel;
  wells: MultiNodeWellDataUIModel[] = [];
  wellsInStore: MultiNodeWellDataUIModel[] = [];

  isConfigSaved: boolean;
  sieName: string = "NEW SIU";
  private arrSubscriptions: Subscription[] = [];
  isLeavingWorkflow: boolean = true;

  // Validation messages
  private mapErrMessages: Map<string, string> = new Map<string, string>();
  isPanelConfigured: boolean = true;

  isDirty: boolean;
  isSieFormDirty: boolean;
  tabLabelAddWell: string = "+ Add Well";
  selectedTabIndex = 0;
  sies: SieUIModel[];

  currentSie: SieModel;
  sieWellLinkModel: SIEWellLinkModel[] = [];
  createWellLabel: string = "Create Well";
  tecPowerSupplyLabel: string = "TEC Power Supply";
  btnTxt: string = this.createWellLabel;
  deleteBtnTxt: string = 'Delete SIU';
  // createwllStatus: boolean = false;
  bIsUnloading: boolean = false;
  isFormValid: boolean = false;
  bShowDeleteButton: boolean = true;
  bShowBackButton: boolean = true;
  bDisableDelete: boolean = true;
  sieData: any;
  eFCVPositionSettings: MultiNodePositionDefaultsDataUIModel;
  IeFCVPositionSettingsState$: Observable<IeFCVPositionSettingsState>;
  hasSieErrors = false;
  disableAddWell = false;

  panelTypeId: number;
  panelName: string;
  sieId: number;
  private currentSieIndex: number;
  private nextSieId: number;
  private prevSieId: number;
  private nextTecNumbr: number;
  private queryParamsSubscription: Subscription;
  stepperIndex: number;
  selectedTabName: string = "";
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
  isTabClicked: boolean = false;

  constructor(protected store: Store,
    private formBuilder: FormBuilder,
    private validationService: ValidationService,
    private router: Router,
    protected route: ActivatedRoute,
    private wellDataFacade: WellFacade,
    private panelConfigFacade: PanelConfigurationFacade,
    private gatewayModalService: GatewayModalService,
    protected sieFacade: SieFacade,
    private dataSourceFacade: DataSourceFacade,
    dataLoggerFacade: DataLoggerFacade,
    private multiNodeAlarmService: MultinodeAlarmsService,
    private utilityService: UtilityService) {
    super(store, panelConfigFacade, wellDataFacade, dataSourceFacade, null, null, null, null, dataLoggerFacade, sieFacade);
    this.IeFCVPositionSettingsState$ = this.store.select<
      IeFCVPositionSettingsState
    >((state: any) => state.eFCVPositionSettingsState);
  }
  selectedTab(event) {
    if (event.tab.textLabel === this.tabLabelAddWell) {
      this.stepperIndex = MultinodeWellStepper.eFCV;
      this.updateNewWell();
    } else {
      this.newWell = null;
      if (this.btnTxt === this.createWellLabel || this.btnTxt === this.tecPowerSupplyLabel) {
        this.well = null;
      } else {
        this.saveWellAndSIE();
      }
      if (this.isTabClicked) {
        this.stepperIndex = MultinodeWellStepper.eFCV;
        this.isTabClicked = false;
      } else {
        if (this.stepperIndex === MultinodeWellStepper.eFCV) {
          this.stepperIndex = MultinodeWellStepper.TEC_POWER_SUPPLY;
        } else {
          this.stepperIndex = MultinodeWellStepper.eFCV;
        }
      }
    }
    this.selectedTabName = event.tab.textLabel;
    this.setUpActionButtons(event.tab.textLabel);
  }

  tabClick() {
    this.isTabClicked = true;
  }

  private SaveSie() {
    if (this.sie != null && this.isDirty) {
      let sieValue = Object.assign({}, this.sie);
      if (sieValue.error && sieValue.error.length > 0) {
        sieValue.IsValid = false;
      } else {
        sieValue.IsValid = true;
      }
      sieValue.IsDirty = true;
      let errMssg = this.sieFacade.validateSie(sieValue);
      if (errMssg != null) {
        sieValue.IsValid = false;
      }
      this.sieId = sieValue.Id;
      this.sieFacade.saveSie(sieValue);
    }
  }

  onNextOrDoneClick(): void {
    if (this.sie != null) {
      this.isLeavingWorkflow = false;
      this.saveWellAndSIE();
      this.sieName = this.sie.Name;
      // if (this.sie.Id < 0) // New SIE
      //   this.router.navigated = false;
      this.disableAddWell = false;
      if (this.selectedTabIndex !== 0 && this.selectedTabIndex == this.sie?.SIEWellLinks?.length) {
        if (isNaN(this.nextSieId)) {
          if (this.stepperIndex === MultinodeWellStepper.eFCV) {
            this.setStepperTecPowerSupply();
          } else
            this.router.navigate([String.Format("{0}/dashboard", this.panelName)]);
        }
        else {
          if (this.stepperIndex === MultinodeWellStepper.eFCV) {
            this.setStepperTecPowerSupply();
          } else
            this.router.navigate([String.Format("{0}/sie", this.panelName), this.nextSieId]); //, { queryParams: { selectedId: this.nextChannelId } }
        }
      }
      else {
        if (this.stepperIndex === MultinodeWellStepper.eFCV) {
          this.setStepperTecPowerSupply();
        } else {
          this.selectedTabIndex += 1;
        }
      }
    }
  }

  setStepperTecPowerSupply() {
    this.stepperIndex = MultinodeWellStepper.TEC_POWER_SUPPLY;
    this.setUpActionButtons(this.selectedTabName);
  }

  saveWell() {
    if (this.well && this.isDirty) {
      // this.well.sieId = this.sie.Id;
      //this.well.currentWellName = this.well.WellName;
      const wellToUpdate = _cloneDeep(this.well); // to avoid state read only issue     
      wellToUpdate.IsValid = true;
      let errMssg = this.wellDataFacade.validateMultiNodeWell(wellToUpdate);
      if (errMssg) {
        wellToUpdate.IsValid = false;
      }
      this.wellDataFacade.saveWell(wellToUpdate);
    }
  }

  saveWellAndSIE() {
    this.saveWell();
    this.SaveSie();
  }

  onCreateWell(): void {
    if (this.newWell !== undefined && this.newWell != null) {
      if (this.stepperIndex === MultinodeWellStepper.eFCV) {
        this.setStepperTecPowerSupply();
      } else {
        this.selectedTabIndex = 0;
        this.saveWell();
        this.sie.SIEWellLinks?.push({
          Id: -(this.sie.SIEWellLinks.length + 1),
          SIEId: this.sie.Id,
          WellId: this.well.WellId,
          WellName: this.well.WellName,
          SIEName: this.sie.Name
        });
        this.SaveSie();
        setTimeout(() => {
          this.selectedTabIndex = this.sie?.SIEWellLinks?.length;
          this.setStepperCompleted(MultinodeWellStepper.TEC_POWER_SUPPLY);
        }, 0);
      }
    }
    else {
      this.selectedTabIndex += 1;
    }
  }
  
  updateNewWell() {
    const newWellId = this.wellEnity.length + 1;
    // const newWellName = this.getNewWellName(newWellId);// this.wellEnity.findIndex(w => w.WellName === `Well ${newWellId}`) === -1 ? `Well ${newWellId}` : `Well ${newWellId + 1}`;
    this.newWell = this.wellDataFacade.getNewWell(newWellId, WellTypeEnum.MultiNode);
    // this.newWell.eFCVPositions = _cloneDeep(this.eFCVPositionSettings);
    let PositionDescriptionData = _cloneDeep(this.eFCVPositionSettings.PositionDescriptionData);
    PositionDescriptionData?.forEach(descriptionData => {
      descriptionData.idPositionOwner = eFCV_POSITION_POSITION_OWNERS.WELL;
      descriptionData.Id = -1;
    });
    this.newWell.PositionDescriptionData = PositionDescriptionData;
    this.newWell.TEC.TecNumber = this.nextTecNumbr++;
  }


  wellStateChange(well: any) {
    this.isDirty = well.IsDirty;
    this.well = well;
    if (this.sie.SIEWellLinks && this.sie.SIEWellLinks.length > 0) {
      this.sie.SIEWellLinks.forEach(sieWell => {
        if (sieWell.WellId === this.well.WellId)
          sieWell.WellName = this.well.WellName;
      });
    }
    this.setUpDeleteButton();
  }
  sieUpdate(sie: any) {
    this.isDirty = sie.IsDirty;
    this.sie = sie;
  }

  isFormValidEvent(isFormValid) {
    this.isFormValid = isFormValid;
  }
  FormInValidEvent(data) {
    if (this.sie) {
      this.sie.error = data;
    }
    this.hasSieErrors = data?.length > 0;
  }



  onSIEFormChangeEvent(data) {
    this.isDirty = data.isDirty;
    this.isSieFormDirty = data.isDirty;
    this.sie = data.data;
    if (this.sie.SIEWellLinks && this.sie.SIEWellLinks.length > 0) {
      this.sie.SIEWellLinks.forEach(sieWell => {
        sieWell.SIEName = this.sie.Name;
      });
    }
  }
  onBackBtnClick(): void {
    if (this.selectedTabIndex > 0) {
      if (this.stepperIndex === MultinodeWellStepper.TEC_POWER_SUPPLY) {
        this.stepperIndex = MultinodeWellStepper.eFCV;
      } else
        this.selectedTabIndex -= 1;
    } else {
      if (!isNaN(this.prevSieId)) {
        this.router.navigate([String.Format("{0}/sie", this.panelName), this.prevSieId]);
      } else {
        this.isLeavingWorkflow = false;
        this.router.navigate([`${this.panelName}/general`]);
      }
    }
  }

  onDeleteBtnClicked(): void {
    if (this.selectedTabIndex === 0) {
      this.DeleteSIE();   // Delete SIU
    }
    else {
      this.DeleteWell();  // Delete a well
    }
  }

  private DeleteSIE() {
    this.gatewayModalService.openDialog(
      `Do you want to delete the SIU '${this.sie.Name}'?`,
      () => {
        this.gatewayModalService.closeModal();
        let sieDeviceId = this.sie.SIEDeviceId;
        this.sieFacade.deleteSie(this.sie.Id, this.sie);
        //this.multiNodeAlarmService.deleteAlarm(sieDeviceId); // clear the alarm
        this.navigateOnDelete();
      },
      () => this.gatewayModalService.closeModal(),
      deleteUIModal.title,
      null,
      true,
      deleteUIModal.primaryBtnText,
      deleteUIModal.secondaryBtnText
    );
  }

  private DeleteWell() {
    let currentWell = this.getCurrentWell();
    let toolConnections = this.toolConnectionEntity.filter(t => t.WellId === currentWell.WellId) ?? [];
    let dataLoggers = this.dataLoggerEntity.filter(t => t.WellId === currentWell.WellId && t.IsDeleted == 0) ?? [];
    if (toolConnections.length > 0) {
      this.gatewayModalService.openDialog(
        `${currentWell.WellName} is associated with a tool(s).<br>Delete the associated tool(s) before deleting the well.</br>`,
        () => this.gatewayModalService.closeModal(),
        null,
        'Warning',
        null,
        false,
        "Ok"
      );
    } else if (dataLoggers.length > 0) {
      this.gatewayModalService.openDialog(
        `${currentWell.WellName} is associated with a Data Logger(s).<br>Delete the associated Data Logger(s) before deleting the well.</br>`,
        () => this.gatewayModalService.closeModal(),
        null,
        'Warning',
        null,
        false,
        "Ok"
      );
      return;
    }
    else {
      this.gatewayModalService.openDialog(
        `Do you want to delete well '${currentWell.WellName}'?`,
        () => {
          this.gatewayModalService.closeModal();
          this.deleteWell(currentWell);
          //this.multiNodeAlarmService.deleteAlarm(currentWell.WellDeviceId); // clear the alarm
        },
        () => this.gatewayModalService.closeModal(),
        deleteUIModal.title,
        null,
        true,
        deleteUIModal.primaryBtnText,
        deleteUIModal.secondaryBtnText
      );
    }
  }

  private deleteWell(currentWell): void {
    this.wellDataFacade.deleteWell(currentWell.WellId);
    const sieWellIndex = this.sie?.SIEWellLinks?.findIndex(well => well.WellId === currentWell.WellId);
    if (sieWellIndex !== -1) {
      this.sie?.SIEWellLinks?.splice(sieWellIndex, 1);
    }
    const wellIndex = this.wells?.findIndex(well => well.WellId === currentWell.WellId);
    if (wellIndex !== -1) {
      this.wells?.splice(wellIndex, 1);
      this.selectedTabIndex -= 1;
    }
    this.setUpDeleteButton();
  }

  private navigateOnDelete(): void {
    if (isNaN(this.nextSieId) && isNaN(this.prevSieId)) {
      this.setNavigation();
    }
    else if (!isNaN(this.nextSieId)) {
      this.router.navigate([String.Format("{0}/sie", this.panelName), this.nextSieId]);
    }
    else {
      this.router.navigate([String.Format("{0}/sie", this.panelName), this.prevSieId]);
    }
  }

  setNavigation() {
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate([String.Format("{0}/sie", this.panelName)]);
    this.isLeavingWorkflow = GatewayPanelBase.ShowNavigation ? true : false;
    if (this.sieEntity?.length === 0 && !this.isLeavingWorkflow) {
      this.utilityService.setForwardStepper(1);
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
            Object.assign(
              this.eFCVPositionSettings,
              state.eFCVPositionSettings
            );
          }
        }
      }
    );

    this.arrSubscriptions.push(subscription);
  }

  getQueryParameters() {
    if (!this.queryParamsSubscription) {
      this.queryParamsSubscription = this.route.params.subscribe(params => {
        this.selectedTabIndex = params['selectedChild'] ? parseInt(params['selectedChild']) : 0;
      });
      this.arrSubscriptions.push(this.queryParamsSubscription);
    }
  }

  setCurrentSie() {
    this.sie = new SieUIModel();
    this.currentSieIndex = this.sieEntity.findIndex(x => (x.Id == this.sieId));

    if (this.currentSieIndex == -1) {  // Data Source does not exist - Navigate to Add Source page
      this.router.navigate([String.Format("{0}/sie", this.panelName)]);
      return;
    }

    this.sie = this.sieEntity[this.currentSieIndex];

    this.nextSieId = this.currentSieIndex + 1 < this.sieEntity.length ? (this.sieEntity[this.currentSieIndex + 1].Id) : NaN;
    this.prevSieId = this.currentSieIndex > 0 ? (this.sieEntity[this.currentSieIndex - 1].Id) : NaN;
    this.bShowBackButton = !isNaN(this.prevSieId) || !GatewayPanelBase.ShowNavigation;
    this.sieName = this.sie?.Name || this.sie?.currentSieName;
  }

  onStepperChange(selectedIndex) {
    this.stepperIndex = selectedIndex;
    this.setUpActionButtons(this.selectedTabName);
    this.setStepperCompleted(MultinodeWellStepper.eFCV);
  }

  setStepperCompleted(index) {
    if (this.well?.WellId < 0 && this.isFormValid && this.steps[index]) {
      this.steps[index].completed = true;
    }
  }

  private setUpActionButtons(tabName: string = null) {
    this.btnTxt = isNaN(this.sieId) ? "Create SIU" : "Next";
    if (this.btnTxt === 'Create SIU' && this.selectedTabIndex == 0) {
      this.disableAddWell = true;
    }
    this.bShowDeleteButton = isNaN(this.sieId) ? false : true;
    if (tabName != null && this.selectedTabIndex !== 0) {
      if (tabName === this.tabLabelAddWell) {
        this.btnTxt = this.getStepperButtonText(this.createWellLabel);
        this.bShowDeleteButton = false;
      } else {
        this.btnTxt = isNaN(this.nextSieId) && (this.sie?.SIEWellLinks?.length === this.selectedTabIndex) && this.stepperIndex === MultinodeWellStepper.TEC_POWER_SUPPLY ? "Done" : "Next";
      }
    }

    // GATE - 1774
    this.setUpDeleteButton();
  }

  private getStepperButtonText(wellText) {
    return this.stepperIndex === MultinodeWellStepper.eFCV ? this.tecPowerSupplyLabel : wellText;
  }

  // GATE - 1774 Starts
  // Check if any tools associated to the selected card
  private isSieAssociatedWells() {
    const cardIdx = this.selectedTabIndex <= this.sie?.SIEWellLinks?.length ? this.selectedTabIndex - 1 : -1;
    if (cardIdx !== -1) {
      if (this.sie?.SIEWellLinks?.length > 0) {
        return true;
      }
    }
    return false;
  }

  getCurrentWell() {
    return this.sie && this.sie.SIEWellLinks?.length > 0 && this.selectedTabIndex > 0 ? this.wells?.find(well => this.sie?.SIEWellLinks[this.selectedTabIndex - 1]?.WellId === well.WellId) : null;
  }

  // set up Delete button status
  private setUpDeleteButton() {
    if (this.selectedTabIndex > 0) {
      this.deleteBtnTxt = "Delete Well";
      let currentWell = this.getCurrentWell();
      this.bDisableDelete = currentWell?.Zones?.length > 0 ? true : false;
    }
    else {
      this.deleteBtnTxt = "Delete SIU";
      this.bDisableDelete = this.sie?.SIEWellLinks?.length > 0 ? true : false;
    }

    /* // If any wells associated to the selected sie, then Delete button would be disabled.
    if (this.sie?.SIEWellLinks?.length > 0 && this.selectedTabIndex > 0) {
      this.bDisableDelete = this.isSieAssociatedWells();
    } */
  }

  private setCurrentWells() {
    let currentSieWellLinks = this.sie?.SIEWellLinks?.filter((sieWell) => sieWell.SIEId === this.sie.Id);
    currentSieWellLinks?.forEach(currentSieWellLink => {
      let wellInStore: any = this.wellsInStore?.find(well => well.WellId === currentSieWellLink.WellId);
      if (wellInStore) {
        if (!this.wells?.find(well => well.WellId === wellInStore.WellId)) {
          // wellInStore.currentWellName = wellInStore.WellName ?? wellInStore.currentWellName;
          this.wells.push(wellInStore);
        }
        this.getQueryParameters();
      }
    });
  }

  postCallGetPanelConfigurationCommon(): void {
    this.panelTypeId = this.panelConfigurationCommonState.panelConfigurationCommon.PanelTypeId;
    this.panelName = UICommon.getPanelType(this.panelTypeId, true).name;

  }

  private subscribeToConfigSaveStatus(): void {
    this.isConfigSaved = this.utilityService.getConfigStatus();
  }

  postCallGetWells(): void {
    this.wellsInStore = _.cloneDeep(this.wellEnity);
    // if(this.wellsInStore.length > 0)
    //   this.initSie();
  }
  postCallGetSie(): void {
    if (this.bIsUnloading)
      return;

    this.currentSieIndex = -1;
    if (isNaN(this.sieId)) {
      if (!GatewayPanelBase.ShowNavigation && this.sieEntity.length === 1) {
        this.sieId = this.sieEntity[0].Id;
        this.setCurrentSie();
      } else {
        this.sie = this.sieFacade.getNewSie(this.sieEntity.length + 1);
      }
      this.bShowBackButton = !GatewayPanelBase.ShowNavigation;
    }
    else {
      if (this.sieEntity && this.sieEntity.length > 0) {
        this.setCurrentSie();
      }
    }

    this.setCurrentWells();
    this.setUpActionButtons();
    this.nextTecNumbr = this.sie?.SIEWellLinks?.length + 1;
  }

  ngOnChanges(): void {
    //this.validateOnInit();
  }
  ngOnDestroy(): void {
    if (this.isLeavingWorkflow) {
      GatewayPanelBase.ShowNavigation = true;
    }
    this.bIsUnloading = true;
    if (this.arrSubscriptions != null && this.arrSubscriptions.length > 0) {
      this.arrSubscriptions.forEach((subscription) => {
        if (subscription !== null) {
          subscription.unsubscribe();
          subscription = null;
        }
      });
    }

    this.arrSubscriptions = [];
    this.validationService.clearError();
    if (this.currentSieIndex != -1 && this.btnTxt !== this.createWellLabel && this.btnTxt !== this.tecPowerSupplyLabel) {
      this.saveWellAndSIE();
    }
    super.ngOnDestroy();
  }


  ngAfterViewInit(): void {
    this.initSie();
  }

  ngOnInit(): void {
    super.ngOnInit();
    const subscription = this.route.params.subscribe(params => {
      this.sieId = parseInt(params['Id']);
    });
    this.arrSubscriptions.push(subscription);
    this.initPanelConfigurationCommon();
    this.initToolConnections();
    this.initDataLoggers();
    this.initWells();
    this.subscribeToeFCVPositionSettingState();
    this.panelSchema = SIEConfigCommonSchema;
    this.subscribeToConfigSaveStatus();
    this.mapErrMessages.clear();

    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
  }

}


