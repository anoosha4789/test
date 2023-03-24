import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl, FormGroup } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { GatewayModalService } from '@shared/gateway-dialogs/services/gatewayModal.service';
import { ChartOptions, XAxes, YAxes } from '@shared/gateway-chart/multiaxis-chart/multiaxis-chart.model';
import { CustomDataPointUIModel } from '../../data-point-trend/point-trend-data-points-dialog/point-trend-data-points-dialog.component';
import { GatewayCheckedFlatNode, GatewayCheckedTreeNode } from '@shared/gateway-treeview/components/gateway-checked-treeview/gateway-checked-treeview.component';
import { DeviceModel } from '@core/models/webModels/DeviceInfo.model';
import { DataPointDefinitionModel, DataPointValueDataType } from '@core/models/webModels/DataPointDefinition.model';
import { GatewayPanelBase } from '@comp/GatewayPanelBase.component';
import { Store } from '@ngrx/store';
import { PublishingChannelFacade } from '@core/facade/publishingChannelFacade.service';
import { PanelConfigurationFacade } from '@core/facade/panelConfigFacade.service';
import { DeviceDataPointsFacade } from '@core/facade/deviceDataPointsFacade.service';
import { DeviceData } from '@shared/publishing/components/create-custom-modbus-map/addEdit-custom-modbus-map.component';
import { String } from 'typescript-string-operations';
import * as _ from 'lodash';
import { UIChartColors } from '@core/data/UICommon';
import { GatewayChartService } from '@shared/gateway-chart/gatewayChart.service';

@Component({
  selector: 'app-historian-datapoints-dialog',
  templateUrl: './historian-datapoints-dialog.component.html',
  styleUrls: ['./historian-datapoints-dialog.component.scss'],
})
export class HistorianDatapointsDialogComponent extends GatewayPanelBase implements OnInit {

  browseDialogForm: FormGroup;
  validationMssg: string = null;
  toMinTime: Date;
  toMaxTime: Date;
  private datePipe = new DatePipe('en-US');
  private chartStartTime: number;
  private chartToTime: number;
  public date: Date = new Date();

  clearSelectedNodes: boolean = false;
  hasChanges: boolean = false;
  selectedDataPoints: CustomDataPointUIModel[];
  dataLoggerNode: GatewayCheckedTreeNode[] = [];
  selectedTreeNodes: GatewayCheckedFlatNode[] = [];
  existingDataPoints: GatewayCheckedFlatNode[] = [];
  deviceDefinitions: DeviceModel[];
  dataPoints: DataPointDefinitionModel[];
  bNoDataPointsAvalbale: boolean = false;
  errorMessage: string = "";
  isValid = true;
  private chartYaxisMap: Map<string, YAxes> = new Map();
  private dataPointSeriesMap: Map<number, XAxes> = new Map();
  currentChart: HistorianData;
  isByFile: boolean = false;
  fromDate: Date;
  toDate: Date;
  fromTime: string = "";
  toTime: string = "";
  selectedIndex: number = 0;
  tempchartOptions: ChartOptions;
  tempcustomDataLoggerDataPoints?: CustomDataPointUIModel[];
  // 1 day in milliseconds 1000 * 60 * 60 * 24
  public static ONEDAY_MILLISECONDS = 86400000;
  public static HISTORIAN_DATE_FORMAT = "MMM dd yyyy HH:mm:ss";
  public static ERR_HISTORIAN_DATE_LIMIT = "Date Range limited to 24 hours";
  public static ERR_HISTORIAN_DATE_COMPARISON = "Should be greater than From time";

  constructor(protected store: Store, public dialogRef: MatDialogRef<any>, public gatewayModalService: GatewayModalService,
    private publishingFacade: PublishingChannelFacade,
    private panelConfigFacade: PanelConfigurationFacade,
    private devicesFacade: DeviceDataPointsFacade,
    protected gatewayChartService: GatewayChartService,
    @Inject(MAT_DIALOG_DATA) public data: HistorianData) {
    super(store, panelConfigFacade, null, null, publishingFacade, devicesFacade, null, null, null);
  }

  validate() {
    if (this.selectedIndex < 1) {
      if (this.chartStartTime < this.chartToTime) {
        if ((this.chartToTime - this.chartStartTime) > HistorianDatapointsDialogComponent.ONEDAY_MILLISECONDS) {
          this.isValid = false;
          this.errorMessage = HistorianDatapointsDialogComponent.ERR_HISTORIAN_DATE_LIMIT;
        } else {
          this.isValid = true;
          this.errorMessage = "";
        }
      } else {
        if ((this.chartToTime - this.chartStartTime) > HistorianDatapointsDialogComponent.ONEDAY_MILLISECONDS) {
          this.isValid = false;
          this.errorMessage = HistorianDatapointsDialogComponent.ERR_HISTORIAN_DATE_LIMIT;
        } else {
          this.isValid = false;
          this.errorMessage = HistorianDatapointsDialogComponent.ERR_HISTORIAN_DATE_COMPARISON;
        }
      }
    } else {
      this.isValid = this.errorMessage === "" && this.currentChart?.customDataLoggerDataPoints?.length > 0;
    }
  }

  changeStepperSelection(index: number) {
    this.selectedIndex = index;
    this.validate();
  }

  radioChange(event) {
    this.isByFile = event?.value === "File";
    //this.currentChart.isByFile = this.isByFile;
    this.tempchartOptions = this.currentChart.chartOptions;
    this.tempcustomDataLoggerDataPoints = this.currentChart.customDataLoggerDataPoints;
    if (this.isByFile) {
      this.isValid = this.currentChart.SelectedFileName !== "" && (this.validationMssg === "" || this.validationMssg === null);
      this.currentChart.customDataLoggerDataPoints = [];
      this.currentChart.chartOptions = new ChartOptions();
      this.buildDataFromCSV();
      this.buildExistingDataPoints();
    } else {
      this.validate();
      this.currentChart.customDataLoggerDataPoints = [];
      this.currentChart.chartOptions = new ChartOptions();
      this.buildDataPointsTreeNodes();
      this.buildExistingDataPoints();
    
    }
  }
  clearDateChartData() {
    let currentDate = new Date();
    currentDate.setSeconds(0);
    let fromDate = new Date(currentDate.getTime() - 60000);
    this.fromDate = fromDate;
    this.toDate = currentDate;
    window.localStorage.removeItem("historianTrendData");
  }
  clearFileData() {
    this.currentChart.SelectedFile = "";
    this.currentChart.SelectedFileName = "";
    this.currentChart.fileData = new HistorianFileData();
    let ctrl = this.browseDialogForm.controls['FileName'];
    ctrl.setErrors(null);
    this.validationMssg = '';
  }

  OnCancel() {
    if(this.tempchartOptions){
      this.currentChart.chartOptions = this.tempchartOptions ;
      this.currentChart.customDataLoggerDataPoints = this.tempcustomDataLoggerDataPoints;  
    }
    if(this.isByFile && !this.currentChart.isByFile)
      this.clearFileData();
    this.dialogRef.close();
  }

  updateTitle(): void {
    if (this.currentChart) {
      this.fromTime = this.datePipe.transform(this.currentChart.fromDate, HistorianDatapointsDialogComponent.HISTORIAN_DATE_FORMAT);
      this.toTime = this.datePipe.transform(this.currentChart.toDate, HistorianDatapointsDialogComponent.HISTORIAN_DATE_FORMAT);
    }
  }

  private populateChartPointsFromFile(): void {
    const dataPointDefinitions = _.cloneDeep(this.datapointdefinitions);
    let dataPoints: DataPointDefinitionModel[] = [];
    this.currentChart.customDataLoggerDataPoints.forEach(element => {
      //let dataPoint = dataPointDefinitions.find(dtPoint => dtPoint.DeviceId === element.DeviceId && dtPoint.DataPointIndex === element.DataPointIndex);
      if (element) {
        const dp = new DataPointDefinitionModel();
        dp.DataPointIndex = element.DataPointIndex;
        dp.DataType = DataPointValueDataType.Double64Bit;
        dp.DeviceId = element.DeviceId;
        dp.RawValue = 0;
        dp.ReadOnly = false;
        dp.TagName = element.TagName;
        dp.UnitQuantityType = element.UnitQuantityType;
        dp.UnitSymbol = element.UnitSymbol;
        dataPoints.push(dp);
      }
    });
    this.initChart(dataPoints);
  }

  private populateChartPoints(): void {
    const dataPointDefinitions = _.cloneDeep(this.datapointdefinitions);
    let dataPoints: DataPointDefinitionModel[] = [];
    this.currentChart.customDataLoggerDataPoints.forEach(element => {
      let dataPoint = dataPointDefinitions.find(dtPoint => dtPoint.DeviceId === element.DeviceId && dtPoint.DataPointIndex === element.DataPointIndex);
      if (dataPoint) {
        const dp = new DataPointDefinitionModel();
        dp.DataPointIndex = dataPoint.DataPointIndex;
        dp.DataType = dataPoint.DataType;
        dp.DeviceId = dataPoint.DeviceId;
        dp.RawValue = 0;
        dp.ReadOnly = dataPoint.ReadOnly;
        dp.TagName = element.TagName;
        dp.UnitQuantityType = dataPoint.UnitQuantityType;
        dp.UnitSymbol = dataPoint.UnitSymbol;
        dataPoints.push(dp);
      }
    });
    this.initChart(dataPoints);
  }

  OnPrev() {
    if (this.selectedIndex > 0) {
      this.changeStepperSelection(this.selectedIndex - 1);
    }
  }

  OnSubmit() {
    if (this.selectedIndex < 1) {
      this.changeStepperSelection(this.selectedIndex + 1);
    }
    else if (this.isByFile)
    {
    this.currentChart.isByFile = true;  
    window.localStorage.removeItem("historianTrendData");
    this.populateChartPointsFromFile();
    }
    else
     {
      this.currentChart.isByFile = false;
      this.clearFileData();
      this.populateChartPoints();
     }
  }

  initChart(dps: DataPointDefinitionModel[]) {
    this.chartYaxisMap.clear();
    this.dataPointSeriesMap.clear();
    if (dps && dps.length > 0) {
      let index = 0;
      dps.forEach((dp) => {
        // Rule #1: check unit quantity, make sure only 4 different unit quantities are allowed.
        const canAddYaxis = !this.chartYaxisMap.has(dp.UnitQuantityType);
        /* const canAddYaxis =
          !this.chartYaxisMap.has(dp.UnitQuantityType) &&
          this.chartYaxisMap.size < CHART_DEFAULTS.MAX_Y_AXIS_SIZE; */

        // Rule #2, check the data point, make sure it is not added, and the total data series length < 16
        const canAddSeries = !this.dataPointSeriesMap.has(
          dp.DeviceId * 1000 + dp.DataPointIndex);
        /*  const canAddSeries =
           !this.dataPointSeriesMap.has(
             dp.DeviceId * 1000 + dp.DataPointIndex
           ) && this.dataPointSeriesMap.size < CHART_DEFAULTS.MAX_DATA_POINTS_SIZE; */

        const usymbol = dp.UnitSymbol ? dp.UnitSymbol : 'dimensionless';
        // const yAxis = this.gatewayChartService.getYAxisMinMaxSettings(usymbol);
        if (canAddYaxis) {
          this.chartYaxisMap.set(dp.UnitQuantityType, {
            label: usymbol,
            unit: usymbol,
            Min: null,
            Max: null,
          });
        }

        if (canAddSeries) {
          // const serialLabel = this.getDeviceName(dp.DeviceId);
          this.dataPointSeriesMap.set(dp.DeviceId * 1000 + dp.DataPointIndex, {
            deviceId: dp.DeviceId,
            pointIndex: dp.DataPointIndex,
            label: dp.UnitSymbol !== ''
              ? dp.TagName + ' (' + dp.UnitSymbol + ')'
              : dp.TagName,
            unit: usymbol,
            decimalPoints: 2,
            brush: UIChartColors.getChartBrush(index++),
            isFixed: true,
          });
        }
      });
      let chartOptions: ChartOptions = new ChartOptions();
      chartOptions.yAxes = [...this.chartYaxisMap.values()];
      chartOptions.dataSeries = [
        ...this.dataPointSeriesMap.values(),
      ];

      let validationMessage = this.gatewayChartService.validateChartOptions(chartOptions);
      if (validationMessage) {
        this.gatewayModalService.openDialog(
          validationMessage,
          () => this.gatewayModalService.closeModal(),
          null,
          'Warning',
          null,
          false,
          "Ok"
        );
      } else {
        let dataPointSeriesChartOptions: ChartOptions = new ChartOptions();
        dataPointSeriesChartOptions.hideCheckbox = true;
        dataPointSeriesChartOptions.yAxes = [...this.chartYaxisMap.values()];
        dataPointSeriesChartOptions.dataSeries = [
          ...this.dataPointSeriesMap.values(),
        ];
        this.currentChart.chartOptions = dataPointSeriesChartOptions;
        this.dialogRef.close(this.currentChart);

      }
    }
  }

  setMaxDate() {
    let date = this.currentChart.fromDate.getTime() + HistorianDatapointsDialogComponent.ONEDAY_MILLISECONDS;
    this.toMaxTime = new Date(date);
  }

  setMinMaxDate() {
    this.toMinTime = this.currentChart.fromDate;
    this.setMaxDate();
  }

  onFromTimeSelected(event) {
    this.currentChart.fromDate = new Date(event);
    this.setMinMaxDate();
    this.fromDate = this.currentChart.fromDate;
    this.chartStartTime = new Date(event).getTime();
    this.updateTitle();
    this.validate();
  }

  onToTimeSelected(event) {
    this.errorMessage = "";
    this.currentChart.toDate = new Date(event);
    this.toDate = this.currentChart.toDate;
    this.chartToTime = new Date(event).getTime();
    this.updateTitle();
    this.validate();
  }

  onTimeValidationFailed(event) {
    event?.timePicker?.close();
    this.validate();
  }

  BrowseFile() {

    this.browseDialogForm.markAllAsTouched();
    const selectedFile = document.getElementById(
      'selectFile'
    ) as HTMLInputElement;
    selectedFile.onchange = (fileInput: any) => {
      if (fileInput.target.files && fileInput.target.files.length > 0) {
        this.validationMssg = null;
        this.currentChart.customDataLoggerDataPoints = [];
        this.currentChart.chartOptions = new ChartOptions();
        this.currentChart.SelectedFile = fileInput.target.files[0];
        this.currentChart.SelectedFileName = fileInput.target.files[0].name;
        this.gatewayChartService.ImportLogFile(this.currentChart.SelectedFile)
          .then(result => {
            if (result) {
              this.buildDataFromCSV();
              this.buildExistingDataPoints();
              this.isValid = true;
            } else {
              this.setFileError();
            }
          },
            error => {
              console.log("Error importing file..." + error);
            })
          .catch(error => console.log("Error importing file..." + error));

        this.validateConfigFile();
      }
    };
    selectedFile.click();

  }

  private validateConfigFile() {
    this.validationMssg = null;
    let ctrl = this.browseDialogForm.controls['FileName'];
    ctrl.setErrors(null);
    this.browseDialogForm.markAllAsTouched();
    if (!this.currentChart.SelectedFileName || this.currentChart.SelectedFileName.trim() == "") {
      this.setFileError();
      return;
    }
    let fileName = this.currentChart.SelectedFileName.split(".")[0];
    if (fileName.trim() === "") {
      this.setFileError();
      return;
    }
    let extensions = this.currentChart.SelectedFileName.split(".");
    if (extensions.length > 0) {
      let extension = extensions[extensions.length - 1];
      if (extension && extension.toLowerCase() != "csv") {
        this.setFileError();
        return;
      }
    }
  }

  setFileError() {
    let ctrl = this.browseDialogForm.controls['FileName'];
    this.validationMssg = "Please import a valid file.";
    ctrl.setErrors({ "invalid": true });
    this.isValid = false;
  }

  // charts
  dataPointsSelected(treeNodes) {
    this.selectedTreeNodes = treeNodes;
  }

  OnAddDataPoints() {
    this.buildAddToMapDataPoints();
    this.buildExistingDataPoints();
    this.hasChanges = true;
  }

  getUnitQuantityType(deviceId, dataPointIndex) {
    return this.dataPoints.find(dataPoint => dataPoint.DeviceId === deviceId && dataPoint.DataPointIndex === dataPointIndex)?.UnitQuantityType ?? "";
  }
  getTagName(name, childName) {
    return this.isByFile ? childName : String.Format("{0}_{1}", name, childName);
  }
  private buildAddToMapDataPoints() {
    let dataPointsToAdd: CustomDataPointUIModel[] = _.cloneDeep(this.currentChart.customDataLoggerDataPoints) ?? [];
    this.selectedTreeNodes.forEach(treeNode => {
      if (treeNode.treeNodeData) {
        let dataPoint: CustomDataPointUIModel = {
          Precision: 0,
          UnitQuantityType: this.isByFile ? treeNode.treeNodeData.UnitSymbol : this.getUnitQuantityType(treeNode.treeNodeData.DeviceId, treeNode.treeNodeData.DataPointIndex),
          DeviceId: treeNode.treeNodeData.DeviceId,
          DataPointIndex: treeNode.treeNodeData.DataPointIndex,
          TagName: this.getTagName(treeNode.fullName, treeNode.treeNodeData.TagName),
          UnitSymbol: treeNode.treeNodeData.UnitSymbol,
        };
        dataPointsToAdd.push(dataPoint);
      }
    });
    this.selectedDataPoints = dataPointsToAdd;
    this.currentChart.customDataLoggerDataPoints = dataPointsToAdd;
    this.selectedTreeNodes = [];
    this.validate();
  }

  onDataPointDeleted(event) {
    let dataPointToDelete: CustomDataPointUIModel = event.dataPoint;
    let dataPoints: CustomDataPointUIModel[] = _.cloneDeep(this.currentChart.customDataLoggerDataPoints) ?? [];

    if (dataPointToDelete) {
      let dtPointIndex = dataPoints.findIndex(d => d.DeviceId === dataPointToDelete.DeviceId && d.DataPointIndex === dataPointToDelete.DataPointIndex) ?? -1;
      if (dtPointIndex != -1)
        dataPoints.splice(dtPointIndex, 1);

      this.selectedDataPoints = dataPoints;
      this.currentChart.customDataLoggerDataPoints = dataPoints;
      this.buildExistingDataPoints();
      this.hasChanges = true;
      this.validate();
    }
  }

  private getDeviceMap(): Map<number, DeviceData> {
    let deviceDataMap = new Map<number, DeviceData>();
    this.deviceDefinitions.forEach(deviceDef => {
      if (deviceDef.Id === deviceDef.OwnerId) {
        let device: DeviceData = { device: deviceDef, children: [] };
        deviceDataMap.set(deviceDef.Id, device);
      }
      else {
        var childList = this.deviceDefinitions.filter(x => x.OwnerId == deviceDef.Id);
        let device: DeviceData = { device: deviceDef, children: [] };
        if (childList && childList.length > 0) {
          let childDevice: DeviceData[] = [];
          childList.forEach(child => {
            let chdevice: DeviceData = { device: child, children: [] };
            childDevice.push(chdevice);
          })
          device.children = childDevice;
          let parentDevice = deviceDataMap.get(deviceDef.OwnerId);
          if (parentDevice != undefined) {
            parentDevice.children.push(device);
          }
        }
        else {
          let parentDevice = deviceDataMap.get(deviceDef.OwnerId);
          if (parentDevice != undefined) {
            let device: DeviceData = { device: deviceDef, children: [] };
            parentDevice.children.push(device);
          }
        }
      }
    });

    return deviceDataMap;
  }

  private addDataPointsToTreeNode(deviceId: number, parentName: string): GatewayCheckedTreeNode[] {
    let treeNodes: GatewayCheckedTreeNode[] = [];
    this.dataPoints.forEach(dataPoint => {
      if (dataPoint.DeviceId === deviceId) {
        treeNodes.push({ name: dataPoint.TagName, fullName: parentName, treeNodeData: dataPoint });
      }
    });

    return treeNodes;
  }

  private buildDataPointsTreeNodes() {
    if ((this.deviceDefinitions && this.deviceDefinitions.length > 0) &&
      (this.dataPoints && this.dataPoints.length > 0)) {
      this.dataLoggerNode = [];

      let deviceDataMap: Map<number, DeviceData> = this.getDeviceMap();
      deviceDataMap.forEach((deviceData) => {
        let treeNode: GatewayCheckedTreeNode = { name: deviceData.device.Name, fullName: null, treeNodeData: null, children: [] };
        deviceData.children.forEach(deviceDef => {
          if (deviceDef.children.length > 0) {
            let treeNodeChildren: GatewayCheckedTreeNode = { name: deviceDef.device.Name, fullName: treeNode.name, treeNodeData: null };
            treeNodeChildren.children = this.addDataPointsToTreeNode(deviceDef.device.Id, this.getTagName(treeNode.name, treeNodeChildren.name));
            deviceDef.children.forEach(dev => {
              let treeNodeChild: GatewayCheckedTreeNode = { name: dev.device.Name, fullName: treeNodeChildren.name, treeNodeData: null };
              treeNodeChild.children = this.addDataPointsToTreeNode(dev.device.Id, this.getTagName(treeNodeChildren.name, treeNodeChild.name));
              treeNodeChildren.children.push(treeNodeChild);
            })
            treeNode.children.push(treeNodeChildren);
          }
          else {
            let treeNodeChildren: GatewayCheckedTreeNode = { name: deviceDef.device.Name, fullName: treeNode.name, treeNodeData: null };
            treeNodeChildren.children = this.addDataPointsToTreeNode(deviceDef.device.Id, this.getTagName(treeNode.name, treeNodeChildren.name));
            if (treeNodeChildren.children && treeNodeChildren.children.length > 0)
              treeNode.children.push(treeNodeChildren);
          }
        });
        treeNode.children = treeNode.children.concat(this.addDataPointsToTreeNode(deviceData.device.Id, treeNode.name));

        if (treeNode.children && treeNode.children.length > 0)
          this.dataLoggerNode.push(treeNode);
      });
    }

    this.bNoDataPointsAvalbale = this.dataLoggerNode.length == 0 ? true : false;
    this.selectedTreeNodes = [];
  }

  buildDataFromCSV() {
    const csvFileData = this.gatewayChartService.getCSVHistorianFileData();
    this.currentChart.fileData = this.gatewayChartService.getCSVHistorianFileData();
    this.dataLoggerNode = [];
    csvFileData?.csvHistorianDataPoints?.slice(1).forEach(dp => {
      let treeNode: GatewayCheckedTreeNode = { name: dp.TagName, fullName: dp.TagName, treeNodeData: dp };
      this.dataLoggerNode.push(treeNode);
    });
    this.currentChart.Day = new Date(csvFileData?.date);
  }

  private buildExistingDataPoints() {
    this.existingDataPoints = [];
    this.existingDataPoints.push({ treeNodeData: this.currentChart.customDataLoggerDataPoints, expandable: true, fullName: "", level: 0, name: "" });
  }

  postCallDeviceDataPoints(): void {
    this.deviceDefinitions = this.devices ?? [];
    this.dataPoints = this.datapointdefinitions ?? [];
    if (this.currentChart.isByFile)
      this.buildDataFromCSV();
    else
      this.buildDataPointsTreeNodes();
    this.buildExistingDataPoints();
  }

  ngOnInit(): void {
    this.currentChart = this.data;
    this.browseDialogForm = new FormGroup({
      FileName: new FormControl(''),
    });
    this.initPanelConfigurationCommon();
    this.initDeviceDataPoints();
    this.chartStartTime = new Date(this.currentChart.fromDate).getTime();
    this.chartToTime = new Date(this.currentChart.toDate).getTime();
    this.fromDate = this.currentChart.fromDate;
    this.toDate = this.currentChart.toDate;
    this.date = this.currentChart.Day;
    this.isByFile = this.currentChart.isByFile;
    this.setMinMaxDate();
    this.updateTitle();
    this.validate();
  }
}

export class HistorianData {
  Day: Date;
  fromDate: Date;
  toDate: Date;
  SelectedFile: string;
  SelectedFileName: string;
  FileExtensions: string;
  chartOptions: ChartOptions;
  customDataLoggerDataPoints?: CustomDataPointUIModel[];
  fileData?: HistorianFileData;
  isByFile: boolean;
}

export class HistorianFileData {
  date: string;
  units: any[];
  headers: any[];
  csvHistorianValues: any[];
  csvHistorianDataPoints: DataPointDefinitionModel[];
}