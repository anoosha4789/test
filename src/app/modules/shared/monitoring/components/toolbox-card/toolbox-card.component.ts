import { Component, HostListener, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Observable, Subscription } from 'rxjs';

import { Store } from '@ngrx/store';

import { DataPointDefinitionModel, DataPointValueDataType } from '@core/models/webModels/DataPointDefinition.model';
import { ConfigurationService } from '@core/services/configurationService.service';
import { DataSourceFacade } from '@core/facade/dataSourceFacade.service';
import { DeviceDataPointsFacade } from '@core/facade/deviceDataPointsFacade.service';
import { RealTimeDataSignalRService } from '@core/services/realTimeDataSignalR.service';

import { GatewayPanelBase } from '@comp/GatewayPanelBase.component';
import { DataSourceUIModel } from '@core/models/UIModels/dataSource.model';
import { CardDataPointIndex, CommunicationChannelType, PanelTypeList, ToolDataPointIndex, TOOL_STATUS, UICommon } from '@core/data/UICommon';
import { ISerialChannelPropertiesState } from '@store/state/serialChannelProperties.state';
import { SerialChannelProperty } from '@core/models/UIModels/SerialChannel.model';
import { StateUtilities } from '@store/state/IState';

import * as ACTIONS from '@store/actions/serialChannelProperties.action';
import * as ERROR_HANDLING_SETTINGS_STATE_ACTIONS from '@store/actions/errorHandlingSettings.action';
import { PanelConfigurationFacade } from '@core/facade/panelConfigFacade.service';
import { UtilityService } from '@core/services/utility.service';
import { InterfaceCardDataUIModel } from '@core/models/webModels/InterfaceCardDataUIModell.model';
import { ErrorHandlingUIModel } from '@core/models/webModels/ErrorHandlingUI.model';
import { IErrorHandlingSettingsState } from '@store/state/errorHandlingSettings.state';
import { ModbusProtocolModel } from '@core/models/UIModels/ModbusProtocol.model';
import { PublishingChannelFacade } from '@core/facade/publishingChannelFacade.service';

@Component({
  selector: 'app-toolbox-card',
  templateUrl: './toolbox-card.component.html',
  styleUrls: ['./toolbox-card.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ToolboxCardComponent  extends GatewayPanelBase implements OnInit, OnDestroy {

  
  private dataSubscriptions: Subscription[] = [];

  errorHandlingSettings: ErrorHandlingUIModel; 
  dataSources: DataSourceUIModel[];
  deviceIndexArray: DataPointDefinitionModel[];
  inchargeMonitoringCards: InChargeMonitoringCard[];
  ProtocolList: ModbusProtocolModel[] = [];
  cardDeviceId: number;
  private errorHandlingSettingsState$: Observable<IErrorHandlingSettingsState>;
  serialCannelProperties$: Observable<ISerialChannelPropertiesState>;
  serialChannelProperty: SerialChannelProperty;
  
  showMaintainceMode: boolean = false;
  panelTypeName:string ="";

  gatewayRoute: string = "/incharge/card";
  cardStatus = UICommon.CARD_STATUS_DISCONNECT;
  bIsMobileView: boolean = false;

  constructor(protected store: Store, 
    private panelConfigFacade: PanelConfigurationFacade,
    private configurationService: ConfigurationService,
    private dataSourceFacade: DataSourceFacade,
    private dataPointFacade: DeviceDataPointsFacade,
    private publishingFacade: PublishingChannelFacade,
    private realTimeService: RealTimeDataSignalRService,
    private utilityService: UtilityService) {
      super(store, panelConfigFacade, null, dataSourceFacade, publishingFacade, dataPointFacade, null);
      this.errorHandlingSettingsState$ = this.store.select<any>((state: any) => state.errorHandlingSettingsState);
      this.serialCannelProperties$ = this.store.select<any>((state: any) => state.serialChannelPropertiesState);
  }

  isEllipsisActive(value) {
    return Math.ceil(value.getBoundingClientRect().height) < value.scrollHeight;
  }

  @HostListener("window:resize", [])
  public onResize() {
    this.detectScreenSize();
  }

  public ngAfterViewInit() {
      this.detectScreenSize();
  }

  private detectScreenSize() {
    this.bIsMobileView = window.innerWidth < 480 ? true : false;
  }

  private getProtocolInfo(commConfigId: number): [boolean, string] {
    let protocolName = "";
    let isTCPChannel = false;
    let inxChannel = this.dataSources.findIndex(c => c.Channel.IdCommConfig === commConfigId)??-1;
    if (inxChannel > -1) {
      let channel = this.dataSources[inxChannel];
      if (channel.Channel.channelType === CommunicationChannelType.SERIAL) {
        protocolName = this.ProtocolList[channel.Channel.Protocol - 1]?.Name;
      }
      else {
        protocolName = this.ProtocolList[channel.Channel.Protocol]?.Name;
        isTCPChannel = true;
      }
    }
    return [isTCPChannel, protocolName];
  }

  private updateToolBoxes(): void {
    if (!this.datapointdefinitions || this.datapointdefinitions.length == 0)
      return;

    this.deviceIndexArray = [];
    if (this.dataSources && this.dataSources.length > 0) {
      this.inchargeMonitoringCards = [];

      this.dataSources.forEach(ds => {
        ds.Cards.forEach(card => {
          if (card.DeviceId !== -1){
            let protocolInfo = this.getProtocolInfo(card.CommConfigId);
            let inChargeCard = new InChargeMonitoringCard();
            inChargeCard.isTCPIPChannel = protocolInfo[0];
            inChargeCard.protocol = protocolInfo[1];
            inChargeCard.port = ds.Channel.Description;
            inChargeCard.details =  card;
            inChargeCard.currentDevice = this.getDeviceByPointIndex(card.DeviceId, CardDataPointIndex.TotalCableCurrent);
            inChargeCard.voltageDevice = this.getDeviceByPointIndex(card.DeviceId, CardDataPointIndex.CableVoltage);
            inChargeCard.commStatus = this.getDeviceByPointIndex(card.DeviceId, CardDataPointIndex.CommStatus);
            inChargeCard.tools = this.setToolsForRealtimeSubscription(card.Gauges);
            if(inChargeCard.isTCPIPChannel){
              let ipAddresssplit = inChargeCard.port.split(':');
              inChargeCard.port = ipAddresssplit[0];
              inChargeCard.portNumber = ipAddresssplit[1];
            }
            this.inchargeMonitoringCards.push(inChargeCard);
          }

        });
      });
    }
    this.setUpRealtimeSubscription();
  }

  private getInvalidTools(toolId, diagCode: number) {
  
    this.inchargeMonitoringCards.forEach(card => {
      const toolIdx = card.tools.findIndex(tool => tool.toolDeviceId === toolId);
      if(toolIdx !== -1) {
        const toolObj: Tool = {
          toolDeviceId: toolId,
          toolDiagCode: diagCode
        }
        if(diagCode !== 0) { // Tool is invalid
          if(card.invalidTools.length > 0) {
            const toolIdx =  card.invalidTools.findIndex(t => t.toolDeviceId === toolId);
            if(toolIdx === -1) { 
              card.invalidTools.push(toolObj);
            } else {
              card.invalidTools[toolIdx].toolDiagCode = diagCode;
            }

          } else {
            card.invalidTools.push(toolObj);
          }
        } else if(diagCode === 0) { //  Tool is valid
          if(card.invalidTools.length > 0) {
            const toolIdx =  card.invalidTools.findIndex(t => t.toolDeviceId === toolId);
            if(toolIdx !== -1) card.invalidTools.splice(toolIdx, 1);
          }
        }
      }
      card.toolStatusCode = this.setCardToolStatusCode(card.invalidTools);
      const toolTipArr = this.getToolTipData(card);
      card.toolTipData = toolTipArr.length > 0 ? toolTipArr.join("\r\n") : null;
    });
    
  }

  private getToolTipData(card: InChargeMonitoringCard) {
    let data = [];
    card.invalidTools.forEach(item => {
      const tool = card.details.Gauges.find(tool => tool.DeviceId === item.toolDeviceId);
      const toolStatus = this.utilityService.getToolStatus(item.toolDiagCode);
      if (toolStatus) {
        const tooltip = `${tool.Description} - ${toolStatus}`;
        data.push(tooltip);
      }
    })
    return data;
  }

  private setCardToolStatusCode(tools: Tool[]) {
    if(tools.length > 0) {
      let toolStatusCriticalCount = 0;
      tools.forEach(tool => {
        if(UICommon.TOOL_DIAGNOSTICS_CODES.findIndex(c => c === tool.toolDiagCode) === -1  || tool.toolDiagCode === -999) toolStatusCriticalCount ++;
      });
      return toolStatusCriticalCount > 0 ? TOOL_STATUS.critical : TOOL_STATUS.warning;
    } else {
      return TOOL_STATUS.valid;
    }
  }

  private setToolsForRealtimeSubscription(tools) {
    const data: MonitoringTool[] = [];
    tools.forEach(tool => {
      let toolObj = new MonitoringTool();
      toolObj.toolDeviceId = tool.DeviceId;
      toolObj.diagnosticsDevice = this.getDeviceByPointIndex(tool.DeviceId, ToolDataPointIndex.Diagnostics);
      data.push(toolObj);
    });
    return data;
  }
 
  private setUpRealtimeSubscription(): void {
    if (this.deviceIndexArray.length > 0) {
      this.deviceIndexArray.forEach((element) => {
        let deviceSubs = null;
        deviceSubs = this.realTimeService
          .GetRealtimeData(element.DeviceId, element.DataPointIndex)
          .subscribe((d) => {
            if (d !== undefined && d !== null) {
              if(element.DataPointIndex === ToolDataPointIndex.Diagnostics) {
                this.getInvalidTools(element.DeviceId, d.Value);
              }
              element.RawValue = d.Value;
            }
            this.dataSubscriptions.push(deviceSubs);
          });
      });
    }
  }

  private getDeviceByPointIndex(deviceId: number, pointIndex: number): DataPointDefinitionModel {
    let index = this.datapointdefinitions.findIndex(d => d.DeviceId === deviceId && d.DataPointIndex == pointIndex)??-1;
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
      
    return null;
  }

  private subscribeSerialSettings() {
    let subscription = this.serialCannelProperties$.subscribe((state: ISerialChannelPropertiesState) => {
      if (state !== undefined && state != null) {
        if (state.isLoaded === false && !StateUtilities.hasErrors(state))   // Dispatch Action if not loaded
          this.store.dispatch(ACTIONS.SERIALCHANNELPROPERTIES_LOAD());
        else {
          this.initDeviceDataPoints();
          this.initDataSources();
        }
      }
    });

    this.dataSubscriptions.push(subscription);
  }

  private subscribeToErrorHandlingState(): void {
    const subscription =  this.configurationService.getErrorHandlingSettings().subscribe((data) => {            
      this.errorHandlingSettings = data;
    });
    this.dataSubscriptions.push(subscription);
  }

  postCallGetModbusProtocols() {
    this.ProtocolList = this.modbusProtocols;
    this.updateToolBoxes();
  }

  postCallGetPanelConfigurationCommon(): void {
    if (this.panelConfigurationCommonState.panelConfigurationCommon) {
      this.showMaintainceMode = this.panelConfigurationCommonState.panelConfigurationCommon.PanelTypeId === PanelTypeList.INFORCE ? true : false;
      this.panelTypeName = UICommon.getPanelType(this.panelConfigurationCommonState.panelConfigurationCommon.PanelTypeId).name;
      this.gatewayRoute = `/${this.panelTypeName}/card`;
    }
  }

  postCallDeviceDataPoints(): void {
    this.updateToolBoxes();
  }

  postCallGetDataSources(): void {
    this.dataSources = this.dataSourcesEntity;
    this.updateToolBoxes();
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.initModbusProtocols();
    this.subscribeToErrorHandlingState();
    this.initPanelConfigurationCommon();
    this.subscribeSerialSettings();
  }

  ngOnDestroy(): void {

    if (this.dataSubscriptions  && this.dataSubscriptions.length > 0) {
      this.dataSubscriptions.forEach(subscription => {
        if (subscription != null)
          subscription.unsubscribe();
      });
    }
    this.dataSubscriptions = [];
    super.ngOnDestroy();
  }

}

class InChargeMonitoringCard {
  protocol: string;
  port: string;
  isTCPIPChannel: boolean;
  details: InterfaceCardDataUIModel;
  currentDevice:DataPointDefinitionModel;
  voltageDevice: DataPointDefinitionModel;
  commStatus: DataPointDefinitionModel;
  tools: MonitoringTool[];
  invalidTools: Tool[] = [];
  toolStatusCode: number; // 0 - valid , 1 - warning , 2 - critical,
  toolTipData?: string;
  portNumber:string;
}

class MonitoringTool {
  toolDeviceId: number;
  diagnosticsDevice: DataPointDefinitionModel;
}

class Tool {
  toolDeviceId: number;
  toolDiagCode: number;
}
