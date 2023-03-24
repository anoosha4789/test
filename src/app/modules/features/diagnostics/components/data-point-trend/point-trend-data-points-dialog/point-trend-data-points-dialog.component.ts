import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GatewayPanelBase } from '@comp/GatewayPanelBase.component';
import { DeviceDataPointsFacade } from '@core/facade/deviceDataPointsFacade.service';
import { PublishingChannelFacade } from '@core/facade/publishingChannelFacade.service';
import { PanelConfigurationFacade } from '@core/facade/panelConfigFacade.service';
import { DataPointDefinitionModel } from '@core/models/webModels/DataPointDefinition.model';
import { DeviceModel } from '@core/models/webModels/DeviceInfo.model';
import { Store } from '@ngrx/store';
import { GatewayCheckedFlatNode, GatewayCheckedTreeNode } from '@shared/gateway-treeview/components/gateway-checked-treeview/gateway-checked-treeview.component';
import { DeviceData } from '@shared/publishing/components/create-custom-modbus-map/addEdit-custom-modbus-map.component';
import { String } from 'typescript-string-operations';
import * as _ from 'lodash';
import { UIChartColors, UICommon } from '@core/data/UICommon';
import { Router } from '@angular/router';
import { GatewayChartService } from '@shared/gateway-chart/gatewayChart.service';
import { ChartOptions, XAxes, YAxes } from '@shared/gateway-chart/multiaxis-chart/multiaxis-chart.model';
import { GatewayModalService } from '@shared/gateway-dialogs/services/gatewayModal.service';
import { PointTrendChart } from '../data-point-trend.component';

@Component({
  selector: 'app-point-trend-data-points-dialog',
  templateUrl: './point-trend-data-points-dialog.component.html',
  styleUrls: ['./point-trend-data-points-dialog.component.scss']
})
export class PointTrendDataPointsDialogComponent extends GatewayPanelBase implements OnInit, OnDestroy {
  selectedDataPoints: CustomDataPointUIModel[];
  dataLoggerNode: GatewayCheckedTreeNode[] = [];
  selectedTreeNodes: GatewayCheckedFlatNode[] = [];
  existingDataPoints: GatewayCheckedFlatNode[] = [];
  deviceDefinitions: DeviceModel[];
  dataPoints: DataPointDefinitionModel[];

  bNoDataPointsAvalbale: boolean = false;
  clearSelectedNodes: boolean = false;
  hasChanges: boolean = false;
  currentLoggerType = "";
  panelName: string;
  validationMessage = "";
  currentChart: PointTrendChart;
  private chartYaxisMap: Map<string, YAxes> = new Map();
  private dataPointSeriesMap: Map<number, XAxes> = new Map();


  constructor(protected store: Store,
    public dialogRef: MatDialogRef<any>,
    private publishingFacade: PublishingChannelFacade,
    private panelConfigFacade: PanelConfigurationFacade,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data,
    protected gatewayChartService: GatewayChartService,
    protected gatewayModalService: GatewayModalService,
    private devicesFacade: DeviceDataPointsFacade) {
    super(store, panelConfigFacade, null, null, publishingFacade, devicesFacade, null, null, null);
  }

  dataPointsSelected(treeNodes) {
    this.selectedTreeNodes = treeNodes;
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
      this.hasChanges = this.currentChart.customDataLoggerDataPoints.length > 0 ? true :false;
    }
  }

  OnAddDataPoints() {
    this.buildAddToMapDataPoints();
    this.buildExistingDataPoints();
    this.hasChanges = true;
  }

  private buildAddToMapDataPoints() {
    let dataPointsToAdd: CustomDataPointUIModel[] = _.cloneDeep(this.currentChart.customDataLoggerDataPoints) ?? [];
    this.selectedTreeNodes.forEach(treeNode => {
      if (treeNode.treeNodeData) {
        let dataPoint: CustomDataPointUIModel = {
          Precision: 0,
          UnitQuantityType: this.getUnitQuantityType(treeNode.treeNodeData.DeviceId, treeNode.treeNodeData.DataPointIndex),
          DeviceId: treeNode.treeNodeData.DeviceId,
          DataPointIndex: treeNode.treeNodeData.DataPointIndex,
          TagName: String.Format("{0}_{1}", treeNode.fullName, treeNode.treeNodeData.TagName),
          UnitSymbol: treeNode.treeNodeData.UnitSymbol,
        };
        dataPointsToAdd.push(dataPoint);
      }
    });
    this.selectedDataPoints = dataPointsToAdd;
    this.currentChart.customDataLoggerDataPoints = dataPointsToAdd;

    this.selectedTreeNodes = [];
  }

  getUnitQuantityType(deviceId, dataPointIndex) {
    return this.dataPoints.find(dataPoint => dataPoint.DeviceId === deviceId && dataPoint.DataPointIndex === dataPointIndex)?.UnitQuantityType ?? "";
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
      // else {
      //   let parentDevice = deviceDataMap.get(deviceDef.OwnerId);
      //   if(parentDevice!= undefined){
      //     let device: DeviceData = { device: deviceDef, children: [] };
      //     parentDevice.children.push(device);
      //   }
      // }
    });

    return deviceDataMap;
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
            treeNodeChildren.children = this.addDataPointsToTreeNode(deviceDef.device.Id, String.Format("{0}_{1}", treeNode.name, treeNodeChildren.name));
            deviceDef.children.forEach(dev => {
              let treeNodeChild: GatewayCheckedTreeNode = { name: dev.device.Name, fullName: treeNodeChildren.name, treeNodeData: null };
              treeNodeChild.children = this.addDataPointsToTreeNode(dev.device.Id, String.Format("{0}_{1}", treeNodeChildren.name, treeNodeChild.name));
              treeNodeChildren.children.push(treeNodeChild);
            })
            treeNode.children.push(treeNodeChildren);
          }
          else {
            let treeNodeChildren: GatewayCheckedTreeNode = { name: deviceDef.device.Name, fullName: treeNode.name, treeNodeData: null };
            treeNodeChildren.children = this.addDataPointsToTreeNode(deviceDef.device.Id, String.Format("{0}_{1}", treeNode.name, treeNodeChildren.name));
            if (treeNodeChildren.children && treeNodeChildren.children.length > 0)
              treeNode.children.push(treeNodeChildren);
          }

          // let treeNodeChildren: GatewayCheckedTreeNode = { name: deviceDef.device.Name, fullName: treeNode.name, treeNodeData: null };
          // treeNodeChildren.children = this.addDataPointsToTreeNode(deviceDef.device.Id, String.Format("{0}_{1}", treeNode.name, treeNodeChildren.name));
          // if (treeNodeChildren.children && treeNodeChildren.children.length > 0)
          //   treeNode.children.push(treeNodeChildren);
        });
        treeNode.children = treeNode.children.concat(this.addDataPointsToTreeNode(deviceData.device.Id, treeNode.name));

        if (treeNode.children && treeNode.children.length > 0)
          this.dataLoggerNode.push(treeNode);
      });
    }
    this.bNoDataPointsAvalbale = this.dataLoggerNode.length == 0 ? true : false;
    this.selectedTreeNodes = [];
  }

  private buildExistingDataPoints() {
    this.existingDataPoints = [];
    this.existingDataPoints.push({ treeNodeData: this.currentChart.customDataLoggerDataPoints, expandable: true, fullName: "", level: 0, name: "" });
  }


  postCallDeviceDataPoints(): void {
    this.deviceDefinitions = this.devices ?? [];
    this.dataPoints = this.datapointdefinitions ?? [];
    this.buildDataPointsTreeNodes();
    this.buildExistingDataPoints();
  }

  postCallGetPanelConfigurationCommon(): void {
    let panelConfigurationCommon = this.panelConfigurationCommonState.panelConfigurationCommon;
    let panelInfo = UICommon.getPanelType(panelConfigurationCommon.PanelTypeId, true);
    this.panelName = panelConfigurationCommon.PanelTypeId > 0 ? panelInfo.name : null;
  }

  OnCancel() {
    this.dialogRef.close();
  }

  OnSubmit() {
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
    this.initDataPointSeries(dataPoints);
  }

  private initDataPointSeries(dps: DataPointDefinitionModel[]): void {
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

      this.validationMessage = this.gatewayChartService.validateChartOptions(chartOptions);
      if (this.validationMessage) {
        this.gatewayModalService.openDialog(
          this.validationMessage,
          () => this.gatewayModalService.closeModal(),
          null,
          'Warning',
          null,
          false,
          "Ok"
        );
      } else {
        this.validationMessage = "";
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

  private getDeviceName(deviceId: number): string {
    if (this.devices) {
      const found = this.devices.find(d => d.Id === deviceId);
      if (found) {
        return found.Name;
      }
    }
    return '';
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  ngOnInit(): void {
    this.currentChart = this.data;
    this.initPanelConfigurationCommon();
    this.initDeviceDataPoints();
  }

}

export class CustomDataPointUIModel {
  DeviceId: number;
  DataPointIndex: number;
  TagName: string;
  UnitQuantityType: string;
  UnitSymbol: string;
  Precision: number;
}