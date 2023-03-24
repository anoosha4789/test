import { Component, HostListener, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

import * as ModbusMapModel from '@core/models/UIModels/modbus-report-model';

import { Stimulsoft } from 'stimulsoft-reports-js/Scripts/stimulsoft.viewer'
import { ReportService } from '@core/services/report.service';
import { UtilityService } from '@core/services/utility.service';
import { UserService } from '@core/services/user.service';
import { GatewayPanelBase } from '@comp/GatewayPanelBase.component';
import { PublishingChannelFacade } from '@core/facade/publishingChannelFacade.service';
import { DeviceDataPointsFacade } from '@core/facade/deviceDataPointsFacade.service';
import { GatewayModalService } from '@shared/gateway-dialogs/services/gatewayModal.service';
import { Store } from '@ngrx/store';
import { CommunicationChannelType } from '@core/data/UICommon';
import { SerialPortCommunicationChannelDataUIModel } from '@core/models/webModels/SerialPortCommunicationChannelDataUIModel.model';
import { TcpIpCommunicationChannelDataUIModel } from '@core/models/webModels/TcpIpCommunicationChannelDataUIModel.model';

import { ModbusmapDialogComponent, ModbusDialogData } from '../modbusmap-dialog/modbusmap-dialog.component';
import { ButtonActions } from '@shared/gateway-dialogs/components/gateway-advanced-dialog/gateway-advanced-dialog.component';
import { ConfigurationService } from '@core/services/configurationService.service';

@Component({
  selector: 'app-modbusmap-report',
  templateUrl: './modbusmap-report.component.html',
  styleUrls: ['./modbusmap-report.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ModbusmapReportComponent extends GatewayPanelBase implements OnInit, OnDestroy {

  //modbusMapData = [];
  @Input() modbusMapData;


  reportVisibility = false;
  modbusDialogData: ModbusDialogData;
  modbusMapList = [];
  selectedModbusMap: any;
  private arrSubscriptions: Subscription[] = [];

  unitSystem = null;
  reportDetails = {
    createdBy: '',
    ipAddress: '',
    buildNumber: ''
  };

  constructor(
    protected store: Store<any>,
    private publishingFacade: PublishingChannelFacade,
    private dataPointFacade: DeviceDataPointsFacade,
    private userService: UserService,
    private utilityService: UtilityService,
    private reportService: ReportService,
    private gatewayModalService: GatewayModalService,
    private router: Router,
    private configurationService: ConfigurationService) {
    super(store, null, null, null, publishingFacade, dataPointFacade, null);
  }
  // initmodbusMapList(){
  //   const subsciption = this.reportService.getAllCustomMapNamesfromDB().subscribe((res) => { 
  //     if(res && res.length > 0) this.modbusMapData = res;
  //   });
  //   this.arrSubscriptions.push(subsciption);
  // }
  initModbusReport() {

    const subscription = forkJoin([this.userService.GetCurrentLoginUser(), this.utilityService.getSystemIPAdress(),
    this.configurationService.getBuildNumber()]).subscribe(results => {
      if (this.publishingEntity && this.publishingEntity.length > 0) {
        this.modbusMapList = [];
        this.reportDetails.createdBy = results[0].Name || null;
        this.reportDetails.ipAddress = results[1][0].IpAddress || null;
        this.reportDetails.buildNumber = results[2];
        this.setModbusMapListData(this.modbusMapData);
        // this.openModbusMapDialog('Select Modbus Map');

      } else {

        this.gatewayModalService.openDialog(
          'No modbus map configured.',
          () => this.navToReport(),
          null,
          'Info',
          null,
          false,
          'Ok',
          null
        );

      }
    });
    this.arrSubscriptions.push(subscription);
  }

  // Set ModbusMap List
  setModbusMapListData(modbusData) {

    this.publishingEntity.forEach((publishing) => {

      let index = modbusData.findIndex(item => item.MapName == publishing.MapType);
      if (index !== -1) {
        const protocol = this.publishingFacade.getModbusProtocolName(publishing.Channel.Protocol, publishing.Channel.channelType);
        let modbusmap = {
          Id: modbusData[index].Id,
          Name: modbusData[index].MapName,
          MapName: "",
          Port: null,
          IPAddressEnabled: false
        };

        publishing.Channel.channelType == CommunicationChannelType.SERIAL ?
          (publishing.Channel as SerialPortCommunicationChannelDataUIModel).PortNamePath : null

        modbusmap.MapName = protocol + " - " + (publishing.Channel.channelType == CommunicationChannelType.SERIAL ?
          (publishing.Channel as SerialPortCommunicationChannelDataUIModel).Description :
          (publishing.Channel as TcpIpCommunicationChannelDataUIModel).IpPortNumber) + " - " + modbusData[index].MapName;

        modbusmap.Port = publishing.Channel.channelType == CommunicationChannelType.SERIAL ?
          (publishing.Channel as SerialPortCommunicationChannelDataUIModel).Description :
          (publishing.Channel as TcpIpCommunicationChannelDataUIModel).IpPortNumber;

        modbusmap.IPAddressEnabled = publishing.Channel.channelType == CommunicationChannelType.SERIAL ? false : true;

        this.modbusMapList.push(modbusmap);

        // this.modbusDialogData = {
        //   modbusMapList: this.modbusMapList,
        //   selectedModbusMap: this.modbusMapList[0]
        // };
      }

    });
  }

  onModbusMapSelChange(event) {
    this.selectedModbusMap = event.value;
    this.reportVisibility = true;
    this.generateReport(event.value);
  }

  // Modbus Map Selection Dropdown
  openModbusMapDialog(title: string): void {
    this.gatewayModalService.openAdvancedDialog(
      title,
      ButtonActions.None,
      ModbusmapDialogComponent,
      this.modbusDialogData,
      (result) => {
        if (result) {
          if (result) this.generateReport(result);
        } else {
          this.gatewayModalService.closeModal();
        }
      },
      '420px'
    );
  }


  resizeTimer = null;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (this.resizeTimer) clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(() => {
      this.generateReport(this.selectedModbusMap);
    }, 300);
  }

  // Generate Report
  generateReport(modbusMap) {
    Stimulsoft.Base.StiLicense.loadFromFile("/assets/stimulsoft/license.key");
    let options = new Stimulsoft.Viewer.StiViewerOptions();
    options = this.reportService.setReportViewerOptions(options, Stimulsoft.Viewer);
    const viewer = new Stimulsoft.Viewer.StiViewer(options, 'StiViewer', false);

    const dataPublishing = this.getDataPublishingByMapType(this.publishingEntity, modbusMap);
    const subscription = this.reportService.getModbusMapDataById(modbusMap.Id).pipe(take(1)).subscribe(modbusMapData => {
      viewer.report = this.getReport(dataPublishing, modbusMapData);
    });
    this.arrSubscriptions.push(subscription);
    viewer.renderHtml("modbusReport");
    if (this.modbusMapList.length > 1) this.appendModbusMenu(this, viewer, modbusMap.MapName);
    this.reportService.appendCustomButton(viewer, this.router);

  }

  // Get Datapublishing based on Map Type
  getDataPublishingByMapType(data, selModbusmap) {

    for (const key in data) {

      if (selModbusmap.IPAddressEnabled && data[key].MapType == selModbusmap.Name && data[key].Channel.IpPortNumber == selModbusmap.Port) {

        return data[key];

      } else if (!selModbusmap.IPAddressEnabled && data[key].MapType == selModbusmap.Name && data[key].Channel.Description == selModbusmap.Port) {

        return data[key];
      }
    }
  }

  // Append modbus menu - To Do adding all the modbus option
  appendModbusMenu(parentRef, viewer, modbusName) {

    let toolbarTable, buttonsTable, userButtonCell;
    const modBusDd = viewer.jsObject.SmallButton("userButton", modbusName, null, null, "down"); // (name, caption, imageName, key)
    modBusDd.arrow.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAMCAYAAACwXJejAAAAOElEQVR42mL8//8/AyHAxEAEoLMiFhijoqICwwcdHR2MKCbBBLDyQUGAjMvLy/+jizEOwnACCDAAaOAnj9wsYQgAAAAASUVORK5CYII=";
    toolbarTable = viewer.jsObject.controls.toolbar.firstChild.firstChild;
    buttonsTable = toolbarTable.rows[0].firstChild.lastChild;
    const elemPosIdx = buttonsTable.rows[0].childElementCount;
    userButtonCell = buttonsTable.rows[0].insertCell(elemPosIdx);
    userButtonCell.className = "stiJsViewerClearAllStyles gw-modbus-menu";
    userButtonCell.appendChild(modBusDd);
    //create menu items
    let items = [];
    const modbusMapList = this.modbusMapList.filter(map => map.MapName !== modbusName);
    for (const modbusmap of modbusMapList) {
      items.push(viewer.jsObject.Item(modbusmap, modbusmap.MapName, null, modbusmap.Id));
    }
    //create menu
    var modbusMenu = viewer.jsObject.VerticalMenu("userMenu", modBusDd, "Down", items); //(name, parentButton, animDirection, items, itemsStyles)

    //show menu action
    modBusDd.action = function () { modbusMenu.changeVisibleState(!modbusMenu.visible); }

    //menu action
    modbusMenu.action = function (menuItem) {
      modbusMenu.changeVisibleState(false);
      parentRef.generateReport(menuItem.name);
    }

  }

  // Get Report
  getReport(dataPublishing, modbusMapData) {

    let report = Stimulsoft.Report.StiReport.createNewReport();
    // Report Data
    const reportData = this.generateReportData(this.unitSystem, dataPublishing, modbusMapData);
    // Modbus map template
    report.loadFile("assets/stimulsoft/templates/modbus.mrt");
    return this.updateReportDataSet(report, reportData);
  }


  // Update Report Data
  updateReportDataSet(report, reportData) {

    // Create new DataSet object
    let dataSet = new Stimulsoft.System.Data.DataSet("config")
    // Load JSON data file from specified URL to the DataSet object
    dataSet.readJson(reportData);
    // Remove all connections from the report template
    report.dictionary.databases.clear();
    // Register DataSet object
    report.regData("config", "config", dataSet);
    return report;
  }

  navToReport() {

    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigateByUrl("/downloads/reports");
    this.gatewayModalService.closeModal();
  }

  generateReportData(unitSystem, dataPublishing, modbusMapData): ModbusMapModel.ModbusReportModel {

    let reportModel: ModbusMapModel.ModbusReportModel = {

      //Report
      Report: {

        Name: "SureFIELD™ Gateway Modbus Map",
        CreatedBy: this.reportDetails.createdBy,
        Build: this.reportDetails.buildNumber
      },

      DataPublishing: this.getPublishingDetails(dataPublishing),

      HoldingRegisters: this.mapHoldingRegisters(modbusMapData && modbusMapData.HoldingRegisters),

      InputRegisters: this.mapInputRegisters(modbusMapData && modbusMapData.InputRegisters),

      InputDiscretes: this.mapInputDiscretes(modbusMapData && modbusMapData.InputDiscretes),

      CoilDiscretes: this.mapCoilDiscretes(modbusMapData && modbusMapData.CoilDiscretes)

    }

    return reportModel;

  }

  getPublishingDetails(publishing) {

    const pubLishingObj: ModbusMapModel.IDataPublishing = {

      Protocol: this.publishingFacade.getModbusProtocolName(publishing.Channel.Protocol, publishing.Channel.channelType),

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
    return pubLishingObj;
  }

  // Map Holding Registers
  mapHoldingRegisters(holdingRegisters): Array<ModbusMapModel.IHoldingRegisters> {

    const holdingRegList = Array<ModbusMapModel.IHoldingRegisters>();
    if (holdingRegisters) {
      for (const holdingReg of holdingRegisters) {
        let record = this.datapointdefinitions.find(c => c.DeviceId == holdingReg.DeviceId && c.DataPointIndex == holdingReg.DataPointIndex);
        if (record) {
          const holdingRegObj: ModbusMapModel.IHoldingRegisters = {
            Address: Number(holdingReg.StartRegisterAddress) + 40000,
            DataType: ModbusMapModel.DataPointValueDataType[holdingReg.SlaveDataType],
            DataFormat: ModbusMapModel.ModbusValueConversionFormatType[holdingReg.ConversionFormat],
            Description: holdingReg.TagName,
            Unit: this.mapUnits(record.UnitSymbol, record.UnitQuantityType)
          }
          holdingRegList.push(holdingRegObj);
        }
      }

      return holdingRegList;
    }

    return [];
  }

  // Map Input Registers
  mapInputRegisters(inputRegisters): Array<ModbusMapModel.IInputRegisters> {

    const inputRegList = Array<ModbusMapModel.IInputRegisters>();
    if (inputRegisters) {
      for (const inputReg of inputRegisters) {
        let record = this.datapointdefinitions.find(c => c.DeviceId == inputReg.DeviceId && c.DataPointIndex == inputReg.DataPointIndex);
        if (record) {
          const inputRegObj: ModbusMapModel.IInputRegisters = {
            Address: Number(inputReg.StartRegisterAddress) + 30000,
            DataType: ModbusMapModel.DataPointValueDataType[inputReg.SlaveDataType],
            DataFormat: ModbusMapModel.ModbusValueConversionFormatType[inputReg.ConversionFormat],
            Description: inputReg.TagName,
            Unit: this.mapUnits(record.UnitSymbol, record.UnitQuantityType)
          }
          inputRegList.push(inputRegObj);
        }
      }

      return inputRegList;
    }

    return [];
  }

  // Map Input Discretes
  mapInputDiscretes(inputDiscretes): Array<ModbusMapModel.IInputDiscretes> {
    const inputDiscretesList = Array<ModbusMapModel.IInputDiscretes>();
    if (inputDiscretes) {
      for (const inputDisc of inputDiscretes) {
        let record = this.datapointdefinitions.find(c => c.DeviceId == inputDisc.DeviceId && c.DataPointIndex == inputDisc.DataPointIndex);
        if (record) {
          const inputDiscreteObj: ModbusMapModel.IInputDiscretes = {
            Address: Number(inputDisc.StartRegisterAddress) + 10000,
            DataType: ModbusMapModel.DataPointValueDataType[inputDisc.SlaveDataType],
            DataFormat: ModbusMapModel.ModbusValueConversionFormatType[inputDisc.ConversionFormat] || ModbusMapModel.ModbusValueConversionFormatType[0],
            Description: inputDisc.TagName,
            Unit: this.mapUnits(record.UnitSymbol, record.UnitQuantityType)
          }
          inputDiscretesList.push(inputDiscreteObj);
        }
      }

      return inputDiscretesList;
    }

    return [];
  }

  // Map Coil Discretes
  mapCoilDiscretes(coilDiscretes): Array<ModbusMapModel.ICoilDiscretes> {

    const coilDiscretesList = Array<ModbusMapModel.ICoilDiscretes>();
    if (coilDiscretes) {
      for (const coil of coilDiscretes) {
        let record = this.datapointdefinitions.find(c => c.DeviceId == coil.DeviceId && c.DataPointIndex == coil.DataPointIndex);
        if (record) {
          const coilDiscreteObj: ModbusMapModel.ICoilDiscretes = {
            Address: coil.StartRegisterAddress,
            DataType: ModbusMapModel.DataPointValueDataType[coil.SlaveDataType],
            DataFormat: ModbusMapModel.ModbusValueConversionFormatType[coil.ConversionFormat] || ModbusMapModel.ModbusValueConversionFormatType[0],
            Description: coil.TagName,
            Unit: this.mapUnits(record.UnitSymbol, record.UnitQuantityType)
          };
          coilDiscretesList.push(coilDiscreteObj);
        }
      }

      return coilDiscretesList;
    }

    return [];
  }

  //Unit mapping
  mapUnits(unit, unitType) {

    const unitSystem = this.unitSystem.UnitQuantities.find((unitSystem) => unitSystem.UnitQuantityDisplayLabel === unitType);
    return unitSystem ? unitSystem.UnitQuantityDisplayLabel : unit;
  }

  postCallGetDataPublishing() { }

  postCallDeviceDataPoints() { }

  ngOnInit(): void {
    super.ngOnInit();
    this.initDataPublishing();
    this.initDeviceDataPoints();
    //this.initmodbusMapList();
    this.publishingFacade.initModbusProtocols();
    const subscription = this.configurationService.getUnitSystem().subscribe(res => {
      if (res) {
        this.unitSystem = res;
        this.initModbusReport();
      }
    });
    this.arrSubscriptions.push(subscription);
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

enum parityList {
  None = 0,
  Odd,
  Even,
  Mark,
  Space
}