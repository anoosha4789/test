import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';

import { Store } from '@ngrx/store';

import { NetworkAddressModel } from '@core/models/UIModels/network-address.model';
import { PanelConfigurationCommonModel } from '@core/models/webModels/PanelConfigurationCommon.model';
import { TimeZoneModel } from '@core/models/webModels/TimeZone.model';
import { DataSourceUIModel } from '@core/models/UIModels/dataSource.model';
import { DATA_LOGGER_TYPE, MultiNodeDefaults, PanelTypeList, UICommon, WellDataPointIndex } from '@core/data/UICommon';
import { RealTimeDataSignalRService } from '@core/services/realTimeDataSignalR.service';
import { ConfigurationService } from '@core/services/configurationService.service';
import { BrowseFileDialogComponentData } from '@shared/gateway-dialogs/components/browse-file-dialog/browse-file-dialog.component';
import { GatewayModalService } from '@shared/gateway-dialogs/services/gatewayModal.service';
import { UserService } from '@core/services/user.service';
import { SystemClockService } from '@core/services/system-clock.service';
import { BhAlertService } from 'bh-theme';
import { IErrorHandlingSettingsState } from '@store/state/errorHandlingSettings.state';
import { GatewayPanelConfigurationService } from '@core/services/gateway-panel-configuration.service';
import { IServerRunningStatusState } from '@store/state/serverRunningStatus.state';
import { IGatewayPanelBase, GatewayPanelBase } from '@comp/GatewayPanelBase.component';
import { IUnitSystemState } from '@store/state/unit-system.state';
import { UtilityService } from '@core/services/utility.service';
import { map } from 'rxjs/operators';
import { SerialPortCommunicationChannelDataUIModel } from '@core/models/webModels/SerialPortCommunicationChannelDataUIModel.model';
import { TcpIpCommunicationChannelDataUIModel } from '@core/models/webModels/TcpIpCommunicationChannelDataUIModel.model';
import { PublishingDataUIModel } from '@core/models/UIModels/dataPublishing.model';
import { GatewayTreeNode } from '@shared/gateway-treeview/components/gateway-tree-view/gateway-tree-view.component';
import { PublishingChannelFacade } from '@core/facade/publishingChannelFacade.service';
import { DataSourceFacade } from '@core/facade/dataSourceFacade.service';
import { PanelConfigurationFacade } from '@core/facade/panelConfigFacade.service';
import { WellFacade } from '@core/facade/wellFacade.service';
import { DeviceDataPointsFacade } from '@core/facade/deviceDataPointsFacade.service';
import { LoginModel, UserRoles } from '@core/models/webModels/Login.model';
import { PublishingErrorNotifierModel, WellErrorNotifierModel } from '@core/models/UIModels/error-notifier-model';
import { ButtonActions } from '@shared/gateway-dialogs/components/gateway-advanced-dialog/gateway-advanced-dialog.component';
import { enumSaveDialogActions, SaveConfigurationComponent } from '../save-configuration/save-configuration.component';
import { ConfigurationSummaryService } from '@shared/configuration/services/configuration-summary.service';

import { MAPTEMPLATES_CONFIG_SAVED } from '@store/actions/mapTemplateDetails.action';
import { SurefloFacade } from '@core/facade/surefloFacade.service';
import { IShiftDefaultState } from '@store/state/shift-default.state';
import { IPanelDefaultState } from '@store/state/panel-default.state';
import { InforceWellUIModel } from '@core/models/UIModels/InforceWell.model';
import { GwFeatureModuleService } from '@core/services/gw-feature-module.service';
import { InforceDeviceDataModel } from '@core/models/webModels/InforceDeviceData.model';
import { IInforceDeviceState } from '@store/state/inforcedevices.state';
import { StateUtilities } from '@store/state/IState';
import { INFORCEDEVICES_LOAD } from '@store/actions/inforcedevices.action';
import { HyrdraulicPowerUnitPointIndex, OperationMode } from '@features/inforce/common/InForceModbusRegisterIndex';
import { AddEditDataLoggerDialogComponent } from '@shared/data-logger/add-edit-data-logger-dialog/add-edit-data-logger-dialog.component';
import { CustomDataLoggerConfiguration } from '@core/models/webModels/DataLogger.model';
import { DataLoggerFacade } from '@core/facade/dataLoggerFacade.service';
import { DataLoggerTypesDataModel } from '@core/models/UIModels/dataLoggerTypes.model';
import { DataLoggerUIModel } from '@core/models/UIModels/dataLogger.model';
import { SieFacade } from '@core/facade/sieFacade.service';
import { IeFCVPositionSettingsState } from '@store/state/efcvPositionSettings.state';
import { SieUIModel } from '@core/models/UIModels/sie.model';
import { GwFooterService } from '@core/services/gw-footer-service.service';
import { AlarmService } from '@core/services/alarm.service';
const ConfigurationMessages = {
  AutoShiftModeMessage: "System in Auto Shift mode.",
  RecirculateModeMessage: "System in Recirculate mode.",
  VentModeMessage: "System in Vent mode.",
  ManualModeMessage: "System in Manual mode.",
  ErrorMessage: "Error(s) in the configuration.",
  NoRecordsToSave: "No changes in the configuration to save.",
  ExportDefaultMessage: "Exports a saved configuration.",
  ImportDefaultMessage: "Imports a previously saved configuration.",
  ResetDefaultMessage: "Resets the configuration to its factory default settings.",
  SaveDefaultMessage: "Saves the configuration to database.",
};

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent extends GatewayPanelBase implements OnInit, OnDestroy, IGatewayPanelBase {

  wells: string[];
  toggleWellIndex;
  toggleSourceIndex;
  toggleCardIndex;
  toggleDataPubIndex;
  toggleSource;
  dataPublishing: string[];
  panel: any;
  panelTypeName: string;
  panelName: string;
  panelTypeId: number;
  currentUser: LoginModel;
  systemClockTime = new Date();
  systemTimeZone: any;
  private timeZoneIdx: any;
  private timeZoneList: TimeZoneModel[] = [];
  networkList: NetworkAddressModel[];
  panelConfigurationCommon: PanelConfigurationCommonModel = new PanelConfigurationCommonModel();

  errorHandlingSettingsState$: Observable<IErrorHandlingSettingsState>;
  unitSystemModel$: Observable<IUnitSystemState>;
  private inforceDeviceState$: Observable<IInforceDeviceState>;
  IeFCVPositionSettingsState$: Observable<IeFCVPositionSettingsState>;

  wellList: any[];
  dataSources: DataSourceUIModel[];
  publishingList: PublishingDataUIModel[];
  generalSettingErrorsList = [];
  wellsErrorsList: WellErrorNotifierModel[];
  dataSourceErrorsList: any[];
  sieErrorsList: any[];
  publishingErrorsList: PublishingErrorNotifierModel[];
  private inForceDevices: InforceDeviceDataModel[] = [];
  dataLoggers: CustomDataLoggerConfiguration[] = [];
  loggerTypesList: DataLoggerTypesDataModel[] = [];
  sies: any[];
  multinodeWellModel: any[];
  bIsValidConfiguration = true;
  bIsConfigDirty = false;
  bIsCustomMapDirty = false;
  bIsMultiNodePanel: boolean = false;

  serverRunningStatusState$: Observable<IServerRunningStatusState>;
  bSavingConfigurationIsInProgress = false;
  bResettingIsInProgress = false;
  bImportVisible: boolean = true;
  bIsShiftInProgress: boolean = false;
  IsConfigSaved: boolean;
  IsSetOperationModeIdle: boolean;
  inForceOperationMode = 'Idle';
  panelIdBeforeImport:number;
  private wellOperationMode: Map<number, boolean> = new Map<number, boolean>();
  private arrSubscriptions: Subscription[] = [];
  dataSourceNode: GatewayTreeNode[] = [];
  publishingNode: GatewayTreeNode[] = [];
  dataLoggerNode: GatewayTreeNode[] = [];
  wellNode: GatewayTreeNode[] = [];
  sieNode: GatewayTreeNode[] = [];
  enableAddSIU: boolean = false;

  isOperationInProgress: boolean = false;
  get isExportDisabled() {
    return this.bIsShiftInProgress ||
      this.bSavingConfigurationIsInProgress ||
      (this.IsConfigSaved && !this.IsSetOperationModeIdle);
  }

  get isSaveDisabled() {
    if (this.panelConfigurationCommon.PanelTypeId === PanelTypeList.InCHARGE) {
      if (this.bIsShiftInProgress) {
        return true;
      }
    }
    if (this.panelConfigurationCommon.PanelTypeId === PanelTypeList.INFORCE) {
      if (this.inForceOperationMode === 'Auto Shift' || this.inForceOperationMode === 'Recirculate' || this.inForceOperationMode === 'Vent' || this.inForceOperationMode === 'Manual') {
        return true;
      }
    }
    if (this.panelConfigurationCommon.PanelTypeId === PanelTypeList.MultiNode) {

      // if(this.isOperationInProgress === FooterOperation.ECHO || this.isOperationInProgress === FooterOperation.RAMPUP || this.isOperationInProgress === FooterOperation.RAMPDOWN || this.isOperationInProgress === FooterOperation.ACTUATION ){
      //    return true;
      //  }
      if (this.isOperationInProgress) {
        return true;
      }
    }
    return !(this.bIsValidConfiguration && (this.bIsConfigDirty || this.bIsCustomMapDirty)) ||
      this.bSavingConfigurationIsInProgress ||
      this.bIsShiftInProgress ||
      (this.IsConfigSaved && !this.IsSetOperationModeIdle);
  }

  get isResetDisabled() {
    if (this.panelConfigurationCommon.PanelTypeId === PanelTypeList.InCHARGE) {
      if (this.bIsShiftInProgress) {
        return true;
      }
    }
    if (this.panelConfigurationCommon.PanelTypeId === PanelTypeList.INFORCE) {
      if (this.inForceOperationMode === 'Auto Shift' || this.inForceOperationMode === 'Recirculate' || this.inForceOperationMode === 'Vent' || this.inForceOperationMode === 'Manual') {
        return true;
      }
    }
    if (this.panelConfigurationCommon.PanelTypeId === PanelTypeList.MultiNode) {
      if (this.isOperationInProgress) {
        return true;
      }
      // if(this.isOperationInProgress === FooterOperation.ECHO || this.isOperationInProgress === FooterOperation.RAMPUP || this.isOperationInProgress === FooterOperation.RAMPDOWN || this.isOperationInProgress === FooterOperation.ACTUATION ){
      //   return true;
      // }
    }
    return this.bResettingIsInProgress ||
      this.bSavingConfigurationIsInProgress ||
      this.bIsShiftInProgress ||
      (this.IsConfigSaved && !this.IsSetOperationModeIdle);
  }

  get importTooltipText() {
    return ConfigurationMessages.ImportDefaultMessage;
  }

  get exportTooltipText() {
    if (this.isExportDisabled) {
      if (this.panelConfigurationCommon.PanelTypeId === PanelTypeList.InCHARGE) {
        if (this.bIsShiftInProgress) {
          return ConfigurationMessages.AutoShiftModeMessage;
        }
      }
      if (this.panelConfigurationCommon.PanelTypeId === PanelTypeList.INFORCE) {
        if (this.inForceOperationMode === 'Auto Shift') {
          return ConfigurationMessages.AutoShiftModeMessage;
        }
        else if (this.inForceOperationMode === 'Recirculate') {
          return ConfigurationMessages.RecirculateModeMessage;
        }
        else if (this.inForceOperationMode === 'Vent') {
          return ConfigurationMessages.VentModeMessage;
        }
        else if (this.inForceOperationMode === 'Manual') {
          return ConfigurationMessages.ManualModeMessage;
        }
      }
      return '';
    }
    else {
      return ConfigurationMessages.ExportDefaultMessage;
    }
  }

  get saveTooltipText() {
    if (this.isSaveDisabled) {
      if (!this.bIsValidConfiguration && (this.bIsConfigDirty || this.bIsCustomMapDirty)) {
        return ConfigurationMessages.ErrorMessage;
      }
      if (this.panelConfigurationCommon.PanelTypeId === PanelTypeList.InCHARGE) {
        if (this.bIsShiftInProgress) {
          return ConfigurationMessages.AutoShiftModeMessage;
        }
      }
      if (this.panelConfigurationCommon.PanelTypeId === PanelTypeList.INFORCE) {
        if (this.inForceOperationMode === 'Auto Shift') {
          return ConfigurationMessages.AutoShiftModeMessage;
        }
        else if (this.inForceOperationMode === 'Recirculate') {
          return ConfigurationMessages.RecirculateModeMessage;
        }
        else if (this.inForceOperationMode === 'Vent') {
          return ConfigurationMessages.VentModeMessage;
        }
        else if (this.inForceOperationMode === 'Manual') {
          return ConfigurationMessages.ManualModeMessage;
        }
      }
      if (!this.bIsConfigDirty && !this.bIsCustomMapDirty) {
        return ConfigurationMessages.NoRecordsToSave;
      }
      return '';
    }
    else {
      return ConfigurationMessages.SaveDefaultMessage;
    }
  }

  get resetTooltipText() {
    if (this.isResetDisabled) {
      if (this.panelConfigurationCommon.PanelTypeId === PanelTypeList.InCHARGE) {
        if (this.bIsShiftInProgress) {
          return ConfigurationMessages.AutoShiftModeMessage;
        }
      }
      if (this.panelConfigurationCommon.PanelTypeId === PanelTypeList.INFORCE) {
        if (this.inForceOperationMode === 'Auto Shift') {
          return ConfigurationMessages.AutoShiftModeMessage;
        }
        else if (this.inForceOperationMode === 'Recirculate') {
          return ConfigurationMessages.RecirculateModeMessage;
        }
        else if (this.inForceOperationMode === 'Vent') {
          return ConfigurationMessages.VentModeMessage;
        }
        else if (this.inForceOperationMode === 'Manual') {
          return ConfigurationMessages.ManualModeMessage;
        }
      }
      return '';
    }
    else {
      return ConfigurationMessages.ResetDefaultMessage;
    }
  }

  constructor(
    private router: Router,
    protected route: ActivatedRoute,
    private userService: UserService,
    private panelConfigFacade: PanelConfigurationFacade,
    private wellDataFacade: WellFacade,
    private dataSourceFacade: DataSourceFacade,
    private publishingFacade: PublishingChannelFacade,
    private deviceFacade: DeviceDataPointsFacade,
    private surefloDataFacade: SurefloFacade,
    private gwFeatureModuleService: GwFeatureModuleService,
    private gatewayPanelConfigurationService: GatewayPanelConfigurationService,
    private configSummaryService: ConfigurationSummaryService,
    private gwFooterService: GwFooterService,

    protected store: Store<{
      errorHandlingSettingsState: IErrorHandlingSettingsState;
      unitSystemState: IUnitSystemState;
      shiftDefaultState: IShiftDefaultState;
      panelDefaultState: IPanelDefaultState;
      serverRunningStatusState: IServerRunningStatusState
    }>,
    private realTimeDataSignalRService: RealTimeDataSignalRService,
    private configurationService: ConfigurationService,
    private gatewayModalService: GatewayModalService,
    private systemClockService: SystemClockService,
    private utilityService: UtilityService,
    private bhAlertService: BhAlertService,
    private alarmService: AlarmService,
    dataLoggerFacade: DataLoggerFacade,
    sieFacade: SieFacade) {
    super(store, panelConfigFacade, wellDataFacade, dataSourceFacade, publishingFacade, deviceFacade, null, surefloDataFacade, dataLoggerFacade, sieFacade);
    this.inforceDeviceState$ = this.store.select<IInforceDeviceState>((state: any) => state.inforcedevicesState);
    // this.deviceDataPointsModels$ = this.store.select<any>((state: any) => state.deviceDataPointsState);
    this.errorHandlingSettingsState$ = this.store.select<any>(
      (state: any) => state.errorHandlingSettingsState
    );
    this.unitSystemModel$ = this.store.select<IUnitSystemState>(
      (state: any) => state.unitSystemState
    );
    this.serverRunningStatusState$ = this.store.select<any>(
      (state: any) => state.serverRunningStatusState
    );
    this.IeFCVPositionSettingsState$ = this.store.select<
      IeFCVPositionSettingsState
    >((state: any) => state.eFCVPositionSettingsState);
  }

  private updateValidateState(isValid: boolean) {
    this.bIsValidConfiguration = this.bIsValidConfiguration && isValid;
    UICommon.isSaveBtnEnabled = this.bIsValidConfiguration && this.bIsConfigDirty;
  }

  private subscribeToErrorHandlingSettingState(): void {
    const subscription = this.errorHandlingSettingsState$.subscribe(
      (state: IErrorHandlingSettingsState) => {
        if (state !== undefined) {
          if (state.errorHandlingSettings.error) { // GATE - 1237
            this.updateErrorNotifierList(state.errorHandlingSettings.error);
          }
          this.updateValidateState(state.isValid);
          this.bIsConfigDirty = this.bIsConfigDirty || state.isDirty;
        }
      }
    );
    this.arrSubscriptions.push(subscription);
  }

  private subscribeToOperationStatus() {
    const subscription = this.gwFooterService.subscribeToOperationStatus().subscribe(footerStatus => {
      if (this.isOperationInProgress != footerStatus)
        this.isOperationInProgress = footerStatus;
    });
    this.arrSubscriptions.push(subscription);
  }

  private subscribeToUnitSystems() {
    const subscription = this.unitSystemModel$.subscribe(
      (state: IUnitSystemState) => {
        if (state !== undefined) {
          this.updateValidateState(state.isValid);
          this.bIsConfigDirty = this.bIsConfigDirty || state.isDirty;
        }
      }
    );

    this.arrSubscriptions.push(subscription);
  }

  private subscribeToeFCVpositions() {
    const subscription = this.IeFCVPositionSettingsState$.subscribe(
      (state: IeFCVPositionSettingsState) => {
        if (state !== undefined) {
          if (state.eFCVPositionSettings.error) {
            this.updateErrorNotifierList(state.eFCVPositionSettings.error);
          }
          this.updateValidateState(state.isValid);
          this.bIsConfigDirty = this.bIsConfigDirty || state.isDirty;
        }
      }
    );

    this.arrSubscriptions.push(subscription);
  }

  private subscribeToServerRunningStatus(): void {
    const subscription = this.serverRunningStatusState$.subscribe(
      (state: IServerRunningStatusState) => {
        console.log('response the serverRunningStatusState updated');
        if (state) {
          const resetStatus = state.ConfigurationResetingInProgress;
          this.bSavingConfigurationIsInProgress = state.ConfigurationSavingInProgress;
          if (this.bResettingIsInProgress && resetStatus == false) {
            this.ResetDone();
          }
        }
      }
    );
    this.arrSubscriptions.push(subscription);
  }

  toggleEdit(key, index) {
    switch (key) {
      case 'well':
        this.toggleWellIndex = this.toggleWellIndex === index ? null : index;
        break;
      case 'source':
        this.toggleSourceIndex =
          this.toggleSourceIndex === index ? null : index;
        break;
      case 'card':
        this.toggleCardIndex = this.toggleCardIndex === index ? null : index;
        break;
      case 'dataPub':
        this.toggleDataPubIndex =
          this.toggleSourceIndex === index ? null : index;
        break;

      default:
        break;
    }
  }

  getSystemTimeZone() {
    // Get All Timezones from server
    const subscription = this.systemClockService
      .getTimeZoneArray()
      .subscribe((res) => {
        this.timeZoneList = res;
        if (this.timeZoneList && this.timeZoneList.length > 0) {
          const systemclockDescription = this.getSystemClockTimeZoneDescription();
          if (systemclockDescription) {
            this.systemTimeZone =
              systemclockDescription +
              ' (' +
              this.getSystemClockTimeZoneValue().replace(':', '') +
              ')';
            this.systemClockService.setSystemTimezone(this.systemTimeZone);
          }else{
            //while connecting
            this.systemTimeZone= "...";
          }
        }
      });
    this.arrSubscriptions.push(subscription);
  }

  getSystemClockTimeZoneDescription(): string {
    const timezone = this.timeZoneList.find(
      (c) => c.Index === this.timeZoneIdx
    );
    return timezone ? timezone.Id : null;
  }

  getSystemClockTimeZoneValue(): string {
    const timezone = this.timeZoneList.find(
      (c) => c.Index === this.timeZoneIdx
    );
    if (timezone) {
      const isnegativeoffset = timezone.BaseUtcOffset.indexOf('-');
      if (isnegativeoffset === -1) {
        // +ve offset
        return 'UTC+' + timezone.BaseUtcOffset.substr(0, 5).replace(':', '');
      } else {
        // -ve offset
        return 'UTC' + timezone.BaseUtcOffset.substr(0, 6).replace(':', '');
      }
    }
  }
  postCallGetLoggerTypes() {
    this.loggerTypesList = this.loggerTypesEntity ?? [];
  }
  postCallGetDataLoggers() {
    this.dataLoggers = this.dataLoggerEntity ?? [];
    this.UpdateDataLoggerTree();
    const dataLoggerData: DataLoggerUIModel[] = this.dataLoggers;
    if (dataLoggerData && dataLoggerData.length > 0) {
      let bValid = true;
      for (let i = 0; i < dataLoggerData.length; i++) {
        if (dataLoggerData[i].IsValid != undefined && !dataLoggerData[i].IsValid) {
          bValid = false;
          break;
        }
      }
      // get dirty status
      for (let i = 0; i < dataLoggerData.length; i++) {
        if (dataLoggerData[i].IsDirty) {
          this.bIsConfigDirty = this.bIsConfigDirty || true;
          break;
        }
      }
      this.updateValidateState(bValid);
    }
  }

  postCallGetSie() {
    this.sies = this.sieEntity ?? [];
    this.sieErrorsList = [];
    this.updateSieTree();
    const sieData: SieUIModel[] = this.sies;
    if (sieData) {
      this.enableAddSIU = sieData.length < MultiNodeDefaults.SIU_MAX_LIMIT;
      let bValid = true;
      for (let i = 0; i < sieData.length; i++) {
        if (sieData[i].IsValid != undefined && !sieData[i].IsValid) {
          bValid = false;
          break;
        }
      }
      // get dirty status
      for (let i = 0; i < sieData.length; i++) {
        if (sieData[i].IsDirty) {
          this.bIsConfigDirty = this.bIsConfigDirty || true;
          break;
        }
      }

      bValid = this.sies.length === 0 ? false : bValid;
      this.updateValidateState(bValid);
      //this.subscribeToCommunicationStatus();
    }
  }
  updateSieTree() {
    this.sieNode = [];
    let nodeIndex = 0;
    let well = this.wellEnity;

    if (this.sies.length > 0 && this.sies) {
      this.sies.forEach(item => {
        this.multinodeWellModel = [];
        let error = [];
        well.forEach(Px => {
          if (item.SIEWellLinks.find(Py => Py.WellId == Px.WellId)) {
            this.multinodeWellModel.push(Px);
            if (Px.Error && Px.Error.length > 0) {
              Px.Error.forEach(wellError => {
                error.push(wellError);
              });
              item.IsValid = false;
            }
          }
        })

        if (error && error.length > 0) {
          item.error = (typeof item.error != 'undefined' && item.error instanceof Array) ? item.error : []
          item.error.push.apply(item.error, error);
        }

        if (!item.IsValid && item.error && item.error.length > 0) {
          item.error.forEach(error => {
            this.sieErrorsList.push(error);
          });
        }

        const treeNode: GatewayTreeNode = {
          name: item.error ? item.currentSieName : item.Name,
          index: ++nodeIndex,
          routerLink: this.setPageRoute(this.panelConfigurationCommon.PanelTypeId, 'sie', item.Id),
          params: null,
          parentNode: true,
          errors: item.error ? item.error : null
        };
        treeNode.children = [];
        this.multinodeWellModel.forEach((child, index) => {
          if (child.Error && child.Error.length > 0) {
            child!.Error[0]!.path = child!.Error[0]!.path + ";selectedChild=" + (index + 1);

          }
          treeNode.children.push({
            name: child.Error ? child.currentWellName : child.WellName,
            index: ++nodeIndex,
            routerLink: this.setPageRoute(this.panelConfigurationCommon.PanelTypeId, 'sie', item.Id),
            params: { selectedChild: index + 1 },
            errors: child.Error ? child.Error : null
          });
        })
        this.sieNode.push(treeNode);
      })
    }
  }

  getNetworkDetails() {
    this.utilityService.getSystemIPAdress()
      .pipe(
        map(response => response.map(item => {
          item.IpAddressList = item.IpAddress ? item.IpAddress.split('.') : null;
          item.SubnetMaskList = item.SubnetMask ? item.SubnetMask.split('.') : null;
          item.DefaultGatewayList = item.DefaultGateway ? item.DefaultGateway.split('.') : null;
          return item;
        }))
      )
      .subscribe((res) => {
        if (res) {
          this.networkList = res;
        }
      });
  }

  get IsPanelConfigured() {
    return GatewayPanelBase.ShowNavigation;
  }

  // Import Configuration
  ImportConfiguration(): void {
    const browseFileDialogComponentData: BrowseFileDialogComponentData = {
      Title: 'Import System Configuration',
      ForImportFile: true, // if this dialog is for export file, set it to false.
      FileExtensions: '.dat', // set the file extension for file selection filter
      SelectedFileName: '', // returned file name
      SelectedFile: {}, // return file object
      PrimaryBtnText: "Import"
    };
    this.panelIdBeforeImport = this.panelConfigurationCommon.PanelTypeId;
    this.gatewayModalService.openBrowseFileDialog(
      browseFileDialogComponentData
    );
    this.gatewayModalService.confirmed().subscribe((result) => {
      if (result) {
        this.bIsValidConfiguration = true;  // reset state
        this.bIsConfigDirty = true;
        UICommon.isSaveBtnEnabled = true;
        this.generalSettingErrorsList = [];
        this.gatewayPanelConfigurationService.ImportConfiguration(
          result.SelectedFile
          
        )
      
      }
    });
  }

  // Export Saved Configuration
  ExportConfiguration(): void {
    const browseFileDialogComponentData: BrowseFileDialogComponentData = {
      Title: 'Export System Configuration',
      ForImportFile: false, // if this dialog is for export file, set it to false.
      FileExtensions: '*.dat', // set the file extension for file selection filter
      SelectedFileName: 'GatewayConfiguration', // returned file name
      SelectedFile: {}, // return file object
      IsConfigDirty: this.bIsConfigDirty,
      PrimaryBtnText: "Export"
    };

    this.gatewayModalService.openBrowseFileDialog(
      browseFileDialogComponentData
    );
    this.gatewayModalService.confirmed().subscribe((result) => {
      if (result) {
        this.gatewayPanelConfigurationService.ExportConfiguration(result.SelectedFileName);
      }
    });
  }

  // Reset Existing Configuration
  ResetConfiguration(): void {
    this.gatewayModalService.openResetConfigurationDialog();
    this.gatewayModalService.confirmed().subscribe((result) => {
      if (result !== undefined && result === true) {
        UICommon.isBusyWaiting = true;
        if (this.currentUser && this.currentUser.Name.toLowerCase() == "manufacturing") {
          this.configurationService.manufactureReset().subscribe(
            () => {
              console.log("Reset command successfully send.");
              this.bResettingIsInProgress = true;
            }, //this.ResetDone(),
            (error) => this.ResetError(error)
          );
        }
        else {
          this.configurationService.configurationReset().subscribe(
            () => {
              console.log("Reset command successfully send.");
              this.bResettingIsInProgress = true;
            },  //this.ResetDone(),
            (error) => this.ResetError(error)
          );
        }
      }
    });
  }

  private ResetDone(): void {
    this.realTimeDataSignalRService.NotifyOthersForConfigurationResetEvent(); // Notify other clients
    GatewayPanelBase.ShowNavigation = false;
    UICommon.IsConfigSaved = false;
    UICommon.deletedObjects = [];
    UICommon.comPortsInUse = [];
    this.bResettingIsInProgress = false;
    this.utilityService.setHeaderLinksByUser(false);
    this.unsubscribeFacadeSubscriptions();
    this.gatewayPanelConfigurationService.ResetStateConfiguration();
    this.realTimeDataSignalRService.ResetData();
    this.alarmService.resetAlarms();
    this.ClearLocalstorage();
    this.userService.LogOut().then(() => {
      //this.router.navigate(['Home']);
      UICommon.isBusyWaiting = false;
      this.bhAlertService.showAlert(
        'success',
        'top',
        5000,
        'Reset successful!'
      );
    }
      ,
      (error) => {
        UICommon.isBusyWaiting = false;
      })
      .finally(() => {
        UICommon.isBusyWaiting = false;
        this.router.navigate(['Home']);
        this.systemClockService.restartClock();
      });
  }

  private ClearLocalstorage(){
    window.localStorage.removeItem("pointTrendCharts");
    window.localStorage.removeItem("historianTrendData");
  }
  private ResetError(error: any): void {
    UICommon.isBusyWaiting = false;
    this.bhAlertService.showAlert(
      'error',
      'top',
      5000,
      'Error in Reset Configuration!'
    );
  }

  // Save modified Configuration to Database
  ApplyConfiguration(): void {
    if (this.bIsConfigDirty && this.bIsValidConfiguration) {
      UICommon.isBusyWaiting = true;
      const bIsConfigSaved = this.panelConfigurationCommon.Id > 0 ? true : false;
      this.configSummaryService.getConfigurationSummary(bIsConfigSaved).then(summary => {
        UICommon.isBusyWaiting = false;
        if (summary.devicesChanges.length > 0 || summary.errorHandlingChanges.length > 0
          || summary.panelSettingChanges.length > 0 || summary.publishingChanges.length > 0
          || summary.unitSystemChanges.length > 0 || summary.wellChanges.length > 0
          || summary.surefloChanges.length > 0 || summary.shiftDefaultChanges.length > 0
          || summary.panelDefaultChanges.length > 0 || summary.alarmsAndLimitsChanges.length > 0
          || summary.dataLoggerChanges.length > 0 || summary.sieChanges.length > 0 || summary.eFCVPositionsChanges.length > 0) {
          this.gatewayModalService.openAdvancedDialog(
            "Configuration Summary",
            ButtonActions.None,
            SaveConfigurationComponent,
            summary,
            (result: enumSaveDialogActions) => {
              switch (result) {
                case enumSaveDialogActions.Save:
                  this.SaveConfiguration();
                  break;

                case enumSaveDialogActions.Cancel:
                  this.CancelConfigurationChanges();
                  break;
              }
              GatewayPanelBase.ShowNavigation = true;
            },
            '900px'
          );
        }
        else {
          this.gatewayPanelConfigurationService.ResetStateConfiguration();
          this.ConfigurationSaved();
        }
      })
        .finally(() => UICommon.isBusyWaiting = false);
    }
    else {
      if (this.bIsCustomMapDirty) {
        this.configurationService.restartAcquisitionProcess().subscribe();
        this.ConfigurationSaved();
        this.store.dispatch(MAPTEMPLATES_CONFIG_SAVED());
      }
    }
  }

  private ConfigurationSaved(): void {
    const panelTypeId = this.panelConfigurationCommon.PanelTypeId;
    // Reset UI states
    UICommon.IsImportConfig = false;
    UICommon.ImportMaxDeviceId = -1;
    UICommon.IsConfigSaved = true;
    if (!this.utilityService.getConfigStatus()) {
      this.utilityService.setHeaderLinksByUser(true);
    }
    this.bImportVisible = false;
    this.bIsValidConfiguration = true;
    this.bIsConfigDirty = false;
    this.bIsCustomMapDirty = false;
    UICommon.isSaveBtnEnabled = this.bIsValidConfiguration && this.bIsConfigDirty;
    UICommon.deletedObjects = [];
    this.utilityService.setForwardStepper(0);

    this.realTimeDataSignalRService.NotifyOthersForConfigurationUpdatedEvent();
    console.log('Configuration saved successful!');
    this.bhAlertService.showAlert(
      'success',
      'top',
      5000,
      'Configuration save successful!'
    );
    this.navToMonitorPage(panelTypeId);
  }

  private navToMonitorPage(panelTypeId: number) {
    const panelInfo = UICommon.getPanelType(panelTypeId);
    this.router.navigate([`${panelInfo.name}/monitoring`]);
  }

  private SaveConfiguration(): void {
    console.log('this.store.dispatch SaveConfiguration');
    UICommon.isBusyWaiting = true;
    this.gatewayPanelConfigurationService
      .SaveConfiguration()
      .then((result) => {
        //UICommon.isBusyWaiting = false;
        this.ConfigurationSaved();
      })
      .catch((err) => {
        //UICommon.isBusyWaiting = false;
        this.bhAlertService.showAlert('error', 'top', 5000, err ?? '');
      });
  }

  private CancelConfigurationChanges(): void {
    this.gatewayModalService.openDialog(
      `Do you want to cancel changes?`,
      () => {
        UICommon.deletedObjects = [];
        this.gatewayPanelConfigurationService.ForceReloadConfiguration(UserRoles.Administrator, true);
        this.bIsConfigDirty = false;
        this.gatewayModalService.closeModal();
        if (this.panelConfigurationCommon?.Id < 0 || UICommon.IsImportConfig) {
          UICommon.IsImportConfig = false;
          this.router.navigate(['Home']);
        }
      },
      () => this.gatewayModalService.closeModal(),
      'Warning',
      null,
      true,
      "Yes",
      "No"
    );
  }
  private UpdateDataLoggerTree(): void {
    this.dataLoggerNode = [];
    let nodeIndex = 0;
    if (this.dataLoggers.length > 0 && this.dataLoggers.find(x => x.IsDeleted === 0)) {
      const treeNode: GatewayTreeNode = {
        name: "Data Logger",
        index: ++nodeIndex,
        routerLink: null,
        params: null,
        parentNode: true
        //errors: publishing.Error ? publishing.Error.filter(e => e.pubId === publishing.Id) : null
      };
      treeNode.children = [];
      this.dataLoggers.forEach(item => {
        if (item.IsDeleted == 0) {
          treeNode.children.push({
            name: item.Name,
            info: this.loggerTypesList.find(Px => Px.Key === item.DataLoggerType)?.Value,
            index: ++nodeIndex,
            routerLink: this.setPageRoute(this.panelConfigurationCommon.PanelTypeId, 'datalogger', item.Id),
            params: null
            //errors: publishing.Error ? publishing.Error.filter(e => e.pubId === publishing.Id) : null
          });
        }
      })
      this.dataLoggerNode.push(treeNode);
    }
  }
  private UpdateDataPublishingTree(): void {
    this.publishingErrorsList = [];
    this.publishingList = this.publishingEntity ?? [];
    this.publishingNode = [];
    // get validation status
    let bValid = true;
    let err: any[] = [];
    for (let i = 0; i < this.publishingList.length; i++) {
      if (this.publishingList[i].Error?.length > 0) {
        this.publishingList[i].Error.forEach(er => {
          err.push(er);
        })

      }
      if (this.publishingList[i].IsValid !== undefined && !this.publishingList[i].IsValid) {
        bValid = false;
        break;
      }
    }
    let nodeIndex = 0;
    if (this.publishingList.length > 0) {
      const treeNode: GatewayTreeNode = {
        name: "Realtime Data",
        index: ++nodeIndex,
        routerLink: null,
        params: null,
        errors: err,
        parentNode: true
      };
      treeNode.children = [];
      this.publishingList.forEach(publishing => {
        let publishingInfo = this.publishingFacade.getPublishingName(publishing);

        // const treeNode: GatewayTreeNode = {
        //   name: publishingInfo.Name,
        //   info: publishingInfo.Protocol.toString(),
        //   description: "Connected To: " + publishingInfo.ConnectedTo,
        //   index: ++nodeIndex,
        //   routerLink: this.setPageRoute(this.panelConfigurationCommon.PanelTypeId, 'publishing', publishing.Id),
        //   params: null,
        //   errors: publishing.Error ? publishing.Error.filter(e => e.pubId === publishing.Id) : null
        // };
        // treeNode.children = [];
        treeNode.children.push({
          name: publishingInfo.Name,
          info: publishingInfo.Protocol.toString(),
          description: "Connected To: " + publishingInfo.ConnectedTo,
          index: ++nodeIndex,
          routerLink: this.setPageRoute(this.panelConfigurationCommon.PanelTypeId, 'publishing', publishing.Id),
          params: null,
          errors: publishing.Error ? publishing.Error.filter(e => e.pubId === publishing.Id) : null
        });
        // GATE- 1239 Publishing ErrorsList
      });
      if (treeNode.errors && treeNode.errors.length > 0) {
        treeNode.errors.forEach(error => this.publishingErrorsList.push(error));
      }
      this.publishingNode.push(treeNode);
    }
    // get dirty status
    for (let i = 0; i < this.publishingList.length; i++) {
      if (this.publishingList[i].IsDirty !== undefined && this.publishingList[i].IsDirty) {
        this.bIsConfigDirty = this.bIsConfigDirty || true;
        break;
      }
    }
    this.updateValidateState(bValid);

  }

  // IGatewayPanelBase methods
  postCallGetPanelConfigurationCommon(): void {
    if (this.panelConfigurationCommonState.panelConfigurationCommon.error) { // GATE- 1237 General Setting Error Validation
      this.updateErrorNotifierList(this.panelConfigurationCommonState.panelConfigurationCommon.error);
    }
    this.updatePanelErrorHandlingNotifiers();
    this.updateConfigDirtyNotifiers();
    this.panelConfigurationCommon = this.panelConfigurationCommonState.panelConfigurationCommon;
    this.updateValidateState((this.panelConfigurationCommon.PanelTypeId > 0 && this.panelConfigurationCommonState.isValid) || UICommon.IsImportConfig);
    this.bIsConfigDirty = this.bIsConfigDirty || this.panelConfigurationCommonState.isDirty;
    this.bImportVisible = this.panelConfigurationCommon.Id <= 0 || UICommon.IsImportConfig;
    let panelInfo = UICommon.getPanelType(this.panelConfigurationCommon.PanelTypeId, true);
    this.panelName = this.panelConfigurationCommon.PanelTypeId > 0 ? panelInfo.name : null;
    this.panelTypeName = this.panelConfigurationCommon.PanelTypeId > 0 ? panelInfo.displayName : '';
    if (this.panelConfigurationCommon.PanelTypeId === PanelTypeList.MultiNode)
      this.bIsMultiNodePanel = true;
    if(this.panelIdBeforeImport && this.panelIdBeforeImport !== this.panelConfigurationCommon.PanelTypeId) {
      this.panelIdBeforeImport = this.panelConfigurationCommon.PanelTypeId
      const address = `${panelInfo.name}/dashboard`;
      this.router.navigate(['/' + address]);
    }
  }

  // GATE- 1237 General Setting Error Validation
  updateErrorNotifierList(error) {
    if (this.generalSettingErrorsList.length > 0) {
      const errorIdx = this.generalSettingErrorsList.findIndex((item) => item.tabName === error.tabName);
      if (errorIdx == -1) this.generalSettingErrorsList.push(error);
    } else {
      this.generalSettingErrorsList.push(error);
    }
  }

  postCallGetWells(): void {
    this.wellList = this.wellEnity ?? [];
    this.wellNode = [];
    let nodeIndex = -1;
    this.wellList.forEach((well, index) => {
      const treeNode: GatewayTreeNode = {
        name: well.Error ? well.currentWellName : well.WellName,
        index: ++nodeIndex,
        routerLink: this.setPageRoute(this.panelConfigurationCommon.PanelTypeId, 'well', well.WellId),
        params: null,
        errors: this.panelConfigurationCommon.PanelTypeId !== PanelTypeList.INFORCE ? (this.panelConfigurationCommon.PanelTypeId !== PanelTypeList.MultiNode ? (well.Error || null) : this.getMultinodeWellErrorList(well, index)) : this.getInforceWellErrorList(well),
      };
      treeNode.children = [];
      this.wellNode.push(treeNode);
    });
    // get validation status
    let bValid = true;
    for (let i = 0; i < this.wellList.length; i++) {
      if (this.wellList[i].IsValid != undefined && !this.wellList[i].IsValid) {
        bValid = false;
        break;
      }
    }
    // get dirty status
    for (let i = 0; i < this.wellList.length; i++) {
      if (this.wellList[i].IsDirty) {
        this.bIsConfigDirty = this.bIsConfigDirty || true;
        break;
      }
    }

    // InFORCE well is part of minimum configuration
    if (this.panelConfigurationCommon.PanelTypeId === PanelTypeList.INFORCE) {
      bValid = this.wellList.length === 0 ? false : bValid;
      this.subscribeToInforceDevices();
    }

    // GATE-1236
    if (this.wellList && this.wellList.length > 0) {
      this.updateWellsErrorList();
      bValid = this.wellsErrorsList.length > 0 ? false : bValid;
    }

    this.updateValidateState(bValid);
    if (this.panelConfigurationCommon.PanelTypeId === PanelTypeList.InCHARGE) {
      this.subscribeToWellOperationMode();
    }
  }


  // GATE- 1236 Wells Error Validation
  updateWellsErrorList() {
    this.wellsErrorsList = [];
    this.wellList.forEach((well) => {
      if (well.Error && well.Error.length > 0) {
        well.Error.forEach(wellError => {
          this.wellsErrorsList.push(wellError);
        });
      }
    });
  }

  getInforceWellErrorList(well: InforceWellUIModel) {
    well.Error = well.Error ?? [];
    // Output mapping errors
    if (well.outMapErrors && well.outMapErrors.length > 0) {
      well.outMapErrors.forEach(error => well.Error.push(error));
    }
    // Zone mapping errors
    if (well.zoneMapErrors && well.zoneMapErrors.length > 0) {
      well.zoneMapErrors.forEach(error => well.Error.push(error));
    }
    // Zoen details errors
    if (well.zoneErrors && well.zoneErrors.length > 0) {
      well.zoneErrors.forEach(error => well.Error.push(error));
    }
    return well.Error;
  }

  getMultinodeWellErrorList(well: any, index: any) {
    well.Error = well.Error ?? [];
    if (well.TEC.PowerSupplySettings.error && well.TEC.PowerSupplySettings.error.length > 0) {
      well.TEC.PowerSupplySettings.error.forEach(error => well.Error.push(error));
    }
    return well.Error;
  }



  private subscribeToInforceDevices(): void {
    const subscription = this.inforceDeviceState$.subscribe(
      (state: IInforceDeviceState) => {
        if (state !== undefined) {
          if (state.isLoaded === false && !StateUtilities.hasErrors(state)) {
            this.store.dispatch(INFORCEDEVICES_LOAD());
          } else {
            Object.assign(this.inForceDevices, state.inforcedevices);
            this.subScribeToInFORCEStatus();
          }
        }
      }
    );
    this.arrSubscriptions.push(subscription);
  }


  private subScribeToInFORCEStatus(): void {
    // Operation Mode
    this.inForceOperationMode = 'Idle';
    let hpuDeviceId = this.inForceDevices.find(d => d.DeviceName === "HPU")?.DeviceId;
    let subscription = this.realTimeDataSignalRService.GetRealtimeData(hpuDeviceId, HyrdraulicPowerUnitPointIndex.CurrentOperationMode).subscribe(value => {
      if (value !== undefined && value !== null) {
        if (value.Value === OperationMode.Idle) {
          this.inForceOperationMode = "Idle";
        }
        else if (value.Value === OperationMode.AutoShift) {
          this.inForceOperationMode = "Auto Shift";
        }
        else if (value.Value === OperationMode.VentAll) {
          this.inForceOperationMode = "Vent";
        }
        else if (value.Value === OperationMode.Recirculation) {
          this.inForceOperationMode = "Recirculate";
        }
        else if (value.Value === OperationMode.Manual) {
          this.inForceOperationMode = "Manual";
        }
      }
    });
    this.arrSubscriptions.push(subscription);
  }

  private updateShiftStatus(): void {
    this.bIsShiftInProgress = false;
    this.wellOperationMode.forEach(value => {
      this.bIsShiftInProgress = this.bIsShiftInProgress || value;
    });
  }

  private subscribeToWellOperationMode(): void {
    this.wellList.forEach(well => {
      if (well.WellId > 0) {
        let deviceSubs = this.realTimeDataSignalRService.GetRealtimeData(well.WellDeviceId, WellDataPointIndex.WellOperationMode).subscribe((d) => {
          if (d !== undefined && d !== null) {
            this.wellOperationMode.set(d.DeviceId, d.Value == 1 ? true : false);
            this.updateShiftStatus();
          }
        });
        this.arrSubscriptions.push(deviceSubs);
      }
    });
  }


  postCallGetDataSources(): void {
    this.dataSourceErrorsList = [];
    this.dataSources = this.dataSourcesEntity ?? [];
    let bValid = this.dataSources.length > 0 ? true : ((this.panelConfigurationCommon.PanelTypeId === PanelTypeList.INFORCE || this.panelConfigurationCommon.PanelTypeId === PanelTypeList.MultiNode) ? true : false);

    this.dataSourceNode = [];
    let nodeIndex = -1;
    this.dataSources.forEach(source => {
      source.IsValid = true;
      let channelSource = source.Channel.channelType == 0 ? source.Channel as SerialPortCommunicationChannelDataUIModel : source.Channel as TcpIpCommunicationChannelDataUIModel;

      if (source.Cards && source.Cards.length == 0) {
        source.IsValid = false;
        bValid = bValid && false;
      }

      let errMssg = this.dataSourceFacade.validateDataSource(source);
      if (errMssg != null) {
        source.IsValid = false;
        bValid = bValid && false;
      }

      if (source.cardError && source.cardError.length > 0) {
        source.cardError.forEach(error => {
          const cardIdx = source.Cards.findIndex(card => card.DeviceId === error.deviceId);
          error.path = `${error.path};selectedChild=${cardIdx + 1}`;
          source.channelError.push(error);
        });
      }

      let treeNode: GatewayTreeNode = {
        name: this.dataSourceFacade.getDataSourceName(source.Channel),
        index: ++nodeIndex,
        routerLink: this.setPageRoute(this.panelConfigurationCommon.PanelTypeId, 'datasource', channelSource.IdCommConfig),
        params: null,
        errors: source.IsValid ? null : source.channelError || null
      };

      // GATE- 1238 Datasource ErrorsList
      if (!source.IsValid && source.channelError && source.channelError.length > 0) {
        source.channelError.forEach(error => {
          const idx = error.errors.findIndex(er => er.value === "Port Number : Ip Address & Port are used.");
          if (idx >= 0) error.errors.splice(idx, 1);

          if (!error.path.includes('/datasource/'))
            error.path = error.path + '/datasource/' + error.channelId;

          this.dataSourceErrorsList.push(error);
        });
      }
      treeNode.children = [];
      source.Cards.forEach((card, index) => {
        const error = source.cardError ? source.cardError.filter(e => e.deviceId === card.DeviceId) : null;
        treeNode.children.push({
          name: error ? card.currentCardName : card.Description,
          index: ++nodeIndex,
          routerLink: this.setPageRoute(this.panelConfigurationCommon.PanelTypeId, 'datasource', channelSource.IdCommConfig),
          params: { selectedChild: index + 1 },
          errors: source.IsValid ? null : error || null
        });
        // GATE- 1238 Datasurce ErrorsList
        // if(error && error.length > 0) {
        //   error.forEach(error => this.dataSourceErrorsList.push(error));
        // }
      });
      this.dataSourceNode.push(treeNode);
    });
    this.updateValidateState(bValid); // set validation status

    // get dirty status
    for (let i = 0; i < this.dataSources.length; i++)
      if (this.dataSources[i].IsDirty !== undefined && this.dataSources[i].IsDirty) {
        this.bIsConfigDirty = this.bIsConfigDirty || true;
        break;
      }
  }

  postCallGetModbusProtocols(): void {
    this.UpdateDataPublishingTree();
  }

  postCallGetDataPublishing(): void {
    this.UpdateDataPublishingTree();
  }

  postCallGetFlowMeters(): void {
    // get validation status
    let bValid = true;
    for (let i = 0; i < this.surefloEnity.length; i++) {
      if (this.surefloEnity[i].IsValid != undefined && !this.surefloEnity[i].IsValid) {
        bValid = false;
        break;
      }
    }

    for (let i = 0; i < this.surefloEnity.length; i++) {
      if (this.surefloEnity[i].IsDirty !== undefined && this.surefloEnity[i].IsDirty) {
        this.bIsConfigDirty = this.bIsConfigDirty || true;
        break;
      }
    }
    // this.updateValidateState(bValid);
  }

  postCallGetModbusTemplateDetails(): void {
    let subscription = this.publishingFacade.getModbusTemplateDirtyStatus().subscribe(isDirty => {
      this.bIsCustomMapDirty = this.bIsCustomMapDirty || isDirty;
    });
    this.arrSubscriptions.push(subscription);
  }

  private setPageRoute(panelTypeId, page, pageId) {
    let pageRoute = null;
    switch (panelTypeId) {
      case PanelTypeList.SURESENS:
        pageRoute = `/suresens/${page}/${pageId}`;
        break;
      case PanelTypeList.InCHARGE:
        pageRoute = `/incharge/${page}/${pageId}`;
        break;
      case PanelTypeList.INFORCE:
        pageRoute = `/inforce-configuration/${page}/${pageId}`;
        break;
      case PanelTypeList.MultiNode:
        pageRoute = `/multinode/${page}/${pageId}`;
        break;
    }
    return pageRoute;
  }

  showDataLoggerDialog() {
    const dialogData = {}
    this.gatewayModalService.openAdvancedDialog(
      'New Data Logger',
      ButtonActions.None,
      AddEditDataLoggerDialogComponent,
      dialogData,
      (result) => {
        if (result) {
          const dataLoggerData11 = this.dataLoggerEntity.slice(-1);
          this.router.navigate([`/${this.panelName}/datalogger/` + dataLoggerData11[0].Id]);
        }
      },
      "540px",
      null,
      null,
      null
    );
  }

  ngOnDestroy(): void {
    if (this.arrSubscriptions != null && this.arrSubscriptions.length > 0) {
      this.arrSubscriptions.forEach((subscription) => {
        if (subscription !== null) {
          subscription.unsubscribe();
          subscription = null;
        }
      });
    }
    this.arrSubscriptions = [];
    super.ngOnDestroy();
  }

  getCurrentUser() {
    this.userService.GetCurrentLoginUser().then((user) => {
      if (user) {
        this.currentUser = user;
      }
    });
  }

  private subscribeToOperationMode(): void {
    const subscription = this.gwFeatureModuleService.subscribeToOperationMode().subscribe(d => {
      if (d != undefined && d != null) {
        this.IsConfigSaved = UICommon.IsConfigSaved;
        this.IsSetOperationModeIdle = d;
      }
    });

    this.arrSubscriptions.push(subscription);
  }

  private updatePanelErrorHandlingNotifiers(): void {
    let errorNotifiers = this.gwFeatureModuleService.getErrorNotifiers();
    if (errorNotifiers) {
      errorNotifiers.forEach((value, key) => {
        this.updateValidateState(value.isValidState);
        this.bIsConfigDirty = this.bIsConfigDirty || value.isConfigDirty;
        this.updateErrorNotifierList(value.errorNotifier);
      });
    }
  }

  private updateConfigDirtyNotifiers(): void {
    let configDirtyNotifiers = this.gwFeatureModuleService.getConfigDirtyNotifiers();
    if (configDirtyNotifiers) {
      configDirtyNotifiers.forEach((value, key) => {
        this.updateValidateState(value.isValidState);
        this.bIsConfigDirty = this.bIsConfigDirty || value.isConfigDirty;
      });
    }
  }

  ngOnInit() {
    super.ngOnInit();
    this.wells = [];
    this.dataPublishing = [];
    this.initPanelConfigurationCommon();
    this.subscribeToErrorHandlingSettingState();
    this.subscribeToUnitSystems();
    this.subscribeToOperationMode();
    this.initWells();
    this.initDataSources();
    this.initModbusProtocols();
    this.initDataPublishing();
    this.initModbusMapTemplateDetails();
    this.initFlowMeters();
    this.subscribeToServerRunningStatus();
    this.getCurrentUser();
    this.initLoggerTypes();
    this.initDataLoggers();
    this.subscribeToOperationStatus();
    if (this.panelConfigurationCommon?.PanelTypeId === PanelTypeList.MultiNode) {
      this.subscribeToeFCVpositions();
      this.initSie();
    }
    this.bIsConfigDirty = this.bIsConfigDirty || UICommon.IsImportConfig || UICommon.deletedObjects.length > 0;
    UICommon.isSaveBtnEnabled = this.bIsValidConfiguration && this.bIsConfigDirty;
    if (this.realTimeDataSignalRService.startConnection()) {
      // Get Date and Time
      const subscription = this.systemClockService.SystemClockTime$.subscribe(
        (dt) => {
          this.systemClockTime = dt;
        }
      );
      this.arrSubscriptions.push(subscription);
      // Get Current Timezone Index
      const timeZoneSubscription = this.systemClockService.SystemTimeZone$.subscribe(
        (tz) => {
          if (tz) {
            this.timeZoneIdx = tz;
            this.getSystemTimeZone();
          }
        }
      );
      this.arrSubscriptions.push(timeZoneSubscription);
    }
    // Get System Clock TimeZone
    //this.getSystemTimeZone();
    // Get Network Details
    this.getNetworkDetails();

    const error = (this.generalSettingErrorsList && this.generalSettingErrorsList.length > 0) ||
      (this.wellsErrorsList && this.wellsErrorsList.length > 0) ||
      (this.dataSourceErrorsList && this.dataSourceErrorsList.length > 0) ||
      (this.publishingErrorsList && this.publishingErrorsList.length > 0) ||
      (this.sieErrorsList && this.sieErrorsList.length > 0);


    if (!UICommon.IsImportConfig) {
      if (!error && !GatewayPanelBase.ShowNavigation) {
        this.ApplyConfiguration();
      }
    }
  }

}
