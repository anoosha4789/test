import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GatewayPanelBase } from '@comp/GatewayPanelBase.component';
import { DATA_LOGGER_TYPE, deleteUIModal, UICommon, UITemperatureUnits } from '@core/data/UICommon';
import { DataLoggerFacade } from '@core/facade/dataLoggerFacade.service';
import { DataSourceFacade } from '@core/facade/dataSourceFacade.service';
import { PanelConfigurationFacade } from '@core/facade/panelConfigFacade.service';
import { SurefloFacade } from '@core/facade/surefloFacade.service';
import { DataLoggerUIModel } from '@core/models/UIModels/dataLogger.model';
import { DataLoggerTypesDataModel } from '@core/models/UIModels/dataLoggerTypes.model';
import { ToolConnectionUIModel } from '@core/models/UIModels/tool-connection.model';
import { CustomDataLoggerConfiguration, CustomDataLoggerDataPointUIModel } from '@core/models/webModels/DataLogger.model';
import { IgxGridComponent } from '@infragistics/igniteui-angular';
import { Store } from '@ngrx/store';
import { ButtonActions } from '@shared/gateway-dialogs/components/gateway-advanced-dialog/gateway-advanced-dialog.component';
import { GatewayModalService } from '@shared/gateway-dialogs/services/gatewayModal.service';
import * as _ from 'lodash';
import { Observable, Subscription } from 'rxjs';
import { AddEditDataLoggerDialogComponent } from '../add-edit-data-logger-dialog/add-edit-data-logger-dialog.component';
import { LoggerDataPointsDialogComponent } from '../logger-data-points-dialog/logger-data-points-dialog.component';
import { UtilityService } from '@core/services/utility.service';
import * as LOGGER_ACTIONS from '@store/actions/dataLogger.entity.action';
import * as UNITSYSTEM_ACTIONS from '@store/actions/unit-system.action';
import { DeviceModel } from '@core/models/webModels/DeviceInfo.model';
import { DeviceDataPointsFacade } from '@core/facade/deviceDataPointsFacade.service';
import { String } from 'typescript-string-operations';
import { WellDataUIModel } from '@core/models/webModels/WellDataUIModel.model';
import { WellFacade } from '@core/facade/wellFacade.service';
import { DataPointDefinitionModel } from '@core/models/webModels/DataPointDefinition.model';
import { IUnitSystemState } from '@store/state/unit-system.state';
import { StateUtilities } from '@store/state/IState';

@Component({
  selector: 'app-ifield-datalogger',
  templateUrl: './ifield-datalogger.component.html',
  styleUrls: ['./ifield-datalogger.component.scss']
})
export class IfieldDataloggerComponent extends GatewayPanelBase implements OnInit, OnDestroy {
  loggerTypes: DataLoggerTypesDataModel[] = [];
  toolConnections: ToolConnectionUIModel[] = [];
  isIFieldLoggerType = false;
  nameValidationMessage = "";
  isFormValid: boolean = false;
  isNoToolConnections: boolean = false;
  selectedWellName: string = "";
  dataLoggers: CustomDataLoggerConfiguration[];
  routeQueryParams$: Subscription;
  dataLoggerData: CustomDataLoggerConfiguration;// = { Id: null, DataLoggerType: DATA_LOGGER_TYPE.Custom, IsDeleted: 0, Name: "", ScanRate: -1, WellId: -1, customDataLoggerDataPoints: [] };
  loggerName: string = "";
  loggerWellName: string = "";
  loggerId: number;
  dataLoggersUI: DataLoggerUIModel;
  private currentPubIndex: number;
  loggerTypeName: string = "";
  selectedTabIndex = 0;
  backBtnVisibility = true;
  bShowBackButton = true;
  actionBtnTxt = 'Next';
  panelTypeId: number;
  private nextPubId: number;
  private prevPubId: number;
  isLeavingWorkflow: boolean = true;
  private arrSubscriptions: Subscription[] = [];
  private dataPointDefinitionModels: DataPointDefinitionModel[];

  wellChanged = false;
  private panelTypeName: string;
  isNewDataLogger = false;
  wells: WellDataUIModel[];
  isConfigSaved = false;

  isImportConfig: boolean = false;
  unitSystem = null;
  private unitSystemModel$: Observable<IUnitSystemState>;

  @ViewChild("gridModbusDataPoints", { static: true })
  public gridModbusDataPoints: IgxGridComponent;

  accessDataPoints: AccessTemplateDetail[];
  deviceDefinitions: DeviceModel[];
  constructor(protected store: Store,
    public dataSourceFacade: DataSourceFacade,
    surefloFacade: SurefloFacade,
    private route: ActivatedRoute,
    private router: Router,
    private gatewayModalService: GatewayModalService,
    private panelConfigFacade: PanelConfigurationFacade,
    private utilityService: UtilityService,
    private customLoggerFacade: DataLoggerFacade,
    dataPointsFacade: DeviceDataPointsFacade,
    private wellDataFacade: WellFacade,
  ) {
    super(store, panelConfigFacade, wellDataFacade, dataSourceFacade, null, dataPointsFacade, null, surefloFacade, customLoggerFacade);
    this.unitSystemModel$ = store.select<IUnitSystemState>((state: any) => state.unitSystemState);
  }

  private getDisplayUnit(tagName: string, displayUnitSymbol: string): string {
    let displayUnit = displayUnitSymbol;
    if (this.isIFieldLoggerType) {
      if (tagName.includes("Pressure"))
        displayUnit = "psi";
      else if (tagName.includes("Temperature"))
        displayUnit = UITemperatureUnits.degF;
    }
    return displayUnit;
  }

  setUpGridDetails(): void {
    if (!this.dataPointDefinitionModels)
      return; // wait for data points to load

    this.accessDataPoints = [];

    if (UICommon.IsImportConfig) {
      if (!this.unitSystem)
        return; // wait for unitSystem to load

      if (this.dataLoggerData && this.dataLoggerData.customDataLoggerDataPoints.length > 0) {
        for (let i = 0; i < this.dataLoggerData.customDataLoggerDataPoints.length; i++) {
          let rec = null;
          for (let j = 0; j < this.unitSystem.UnitQuantities.length; j++) {
            if (this.unitSystem.UnitQuantities[j].SupportedUnitSymbols.find(s => s.Key == this.dataLoggerData.customDataLoggerDataPoints[i].UnitSymbol)) {
              rec = this.unitSystem.UnitQuantities[j].SupportedUnitSymbols;
              break;
            };
          }
          let record = rec != null ? this.unitSystem.UnitQuantities.find(s => s.SupportedUnitSymbols == rec) : null;
          let modbusDataPoint = {
            Description: this.dataLoggerData.customDataLoggerDataPoints[i].TagName,
            Units: this.getDisplayUnit(this.dataLoggerData.customDataLoggerDataPoints[i].TagName, record != null ? record.SelectedDisplayUnitSymbol : this.dataLoggerData.customDataLoggerDataPoints[i].UnitSymbol)
          }
          this.accessDataPoints.push(modbusDataPoint);
        }
      }
    } else {
      if (this.dataLoggerData && this.dataLoggerData.customDataLoggerDataPoints.length > 0) {
        for (let i = 0; i < this.dataLoggerData.customDataLoggerDataPoints.length; i++) {
          let record = this.dataPointDefinitionModels.find(c => c.DeviceId == this.dataLoggerData.customDataLoggerDataPoints[i].DeviceId && c.DataPointIndex == this.dataLoggerData.customDataLoggerDataPoints[i].DataPointIndex);
          if (record != null) {
            let modbusDataPoint = {
              Description: this.dataLoggerData.customDataLoggerDataPoints[i].TagName,
              Units: this.getDisplayUnit(record.TagName, record.UnitSymbol)
            }
            this.accessDataPoints.push(modbusDataPoint);
          }
        }
      }
    }
  }

  showLoggerDataPointDialog(dialogData) {
    dialogData.isEdit = true;
    this.gatewayModalService.openAdvancedDialog(
      dialogData.dataLogger.Name,
      ButtonActions.None,
      LoggerDataPointsDialogComponent,
      dialogData,
      (result) => {
        if (result) {
          this.router.navigate([`/${this.panelTypeName}/datalogger/` + dialogData.dataLogger.Id]);
        }
      },
      "980px",
      null,
      null,
      null
    );
  }


  postCallGetDataLoggers(): void {
    this.currentPubIndex = -1;
    this.dataLoggers = this.dataLoggerEntity.filter(y => y.IsDeleted == 0);
    if (this.dataLoggers && this.dataLoggers.length > 0) {
      this.currentPubIndex = this.dataLoggers
        .findIndex(x => x.Id === this.loggerId);
      let newdatalogger = true;
      this.route.params.subscribe(params => {
        if (params.Id != 'newdatalogger') {
          newdatalogger = false;
        }
      })
      if (this.currentPubIndex === -1 && !newdatalogger) {
        if (this.nextPubId)
          this.router.navigate([`${this.panelTypeName}/datalogger`, this.nextPubId]);
        else
          this.router.navigate([`${this.panelTypeName}/datalogger/` + this.prevPubId]);
        return;
      }


      this.dataLoggerData = _.cloneDeep(this.dataLoggers[this.currentPubIndex]);
      this.loggerName = this.dataLoggerData?.Name;

      // if (this.currentPubIndex === -1) {  // Data Publishing does not exist - Navigate to Add Publishing page
      //   if (this.nextPubId)
      //     this.router.navigate([`${this.panelTypeName}/datalogger`, this.nextPubId]);
      //     else
      //     this.router.navigate([`${this.panelTypeName}/datalogger/`+ this.prevPubId]);
      //   return;
      // }
      this.dataLoggerData = _.cloneDeep(this.dataLoggers[this.currentPubIndex]);
      this.loggerName = this.dataLoggerData?.Name;

      this.initToolConnections();

      this.loggerTypeName = (this.dataLoggerData?.DataLoggerType === DATA_LOGGER_TYPE.Custom) ? "Custom" : "Saudi Aramco iField";
      this.isIFieldLoggerType = (this.dataLoggerData?.DataLoggerType === DATA_LOGGER_TYPE.Custom) ? false : true;
      this.isNewDataLogger = (Math.sign(this.dataLoggerData?.Id) === 1) ? true : false;

      this.nextPubId = this.currentPubIndex + 1 < this.dataLoggers.length ? this.dataLoggers[this.currentPubIndex + 1].Id : null;
      this.prevPubId = this.currentPubIndex > 0 ? this.dataLoggers[this.currentPubIndex - 1].Id : null;

      this.bShowBackButton = this.prevPubId ? true : false;
      if (this.dataLoggerData?.DataLoggerType === DATA_LOGGER_TYPE.Saudi_Aramco_iField) {
        this.dataLoggers.forEach(item => {
          if (item.Id != this.loggerId) {
            if (item.Id < 0) {
              this.toolConnections.forEach(tool => {
                if (tool.WellId == item.WellId) {
                  let indx = this.toolConnections.indexOf(tool);
                  this.toolConnections.splice(indx, 1);
                }
              })
            }
          }
        })
      }

    }
    this.setSaveButtonText();
    this.setUpGridDetails();
    this.initWells();
  }

  private setSaveButtonText(tabName: string = null) {
    this.actionBtnTxt = this.loggerId ? 'Next' : '';
    this.actionBtnTxt = (this.nextPubId == null) ? 'Done' : 'Next';
  }

  onBackBtnClick(): void {
    if (this.prevPubId) {
      this.router.navigate([`${this.panelTypeName}/datalogger`, this.prevPubId]);
    }
  }
  onWellSelChange(event) {
    let actualPoints = this.fillSaudiAramcoDataPoints(event.value);
    this.accessDataPoints = [];
    if (actualPoints && actualPoints.length > 0) {
      for (let i = 0; i < actualPoints.length; i++) {
        let modbusDataPoint = {
          Description: actualPoints[i].TagName,
          Units: actualPoints[i].UnitSymbol
        }
        this.accessDataPoints.push(modbusDataPoint);
      }
    }
    this.wellChanged = true;
    this.updateDataLogger();
    this.dataLoggerData.customDataLoggerDataPoints = actualPoints;
    this.dataLoggerData.WellId = event.value;
    this.setUpGridDetails();
  }

  private fillSaudiAramcoDataPoints(wellId): CustomDataLoggerDataPointUIModel[] {
    let dataPointsToAdd: CustomDataLoggerDataPointUIModel[] = [];
    let tools = this.toolConnectionEntity.filter(t => t.WellId === wellId) ?? [];
    if (tools && tools.length > 0) {
      tools.forEach(tool => {
        let dataPoints = this.datapointdefinitions.filter(d => d.DeviceId === tool.DeviceId) ?? [];
        dataPoints.forEach(dtPoint => {
          if (dtPoint.TagName === "Pressure" || dtPoint.TagName === "Temperature") {
            dataPointsToAdd.push({
              DataPointIndex: dtPoint.DataPointIndex,
              DeviceId: dtPoint.DeviceId,
              Id: -1,
              IdDataLogger: this.dataLoggerData.Id,
              Precision: 4,
              TagName: String.Format("{0}_{1}_{2}_{3}", tool.ChannelName, tool.CardDeviceName, tool.DeviceName, dtPoint.TagName),
              UnitQuantityType: dtPoint.UnitQuantityType,
              UnitSymbol: dtPoint.UnitSymbol
            })
          }
        });
      });
    }
    return dataPointsToAdd;
  }


  saveDataPubBtnClick(): void {
    if (this.dataLoggerData) {
      if (this.loggerId < 0)
        this.router.navigated = false;
      if (this.nextPubId) {
        this.router.navigate([`${this.panelTypeName}/datalogger`, this.nextPubId]);
      } else {
        this.router.navigate([`${this.panelTypeName}/dashboard`]);
      }
    }
  }

  postCallGetToolConnections(): void {
    this.isNoToolConnections = !this.toolConnectionEntity || this.toolConnectionEntity?.length === 0;
    if (!this.isNoToolConnections) {
      //this.dataLoggerData.DataLoggerType = DATA_LOGGER_TYPE.Custom;
      //this.onCustomSelected();
      //} else {
      if (this.dataLoggerData)
        this.loggerWellName = this.toolConnectionEntity.find(toolConnection => toolConnection.WellId === this.dataLoggerData.WellId)?.WellName;
      this.toolConnectionEntity.forEach(toolConnection => {
        if (toolConnection.WellId > 0) {
          let toolGauge = this.dataSourceFacade.getToolGauge(toolConnection.ChannelId, toolConnection.CardDeviceId, toolConnection.DeviceId);
          let isESPtool = this.dataSourceFacade.isESPTool(toolGauge);
          if (!isESPtool) {
            const tools = this.toolConnections.find(tool => tool.WellId === toolConnection.WellId);
            if (!tools) {
              const logger = this.dataLoggers.find(dataLogger => dataLogger.WellId === toolConnection.WellId && dataLogger.IsDeleted === 0);
              if (!logger || logger.Id < 0)
                this.toolConnections.push(toolConnection);
            }
          }
        }
      })
    }
  }
  postCallGetPanelConfigurationCommon(): void {
    this.panelTypeId = this.panelConfigurationCommonState.panelConfigurationCommon.PanelTypeId;
    this.panelTypeName = UICommon.getPanelType(this.panelTypeId, true).name;
    if (this.panelConfigurationCommonState.panelConfigurationCommon.Id > 0) {
      this.isConfigSaved = true;
    }
  }

  postCallGetWells(): void {
    this.wells = this.wellEnity ?? [];
    if (this.wells && this.wells.length > 0) {
      this.loggerWellName = this.wells?.find(x => x.WellId == this.dataLoggerData?.WellId)?.WellName;
    }
  }
  postCallDeviceDataPoints(): void {
    this.dataPointDefinitionModels = this.datapointdefinitions;
    this.setUpGridDetails();
  }

  loadDataLogger() {
    this.route.queryParams.subscribe(params => {
      if (params && params.selectedId) {
        this.loggerId = parseInt(params.selectedId, 10);
        this.selectedTabIndex = params.selectedChild ? parseInt(params.selectedChild, 10) : 0;
        this.initDataLoggers();

      } else {
        this.getParameter();
      }
    });
    this.setUpGridDetails();

  }

  getParameter(): void {
    this.route.params.subscribe(params => {
      this.loggerId = (params.Id != 'newdatalogger') ? parseInt(params.Id, 10) : 0;
      if (params.Id === 'newdatalogger') {
        const dialogData = {}
        this.gatewayModalService.openAdvancedDialog(
          'New Data Logger',
          ButtonActions.None,
          AddEditDataLoggerDialogComponent,
          dialogData,
          (result) => {
            if (result) {
              const dataLoggerData11 = this.dataLoggerEntity.slice(-1);
              this.router.navigate([`${this.panelTypeName}/datalogger/` + dataLoggerData11[0].Id]);
            } else {
              this.router.navigate([`${this.panelTypeName}/dashboard/`]);
            }
          },
          "540px",
          null,
          null,
          null
        );

      }
      this.selectedTabIndex = 0;

      this.initDataLoggers();
      setTimeout(() => {

        if (this.loggerId) {
          this.setUpGridDetails();
        }
      }, 1000);

    });

  }

  deleteDataLoggerClick() {
    if (this.dataLoggerData) {
      this.gatewayModalService.openDialog(
        `Do you want to delete the dataLogger '${this.dataLoggerData.Name}'?`,
        () => {
          this.gatewayModalService.closeModal();
          this.customLoggerFacade.deleteDataLogger(this.dataLoggerData.Id, this.dataLoggerData);
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
  }
  private navigateOnDelete(): void {
    if (this.nextPubId == null && this.prevPubId == null) {
      this.setNavigation();
    }
    else if (this.nextPubId != null && !isNaN(this.nextPubId)) {
      this.router.navigate([`${this.panelTypeName}/datalogger`, this.nextPubId]);
    }
    else {
      this.router.navigate([`${this.panelTypeName}/datalogger`, this.prevPubId]);
    }
  }
  setNavigation() {
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate([`${this.panelTypeName}/dashboard/`]);
    this.isLeavingWorkflow = GatewayPanelBase.ShowNavigation ? true : false;
    if (!this.isLeavingWorkflow) {
      this.utilityService.setForwardStepper(1);
    }
  }
  updateDataLogger() {
    if (this.wellChanged && this.dataLoggerData) {
      let dataLoggerToUpdate: DataLoggerUIModel = _.cloneDeep(this.dataLoggerData);
      dataLoggerToUpdate.IsDirty = true;
      dataLoggerToUpdate.IsValid = true;
      const logger = { dataLogger: dataLoggerToUpdate }
      this.store.dispatch(LOGGER_ACTIONS.DATALOGGER_UPDATE(logger));
    }
  }

  public initUnitSystems() {
    const subscription = this.unitSystemModel$.subscribe(
      (state: IUnitSystemState) => {
        if (state !== undefined) {
          if (state.isLoaded === false || StateUtilities.hasErrors(state)) {
            // Dispatch Action if not loaded
            this.store.dispatch(UNITSYSTEM_ACTIONS.UNITSYSTEM_LOAD());
          } else {
            this.unitSystem = _.cloneDeep(state.unitSystem);
          }
        }
      }
    );

    this.arrSubscriptions.push(subscription);
  }

  postCallGetUnitSystems() { }

  ngOnInit(): void {
    this.initPanelConfigurationCommon();
    this.initUnitSystems();
    this.initLoggerTypes();
    this.loadDataLogger();
    this.initDeviceDataPoints();
    this.setUpGridDetails();
    this.isImportConfig = UICommon.IsImportConfig && isNaN(this.loggerId);
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

class AccessTemplateDetail {
  Description: string;
  Units: string;
}