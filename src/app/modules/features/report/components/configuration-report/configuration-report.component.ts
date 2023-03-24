import { Component, HostListener, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, Observable, Subscription } from 'rxjs';
import { Stimulsoft } from 'stimulsoft-reports-js/Scripts/stimulsoft.viewer'

import { Store } from '@ngrx/store';
import { StateUtilities } from '@store/state/IState';
import * as ERROR_HANDLING_SETTINGS_STATE_ACTIONS from '@store/actions/errorHandlingSettings.action';
import * as ACTIONS from '@store/actions/serialChannelProperties.action';
import * as SHIFT_DEFFAULT_ACTIONS from '@store/actions/shift-default.action';
import * as FLOWMETER_TRASMITTER_ACTIONS from '@store/actions/flowmeterTransmitter.action';
import * as eFCV_POSITION_SETTINGS_STATE_ACTIONS from '@store/actions/efcvPositionSettings.action';
import { UNITSYSTEM_LOAD } from '@store/actions/unit-system.action';
import { ISerialChannelPropertiesState } from '@store/state/serialChannelProperties.state';

import { ConfigurationService } from '@core/services/configurationService.service';
import { InchargeReportService } from '@core/services/incharge-report.service';
import { SuresensReportService } from '@core/services/suresens-report.service';
import { ReportService } from '@core/services/report.service';
import { UtilityService } from '@core/services/utility.service';
import { UserService } from '@core/services/user.service';
import { GatewayModalService } from '@shared/gateway-dialogs/services/gatewayModal.service';
import { PanelTypeList, UICommon } from '@core/data/UICommon';
import { IErrorHandlingSettingsState } from '@store/state/errorHandlingSettings.state';
import { ErrorHandlingUIModel } from '@core/models/webModels/ErrorHandlingUI.model';
import { GatewayPanelBase } from '@comp/GatewayPanelBase.component';
import { PanelConfigurationFacade } from '@core/facade/panelConfigFacade.service';
import { WellFacade } from '@core/facade/wellFacade.service';
import { DataSourceFacade } from '@core/facade/dataSourceFacade.service';
import { PublishingChannelFacade } from '@core/facade/publishingChannelFacade.service';
import { SurefloFacade } from '@core/facade/surefloFacade.service';
import { IUnitSystemState } from '@store/state/unit-system.state';
import { UnitSystemModel } from '@core/models/webModels/UnitSystem.model';
import * as _ from 'lodash';
import { InForceReportService } from '@core/services/inforce-report-service';
import { initialShiftDefaultState, IShiftDefaultState } from '@store/state/shift-default.state';
import { ShiftDefaultUIModel } from '@core/models/UIModels/shift-default.model';
import { AlarmsAndLimitsUIModel, FlowmeterTransmitterUIModel, PanelDefaultUIModel } from '@core/models/UIModels/panel-default.model';
import { IAlarmsAndLimitsState } from '@store/state/alarms-and-limits.state';
import { LOAD_ALARMS_AND_LIMITS } from '@store/actions/alarms-and-limits.action';
import { IPanelDefaultState } from '@store/state/panel-default.state';
import { LOAD_PANEL_DEFAULTS } from '@store/actions/panel-default.action';
import { IFlowmeterTransmitterState } from '@store/state/flowmeterTransmitter.state';
import { DataLoggerFacade } from '@core/facade/dataLoggerFacade.service';
import { MultinodeReportService } from '@core/services/multinode-report.service';
import { IeFCVPositionSettingsState } from '@store/state/efcvPositionSettings.state';
import { MultiNodePositionDefaultsDataUIModel } from '@core/models/UIModels/MultiNodePositionDefaultsDataUI.model';
import { SieFacade } from '@core/facade/sieFacade.service';

@Component({
  selector: 'app-configuration-report',
  templateUrl: './configuration-report.component.html',
  styleUrls: ['./configuration-report.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ConfigurationReportComponent extends GatewayPanelBase implements OnInit, OnDestroy {

  private arrSubscriptions: Subscription[] = [];
  IErrorHandlingSettingsState$: Observable<IErrorHandlingSettingsState>;
  serialCannelProperties$: Observable<ISerialChannelPropertiesState>;
  unitSystemModel$: Observable<IUnitSystemState>;
  protocolList = [];
  errorHandlingSettings: ErrorHandlingUIModel = new ErrorHandlingUIModel();
  unitSystem: UnitSystemModel;
  shiftDefaultState$: Observable<IShiftDefaultState>;
  shiftDefaultData: ShiftDefaultUIModel;
  alarmsAndLimitsState$: Observable<IAlarmsAndLimitsState>;
  alarmsAndLimitsData: AlarmsAndLimitsUIModel;
  panelDefaultState$: Observable<IPanelDefaultState>;
  panelDefaultData: PanelDefaultUIModel;
  flowmeterTransmitterList: FlowmeterTransmitterUIModel[] = [];
  eFCVPositionSettings: MultiNodePositionDefaultsDataUIModel;
  IeFCVPositionSettingsState$: Observable<IeFCVPositionSettingsState>;
  private flowmeterTransmitterTypesState$: Observable<IFlowmeterTransmitterState>;

  constructor(protected store: Store<{
    errorHandlingSettingsState: IErrorHandlingSettingsState;
  }>,
    private router: Router,
    private panelConfigFacade: PanelConfigurationFacade,
    private wellDataFacade: WellFacade,
    private dataSourceFacade: DataSourceFacade,
    private publishingFacade: PublishingChannelFacade,
    private surefloDataFacade: SurefloFacade,
    private dataLoggersFacade: DataLoggerFacade,
    protected sieFacade: SieFacade,
    private configurationService: ConfigurationService,
    private userService: UserService,
    private utilityService: UtilityService,
    private suresensReportService: SuresensReportService,
    private inchargeReportService: InchargeReportService,
    private inForceReportService: InForceReportService,
    private multinodeReportService: MultinodeReportService,
    private reportService: ReportService,
    private gwModalService: GatewayModalService) {
    super(store, panelConfigFacade, wellDataFacade, dataSourceFacade, publishingFacade, null, null, surefloDataFacade, dataLoggersFacade, sieFacade);
    this.serialCannelProperties$ = this.store.select<any>((state: any) => state.serialChannelPropertiesState);
    this.IErrorHandlingSettingsState$ = this.store.select<IErrorHandlingSettingsState>((state: any) => state.errorHandlingSettingsState);
    this.unitSystemModel$ = this.store.select<IUnitSystemState>((state: any) => state.unitSystemState);
    this.shiftDefaultState$ = this.store.select<IShiftDefaultState>((state: any) => state.shiftDefaultState);
    this.panelDefaultState$ = this.store.select<IPanelDefaultState>((state: any) => state.panelDefaultState);
    this.alarmsAndLimitsState$ = this.store.select<IAlarmsAndLimitsState>((state: any) => state.alarmsAndLimitsState);
    this.flowmeterTransmitterTypesState$ = this.store.select<IFlowmeterTransmitterState>((state: any) => state.flowmeterTransmitterState);
    this.IeFCVPositionSettingsState$ = this.store.select<IeFCVPositionSettingsState>((state: any) => state.eFCVPositionSettingsState);
  }


  resizeTimer = null;
  @HostListener('window:resize', ['$event'])
  onResize(event) {

    if (this.resizeTimer) clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(() => {
      this.initConfigReport();
    }, 300);
  }


  private initConfigReport() {

    let options = new Stimulsoft.Viewer.StiViewerOptions();
    options = this.reportService.setReportViewerOptions(options, Stimulsoft.Viewer);
    const viewer = new Stimulsoft.Viewer.StiViewer(options, 'StiViewer', false);
    Stimulsoft.Base.StiLicense.loadFromFile("assets/stimulsoft/license.key");
    const reportInfo = {
      createdBy: '',
      ipAddress: '',
      buildNumber: ''
    };

    const subscription = forkJoin([this.userService.GetCurrentLoginUser(), this.utilityService.getSystemIPAdress(),
    this.configurationService.getBuildNumber()]).subscribe(results => {
      reportInfo.createdBy = results[0].Name || null;
      reportInfo.ipAddress = results[1][0].IpAddress || null;
      reportInfo.buildNumber = results[2];
      viewer.report = this.getReport(reportInfo);
    });
    this.arrSubscriptions.push(subscription);

    viewer.renderHtml("configReport");
    this.reportService.appendCustomButton(viewer, this.router);
  }



  getReport(reportInfo) {
    let report = Stimulsoft.Report.StiReport.createNewReport();
    let reportData: any;
    if (this.panelConfigurationCommonState.panelConfigurationCommon.PanelTypeId === PanelTypeList.MultiNode) {
      reportData = this.getMultinodeReport(reportInfo);
      this.validateMultinodeData(reportData);
      report.loadFile("assets/stimulsoft/templates/multinode.mrt");
    }
    else if (this.panelConfigurationCommonState.panelConfigurationCommon.PanelTypeId === PanelTypeList.INFORCE) {
      reportData = this.getInFORCEReport(reportInfo);
      this.validateInforceData(reportData);
      report.loadFile("assets/stimulsoft/templates/inforce.mrt");
    }
    else if (this.panelConfigurationCommonState.panelConfigurationCommon.PanelTypeId === PanelTypeList.InCHARGE) {
      reportData = this.getInchargeReport(reportInfo);;
      report.loadFile("assets/stimulsoft/templates/incharge.mrt");
    } else {
      reportData = this.getSuresensReport(reportInfo);
      report.loadFile("assets/stimulsoft/templates/suresens.mrt");
    }
    return this.UpdateReportDataSet(report, reportData);
  }

  getMultinodeReport(reportInfo) {
    return this.multinodeReportService.generateReportData(reportInfo, this.errorHandlingSettings, this.protocolList, this.unitSystem,
      this.panelConfigurationCommonState.panelConfigurationCommon, this.wellEnity,
      this.dataSourcesEntity, this.toolConnectionEntity, this.publishingEntity, this.dataLoggerEntity, this.eFCVPositionSettings, this.sieEntity);
  }

  getInFORCEReport(reportInfo) {
    return this.inForceReportService.generateReportData(reportInfo, this.errorHandlingSettings, this.protocolList, this.unitSystem,
      this.panelConfigurationCommonState.panelConfigurationCommon, this.wellEnity,
      this.dataSourcesEntity, this.toolConnectionEntity, this.publishingEntity, this.surefloEnity, this.shiftDefaultData, this.panelDefaultData, this.alarmsAndLimitsData, this.flowmeterTransmitterList, this.dataLoggerEntity);
  }

  getInchargeReport(reportInfo) {
    return this.inchargeReportService.generateReportData(reportInfo, this.errorHandlingSettings, this.protocolList, this.unitSystem,
      this.panelConfigurationCommonState.panelConfigurationCommon, this.wellEnity,
      this.dataSourcesEntity, this.toolConnectionEntity, this.publishingEntity, this.surefloEnity, this.dataLoggerEntity);
  }

  getSuresensReport(reportInfo) {
    return this.suresensReportService.generateReportData(reportInfo, this.errorHandlingSettings, this.protocolList, this.unitSystem,
      this.panelConfigurationCommonState.panelConfigurationCommon, this.wellEnity,
      this.dataSourcesEntity, this.toolConnectionEntity, this.publishingEntity, this.surefloEnity, this.dataLoggerEntity);
  }

  validateInforceData(data): boolean {
    if (data?.Wells?.length > 0) {
      for (let well of data.Wells) {
        for (const zone of well.Zones) {
          if (!well.ZoneGaugesVisbility) well.ZoneGaugesVisbility = zone.Gauges.length > 0 ? true : false;
        }
      }
    } else return data;
  }
  validateMultinodeData(data): boolean {
    if (data?.SIEs?.length > 0) {
      data.SIEs.forEach(sie => {
        for (let well of sie.Wells) {
          for (const zone of well.Zones) {
            if (!well.ZoneGaugesVisbility) well.ZoneGaugesVisbility = zone.Gauges.length > 0 ? true : false;
          }
        }
      });
    } else return data;


  }

  UpdateReportDataSet(report, reportData) {

    // Create new DataSet object
    let dataSet = new Stimulsoft.System.Data.DataSet("config");

    // Load JSON data file from specified URL to the DataSet object
    dataSet.readJson(reportData);

    // Remove all connections from the report template
    report.dictionary.databases.clear();

    // Register DataSet object
    report.regData("config", "config", dataSet);

    return report;
  }

  public showConfirmModal() {

    this.gwModalService.openDialog(
      'Please save the configuration before generating the report.',
      () => this.navToDashboard(),
      null,
      'Warning',
      null,
      false,
      'Ok',
      null
    );
  }

  navToDashboard() {
    let panelType = UICommon.getPanelType(this.panelConfigurationCommonState?.panelConfigurationCommon?.PanelTypeId, true)?.name;
    if (panelType)
      this.router.navigateByUrl(panelType + "/dashboard");
    this.gwModalService.closeModal();
  }

  private subscribeToErrorHandlingSettingState(): void {
    const subscription = this.IErrorHandlingSettingsState$.subscribe(
      (state: IErrorHandlingSettingsState) => {
        if (state !== undefined) {
          if (state.isLoaded === false && !StateUtilities.hasErrors(state)) {
            // Dispatch Action if not loaded
            this.store.dispatch(
              ERROR_HANDLING_SETTINGS_STATE_ACTIONS.LOAD_ERROR_HANDLING_SETTINGS()
            );
          } else {
            this.errorHandlingSettings = new ErrorHandlingUIModel();
            Object.assign(
              this.errorHandlingSettings,
              state.errorHandlingSettings
            );
          }
          this.initConfigReport();
        }
      }
    );
    this.arrSubscriptions.push(subscription);
  }

  private subscribeSerialSettings() {
    let subscription = this.serialCannelProperties$.subscribe((state: ISerialChannelPropertiesState) => {
      if (state !== undefined && state != null) {
        if (state.isLoaded === false && !StateUtilities.hasErrors(state))   // Dispatch Action if not loaded
          this.store.dispatch(ACTIONS.SERIALCHANNELPROPERTIES_LOAD());
        else {
          this.protocolList = [{ Id: 1, Name: state.serialChannelProperties.Protocol[0] }];
        }
      }
    });
    this.arrSubscriptions.push(subscription);
  }

  private subscribeToUnitSystems() {
    let subscription = this.unitSystemModel$.subscribe(
      (state: IUnitSystemState) => {
        if (state !== undefined) {
          if (state.isLoaded === false || StateUtilities.hasErrors(state)) {
            // Dispatch Action if not loaded
            this.store.dispatch(UNITSYSTEM_LOAD());
          } else {
            this.unitSystem = _.cloneDeep(state.unitSystem);
          }
        }
      }
    );

    this.arrSubscriptions.push(subscription);
  }

  private subscribeToShiftDefault(): void {
    const subscription = this.shiftDefaultState$.subscribe(
      (state: IShiftDefaultState) => {
        if (state !== undefined) {
          if (state.isLoaded === false && !StateUtilities.hasErrors(state)) {
            this.store.dispatch(SHIFT_DEFFAULT_ACTIONS.LOAD_SHIFT_DEFAULTS());
          } else {
            this.shiftDefaultData = new ShiftDefaultUIModel();
            // Object.assign(this.shiftDefaultData, state.shiftDefaults);
            this.shiftDefaultData = _.cloneDeep(state.shiftDefaults);
            /*  if (!this.shiftDefaultData.ShiftMethod || this.shiftDefaultData.ShiftMethod === 'NA') {
               this.shiftDefaultData.ShiftMethod = initialShiftDefaultState.shiftDefaults.ShiftMethod;
             }
             if (!this.shiftDefaultData.ReturnsBasedShiftDefaults) {
               this.shiftDefaultData.ReturnsBasedShiftDefaults = initialShiftDefaultState.shiftDefaults.ReturnsBasedShiftDefaults;
             }
             if (!this.shiftDefaultData.TimeBasedShiftDefaults) {
               this.shiftDefaultData.TimeBasedShiftDefaults = initialShiftDefaultState.shiftDefaults.TimeBasedShiftDefaults;
             } */
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
            this.store.dispatch(LOAD_PANEL_DEFAULTS());
          } else {
            this.panelDefaultData = new PanelDefaultUIModel();
            this.panelDefaultData = _.cloneDeep(state.panelDefaults);
            // Object.assign(this.panelDefaultData, state.panelDefaults);
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
            this.store.dispatch(LOAD_ALARMS_AND_LIMITS());
          } else {
            this.alarmsAndLimitsData = new AlarmsAndLimitsUIModel();
            this.alarmsAndLimitsData = _.cloneDeep(state.alarmsAndLimits);
            // Object.assign(this.alarmsAndLimitsData, state.alarmsAndLimits);
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
            this.store.dispatch(FLOWMETER_TRASMITTER_ACTIONS.LOAD_FLOWMETER_TRANSMITTER_TYPES());
          } else {
            this.flowmeterTransmitterList = [];
            Object.assign(this.flowmeterTransmitterList, state.flowmeterTransmitterTypes);
          }
        }
      }
    );
    this.arrSubscriptions.push(subscription);
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
            this.eFCVPositionSettings = _.cloneDeep(state.eFCVPositionSettings);
          }
        }
      }
    );

    this.arrSubscriptions.push(subscription);
  }

  private renderReport() {
    const saveBtnStatus = UICommon.isSaveBtnEnabled;
    if (saveBtnStatus) {
      this.showConfirmModal();
    } else {
      this.subscribeToErrorHandlingSettingState();
      this.subscribeSerialSettings();
      this.subscribeToUnitSystems();
      this.subscribeToAlarmsAndLimits();
      if (this.panelConfigurationCommonState.panelConfigurationCommon.PanelTypeId === PanelTypeList.INFORCE) {
        this.subscribeToShiftDefault();
        this.subscribeToPanelDefault();
        this.subscribeToFlowmeterTransmitterTypes();
      } else if (this.panelConfigurationCommonState.panelConfigurationCommon.PanelTypeId === PanelTypeList.MultiNode) {
        this.subscribeToeFCVPositionSettingState();
        this.initSie();
      }
    }
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.initPanelConfigurationCommon();
    this.initModbusProtocols();
    this.initWells();
    this.initDataSources();
    this.initToolConnections();
    this.initFlowMeters();
    if (UICommon.IsImportConfig || UICommon.IsConfigSaved) {
      this.initDataLoggers();
      this.initDataPublishing();
    }
    this.renderReport();
  }

  ngOnDestroy(): void {

    if (this.arrSubscriptions != null && this.arrSubscriptions.length > 0) {
      this.arrSubscriptions.forEach((subscription) => {
        if (subscription != null) {
          subscription.unsubscribe();
          subscription = null;
        }
      });
    }
    this.arrSubscriptions = [];
    super.ngOnDestroy();
  }
}
