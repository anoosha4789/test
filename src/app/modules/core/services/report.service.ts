import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { Observable, throwError as observableThrowError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

import { PublishingChannelFacade } from '@core/facade/publishingChannelFacade.service';

import * as reportUIModel from '@core/models/UIModels/report.model'
import { PublishingDataUIModel } from '@core/models/UIModels/dataPublishing.model';
import { SerialPortCommunicationChannelDataUIModel } from '@core/models/webModels/SerialPortCommunicationChannelDataUIModel.model';
import { CommunicationChannelType, DATA_LOGGER_TYPE } from '@core/data/UICommon';
import { TcpIpCommunicationChannelDataUIModel } from '@core/models/webModels/TcpIpCommunicationChannelDataUIModel.model';
import * as AlarmHistory from '@core/models/UIModels/alarm-history-report-model';
import * as ShiftHistory from '@core/models/UIModels/shift-history-report-model';
import { DataLoggerUIModel } from '@core/models/UIModels/dataLogger.model';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  private baseUrl: string = environment.webHostURL + 'api/';
  private fetchAllModbusMapListUrl: string = this.baseUrl + 'modbus/getallmodbusmapnames';
  private fetchModbusMapDataUrl: string = this.baseUrl + 'modbus/getmodbusmap';
  private fetchAlarmHistoryDataUrl: string = this.baseUrl + 'InFluxDbTimeSeriesData/QueryAlarmHistory';
  private fetchShiftHistoryDataUrl: string = this.baseUrl + 'InFluxDbTimeSeriesData/QueryInForceShiftHistory';

  constructor(protected http: HttpClient, private publishingChannelFacade: PublishingChannelFacade) { }

  // Get All Modbusmap templates
  getAllCustomMapNamesfromDB(): Observable<CustomMapNameModel[]> {

    return this.http.get<CustomMapNameModel[]>(this.fetchAllModbusMapListUrl).pipe(
      catchError(this.handleError));
  }

  // Get Modbusmap data by Id
  getModbusMapDataById(id: number): Observable<any> {

    return this.http.get<any>(this.fetchModbusMapDataUrl + "/" + id).pipe(
      catchError(this.handleError));
  }


  // Get Gauge Type
  getGaugeTypeById(id: number) {

    const gaugeTypes = [
      { Id: 0, Name: "SureSENS QPT ELITE" },
      { Id: 2, Name: "SureSENS SPTV" },
      { Id: 5, Name: "InCHARGE" }
    ];
    const gauge = gaugeTypes.find(gauge => gauge.Id == id);
    return gauge ? gauge.Name : null;
  }


  // Set Time Units
  convertToTimeUnit(type: string, value: number) {
    if (type == 'seconds') {
      return value * 60;
    } else if (type == 'minutes') {
      return value / 60;
    } else if (type == 'hours') {
      return value;
    }

  }

  //Set Default Tool Bar Options
  setReportViewerOptions(options, Viewer) {
    options.height = "100%";
    options.appearance.showTooltips = false;
    options.appearance.ScrollbarsMode = true;
    options.appearance.InterfaceType = Viewer.StiInterfaceType.Auto;
    options.toolbar.printDestination = Viewer.StiPrintDestination.Default;
    // Toolbar Options
    options.toolbar.showOpenButton = false;
    options.toolbar.showBookmarksButton = false;
    options.toolbar.showParametersButton = false;
    options.toolbar.showResourcesButton = false;
    options.toolbar.showAboutButton = false;
    options.toolbar.viewMode = Viewer.StiWebViewMode.Continuous;
    options.toolbar.zoom = Viewer.StiZoomMode.PageWidth;
    // Export Options
    options.exports.showExportToImageBmp = true;
    options.exports.showExportToImagePng = true;
    options.exports.showExportToImageJpeg = true;
    options.exports.showExportToImageMetafile = true;
    options.exports.showExportToImageSvg = false;
    options.exports.showExportToExcel2007 = false;
    options.exports.showExportToPowerPoint = false;
    options.exports.showExportToHtml = false;
    options.exports.showExportToHtml5 = false;
    options.exports.showExportToText = false;
    options.exports.showExportToDocument = false;
    options.exports.showExportToOpenDocumentCalc = false;
    options.exports.showExportToOpenDocumentWriter = false;
    options.exports.showExportToCsv = false;
    options.exports.showExportToXml = false;
    options.exports.showExportToJson = false;
    return options;
  }

  protected handleError(error: Response | any) {

    let errMsg: string;
    if (error instanceof Response) {
      const err = error;
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    return observableThrowError(errMsg);
  }

  // Report Model Data Binding


  // Get Publishing Details
  getPublishingDetails(publishingEntity: PublishingDataUIModel[]) {

    if (publishingEntity && publishingEntity.length > 0) {

      const publishingList = Array<reportUIModel.IDataPublishing>();
      for (const publishing of publishingEntity) {

        const pubLishingObj: reportUIModel.IDataPublishing = {
          Protocol: this.publishingChannelFacade.getModbusProtocolName(publishing.Channel.Protocol, publishing.Channel.channelType),
          Port: publishing.Channel.channelType == CommunicationChannelType.SERIAL ?
            (publishing.Channel as SerialPortCommunicationChannelDataUIModel).Description : null,
          BaudRate: publishing.Channel.channelType == CommunicationChannelType.SERIAL ?
            (publishing.Channel as SerialPortCommunicationChannelDataUIModel).BaudRate : null,
          DataBits: publishing.Channel.channelType == CommunicationChannelType.SERIAL ?
            (publishing.Channel as SerialPortCommunicationChannelDataUIModel).DataBits : null,
          StopBits: publishing.Channel.channelType == CommunicationChannelType.SERIAL ?
            (publishing.Channel as SerialPortCommunicationChannelDataUIModel).StopBits : null,
          Parity: publishing.Channel.channelType == CommunicationChannelType.SERIAL ?
            parityList[(publishing.Channel as SerialPortCommunicationChannelDataUIModel).Parity] : null,
          IpPortNumber: publishing.Channel.channelType == CommunicationChannelType.SERIAL ?
            null : (publishing.Channel as TcpIpCommunicationChannelDataUIModel).IpPortNumber,
          IpAddress: publishing.Channel.channelType == CommunicationChannelType.SERIAL ?
            null : (publishing.Channel as TcpIpCommunicationChannelDataUIModel).IpAddress,
          ConnectionTo: publishing.ConnectionTo,
          MapType: publishing.MapType,
          WordOrder: publishing.WordOrder,
          ByteOrder: publishing.ByteOrder,
          SlaveId: publishing.SlaveId

        }
        publishingList.push(pubLishingObj);
      }
      return publishingList;
    } else return [];

  }

  public getModbusProtocolName(protocolId: number, channelType: CommunicationChannelType) {
    return this.publishingChannelFacade.getModbusProtocolName(protocolId, channelType);
  }

  getAlarmHistoryData(): Observable<AlarmHistory.IAlarmtHistory[]> {

    return this.http.get<AlarmHistory.IAlarmtHistory[]>(this.fetchAlarmHistoryDataUrl).pipe(
      catchError(this.handleError));
  }


  // Get Shift History Data
  getShiftHistoryData(): Observable<ShiftHistory.IShifttHistory[]> {

    return this.http.get<ShiftHistory.IShifttHistory[]>(this.fetchShiftHistoryDataUrl).pipe(
      catchError(this.handleError));
  }

  // Get Valve Type based on Id
  getValveTypeId(valveTypeID: string): string {

    let valveList = [
      { Id: 0, Name: "Monitoring" },
      { Id: 2, Name: "HCM+" },
      { Id: 1, Name: "HCM-A" },
      { Id: 3, Name: "HCM-S" }
    ];
    const valve = valveList.filter(valve => valve.Id == parseInt(valveTypeID))[0];
    return valve.Name;
  }

  // Append Back button in Toolbar
  appendCustomButton(viewer, router) {
    let toolbarTable, buttonsTable, userButtonCell;
    const backButton = viewer.jsObject.SmallButton("userButton", "<< Back");
    backButton.action = () => {
      router.navigateByUrl('/', { skipLocationChange: true })
        .then(() => router.navigate(["/downloads/reports"]));
      //window.location.reload();
    }
    toolbarTable = viewer.jsObject.controls.toolbar.firstChild.firstChild;
    buttonsTable = toolbarTable.rows[0].lastChild.lastChild;;
    userButtonCell = buttonsTable.rows[0].insertCell(0);
    userButtonCell.className = "stiJsViewerClearAllStyles gw-back-btn";
    userButtonCell.appendChild(backButton);
  }

  // get Data Loggers
  getDataLoggerDetails(dataloggers: DataLoggerUIModel[], wellEntity: any[]): Array<reportUIModel.IDataLogger> {
    if (dataloggers) {
      const dataloggerList = Array<reportUIModel.IDataLogger>();
      for (const logger of dataloggers) {
        if (logger.IsDeleted === 0) {
          const loggerObj: reportUIModel.IDataLogger = {
            Name: logger.Name,
            WellName: wellEntity.find(w => w.WellId === logger.WellId)?.WellName,
            ScanRate: logger.ScanRate,
            IsDeleted: logger.IsDeleted,
            DataLoggerType: logger.DataLoggerType,
            DataLoggerTypeName: logger.DataLoggerType === DATA_LOGGER_TYPE.Saudi_Aramco_iField ? "Saudi Aramco iField" : "Custom"
          }
          dataloggerList.push(loggerObj);
        }
      }

      return dataloggerList;
    }
    else return [];
  }

}

enum parityList {
  None = 0,
  Odd,
  Even,
  Mark,
  Space
}

export class CustomMapNameModel {
  public Id: number;
  public MapName: string;
}

export enum TOOL_TYPES {
  "SureSENS QPT ELITE" = 0,
  "SureSENS SPTV" = 2,
  "InCHARGE" = 5
}

export enum ESP_TOOL_TYPES {
  "SureSENS QPT ELITE" = 0,
  "SureSENS ESP MGA P/T" = -1
}

export enum ESP_VIBE_TOOL_TYPES {
  "SureSENS Inline Vibe" = 0,
  "SureSENS ESP MGA Vibe" = 1
}
