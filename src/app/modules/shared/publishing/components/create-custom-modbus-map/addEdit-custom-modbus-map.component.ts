import { Component, ElementRef, EventEmitter, Inject, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { GatewayPanelBase } from '@comp/GatewayPanelBase.component';
import { DataSourceUIModel } from '@core/models/UIModels/dataSource.model';
import { ModbusMapTemplateUIModel, RegisteredModbusMapTypeEnum, RegisterTableType } from '@core/models/UIModels/modbusTemplate.model';
import { RegisteredModbusMap } from '@core/models/UIModels/RegisteredModbusMap.model';
import { DataPointDefinitionModel } from '@core/models/webModels/DataPointDefinition.model';
import { DataPointModbusRegisterConfigurationModel } from '@core/models/webModels/DataPointModbusRegisterConfiguration.model';
import { DeviceModel } from '@core/models/webModels/DeviceInfo.model';
import { PublishingChannelService } from '@core/services/publishingChannel.service';
import { Store } from '@ngrx/store';
import { ButtonActions } from '@shared/gateway-dialogs/components/gateway-advanced-dialog/gateway-advanced-dialog.component';
import { GatewayModalService } from '@shared/gateway-dialogs/services/gatewayModal.service';
import { GatewayCheckedFlatNode, GatewayCheckedTreeNode } from '@shared/gateway-treeview/components/gateway-checked-treeview/gateway-checked-treeview.component';
import { ModbusDataPointsService, modbusMapNameSchema } from '@shared/publishing/services/modbus-data-points.service';
import { AddDatapointsToCustomMapComponent, AddSlaveDataPointsData, SlaveDataPointsRange } from '../add-datapoints-to-custom-map/add-datapoints-to-custom-map.component';
import { ModbusPointsDisplayType } from '../modbus-template-points/modbus-template-points.component';
import { String } from 'typescript-string-operations';

import * as ACTIONS from '@store/actions/mapTemplateDetails.action';
import { deleteUIModal, UICommon } from '@core/data/UICommon';
import { PublishingChannelFacade } from '@core/facade/publishingChannelFacade.service';
import { DeviceDataPointsFacade } from '@core/facade/deviceDataPointsFacade.service';
import * as _ from 'lodash';
import { FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ValidationService } from '@core/services/validation.service';
import { SurefloFacade } from '@core/facade/surefloFacade.service';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'gw-addEdit-custom-modbus-map',
  templateUrl: './addEdit-custom-modbus-map.component.html',
  styleUrls: ['./addEdit-custom-modbus-map.component.scss']
})
export class AddEditCustomModbusMapComponent extends GatewayPanelBase implements OnInit, OnChanges, OnDestroy {

  @Input()
  addEditModbusMap: RegisteredModbusMap;

  @Input()
  displayType: ModbusPointsDisplayType = ModbusPointsDisplayType.CustomMap;

  @Input()
  saveModbusMap: boolean;

  @Input()
  isEdit: boolean;

  @Output()
  newMapAddedEmitter = new EventEmitter();

  @Output()
  mapUpdatedEmitter = new EventEmitter();

  @Output()
  mapDeletedEmitter = new EventEmitter();

  @Output()
  mapHasChangesEmitter = new EventEmitter<boolean>();

  @Output()
  validationMessageEmitter = new EventEmitter();

  @Output()
  isFormDirtyEmitter = new EventEmitter();

  @Output()
  deleteDataPoints = new EventEmitter();


  private ctrlMapFocus: ElementRef;
  @ViewChild('MapFocus', { static: false }) set content(ctrlMapName: ElementRef) {
    if (!this.ctrlMapFocus) {
      this.ctrlMapFocus = ctrlMapName;
      this.ctrlMapFocus.nativeElement.focus();
    }
  };

  modbusId: number;
  modbusMapName: string;
  mapTypeId:number;

  dataSources: DataSourceUIModel[];
  deviceDefinitions: DeviceModel[];
  dataPoints: DataPointDefinitionModel[];
  dataSourceNode: GatewayCheckedTreeNode[] = [];
  selectedTreeNodes: GatewayCheckedFlatNode[] = [];
  existingDataPoints: GatewayCheckedFlatNode[] = [];

  bIsValidMap: boolean = false;
  bNoDataPointsAvalbale: boolean = false;
  IsDefaultMap: boolean = false;
  IsNewMap: boolean = false;
  hasChanges: boolean = false;
  hasDataPoints: boolean = false;
  clearSelectedNodes: boolean = false;
  validationMessage = null;
  disableRemoveButton: boolean = true;
  selectedDataPointsToDelete: any[] = [];

  childNotifier : Subject<boolean> = new BehaviorSubject<boolean>(false);


  private selectedRegisterTableType: RegisterTableType = RegisterTableType.HoldingRegisters;
  private dataTypesBasedOnRegistersType: number[];
  private modbusMapModel: ModbusMapTemplateUIModel;
  private mapTemplateList: ModbusMapTemplateUIModel[];

  mapTemplateForm: FormGroup;

  constructor(protected store: Store,
    private modbusPointsService: ModbusDataPointsService,
    private publishingService: PublishingChannelService,
    private publishingFacade: PublishingChannelFacade,
    private devicesFacade: DeviceDataPointsFacade,
    private validationService: ValidationService,
    private gwModalService: GatewayModalService) {
    super(store, null, null, null, publishingFacade, devicesFacade, null, null);
  }

  registerTypeUpdated(event) {
    this.selectedRegisterTableType = event;
    this.dataTypesBasedOnRegistersType = [];
    this.dataTypesBasedOnRegistersType = this.modbusPointsService.getDataTypesBasedOnRegisterTableType(this.selectedRegisterTableType);
    this.buildDataPointsTreeNodes();
    this.buildExistingDataPoints();
  }

  selectedRowsTodeleteEnable(event){
   this.disableRemoveButton = !(event.length>0);
   this.selectedDataPointsToDelete = event;
  }
  OnDeleteDataPoints(){
    let modBusRecordDesc ="";
    if(this.selectedDataPointsToDelete && this.selectedDataPointsToDelete.length>0){
        this.selectedDataPointsToDelete.forEach((record)=>{
          modBusRecordDesc = modBusRecordDesc + `\n` + record.Description +" ";
        })
    }
    this.childNotifier.next(true);
    this.disableRemoveButton = true;
  }

  modbusDeviceMapUpdated(event) {
    this.modbusMapModel = {
      Id: event.mapID,
      MapName: this.modbusMapName.trim(),
      MapRecords: event.modbusDeviceMap.ModbusSlaveRegisterMap
    };
    this.hasChanges = this.hasChanges || (event.pointsDeleted ? true : false);
    this.checkDataPoints();
    this.buildExistingDataPoints();
    this.mapHasChangesEmitter.emit(this.hasChanges);
  }

  private checkDataPoints() {
    this.hasDataPoints = false;
    if (this.modbusMapModel && this.modbusMapModel.MapRecords) {
      let modbusMaps = this.modbusMapModel.MapRecords ?? [];
      for (let i = 0; i < modbusMaps.length; i++) {
        if (modbusMaps[i].DataPoints.length > 0) {
          this.hasDataPoints = true;
          break;
        }
      }
    }
    this.validationMessageEmitter.emit(this.hasDataPoints && !this.validationMessage);
    this.isFormDirtyEmitter.emit(this.hasChanges);
  }
  

  dataPointsSelected(treeNodes) {
    this.selectedTreeNodes = treeNodes;
  }

  onSaveMap() {
    if (this.displayType == ModbusPointsDisplayType.BrandNewMap || this.displayType == ModbusPointsDisplayType.NewMapFromExisting)
      this.CreateNewMap();
    else
      this.SaveMap();
  }

  private CreateNewMap() {
    if (this.modbusMapModel) {
      UICommon.isBusyWaiting = true;
      this.modbusMapModel.Id = -1;  // New Map
      this.modbusMapModel.MapName = this.modbusMapName;
      this.modbusMapModel.MapTypeId = this.mapTypeId;
      // NOT USING STORE ACTIONS HERE BECAUSE WE NEED TO WAIT FOR RESULT
      this.publishingService.saveModbusMaps(this.modbusMapModel).subscribe(r => {
        this.store.dispatch(ACTIONS.MAPTEMPLATES_LOAD());
        this.newMapAddedEmitter.emit();
        UICommon.isBusyWaiting = false;
      },
        error => {
          // console.log(error);
          UICommon.isBusyWaiting = false;
        })
    }
  }

  private SaveMap() {
    if (this.modbusMapModel) {
      UICommon.isBusyWaiting = true;
      this.modbusMapModel.MapName = this.modbusMapName;
      this.modbusMapModel.MapTypeId = this.mapTypeId;
      // NOT USING STORE ACTIONS HERE BECAUSE WE NEED TO WAIT FOR RESULT
      this.publishingService.saveModbusMaps(this.modbusMapModel).subscribe(r => {
        let publishings = this.publishingEntity.filter(p => p.RegisteredModbusMapId === this.modbusMapModel.Id) ?? [];
        if (publishings.length > 0)
          this.store.dispatch(ACTIONS.MAPTEMPLATES_AFTER_SAVE());
        else
          this.store.dispatch(ACTIONS.MAPTEMPLATES_LOAD());
        this.mapUpdatedEmitter.emit();
        this.publishingService.setModbusDeviceMap();
        UICommon.isBusyWaiting = false;
      },
        error => {
          // console.log(error);
          UICommon.isBusyWaiting = false;
        })
    }
  }

  onDeleteMap() {
    let pub = this.publishingEntity.filter(p => p.RegisteredModbusMapId === this.modbusId) ?? [];
    if (pub && pub.length > 0) {
      this.gwModalService.openDialog(
        String.Format('Map - {0} is associated with a configured Publishing Channel. Therefore, the map can’t be deleted.', this.modbusMapName),
        () => this.gwModalService.closeModal(),
        null,
        'Warning',
        null,
        false,
        "Ok"
      );
      return;
    }

    this.gwModalService.openDialog(
      `Do you want to delete custom map '${this.modbusMapName}'?`,
      () => {
        this.gwModalService.closeModal();
        this.DeleteMap();
      },
      () => this.gwModalService.closeModal(),
      deleteUIModal.title,
      null,
      true,
      deleteUIModal.primaryBtnText,
      deleteUIModal.secondaryBtnText
    );
  }

  private DeleteMap() {
    UICommon.isBusyWaiting = true;
    // NOT USING STORE ACTIONS HERE BECAUSE WE NEED TO WAIT FOR RESULT
    this.publishingService.deleteModbusMap(this.modbusId).subscribe(r => {
      this.store.dispatch(ACTIONS.MAPTEMPLATES_LOAD());
      this.mapDeletedEmitter.emit();
      UICommon.isBusyWaiting = false;
    },
      error => {
        // console.log(error);
        UICommon.isBusyWaiting = false;
      })
  }

  private buildAddToMapDataPoints(dataPointsRange: SlaveDataPointsRange) {
    let dataPointsToAdd: DataPointModbusRegisterConfigurationModel[] = [];
    let noOfBytes = this.modbusPointsService.getNoOfBysteUsed(dataPointsRange.dataType);
    let indexDataPoint = -1;
    this.selectedTreeNodes.forEach(treeNode => {
      if (treeNode.treeNodeData) {
        indexDataPoint++;
        let dataPoint: DataPointModbusRegisterConfigurationModel = {
          StartRegisterAddress: dataPointsRange.startAddress + (indexDataPoint * noOfBytes),
          DeviceId: treeNode.treeNodeData.DeviceId,
          DataPointIndex: treeNode.treeNodeData.DataPointIndex,
          TagName: String.Format("{0}_{1}", treeNode.fullName, treeNode.treeNodeData.TagName),
          UnitSymbol: treeNode.treeNodeData.UnitSymbol,
          ReadWriteFlag: treeNode.treeNodeData.ReadOnly == true ? 1 : 3,  //1 is readonly. 3 is readwrite,
          SlaveDataType: dataPointsRange.dataType,
          ConversionFormat: this.modbusPointsService.getModbusValueConversionFormatType_Enum(dataPointsRange.dataType, 2, false),
        };
        dataPointsToAdd.push(dataPoint);
      }
    });
    this.modbusPointsService.setModbusDataPointsToAdd(this.modbusId, dataPointsToAdd);
    this.selectedTreeNodes = [];
  }

  private getStartAddress(): AddSlaveDataPointsData {
    let startAddres = 0;
    let dataPoints: DataPointModbusRegisterConfigurationModel[] = [];

    if (!this.modbusMapModel || !this.modbusMapModel.MapRecords)  // New Map from Scratch or new data points added to map
      return {
        startAddress: startAddres,
        DataPoints: [],
        registerTableType: this.selectedRegisterTableType,
        noOfDataPoints: this.getNoOfDataPoints()
      };

    let indexMapRecord = this.modbusMapModel.MapRecords.findIndex(m => m.RegisterTableType === this.selectedRegisterTableType) ?? -1;
    if (indexMapRecord != -1) {
      let mapRecord = this.modbusMapModel.MapRecords[indexMapRecord];
      if (mapRecord.DataPoints.length > 0) {
        dataPoints = _.cloneDeep(mapRecord.DataPoints);
        dataPoints.sort((rA1, rA2) => rA1.StartRegisterAddress - rA2.StartRegisterAddress);
        startAddres = this.modbusPointsService.getStartRegisterAddress(dataPoints[dataPoints.length - 1].StartRegisterAddress,
          dataPoints[dataPoints.length - 1].SlaveDataType);
      }
    }
    return {
      startAddress: startAddres,
      DataPoints: dataPoints,
      registerTableType: this.selectedRegisterTableType,
      noOfDataPoints: this.getNoOfDataPoints()
    };
  }

  private getNoOfDataPoints(): number {
    let dataPointNodes = this.selectedTreeNodes.filter(n => n.treeNodeData !== null) ?? [];
    return dataPointNodes.length;
  }

  OnAddDataPoints() {
    let addSlavePoints: AddSlaveDataPointsData = this.getStartAddress();

    this.clearSelectedNodes = false;
    let dialogAddSlaveDataPoints = this.gwModalService.openDialogInsideModal(
      "New Slave Data Points",
      ButtonActions.None,
      AddDatapointsToCustomMapComponent,
      addSlavePoints,
      (result) => {
        if (result) {
          this.hasChanges = true;
          this.clearSelectedNodes = true;
          this.buildAddToMapDataPoints(result);
          dialogAddSlaveDataPoints.close();
          this.mapHasChangesEmitter.emit(this.hasChanges);
        }
        else
          dialogAddSlaveDataPoints.close();
      },
      '390px',
    );
  }

  validateCustomMap() {
    this.mapTemplateForm.markAllAsTouched();
    this.hasChanges = true;
    this.mapHasChangesEmitter.emit(this.hasChanges);
    this.bIsValidMap = this.modbusMapName && this.modbusMapName.trim().length > 0 ? true : false;
    let ctrl = this.mapTemplateForm.controls['MapName'];
    if (ctrl != null) {
      this.validationMessage = null;
      this.validationMessage = this.validationService.getValidationErrorMessage(ctrl.errors, 'Map Name');
      this.bIsValidMap = this.validationMessage == null ? true : false;
      this.validationMessageEmitter.emit(this.hasDataPoints && !this.validationMessage);
      this.isFormDirtyEmitter.emit(this.mapTemplateForm.dirty);
      if (!this.bIsValidMap)
        return;
    }
  }

  private registerApplicable(dataPointValueDataType: number): boolean {
    if (this.dataTypesBasedOnRegistersType.findIndex(c => c == dataPointValueDataType) == -1)
      return false;
    else
      return true;
  }

  private addDataPointsToTreeNode(deviceId: number, parentName: string): GatewayCheckedTreeNode[] {
    let treeNodes: GatewayCheckedTreeNode[] = [];
    if(this.mapTypeId === RegisteredModbusMapTypeEnum.Diagnostic){
      this.dataPoints.forEach(dataPoint => {
        if (dataPoint.DataPointType == 1 && dataPoint.DeviceId === deviceId) {
          if (this.registerApplicable(dataPoint.DataType) == true)
            treeNodes.push({ name: dataPoint.TagName, fullName: parentName, treeNodeData: dataPoint });
        }
      });
    }
    else{
      this.dataPoints.forEach(dataPoint => {
        if (dataPoint.DeviceId === deviceId) {
          if (this.registerApplicable(dataPoint.DataType) == true)
            treeNodes.push({ name: dataPoint.TagName, fullName: parentName, treeNodeData: dataPoint });
        }
      });
    }
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
    });
    return deviceDataMap;
  }

  private buildDataPointsTreeNodes() {
    if ((this.deviceDefinitions && this.deviceDefinitions.length > 0) &&
      (this.dataPoints && this.dataPoints.length > 0)) {
      this.dataSourceNode = [];

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
          
        });
        treeNode.children = treeNode.children.concat(this.addDataPointsToTreeNode(deviceData.device.Id, treeNode.name));

        if (treeNode.children && treeNode.children.length > 0)
          this.dataSourceNode.push(treeNode);
      });
    }
    this.bNoDataPointsAvalbale = this.dataSourceNode.length == 0 ? true : false;
    this.selectedTreeNodes = [];
  }

  private buildExistingDataPoints() {
    this.existingDataPoints = [];
    if (this.modbusMapModel && this.modbusMapModel.MapRecords) {
      let mapRecord = this.modbusMapModel.MapRecords.find(m => m.RegisterTableType === this.selectedRegisterTableType);
      if (mapRecord && mapRecord.DataPoints) {
        this.existingDataPoints.push({ treeNodeData: mapRecord.DataPoints, expandable: false, fullName: "", level: 0, name: "" });
        // this.existingDataPoints = [...mapRecord.DataPoints];
      }
    }
  }

  postCallGetModbusTemplateDetails() {
    this.mapTemplateList = this.modbusTemplateDetails;
    this.createFormGroup();
  }

  postCallDeviceDataPoints(): void {
    this.deviceDefinitions = this.devices ?? [];
    this.dataPoints = this.datapointdefinitions ?? [];
    this.registerTypeUpdated(RegisterTableType.HoldingRegisters);
  }

  private createFormGroup(): void {
    this.mapTemplateForm = new FormGroup({});
    for (const property in modbusMapNameSchema.properties) {
      let formControl = new FormControl('');
      let validationFn: ValidatorFn[] = [];
      if (modbusMapNameSchema.required.includes(property))
        validationFn.push(Validators.required);

      if (modbusMapNameSchema.properties.hasOwnProperty(property)) {
        let prop = modbusMapNameSchema.properties[property];
        if (prop.minLength !== undefined)
          validationFn.push(Validators.minLength(prop.minLength));

        if (prop.maxLength !== undefined)
          validationFn.push(Validators.maxLength(prop.maxLength));

        if (prop.pattern !== undefined)
          validationFn.push(Validators.pattern(prop.pattern));

        if (property === 'MapName')
          validationFn.push(this.modbusPointsService.mapNameValidator(this.modbusId, this.modbusMapName, this.mapTemplateList));
      }
      formControl.setValidators(validationFn);
      this.mapTemplateForm.addControl(property, formControl);
    }
    this.subscribeToFormValidationEvent();
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }
  private subscribeToFormValidationEvent() {
      this.mapTemplateForm.statusChanges
      .pipe(filter(() => this.mapTemplateForm.dirty)).subscribe(() => {
        this.isFormDirtyEmitter.emit(true);
      });
  }
  ngOnChanges(simpleChanges: SimpleChanges): void {
    if (simpleChanges.addEditModbusMap && simpleChanges.addEditModbusMap.currentValue) {
      this.modbusId = this.addEditModbusMap.Id;
      this.mapTypeId = this.addEditModbusMap.MapTypeId;
      this.modbusMapName = this.addEditModbusMap.MapName;
    }

    if (simpleChanges.displayType) {
      this.IsDefaultMap = this.displayType == ModbusPointsDisplayType.DefaultMap ? true : false;
      this.IsNewMap = this.displayType == ModbusPointsDisplayType.NewMapFromExisting || this.displayType == ModbusPointsDisplayType.BrandNewMap ? true : false;
      this.hasChanges = this.displayType == ModbusPointsDisplayType.NewMapFromExisting ? true : false;
      this.mapHasChangesEmitter.emit(this.hasChanges);
    }

    if (simpleChanges.saveModbusMap && simpleChanges.saveModbusMap.currentValue) {
      //if (this.ctrlMapFocus) {
      this.onSaveMap();
      //  this.ctrlMapFocus.nativeElement.focus();
      //}
    }
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.initModbusMapTemplateDetails();
    this.initDataPublishing();
    this.initDeviceDataPoints();
  }
}

export class DeviceData {
  device: DeviceModel;
  children: DeviceData[];
}
