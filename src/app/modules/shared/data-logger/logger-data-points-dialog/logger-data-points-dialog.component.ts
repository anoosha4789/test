import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GatewayPanelBase } from '@comp/GatewayPanelBase.component';
import { DeviceDataPointsFacade } from '@core/facade/deviceDataPointsFacade.service';
import { PublishingChannelFacade } from '@core/facade/publishingChannelFacade.service';
import { PanelConfigurationFacade } from '@core/facade/panelConfigFacade.service';
import { CustomDataLoggerDataPointUIModel } from '@core/models/webModels/DataLogger.model';
import { DataPointDefinitionModel } from '@core/models/webModels/DataPointDefinition.model';
import { DeviceModel } from '@core/models/webModels/DeviceInfo.model';
import { Store } from '@ngrx/store';
import { GatewayCheckedFlatNode, GatewayCheckedTreeNode } from '@shared/gateway-treeview/components/gateway-checked-treeview/gateway-checked-treeview.component';
import { DeviceData } from '@shared/publishing/components/create-custom-modbus-map/addEdit-custom-modbus-map.component';
import { String } from 'typescript-string-operations';
import { CustomDataLoggerConfiguration } from '@core/models/webModels/DataLogger.model';
import * as _ from 'lodash';
import { DataLoggerFacade } from '@core/facade/dataLoggerFacade.service';
import { UICommon } from '@core/data/UICommon';
import * as LOGGER_ACTIONS from '@store/actions/dataLogger.entity.action';
import { DataLoggerUIModel } from '@core/models/UIModels/dataLogger.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-logger-data-points-dialog',
  templateUrl: './logger-data-points-dialog.component.html',
  styleUrls: ['./logger-data-points-dialog.component.scss']
})
export class LoggerDataPointsDialogComponent extends GatewayPanelBase implements OnInit, OnDestroy {

  currentDataLogger: CustomDataLoggerConfiguration;
  dataLoggerNode: GatewayCheckedTreeNode[] = [];
  selectedTreeNodes: GatewayCheckedFlatNode[] = [];
  existingDataPoints: GatewayCheckedFlatNode[] = [];
  deviceDefinitions: DeviceModel[];
  dataPoints: DataPointDefinitionModel[];
  scanRates = UICommon.LOGGER_LOGGING_RATES;

  bNoDataPointsAvalbale: boolean = false;
  clearSelectedNodes: boolean = false;
  hasChanges: boolean = false;
  currentLoggerType = "";
  panelName: string;


  constructor(protected store: Store,
    public dialogRef: MatDialogRef<any>,
    private publishingFacade: PublishingChannelFacade,
    private panelConfigFacade: PanelConfigurationFacade,
    dataLoggerFacade: DataLoggerFacade,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data,
    private devicesFacade: DeviceDataPointsFacade) {
    super(store, panelConfigFacade, null, null, publishingFacade, devicesFacade, null, null, dataLoggerFacade);
  }

  dataPointsSelected(treeNodes) {
    this.selectedTreeNodes = treeNodes;
  }

  onScanRateChange(event) {
    if (this.currentDataLogger.customDataLoggerDataPoints && this.currentDataLogger.customDataLoggerDataPoints.length > 0)
      this.hasChanges = true;
  }

  onDataPointDeleted(event) {
    let dataPointToDelete: CustomDataLoggerDataPointUIModel = event.dataPoint;
    let dataPoints: CustomDataLoggerDataPointUIModel[] = _.cloneDeep(this.currentDataLogger.customDataLoggerDataPoints) ?? [];

    if (dataPointToDelete) {
      let dtPointIndex = dataPoints.findIndex(d => d.DeviceId === dataPointToDelete.DeviceId && d.DataPointIndex === dataPointToDelete.DataPointIndex) ?? -1;
      if (dtPointIndex != -1)
        dataPoints.splice(dtPointIndex, 1);
      this.currentDataLogger.customDataLoggerDataPoints = dataPoints;
      this.buildExistingDataPoints();
      this.hasChanges = true;
    }
  }

  OnAddDataPoints() {
    this.buildAddToMapDataPoints();
    this.buildExistingDataPoints();
    this.hasChanges = true;
  }

  private buildAddToMapDataPoints() {
    let dataPointsToAdd: CustomDataLoggerDataPointUIModel[] = _.cloneDeep(this.currentDataLogger.customDataLoggerDataPoints) ?? [];
    let indexDataPoint = 0;
    this.selectedTreeNodes.forEach(treeNode => {
      if (treeNode.treeNodeData) {
        indexDataPoint++;
        let dataPoint: CustomDataLoggerDataPointUIModel = {
          Id: -indexDataPoint,
          IdDataLogger: this.currentDataLogger.Id,
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
    this.currentDataLogger.customDataLoggerDataPoints = dataPointsToAdd;

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
      else{
        var childList = this.deviceDefinitions.filter(x=>x.OwnerId == deviceDef.Id);
       let device: DeviceData = { device: deviceDef, children: [] };
       if(childList && childList.length>0){
        let childDevice : DeviceData[] =[];
        childList.forEach(child=>{
          let chdevice: DeviceData = { device: child, children: [] };
          childDevice.push(chdevice);
        })   
        device.children = childDevice;
        let parentDevice = deviceDataMap.get(deviceDef.OwnerId);
          if(parentDevice != undefined){
            parentDevice.children.push(device);
          }   
       }
       else{
        let parentDevice = deviceDataMap.get(deviceDef.OwnerId);
        if(parentDevice != undefined){
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
          if(deviceDef.children.length >0){
            let treeNodeChildren: GatewayCheckedTreeNode = { name: deviceDef.device.Name, fullName: treeNode.name, treeNodeData: null };
            treeNodeChildren.children = this.addDataPointsToTreeNode(deviceDef.device.Id, String.Format("{0}_{1}", treeNode.name, treeNodeChildren.name));
            deviceDef.children.forEach(dev=>{
              let treeNodeChild: GatewayCheckedTreeNode = { name: dev.device.Name, fullName: treeNodeChildren.name, treeNodeData: null };
              treeNodeChild.children = this.addDataPointsToTreeNode(dev.device.Id, String.Format("{0}_{1}", treeNodeChildren.name, treeNodeChild.name));
              treeNodeChildren.children.push(treeNodeChild);
            })
            treeNode.children.push(treeNodeChildren);
          }
          else{
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
    this.existingDataPoints.push({ treeNodeData: this.currentDataLogger.customDataLoggerDataPoints, expandable: true, fullName: "", level: 0, name: "" });
  }

  setUpGridDetails(): void {
    if (this.dataPoints.length > 0) {
      if (this.currentDataLogger && this.currentDataLogger.customDataLoggerDataPoints.length > 0) {
        for (let i = 0; i < this.currentDataLogger.customDataLoggerDataPoints.length; i++) {
          let record = this.dataPoints.find(c => c.DeviceId == this.currentDataLogger.customDataLoggerDataPoints[i].DeviceId && c.DataPointIndex == this.currentDataLogger.customDataLoggerDataPoints[i].DataPointIndex);
          if (record != null) {
            this.currentDataLogger.customDataLoggerDataPoints[i].UnitSymbol = record.UnitSymbol;
          }
        }
      }  
    }
  }

  postCallDeviceDataPoints(): void {
    this.deviceDefinitions = this.devices ?? [];
    this.dataPoints = this.datapointdefinitions ?? [];
    this.setUpGridDetails();
    this.buildDataPointsTreeNodes();
    this.buildExistingDataPoints();
  }

  postCallGetLoggerTypes(): void {
    this.currentLoggerType = this.loggerTypesEntity.find(logger => logger.Key === this.currentDataLogger.DataLoggerType)?.Value ?? "";
  }
  postCallGetPanelConfigurationCommon(): void {
    let panelConfigurationCommon = this.panelConfigurationCommonState.panelConfigurationCommon;
    let panelInfo = UICommon.getPanelType(panelConfigurationCommon.PanelTypeId, true);
    this.panelName = panelConfigurationCommon.PanelTypeId > 0 ? panelInfo.name : null;
  }

  OnCancel() {
    this.dialogRef.close();
    this.router.navigate([`/${this.panelName}/dashboard/`]);
  }

  OnSubmit() {
    let dataLoggerToAdd: DataLoggerUIModel = _.cloneDeep(this.currentDataLogger);
    dataLoggerToAdd.IsDirty = true;
    dataLoggerToAdd.IsValid = true;
    const logger = { dataLogger: dataLoggerToAdd }
    console.log("dataLoggerToAdddsds", dataLoggerToAdd);
    if (this.data.isEdit) {
      this.store.dispatch(LOGGER_ACTIONS.DATALOGGER_UPDATE(logger));
    } else {
      this.store.dispatch(LOGGER_ACTIONS.DATALOGGER_ADD(logger));
    }

    this.dialogRef.close(logger);
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  ngOnInit(): void {
    this.currentDataLogger = this.data.dataLogger;
    this.initPanelConfigurationCommon();
    this.initDeviceDataPoints();
    this.initLoggerTypes();
  }

}
