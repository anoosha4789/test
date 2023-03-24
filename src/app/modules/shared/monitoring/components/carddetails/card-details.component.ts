import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GatewayPanelBase } from '@comp/GatewayPanelBase.component';
import { DataSourceFacade } from '@core/facade/dataSourceFacade.service';
import { DeviceDataPointsFacade } from '@core/facade/deviceDataPointsFacade.service';
import { WellFacade } from '@core/facade/wellFacade.service';
import { DataPointDefinitionModel, DataPointValueDataType } from '@core/models/webModels/DataPointDefinition.model';
import { RealTimeDataSignalRService } from '@core/services/realTimeDataSignalR.service';
import { Store } from '@ngrx/store';
import { ButtonActions } from '@shared/gateway-dialogs/components/gateway-advanced-dialog/gateway-advanced-dialog.component';
import { GatewayModalService } from '@shared/gateway-dialogs/services/gatewayModal.service';
import { Subscription } from 'rxjs';
import { ServerDataType, SetServerComponentData, SetServerValueComponent } from '../setservervalue/setservervalue.component';
import { String } from 'typescript-string-operations';
import { CablePowerConverstion, CableSelectConverstion, CardDataPointIndex, ToolDataPointIndex, TOOL_STATUS, UIChartColors, UICommon } from '@core/data/UICommon';
import { ConfigurationService } from '@core/services/configurationService.service';
import { WriteToServerDataModel } from '@core/models/webModels/WriteToServerData.model';
import { PointTemplatesFacade } from '@core/facade/pointTemplatesFacade.service';
import { PointTemplatesExtensionUIModel } from '@core/models/webModels/PointTemplatesExtensionUIModel.model';
import * as _ from 'lodash';
import { PanelConfigurationFacade } from '@core/facade/panelConfigFacade.service';
import { SetBaudrateComponent, SetBaudRateComponentData } from '../setbaudrate/setbaudrate.component';
import { DatePipe } from '@angular/common';
import { GwTruncatePipe } from '@shared/gateway-pipes/pipes/gw-truncate.pipe';
import { CardMonitoringDataPoint, CardMonitoringPanel, InChargeMonitoringToolDetails } from './data/cardDetails.model';
import { ErrorHandlingUIModel } from '@core/models/webModels/ErrorHandlingUI.model';
import { CommunicationChannelType } from '@core/data/UICommon';
@Component({
  selector: 'app-card-details',
  templateUrl: './card-details.component.html',
  styleUrls: ['../../assets/css/monitoring.scss', './card-details.component.scss'] 
})
export class CardDetailsComponent extends GatewayPanelBase implements OnInit, OnDestroy {
  cardTitle: string = "";
  cardTitle1: string = "";
  channelId:number;
  inchargeMonitoringToolDetails: InChargeMonitoringToolDetails[];
  expandPanels: boolean[] = [];
  gatewayRoute: string = '/incharge/toolbox';
  toolDetailsRoute: string = '/incharge/monitoring/tool';

  CARDID_DATAPOINT_INDEX = CardDataPointIndex.CardId; // 1
  CARDTIMESTAMP_DATAPOINT_INDEX = CardDataPointIndex.CardTimestamp;  // 10
  CABLESELECT_DATAPOINT_INDEX = CardDataPointIndex.CableSelect; // 12
  CABLEPOWER_DATAPOINT_INDEX = CardDataPointIndex.CablePower; // 13
  BAUDRATE_DATAPOINT_INDEX = CardDataPointIndex.BaudRate; // 25
  LOWERCONFIDENCEDATA_DATAPOINT_INDEX = CardDataPointIndex.EnableBadGaugeDataReporting; // 26
  COMMSTATUS_DATAPOINT_INDEX = CardDataPointIndex.CommStatus; // 32

  cardDeviceTypeId: number = 1;
  cardDeviceID: number;
  wellId: number;
  isSwampy: boolean = false;
  isCardConnected: boolean = true;
  chartId: string = "carddetails";
  multi_axis_series: any;
  errorHandlingSettings: ErrorHandlingUIModel;
  
  IsMobileView: boolean = false;
  HideBaudRate:boolean= true;
  isTCPIPChannel:boolean =false;

  private dataSubscriptions: Subscription[] = [];
  private monthNames: string[] = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  cardDataPanels: CardMonitoringPanel[] = [];

  constructor(protected store: Store,
    private panelConfigFacade: PanelConfigurationFacade,
    private wellDataFacade: WellFacade,
    private dataSourceFacade: DataSourceFacade,
    private dataPointFacade: DeviceDataPointsFacade,
    private pointTemplateFacade: PointTemplatesFacade,
    private configService: ConfigurationService,
    private realTimeService: RealTimeDataSignalRService,
    private gwModalService: GatewayModalService,
    private datePipe: DatePipe,
    private gwTruncate: GwTruncatePipe,
    protected router: Router,
    protected activatedRoute: ActivatedRoute) { 
      super(store, panelConfigFacade, wellDataFacade, dataSourceFacade, null, dataPointFacade, pointTemplateFacade);
  }

  @HostListener("window:resize", [])
  public onResize() {
    this.detectScreenSize();
  }

  ngAfterViewInit(): void {
    this.detectScreenSize();
  }

  resizeTimer = null;
  private detectScreenSize() {
    if (this.resizeTimer) clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(() => {
      this.IsMobileView = window.innerWidth < 950 ? true : false;
    }, 300);
  }

  setServerValue(dataPoint: CardMonitoringDataPoint) {
    if (dataPoint.deviceDataPoint.DataPointIndex === this.BAUDRATE_DATAPOINT_INDEX) {
      let baudRateData: SetBaudRateComponentData = new SetBaudRateComponentData();
      baudRateData.device = dataPoint.deviceDataPoint;
      let dialogBaudRateValue = this.gwModalService.openDialogInsideModal(
        dataPoint.pointTemplate.Description,
        ButtonActions.None,
        SetBaudrateComponent,
        baudRateData,
        () => dialogBaudRateValue.close(),
        '350px',
      );
      return;
    }

    let serverData: SetServerComponentData = new SetServerComponentData();
    serverData.fieldName = "Setpoint";
    serverData.device = dataPoint.deviceDataPoint;
    switch(dataPoint.deviceDataPoint.DataPointIndex) {
      case this.CABLESELECT_DATAPOINT_INDEX:
        serverData.serverDataType = ServerDataType.SELECT;
        serverData.selectValues = [{key: 0, value: "None"}, {key: 1, value: "A Only"}, {key: 2, value: "B Only"}, {key: 3, value: "A & B"}];
        break;

      case this.CABLEPOWER_DATAPOINT_INDEX:
        serverData.serverDataType = ServerDataType.SELECT;
        serverData.selectValues = [{key: 0, value: "OFF"}, {key: 1, value: "ON"}];
        break;

      case this.LOWERCONFIDENCEDATA_DATAPOINT_INDEX:
        serverData.serverDataType = ServerDataType.SELECT;
        serverData.selectValues = [{key: 0, value: "OFF"}, {key: 1, value: "ON"}];
        break;

      default:
        serverData.min = dataPoint.pointTemplate.MinValue;
        serverData.max = dataPoint.pointTemplate.MaxValue;
        serverData.serverDataType = ServerDataType.INTEGER;
        break;
    }
    
    let dialogSetServerValue = this.gwModalService.openDialogInsideModal(
      dataPoint.pointTemplate.Description,
      ButtonActions.None,
      SetServerValueComponent,
      serverData,
      
      () => dialogSetServerValue.close(),
      '350px',
    );
  }

  getCableSelectPointValue(value: number): string {
    if (value != null)
        return CableSelectConverstion.GetValue(value);
  }

  getCablePowerPointValue(value: number): string {
    if (value != null)
        return CablePowerConverstion.GetValue(value);
  }

  doubleToByteArray(number) {
    let buffer = new ArrayBuffer(8);        
    let longNum = new Float64Array(buffer);
    longNum[0] = number;
    let int16bitarray= Array.from(new Int16Array(buffer)) //
    //always show 4 digits
    return int16bitarray[0].toString(16).toUpperCase().padStart(4, '0')+"-"
      +int16bitarray[1].toString(16).toUpperCase().padStart(4, '0')+"-"
      +int16bitarray[2].toString(16).toUpperCase().padStart(4, '0')+"-"
      +int16bitarray[3].toString(16).toUpperCase().padStart(4, '0');
  }

  resetCard(): void {
    const writeVar = new WriteToServerDataModel();
    writeVar.DeviceId = this.cardDeviceID;
    writeVar.PointIndex = CardDataPointIndex.CardReset;
    writeVar.PointName = 'CardReset';
    writeVar.Value = 1;
    writeVar.WriteToServerCommandEnum = 1;
    this.configService.WriteToServer(writeVar).subscribe(
      result => { 
        this.gwModalService.closeModal();
       }
    );
  }

  setHostTimestamp() {
    let thisdate = new Date();
    var minutes = thisdate.getTimezoneOffset();

    let value = (Date.now())/1000; //(Date.now() - minutes * 60000) / 1000;

    const writeVar = new WriteToServerDataModel();
    writeVar.DeviceId = this.cardDeviceID;
    writeVar.PointIndex = CardDataPointIndex.HostTimestamp;
    writeVar.PointName = 'HostTimestamp';
    writeVar.Value = value;
    writeVar.WriteToServerCommandEnum = 1;
    this.configService.WriteToServer(writeVar).subscribe(
      result => { 
        this.gwModalService.closeModal();
       }
    );
  }

  private addZero(i: number) {
    if (i < 10) {
        return ("0" + i.toString()).toString();
    }
    return i.toString();
  }

  resetCardClick() : void {
    this.gwModalService.openDialog(
      String.Format('Please confirm that you wish to send a reset command to the interface card?'),
      () => this.resetCard(),
      () => this.gwModalService.closeModal(),
      'Warning',
      null,
      true,
      "Send",
      "Cancel"
    );
  }

  setHostTimestampClick() : void {
    var currentDate = new Date();
    let currentDateTime = this.addZero(currentDate.getDate()) + " "
            + this.monthNames[(currentDate.getMonth())] + " "
            + currentDate.getFullYear() + " "
            + this.addZero(currentDate.getHours()) + ":"
            + this.addZero(currentDate.getMinutes());

    this.gwModalService.openDialog(
      String.Format("Please confirm that you wish to set the card\'s host time to: {0}?", currentDateTime),
      () => this.setHostTimestamp(),
      () => this.gwModalService.closeModal(),
      'Warning',
      null,
      true,
      "Set",
      "Cancel"
    );
  }

  private setUpRealtimeSubscriptionForCard(): void {
    if (this.cardDataPanels.length > 0) {
      this.cardDataPanels.forEach(panel => {
        panel.deviceDataPoints.forEach(element => {
          let deviceSubs = this.realTimeService
          .GetRealtimeData(element.deviceDataPoint.DeviceId, element.deviceDataPoint.DataPointIndex)
          .subscribe((d) => {
            // console.log(element.TagName + " - " + "Value = " + d.Value + ", " + d.RawValue);
            if (d !== undefined && d !== null) {
              element.deviceDataPoint.RawValue = d.Value;
              this.updateCardDisplayValue(element);
            }
          });
         this.dataSubscriptions.push(deviceSubs); 
        });
      });
    }
  }

  private setUpRealtimeSubscriptionForTools(): void {
    if (this.inchargeMonitoringToolDetails.length > 0) {
      this.inchargeMonitoringToolDetails.forEach(cardTool => {
        let subscription = this.realTimeService.GetRealtimeData(cardTool.deviceId, ToolDataPointIndex.Diagnostics)
                          .subscribe(d => {
                            if (d !== undefined && d !== null) {
                              cardTool.toolDiagnosticCode = d.Value;
                              cardTool.toolDiagnosticStatus = this.getToolStatusCode(d.Value);
                            }
                          });
        this.dataSubscriptions.push(subscription);
      });
    }
  }

  private getToolTipText(value: number, isFloat: boolean): string {
    let toolTip = "";
    if (isFloat) {
      toolTip = value === -999 ? this.errorHandlingSettings?.BadDataValue.toString() : value.toFixed(2);
    }
    else {
      toolTip = value === -999 ? this.errorHandlingSettings?.BadDataValueUnsignedInteger.toString() : value.toString();
    }
    return toolTip;
  }

  private updateCardDisplayValue(dataPoint: CardMonitoringDataPoint): void {
    if (dataPoint.isSpecialCase) {
      dataPoint.colSpan = dataPoint.pointTemplate.ReadOnly == false ? 1 : 2;
      dataPoint.toolTip = "";
      dataPoint.showToolTip = false;
      switch(dataPoint.pointTemplate.DevicePointIndex) {
        case this.CARDID_DATAPOINT_INDEX:
          dataPoint.displayValue = this.doubleToByteArray(dataPoint.deviceDataPoint.RawValue);
          break;

        case this.CARDTIMESTAMP_DATAPOINT_INDEX:
          dataPoint.displayValue = this.datePipe.transform(dataPoint.deviceDataPoint.RawValue * 1000, "HH:mm:ss");
          break;

        case this.CABLESELECT_DATAPOINT_INDEX:
          dataPoint.displayValue = this.getCableSelectPointValue(dataPoint.deviceDataPoint.RawValue);
          break;

        case this.CABLEPOWER_DATAPOINT_INDEX:
          dataPoint.displayValue = this.getCablePowerPointValue(dataPoint.deviceDataPoint.RawValue);
          break;

        case this.LOWERCONFIDENCEDATA_DATAPOINT_INDEX:
          dataPoint.displayValue = this.getCablePowerPointValue(dataPoint.deviceDataPoint.RawValue);
          break;
      }
    }
    else {
      dataPoint.colSpan = dataPoint.pointTemplate.ReadOnly == false ? 1 : 2;
      dataPoint.toolTip = this.getToolTipText(dataPoint.deviceDataPoint.RawValue, dataPoint.isFloat);
      dataPoint.showToolTip = Number(dataPoint.toolTip)>10 ? true : false;
      dataPoint.displayValue = dataPoint.isFloat ? this.gwTruncate.transform(dataPoint.deviceDataPoint.RawValue.toFixed(2))
                                                  : this.gwTruncate.transform(dataPoint.deviceDataPoint.RawValue.toString());
    }
  }

  private getDeviceByPointIndex(deviceId: number, pointIndex: number): DataPointDefinitionModel {
    let dp = this.dataPointFacade.getDeviceByPoint(deviceId, pointIndex);
    if (dp != null) {  
      return dp;
    }
      
    return new DataPointDefinitionModel();  // return empty DataPointDefinitionModel
  }

  private isSwampyPoint(pointIndex: number): boolean {
    let isSwampyPt = false;
    if (pointIndex  === CardDataPointIndex.SupplyVoltage 
    || pointIndex === CardDataPointIndex.SupplyCurrent
    || pointIndex === CardDataPointIndex.CableACurrent
    || pointIndex === CardDataPointIndex.CableBCurrent
    || pointIndex === CardDataPointIndex.CableSelect
    || pointIndex === CardDataPointIndex.CardId)
      isSwampyPt = true;

    return isSwampyPt;
  }

  private setUpFirmwareVersion() {
    let subscription = this.realTimeService.GetRealtimeData(this.cardDeviceID, CardDataPointIndex.FirmwareVersion)
    .subscribe((d) => {
      if (d !== undefined && d !== null) {
        if (d.Value.toFixed(2) === UICommon.SWAMPY_FIRMWARE_VERSION) {
          console.log(d.Value);
          this.isSwampy = true;
          this.cardDataPanels.forEach(cardTool => {
            cardTool.deviceDataPoints.forEach(dataPoint => {
              if (this.isSwampyPoint(dataPoint.pointTemplate.DevicePointIndex)){
                dataPoint.hide = true;
              }
            });
          });
        }
      }
    });
    this.dataSubscriptions.push(subscription);
  }

  private setUpToolsForCard(): void {
    this.inchargeMonitoringToolDetails = [];
    let tools = this.toolConnectionEntity.filter(t => t.CardDeviceId === this.cardDeviceID)??[];
    if (tools.length > 0) {
      tools.forEach(cardTool => {
        let inchargeTool: InChargeMonitoringToolDetails = {
          deviceId: cardTool.DeviceId,
          toolName: cardTool.DeviceName,
          toolDiagnosticCode: -999,
          toolDiagnosticStatus: 0
        };
        this.inchargeMonitoringToolDetails.push(inchargeTool);
      });
      this.setUpRealtimeSubscriptionForTools();

      this.cardTitle = String.Format(" > {0} - {1}", tools[0].ChannelName, tools[0].CardDeviceName);
      this.cardTitle1 = String.Format("{0} - {1}: ", tools[0].ChannelName, tools[0].CardDeviceName);

      this.channelId = tools[0].ChannelId;
      
     
      this.dataSourcesEntity.forEach(Px=>{
       
        if(this.channelId == Px.Channel.IdCommConfig){
          if(Px.Channel.channelType !== CommunicationChannelType.SERIAL){
            this.HideBaudRate = false;
            this.isTCPIPChannel=  true;
          }
          else{
            this.HideBaudRate = true;
            this.isTCPIPChannel = false;
          } 
        }
      })
    }
  }

  private setUpChart(): void {
    let points = _.cloneDeep(this.pointTemplatesEnity.find(pt => pt.deviceTypeId === this.cardDeviceTypeId));
    if (points && points.PointTemplates.length > 0) {
      let dataPoints = points.PointTemplates.filter(pt => pt.UIChart === true)??[];
      let chartPoints: CardMonitoringDataPoint[] = [];
      dataPoints.forEach(dataPoint => {
        let dp = this.dataPointFacade.getDeviceByPoint(this.cardDeviceID, dataPoint.DevicePointIndex);
        if (dp != null) {
          chartPoints.push(
            {
              deviceDataPoint: dp,
              pointTemplate: dataPoint,
              isFloat: undefined,
              isSpecialCase: undefined,
              toolTip: undefined,
              showToolTip: undefined,
              displayValue: undefined,
              colSpan: undefined,
              hide: undefined
            }
          );
        }
      });
      let chartPointDict = _.groupBy(chartPoints, point => point.deviceDataPoint.UnitSymbol);
      let yAxes: any [] = [];
      let dataSeries: any [] = [];
      let inxColor = 0;
      for (let unitLabel in chartPointDict) {
        yAxes.push(
          {
            label: unitLabel,
            unit:  unitLabel 
          }
        );
        let series = chartPointDict[unitLabel];
        series.forEach(point => {
          dataSeries.push(
            {
              deviceId: this.cardDeviceID, 
              pointIndex: point.pointTemplate.DevicePointIndex, 
              label: String.Format("{0} ({1})", point.pointTemplate.Description, point.deviceDataPoint.UnitSymbol??""), 
              unit: point.deviceDataPoint.UnitSymbol,
              decimalPoints: point.pointTemplate.DecimalPoints,
              brush: UIChartColors.getChartBrush(inxColor++) 
            }
          );
        });
      }

      let chartOptions = null;
      if (yAxes.length > 0 && dataSeries.length > 0) {
        chartOptions = {
          yAxes: yAxes,
          dataSeries: dataSeries
        };
        this.multi_axis_series = chartOptions;
      }
    }
  }

  private checkSpecialDataPoints(dataPointIndex: number): boolean {
    let bIsSpecial = false;
    if (dataPointIndex == this.CARDID_DATAPOINT_INDEX || dataPointIndex == this.CARDTIMESTAMP_DATAPOINT_INDEX 
      || dataPointIndex == this.CABLESELECT_DATAPOINT_INDEX || dataPointIndex == this.CABLEPOWER_DATAPOINT_INDEX 
      || dataPointIndex == this.LOWERCONFIDENCEDATA_DATAPOINT_INDEX)
      bIsSpecial = true;
    
    return bIsSpecial;
  }
  postCallGetDataSources():void{
    this.getParameter();
  }
  postCallGetPanelConfigurationCommon(): void {
    if (this.panelConfigurationCommonState.panelConfigurationCommon) {
      let panelTypeName = UICommon.getPanelType(this.panelConfigurationCommonState.panelConfigurationCommon.PanelTypeId).name;
      this.gatewayRoute = `/${panelTypeName}/toolbox`;
      this.toolDetailsRoute = `/${panelTypeName}/monitoring/tool`;
    }
  }

  postCallDeviceDataPoints(): void {
    this.initToolConnections();
    this.initPointTemplates(this.cardDeviceTypeId);
  }

  postCallGetToolConnections(): void {
    this.setUpToolsForCard();
  }

  postCallGetPointTemplates(): void {
    if (this.datapointdefinitions && this.datapointdefinitions.length > 0) {
      let subscription = this.realTimeService.GetRealtimeData(this.cardDeviceID, this.COMMSTATUS_DATAPOINT_INDEX)
                          .subscribe(d => {
                            if (d !== undefined && d !== null) {
                              this.isCardConnected = d.Value == 1 ? true : false;
                            }
                          });
      this.dataSubscriptions.push(subscription);   
      this.cardDataPanels = [];
      if (this.pointTemplatesEnity && this.pointTemplatesEnity.length > 0) {
        this.expandPanels = [];
        this.expandPanels.push(true);
        let points = _.cloneDeep(this.pointTemplatesEnity.find(pt => pt.deviceTypeId === this.cardDeviceTypeId));
        if (points) {
          let pointTemplates =  _.groupBy(points.PointTemplates, point => point.PropertyCategoryDescription);
          for (let key in pointTemplates) {
            let cardPanelDataPoints: CardMonitoringDataPoint[] = [];
            let dataPointsXXX = pointTemplates[key].filter(p => p.UIPropertyList === true)??[];    
            dataPointsXXX.forEach((dataPoint,index,object)=> {
              if(this.isTCPIPChannel && dataPoint.Description === 'Cable B Current'){
                dataPointsXXX.splice(index,1);
            }
            })

            dataPointsXXX.forEach((dataPoint,index,object)=> {
              if(this.isTCPIPChannel && dataPoint.Description === 'Cable Select'){
              dataPointsXXX.splice(index,1);
            }
            })            
            
            dataPointsXXX.forEach((dataPoint,index,object)=> {
              let deviceDataPoint = this.getDeviceByPointIndex(this.cardDeviceID, dataPoint.DevicePointIndex);
              // if (deviceDataPoint.UnitSymbol == "degF" || deviceDataPoint.UnitSymbol == "degC")
              //   deviceDataPoint.UnitSymbol = deviceDataPoint.UnitSymbol == "degF" ? "°F" : "°C";
             
              if(deviceDataPoint.DataPointIndex === CardDataPointIndex.BaudRate){
                if(this.HideBaudRate) {
                  cardPanelDataPoints.push({
                    deviceDataPoint: deviceDataPoint,
                    pointTemplate: dataPoint,
                    isFloat: (deviceDataPoint.DataType == DataPointValueDataType.Double64Bit || deviceDataPoint.DataType == DataPointValueDataType.Float32Bit) ? true : false,
                    isSpecialCase: this.checkSpecialDataPoints(dataPoint.DevicePointIndex),
                    displayValue: "-999",
                    toolTip: "",
                    showToolTip: false,
                    colSpan: 2,
                    hide: false
                  });
                }
              }
              else{
                cardPanelDataPoints.push({
                  deviceDataPoint: deviceDataPoint,
                  pointTemplate: dataPoint,
                  isFloat: (deviceDataPoint.DataType == DataPointValueDataType.Double64Bit || deviceDataPoint.DataType == DataPointValueDataType.Float32Bit) ? true : false,
                  isSpecialCase: this.checkSpecialDataPoints(dataPoint.DevicePointIndex),
                  displayValue: "-999",
                  toolTip: "",
                  showToolTip: false,
                  colSpan: 2,
                  hide: false
                });
              }
              
            });

            this.cardDataPanels.push({
              panelName: key,
              deviceDataPoints: cardPanelDataPoints
            });

            this.expandPanels.push(false);
          }

          this.setUpRealtimeSubscriptionForCard();
          this.setUpChart();
        }
      }
      this.setUpFirmwareVersion();
    }
  }

  getParameter(): void {
    this.activatedRoute.params.subscribe(params => {
      this.cardDeviceID = parseInt(params['Id']);
      this.initDeviceDataPoints();
    });
  }

  getToolStatusCode(statusCode : number) {
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
  private subscribeErrorHandling(): void {
    const subscription = this.configService.getErrorHandlingSettings().subscribe((data) => {
      this.errorHandlingSettings = data;
    });
    this.dataSubscriptions.push(subscription);
  }

  ngOnDestroy(): void {
    if (this.dataSubscriptions != null && this.dataSubscriptions.length > 0) {
      this.dataSubscriptions.forEach(subscription => {
        if (subscription != null) {
          subscription.unsubscribe();
          subscription = null;
        }
      });
    }

    this.dataSubscriptions = [];
    this.errorHandlingSettings = null;
    super.ngOnDestroy();
  }
  ngOnInit(): void {
    super.ngOnInit();
    this.initDataSources();
    this.initPanelConfigurationCommon();
    this.subscribeErrorHandling();
  }
}