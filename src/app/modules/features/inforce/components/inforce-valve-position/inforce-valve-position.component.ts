import { Component, Inject, Input, LOCALE_ID, OnDestroy, OnInit } from '@angular/core';

import { Router,ActivatedRoute } from '@angular/router';
import { formatDate } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';

import { WellFacade } from '@core/facade/wellFacade.service';
import { GatewayPanelBase } from '@comp/GatewayPanelBase.component';
import { InforceWellUIModel } from '@core/models/UIModels/InforceWell.model';
import { InFORCEZoneDataUIModel } from '@core/models/webModels/ZoneDataUIModel.model';
import { ToolConnectionUIModel } from '@core/models/UIModels/tool-connection.model';
import { DataPointDefinitionModel } from '@core/models/webModels/DataPointDefinition.model';
import { RealTimeDataSignalRService } from '@core/services/realTimeDataSignalR.service';
import { DeviceDataPointsFacade } from '@core/facade/deviceDataPointsFacade.service';
import { InforceMonitoringSleeveUIModel, InforceMonitoringToolUIModel, InforceMonitoringZoneUIModel } from '@core/models/UIModels/InforceZone.model';
import { CardDataPointIndex, SureSENSDataPointIndex, ToolDataPointIndex, TOOL_STATUS, UICommon } from '@core/data/UICommon';
import { DataSourceFacade } from '@core/facade/dataSourceFacade.service';
import { INFORCE_WELL_ARCHITECTURE, ZONE_VALVE_TYPE } from '@core/services/well.service';
import { SureSENSGaugeDataUIModel } from '@core/models/webModels/SureSENSGaugeDataUIModel.model';
import { HyrdraulicPowerUnitPointIndex, InforceWellDevicePointIndex, InFORCEZone_HCM_PointIndex,  SHIFT_STATUS_MESSAGE } from '@features/inforce/common/InForceModbusRegisterIndex';
import { GatewayModalService } from '@shared/gateway-dialogs/services/gatewayModal.service';
import { ConfigurationService } from '@core/services/configurationService.service';
import { ButtonActions } from '@shared/gateway-dialogs/components/gateway-advanced-dialog/gateway-advanced-dialog.component';
import { InforcePerformShiftDialogComponent } from '../inforce-perform-shift-dialog/inforce-perform-shift-dialog.component';
import { UserService } from '@core/services/user.service';
import { IServerRunningStatusState } from '@store/state/serverRunningStatus.state';
import { InforceShiftStatus, INFORCE_ALARM_CONFIG, ShiftControlReciepe } from '@features/inforce/common/InforceUICommon';
import { IHPUDeviceDetail, InforceDeviceDetail, InforceMonitoringWellUIModel } from '@core/models/UIModels/InforceMonitoring.model';
import { AlarmDefinitionDataUIModel } from '@core/models/webModels/AlarmDefinitionDataUI.model';
import { AlarmService } from '@core/services/alarm.service';
import { ErrorHandlingUIModel } from '@core/models/webModels/ErrorHandlingUI.model';

@Component({
  selector: 'gw-inforce-valve-position',
  templateUrl: './inforce-valve-position.component.html',
  styleUrls: ['./inforce-valve-position.component.scss']
})
export class InforceValvePositionComponent extends GatewayPanelBase implements OnInit, OnDestroy {

  @Input() deviceData: InforceDeviceDetail;
  @Input() errorHandlingData: ErrorHandlingUIModel;
  
  expandLinkVisibility = false;
  isConfigSaveInProgress = false;
  isShiftInProgress = false;
  monitoringValveType: number;
  expandedItemName: string;    
  defaultRoute = "/inforce/monitoring";
  toolRoute: string = '/inforce/monitoring/tool';
  alarmData: AlarmDefinitionDataUIModel[];
  alarmStatusInValid = false; // If severity fatal or critical make it as true and disable perofomr shift button
  hpuDevice: IHPUDeviceDetail;
  currentShiftWell: InforceMonitoringWellUIModel; // Active Shifting well
  wellList: InforceWellUIModel[] = [];
  defMonitoringWellList: InforceMonitoringWellUIModel[] = [];
  monitoringWellList: InforceMonitoringWellUIModel[] = [];
  toolConnectionList: ToolConnectionUIModel[];
  deviceIndexArray: DataPointDefinitionModel[];
  cardGauges: SureSENSGaugeDataUIModel[] = [];
  private serverRunningStatusState$: Observable<IServerRunningStatusState>;  
  private dataSubscriptions: Subscription[] = [];

  constructor(@Inject(LOCALE_ID) private locale: string,
    private router: Router,
    protected activatedRoute: ActivatedRoute,
    protected store: Store<{ serverRunningStatusState: IServerRunningStatusState}>,
    private wellDataFacade: WellFacade, private dataSourceFacade: DataSourceFacade,
    private dataPointFacade: DeviceDataPointsFacade, private realTimeService: RealTimeDataSignalRService,
    private userService: UserService,
    private alarmService: AlarmService,
    private configService: ConfigurationService,
    private gwModalService: GatewayModalService) { 
      super(store, null, wellDataFacade, dataSourceFacade, null, dataPointFacade, null);
      this.serverRunningStatusState$ = this.store.select<IServerRunningStatusState>((state: any) => state.serverRunningStatusState);      
  }

  onPanelToggleAll(expandPanel: boolean) {
    this.expandLinkVisibility = expandPanel ? false : true;
    this.monitoringWellList.forEach(well => well.Expanded = expandPanel );
  }

  isEllipsisActive(value) {
    return Math.ceil(value.getBoundingClientRect().height) < value.scrollHeight;
  }

  onPanelOpened(itemName) {
    let wellToOpenCount = 0;
    this.expandedItemName = itemName;
    this.monitoringWellList.forEach((well) => {
      if(well.WellName === itemName) {
        well.Expanded = true;
      } else {
        wellToOpenCount = !well.Expanded ? wellToOpenCount + 1 : wellToOpenCount;
      }
    });
    this.monitoringWellList.find(w => w.WellName === itemName).Expanded = true;
    this.expandLinkVisibility = wellToOpenCount > 0 ? true : false;
  }

  onPanelClosed(itemName) {
    this.monitoringWellList.find(w => w.WellName === itemName).Expanded = false;
    this.expandLinkVisibility = true;
  }

  onPerformShiftBtnClick(event, wellId) {
    event.stopPropagation(); /// to ignore panel collapse event
    this.userService.GetCurrentLoginUser().then((user) => {
      if (user && user?.Name !== UICommon.OPENUSER_NAME) {
        this.openPerformShiftDialog(wellId);
      } else {
        UICommon.LogInRouteURL =`${this.defaultRoute}/${wellId}`; 
        this.router.navigate(['/Login']);
      }
    });
    
  }
  onToolLinkClick(toolId) {
    this.userService.GetCurrentLoginUser().then((user) => {
      if (user && user?.Name !== UICommon.OPENUSER_NAME) {
        this.router.navigate([`${this.toolRoute}/${toolId}`]);
      } else {
        UICommon.LogInRouteURL = `${this.toolRoute}/${toolId}`;
        this.router.navigate(['/Login']);
      }
    });
    
  }

  onViewShiftBtnClick(event, wellId) {
    this.userService.GetCurrentLoginUser().then((user) => {
      if (user && user?.Name !== UICommon.OPENUSER_NAME) {
        event.stopPropagation(); // to ignore panel collapse event
        this.router.navigate([`${this.defaultRoute}/well/${wellId}/viewshift`]);
      } else {
        UICommon.LogInRouteURL = `${this.defaultRoute}/well/${wellId}/viewshift`;
        this.router.navigate(['/Login']);
      }
    });
    

   
  }

  openPerformShiftDialog(wellId) {
    let well: InforceWellUIModel = this.wellEnity.find(w => w.WellId === wellId); 
    const wellObj = this.monitoringWellList.find(w => w.WellId === well.WellId);
    this.currentShiftWell = wellObj;
    this.gwModalService.openAdvancedDialog(
      'Perform a Shift',
      ButtonActions.None,
      InforcePerformShiftDialogComponent,
      Object.assign({}, well),
      (result) => {
        if (result) {           
          this.closeModal();
        } else {
          this.closeModal();
        }
      },
      '750px',
      null,
      null,
      null,
      'gw-inforce-shift-dialog'
    );
  }

  closeModal() {
    this.gwModalService.closeModal();
  }

  private setUpRealtimeSubscription(): void {
    if (this.deviceIndexArray.length > 0) {
      this.deviceIndexArray.forEach((element) => {
        let deviceSubs = null;
        deviceSubs = this.realTimeService
          .GetRealtimeData(element.DeviceId, element.DataPointIndex)
          .subscribe((data) => {
            if (data) {
              element.RawValue = data.Value;
              this.updateZoneCurrentPositions();
            }
            this.dataSubscriptions.push(deviceSubs);
          });
      });
    }
  }

  private updateZoneCurrentPositions(): void {
    this.monitoringWellList.forEach(monitoringWell => {
      monitoringWell.Zones.forEach(monitoringZone => {
        monitoringZone.currentPositionDescription = this.getZonePosition(monitoringZone);
        if (monitoringZone?.sleeve){
          monitoringZone.sleeve.lastShiftDate = this.getLastShiftDate(monitoringZone.sleeve.lastShift);
          monitoringZone.sleeve.lastShiftStatusDescription = this.getLastShiftStatus(monitoringZone.sleeve);
        }

        if (monitoringZone.toolList){
          monitoringZone.toolList.forEach(zoneTool => {
            zoneTool.toolStatusCode = this.getToolStatusCode(zoneTool.diagnosticsDevice.RawValue);
          });
        }
      });
    });
  }

  private getWellRealTimeData(): void {
    if (this.datapointdefinitions &&  this.datapointdefinitions.length > 0) {
      this.setUpRealtimeSubscription();  
      this.subscribeToInforceShiftStatus();
    }
  }
  
  constructWellZones(wellId: number, zones:InFORCEZoneDataUIModel[], isSuresensWell: boolean) {
    let zoneList:InforceMonitoringZoneUIModel [] = []; 
    zones.forEach(zone => {
      const zoneObj: InforceMonitoringZoneUIModel = {
        wellId: wellId,
        zoneId: zone.ZoneId,
        zoneName: zone.ZoneName,        
        measuredDepth: zone.MeasuredDepth,
        valveType: zone.ValveType,        
        numberOfPositions: zone.NumberOfPositions,
        hcmId: zone.HcmId,        
        currentPosition: !isSuresensWell ? zone.CurrentPosition : null,        
        CurrentPositionDp: this.getDeviceByPointIndex(zone.HcmId, InFORCEZone_HCM_PointIndex.CurrentPositionStateUnknownFlag),
        currentPositionStateUnknownFlag: !isSuresensWell ? zone.CurrentPositionStateUnknownFlag : null,
        shiftMethod: zone.ShiftMethod ?? null,
        ValvePositionsAndReturns: !isSuresensWell ? zone.ValvePositionsAndReturns : null,
        sleeve: !isSuresensWell && zone.ValveType !== ZONE_VALVE_TYPE.Monitoring ? this.getSleeveInfo(zone) : null,
        toolList: this.constructZoneToolList(wellId, zone.ZoneId) 
      }
      zoneList.push(zoneObj);     
  
    });
   
    return zoneList;
  }

  getSleeveInfo(zone) {
   
    const sleeveObj:InforceMonitoringSleeveUIModel = {
        sleeveId: zone.HcmId,
        lastShift: this.getDeviceByPointIndex(zone.HcmId, InFORCEZone_HCM_PointIndex.LastShiftOADate),
        lastShiftStatus: this.getDeviceByPointIndex(zone.HcmId, InFORCEZone_HCM_PointIndex.LastAutoShiftingOperationStatus),
        position: this.getDeviceByPointIndex(zone.HcmId, InFORCEZone_HCM_PointIndex.CurrentPosition)
    }
    return sleeveObj;
  }

  private getZonePosition(zone:InforceMonitoringZoneUIModel) {
    if(zone?.ValvePositionsAndReturns) {
      const valvePosition = zone.ValvePositionsAndReturns.find(vp => vp.ToPosition === zone.sleeve.position.RawValue);
      return zone.CurrentPositionDp.RawValue === 0 ? valvePosition?.Description :  'Unknown';
    } else return null;
  }

  private getLastShiftDate(lastShift: DataPointDefinitionModel) { 
    let lastShiftDate = ''; 
    if (lastShift) {
      const date = new Date(((lastShift.RawValue - 25569) * 86400000));
      const tz = date.getTimezoneOffset();
      if (lastShift.RawValue > 0) {
        const newdate = new Date(((lastShift.RawValue - 25569 + (tz / (60 * 24))) * 86400000));
        lastShiftDate = formatDate(newdate.getTime(), 'MMM d y hh:mm:ss a', this.locale);
      } 
    } 
    return lastShiftDate;
  }
  
  private getLastShiftStatus(sleeve: InforceMonitoringSleeveUIModel) { 
    let shiftStatus = ''; 
    if(sleeve) {           
      shiftStatus = this.getLastShiftDate(sleeve.lastShift) ?  SHIFT_STATUS_MESSAGE.FindValue(sleeve.lastShiftStatus.RawValue) : null;
    } 
    return shiftStatus;
  }

  constructZoneToolList(wellId: number, zoneId:number) {
    let monitoringToolList:InforceMonitoringToolUIModel [] = []; 
    let toolList: ToolConnectionUIModel[] = this.toolConnectionList.filter(tc => tc.WellId === wellId && tc.ZoneId === zoneId);
    toolList.forEach(tool => {
      const datasource = this.dataSourcesEntity.find(ds => ds.Channel.IdCommConfig === tool.ChannelId);
      const card = datasource?.Cards?.find(c => c.DeviceId === tool.CardDeviceId);
      const cardTool = card?.Gauges?.find(g => g.DeviceId === tool.DeviceId);
      if (cardTool) {
        const toolObj: InforceMonitoringToolUIModel = {
          tool: tool,
          gaugeType: cardTool.GaugeType,
          espGaugeType: cardTool.EspGaugeType,
          pressureDevice: this.getDeviceByPointIndex(tool.DeviceId, SureSENSDataPointIndex.Pressure),
          temperatureDevice: this.getDeviceByPointIndex(tool.DeviceId, SureSENSDataPointIndex.Temperature),
          diagnosticsDevice: this.getDeviceByPointIndex(tool.DeviceId, ToolDataPointIndex.Diagnostics),
          commStatus: this.getDeviceByPointIndex(tool.DeviceId, CardDataPointIndex.CommStatus),
        }
        monitoringToolList.push(toolObj);
      }
    });   
    return monitoringToolList;
  }

  getZoneShiftDetails() {
   
  }

  private getDeviceByPointIndex(deviceId: number, pointIndex: number): DataPointDefinitionModel {
    let index = this.datapointdefinitions.findIndex(d => d.DeviceId === deviceId && d.DataPointIndex == pointIndex) ?? -1;
    if (index !== -1) {
      const dp = new DataPointDefinitionModel();
      dp.DataPointIndex = this.datapointdefinitions[index].DataPointIndex;
      dp.DataType = this.datapointdefinitions[index].DataType;
      dp.DeviceId = this.datapointdefinitions[index].DeviceId;
      dp.RawValue = -999;
      dp.ReadOnly = this.datapointdefinitions[index].ReadOnly;
      dp.TagName = this.datapointdefinitions[index].TagName;
      dp.UnitQuantityType = this.datapointdefinitions[index].UnitQuantityType;
      dp.UnitSymbol = this.datapointdefinitions[index].UnitSymbol;

      this.deviceIndexArray.push(dp);
      return dp;
    }

    return new DataPointDefinitionModel();  // return empty DataPointDefinitionModel
  }

  private getToolStatusCode(statusCode : number) {
    let toolStausCode : number;
    if(statusCode === TOOL_STATUS.valid) { 
      toolStausCode = 0;
    } else if(UICommon.TOOL_DIAGNOSTICS_CODES.findIndex(c => c === statusCode) !== -1) { 
      toolStausCode = TOOL_STATUS.warning;
    } else {
      toolStausCode = TOOL_STATUS.critical; 
    }
    return toolStausCode;
  }


  private setAlarmStatus() {
    let fatalAlarmCount = 0;
    let criticalAlarmCount = 0;
    this.alarmData.forEach((alarm) => {
      if (alarm.SeverityType === INFORCE_ALARM_CONFIG.Fatal) {
        fatalAlarmCount++;
      } else if (alarm.SeverityType === INFORCE_ALARM_CONFIG.Critical) {
        criticalAlarmCount++;
      }
    });
    this.alarmStatusInValid = fatalAlarmCount > 0 || criticalAlarmCount > 0 ? true : false; 
  }

  private getActiveAlarmList() {
    
    const subscription = this.alarmService.subscribeToActiveAlarms().subscribe(alarmDesc => {
      this.alarmData = alarmDesc ?? [];  
      this.setAlarmStatus();   
    }); 
    this.dataSubscriptions.push(subscription);
  }

  private getShiftingInProgressWell() {
    let wellList: InforceMonitoringWellUIModel[] = [];
    if (this.isShiftInProgress && this.monitoringWellList.length > 0) {
      this.monitoringWellList.forEach(well => {
        if (!well.IsSuresensWell && well.SelectedToRunShift.RawValue === 1 && this.isShiftInProgress) {
          this.currentShiftWell = well;
          wellList.unshift(well);
        } else {
          wellList.push(well);
        }
      });
      this.monitoringWellList = wellList;
    } else {
      this.monitoringWellList = this.defMonitoringWellList;
    }
  }

  private subscribeToInforceShiftStatus() {
    const subscription = this.realTimeService.GetRealtimeData(this.deviceData.HPUID, HyrdraulicPowerUnitPointIndex.CurrentOperationMode).subscribe(dataPoint => {
      if (dataPoint != undefined && dataPoint != null) {
        this.isShiftInProgress =  (dataPoint.Value === InforceShiftStatus.Idle) ? false : true;
        this.getShiftingInProgressWell();
      }
    });
    this.dataSubscriptions.push(subscription);
  }

  postCallGetWells() {
    this.wellList =  this.wellEnity.filter(Px=>Px.WellDeviceId > 0) ?? [];
  }

  postCallGetToolConnections(): void {       
    this.toolConnectionList = this.toolConnectionEntity ?? [];
    this.initDeviceDataPoints();
  }

  postCallDeviceDataPoints() {
    this.monitoringWellList = []; 
    this.defMonitoringWellList = [];
    this.deviceIndexArray = [];
    if (this.wellList.length > 0) {

      // HPU Device Details
      this.hpuDevice = {
        ShiftStatus: this.getDeviceByPointIndex(this.deviceData.HPUID, HyrdraulicPowerUnitPointIndex.CurrentOperationMode),
        OperationMode: this.getDeviceByPointIndex(this.deviceData.HPUID, HyrdraulicPowerUnitPointIndex.ExecuteOperationMode),
        SetOperationMode: this.getDeviceByPointIndex(this.deviceData.HPUID, HyrdraulicPowerUnitPointIndex.SetOperationMode),
        Connected: this.getDeviceByPointIndex(this.deviceData.HPUID, HyrdraulicPowerUnitPointIndex.CommStatus),    
        ControlReciepeType: this.getDeviceByPointIndex(this.deviceData.HPUID, HyrdraulicPowerUnitPointIndex.CurrentRecipeControlTypeInExecution)
      };
      
      
      this.wellList.forEach(well => {
        const isSuresensWell = well.ControlArchitectureId === INFORCE_WELL_ARCHITECTURE.SURESENS ? true : false;
        const wellObj: InforceMonitoringWellUIModel = {
          WellId: well.WellId,
          WellName: well.WellName,
          ControlArchitectureId: well.ControlArchitectureId,
          WellDeviceId: well.WellId,
          WellType: well.WellType,
          IsSuresensWell: isSuresensWell,
          Zones: well.Zones?.length > 0 ? this.constructWellZones(well.WellId, well.Zones, isSuresensWell) : [],
          Expanded: true,
          SelectedToRunShift: this.getDeviceByPointIndex(well.WellDeviceId, InforceWellDevicePointIndex.SelectedToRunAutoShiftingIndex)
        }       
        this.monitoringWellList.push(wellObj);
        this.defMonitoringWellList.push(wellObj);
      });
    }
    
    this.getWellRealTimeData();
  }

  ngOnDestroy(): void {
    if (this.dataSubscriptions != null && this.dataSubscriptions.length > 0) {
      this.dataSubscriptions.forEach(subscription => {
        if (subscription != null)
          subscription.unsubscribe();
      });
    }
    this.dataSubscriptions = [];
    super.ngOnDestroy();
  }
   private subscribeToServerRunningStatus(): void {
    const subscription = this.serverRunningStatusState$.subscribe(
      (state: IServerRunningStatusState) => {
        if (state) {
          this.isConfigSaveInProgress = state.ConfigurationSavingInProgress;
        }
      }
    );
    this.dataSubscriptions.push(subscription);
  }

  ngOnInit(): void {  
    this.monitoringValveType = ZONE_VALVE_TYPE.Monitoring;
    this.initWells();
    this.initDataSources();
    this.initToolConnections();    
    this.getActiveAlarmList();
    this.subscribeToServerRunningStatus();
    this.activatedRoute.params.subscribe( 
      params => { 
        if(params['welId']) {
          this.openPerformShiftDialog(parseInt(params['welId']));
        }
      } 
    );
  } 

}

