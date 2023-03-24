import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { GatewayPanelBase } from '@comp/GatewayPanelBase.component';
import { deleteUIModal, UICommon } from '@core/data/UICommon';
import { DeviceDataPointsFacade } from '@core/facade/deviceDataPointsFacade.service';
import { PublishingChannelFacade } from '@core/facade/publishingChannelFacade.service';
import { DataPointModbusRegisterConfigurationUIModel, Endianness, ModbusDeviceConfigurationModelUIExtension, ModbusValueConversionFormatType, RegisterTableType } from '@core/models/UIModels/modbusTemplate.model';
import { DataPointDefinitionModel, DataPointValueDataType } from '@core/models/webModels/DataPointDefinition.model';
import { DataPointModbusRegisterConfigurationModel } from '@core/models/webModels/DataPointModbusRegisterConfiguration.model';
import { ModbusSlaveRegisterMapUI } from '@core/models/webModels/ModbusSlaveRegisterMapUI.model';
import { PublishingChannelService } from '@core/services/publishingChannel.service';
import { IgxColumnComponent, IgxGridComponent, IRowSelectionEventArgs } from '@infragistics/igniteui-angular';
import { Store } from '@ngrx/store';
import { GatewayModalService } from '@shared/gateway-dialogs/services/gatewayModal.service';
import { ModbusDataPointsService, modbusMapNameSchema } from '@shared/publishing/services/modbus-data-points.service';
import { StateUtilities } from '@store/state/IState';
import { IUnitSystemState } from '@store/state/unit-system.state';
import { Observable, Subject, Subscription } from 'rxjs';
import { String } from 'typescript-string-operations';
import * as UNITSYSTEM_ACTIONS from '@store/actions/unit-system.action';
import * as _ from 'lodash';

@Component({
  selector: 'gw-modbus-template-points',
  templateUrl: './modbus-template-points.component.html',
  styleUrls: ['./modbus-template-points.component.scss']
})
export class ModbusTemplatePointsComponent extends GatewayPanelBase implements OnInit, AfterViewInit, OnChanges, OnDestroy {

  @Input()
  modbusId: number;

  @Input()
  displayType: ModbusPointsDisplayType = ModbusPointsDisplayType.PublishingView;

  @Input()
  endianness: number;

  @Input()
  bBytesSwapped: boolean;

  @Input()
  refresh: boolean;

  @Output()
  modbusDeviceMapUpdatedEvent = new EventEmitter();

  @Output()
  registerTypeUpdatedEvent = new EventEmitter();

  @Output()
  selectedRowsTodeleteEnable = new EventEmitter();

  @Input()
  deleteDataPoints: boolean;

  @Input() notifier: Subject<boolean>;


  @ViewChild("gridModbusDataPoints", { static: true })
  public gridModbusDataPoints: IgxGridComponent;

  private modbusMap: any;
  private modbusMapNew = new Map<RegisterTableType, DataPointModbusRegisterConfigurationModel[]>();
  private filteredRegistersbasedOnRegisterType: DataPointModbusRegisterConfigurationUIModel[];
  private dataPointDefinitionModels: DataPointDefinitionModel[];
  private ModbusDeviceMap: any;

  SelectedRegisterType: RegisterTableType = RegisterTableType.HoldingRegisters;  //default to holding registers
  modBusDataPoints: ModbusTemplateDetial[];
  showDataFormat: boolean = true;
  columnDescWidth: string = "42%";
  selectedRowsToDelete:any = [];
  checked3: boolean = false;
  checked2: boolean = false;
  checked1: boolean = false;
  checked4: boolean = false;
  indeterminate3: boolean = false;
  indeterminate2: boolean = false;
  indeterminate1: boolean = false;
  indeterminate4: boolean = false;


  private arrSubscriptions: Subscription[] = [];

  unitSystem = null;
  private unitSystemModel$: Observable<IUnitSystemState>;

  constructor(protected store: Store,
    private modbusPointsService: ModbusDataPointsService,
    private publishingService: PublishingChannelService,
    private publishingFacade: PublishingChannelFacade,
    private devicesFacade: DeviceDataPointsFacade,
    private gatewayModalService: GatewayModalService) {
    super(store, null, null, null, publishingFacade, devicesFacade, null);
    this.unitSystemModel$ = store.select<IUnitSystemState>((state: any) => state.unitSystemState);
  }

  onRegisterTableTypeChange(event) {
    this.SelectedRegisterType = parseInt(event.value);
    this.filterRecords();
    this.registerTypeUpdatedEvent.emit(this.SelectedRegisterType);
  }

  onDeleteDataPoint(rowIndex, rowId) {
    let modBusRecord = this.modBusDataPoints[rowIndex];
    this.gatewayModalService.openDialog(
      `Do you want to delete data point address '${modBusRecord.Description}'?`,
      () => {
        this.gatewayModalService.closeModal();
        //this.updateMaBasedOnDataPointDelete(modBusRecord.DeviceId, modBusRecord.PointIndex);
      },
      () => this.gatewayModalService.closeModal(),
      deleteUIModal.title,
      null,
      true,
      deleteUIModal.primaryBtnText,
      deleteUIModal.secondaryBtnText
    );
  }

  onSelectAllDataPointsToRemove($event){
    if($event.checked){
      //this.selectedRowsToDelete.length = 0;
      this.modBusDataPoints.forEach((record)=>{
        record.isChecked = true;
        record.startAddress = this.SelectedRegisterType;
        let dtPointIndex = this.selectedRowsToDelete.findIndex(d => d.Address === record.Address) ?? -1;
        if(dtPointIndex === -1){
          this.selectedRowsToDelete.push(record);
        }
        
      });

      switch (this.SelectedRegisterType) {
        case 1:
          this.checked1=true;
          break;
        case 2:
          this.checked2 = true;
          break;
        case 3:
          this.checked3 = true;
          break;
        case 4:
          this.checked4 = true;
          break;
        default:
          break;
      }
    }else{
      this.modBusDataPoints.forEach((record)=>{
        record.isChecked = false;
        let dtPointIndex = this.selectedRowsToDelete.findIndex(d => d.Address === record.Address) ?? -1;
        if(dtPointIndex != -1){
          this.selectedRowsToDelete.splice(dtPointIndex,1);
        }
      })
      switch (this.SelectedRegisterType) {
        case 1:
          this.checked1=false;
          break;
        case 2:
          this.checked2 = false;
          break;
        case 3:
          this.checked3 = false;
          break;
        case 4:
          this.checked4 = false;
          break;
        default:
          break;
      }

    }
    
    this.selectedRowsTodeleteEnable.emit(this.selectedRowsToDelete);
  }

  descendantsAllSelected(): boolean {
    if(this.modBusDataPoints && this.modBusDataPoints.length>0){
        return this.modBusDataPoints.every(child => {child.isChecked});
    }else{
      return false;
    }
  }

  onSelectDataPointToRemove(event , rowIndex, rowId) {
    let modBusRecord = this.modBusDataPoints[rowIndex];
    modBusRecord.isChecked =  event.checked;
    if(event.checked){
        modBusRecord.startAddress = this.SelectedRegisterType;
        this.selectedRowsToDelete.push(modBusRecord);
        switch (this.SelectedRegisterType) {
          case 1:
            this.indeterminate1=true;
            break;
          case 2:
            this.indeterminate2 = true;
            break;
          case 3:
            this.indeterminate3 = true;
            break;
          case 4:
            this.indeterminate4 = true;
            break;
          default:
            break;
        }
    }else{

      let dtPointIndex = this.selectedRowsToDelete.findIndex(d => d.Address === rowId) ?? -1;
      if(dtPointIndex != -1){
        this.selectedRowsToDelete.splice(dtPointIndex,1);
      }

    if(this.selectedRowsToDelete && this.selectedRowsToDelete.length>0){
        this.selectedRowsToDelete.forEach(record =>{
          switch (record.startAddres) {
            case 1:
              this.indeterminate1 = true;
              break;
            case 2:
              this.indeterminate2 = true;
              break;
            case 3:
              this.indeterminate3 = true;
              break;
            case 4:
              this.indeterminate4 = true;
              break;
            default:
              break;
          }
        })
      } else{
        this.indeterminate1 = false;
        this.indeterminate2 = false;
        this.indeterminate3 = false;
        this.indeterminate4 = false;
      }
    }
    this.selectedRowsTodeleteEnable.emit(this.selectedRowsToDelete);
  }

  deleteSelectedDataPoints(){
    if(this.notifier){
    let subscription = this.notifier.subscribe(data => {
      if(data && this.selectedRowsToDelete && this.selectedRowsToDelete.length>0){
        this.selectedRowsToDelete.forEach((record) =>{
          this.updateMaBasedOnDataPointDelete(record.DeviceId, record.PointIndex, record.startAddress,record);
        })
      }
       this.selectedRowsToDelete.length=0;
       this.indeterminate1 = false;
       this.indeterminate2 = false;
       this.indeterminate3 = false;
       this.indeterminate4 = false;
       this.checked1=false;
       this.checked2= false;
       this.checked3 = false;
       this.checked4 = false;
    });
    this.arrSubscriptions.push(subscription);
  }
  }


  private updateMaBasedOnDataPointDelete(deviceId: number, dataPointIndex: number, startAddress:any,record:any) {
    let modbusDevicemapSlave = new ModbusDeviceConfigurationModelUIExtension();
    modbusDevicemapSlave.ModbusSlaveRegisterMap = new Array();
    if (this.modbusMap != null) {
      //loop to get existing modbus register map
      for (var key2 in this.modbusMap) {
        let registerMaprecords = this.modbusMap[key2];//api dictionary format.convert it to class format
        if (isNaN(parseInt(registerMaprecords.toString()))) {
          let registerMapUIRecord = new ModbusSlaveRegisterMapUI();
          registerMapUIRecord.RegisterTableType = RegisterTableType[key2];//input or holding register type
          if (startAddress === registerMapUIRecord.RegisterTableType) {
            let array = registerMaprecords.filter(d => d.DeviceId === deviceId && d.DataPointIndex === dataPointIndex);
            if(array != null && array.length > 1){
              let dtPointIndex = registerMaprecords.findIndex(d => d.TagName === record.Description) ?? -1;
              if (dtPointIndex != -1)
                registerMaprecords.splice(dtPointIndex, 1);

            }else{
              let dtPointIndex = registerMaprecords.findIndex(d => d.DeviceId === deviceId && d.DataPointIndex === dataPointIndex) ?? -1;
              if (dtPointIndex != -1)
                registerMaprecords.splice(dtPointIndex, 1);

            }
          }
          registerMapUIRecord.DataPoints = registerMaprecords;
          modbusDevicemapSlave.ModbusSlaveRegisterMap.push(registerMapUIRecord);
        }
      }
    }

    if (this.modbusMapNew != null && this.modbusMapNew.size > 0) {  // New maps added
      let mapDataPoints = this.modbusMapNew.get(startAddress) ?? [];
      if (mapDataPoints) {
        let registerMapUIRecord = new ModbusSlaveRegisterMapUI();
        registerMapUIRecord.RegisterTableType = this.SelectedRegisterType;

        let dtPointIndex = mapDataPoints.findIndex(d => d.DeviceId === deviceId && d.DataPointIndex === dataPointIndex) ?? -1;
        if (dtPointIndex != -1)
          mapDataPoints.splice(dtPointIndex, 1);

        registerMapUIRecord.DataPoints = mapDataPoints;
        this.modbusMapNew.set(startAddress, mapDataPoints);
      }

      //loop to get modbus register map
      this.modbusMapNew.forEach((registerMaprecords, key2) => {
        if (isNaN(parseInt(registerMaprecords.toString()))) {
          let registerMapUIRecord = new ModbusSlaveRegisterMapUI();
          registerMapUIRecord.RegisterTableType = key2; //input or holding register type
          registerMapUIRecord.DataPoints = registerMaprecords;
          modbusDevicemapSlave.ModbusSlaveRegisterMap.push(registerMapUIRecord);
        }
      });
    }

    this.ModbusDeviceMap = [];
    this.ModbusDeviceMap.push(modbusDevicemapSlave);
    this.modbusDeviceMapUpdatedEvent.emit({ mapID: this.modbusId, modbusDeviceMap: modbusDevicemapSlave, pointsDeleted: true });

    this.filterRecords();
  }

  private createNewMaBasedOnAddDataPoints(dataPointsToAdd: DataPointModbusRegisterConfigurationModel[]) {
    let modbusDevicemapSlave = new ModbusDeviceConfigurationModelUIExtension();
    modbusDevicemapSlave.ModbusSlaveRegisterMap = new Array();

    let mapDataPoints = this.modbusMapNew.get(this.SelectedRegisterType) ?? [];
    if (mapDataPoints) {
      let registerMapUIRecord = new ModbusSlaveRegisterMapUI();
      registerMapUIRecord.RegisterTableType = this.SelectedRegisterType;
      dataPointsToAdd.forEach(dataPointToAdd => {
        mapDataPoints.push(dataPointToAdd);
      });
      registerMapUIRecord.DataPoints = mapDataPoints;
      this.modbusMapNew.set(this.SelectedRegisterType, mapDataPoints);
    }

    //loop to get modbus register map
    this.modbusMapNew.forEach((registerMaprecords, key2) => {
      if (isNaN(parseInt(registerMaprecords.toString()))) {
        let registerMapUIRecord = new ModbusSlaveRegisterMapUI();
        registerMapUIRecord.RegisterTableType = key2; //input or holding register type
        registerMapUIRecord.DataPoints = registerMaprecords;
        modbusDevicemapSlave.ModbusSlaveRegisterMap.push(registerMapUIRecord);
      }
    });

    this.ModbusDeviceMap = [];
    this.ModbusDeviceMap.push(modbusDevicemapSlave);
    this.modbusDeviceMapUpdatedEvent.emit({ mapID: this.modbusId, modbusDeviceMap: modbusDevicemapSlave });

    this.filterRecords();
  }

  private updateMaBasedOnAddDataPoints(dataPointsToAdd: DataPointModbusRegisterConfigurationModel[]) {
    if (this.modbusMap != null) {
      let modbusDevicemapSlave = new ModbusDeviceConfigurationModelUIExtension();
      modbusDevicemapSlave.ModbusSlaveRegisterMap = new Array();

      //loop to get modbus existing register map
      for (var key2 in this.modbusMap) {
        let registerMaprecords = this.modbusMap[key2];//api dictionary format.convert it to class format
        if (isNaN(parseInt(registerMaprecords.toString()))) {
          let registerMapUIRecord = new ModbusSlaveRegisterMapUI();
          registerMapUIRecord.RegisterTableType = RegisterTableType[key2];//input or holding register type
          if (this.SelectedRegisterType === registerMapUIRecord.RegisterTableType) {
            dataPointsToAdd.forEach(dataPointToAdd => {
              registerMaprecords.push(dataPointToAdd)
            });
          }
          registerMapUIRecord.DataPoints = registerMaprecords;
          modbusDevicemapSlave.ModbusSlaveRegisterMap.push(registerMapUIRecord);
        }
      }

      // add data points for new Register Table type selected
      let mapDataPoints = this.modbusMapNew.get(this.SelectedRegisterType) ?? [];
      if (mapDataPoints) {
        let registerMapUIRecord = new ModbusSlaveRegisterMapUI();
        registerMapUIRecord.RegisterTableType = this.SelectedRegisterType;
        dataPointsToAdd.forEach(dataPointToAdd => {
          mapDataPoints.push(dataPointToAdd);
        });
        registerMapUIRecord.DataPoints = mapDataPoints;
        this.modbusMapNew.set(this.SelectedRegisterType, mapDataPoints);
      }

      //loop to get modbus register map
      this.modbusMapNew.forEach((registerMaprecords, key2) => {
        if (isNaN(parseInt(registerMaprecords.toString()))) {
          let registerMapUIRecord = new ModbusSlaveRegisterMapUI();
          registerMapUIRecord.RegisterTableType = key2; //input or holding register type
          registerMapUIRecord.DataPoints = registerMaprecords;
          modbusDevicemapSlave.ModbusSlaveRegisterMap.push(registerMapUIRecord);
        }
      });

      this.ModbusDeviceMap = [];
      this.ModbusDeviceMap.push(modbusDevicemapSlave);
      this.modbusDeviceMapUpdatedEvent.emit({ mapID: this.modbusId, modbusDeviceMap: modbusDevicemapSlave });
    }
    this.filterRecords();
  }

  private setUpMapDetails(): void {
    this.modBusDataPoints = [];
    if (this.filteredRegistersbasedOnRegisterType != null) {
      for (let i = 0; i < this.filteredRegistersbasedOnRegisterType.length; i++) {
        let record = this.dataPointDefinitionModels.find(c => c.DeviceId == this.filteredRegistersbasedOnRegisterType[i].DeviceId && c.DataPointIndex == this.filteredRegistersbasedOnRegisterType[i].DataPointIndex);
        if (record != null) {
          let modbusDataPoint = {
            DeviceId: record.DeviceId,
            PointIndex: record.DataPointIndex,
            Address: this.modbusPointsService.formatRegisterValue(this.filteredRegistersbasedOnRegisterType[i].StartRegisterAddress, this.SelectedRegisterType),
            DataFormat: this.modbusPointsService.getModbusValueConversionFormatType_Value(this.filteredRegistersbasedOnRegisterType[i].SlaveDataType, this.endianness, this.bBytesSwapped),
            DataType: this.modbusPointsService.formatDataType(this.filteredRegistersbasedOnRegisterType[i].SlaveDataType),
            Description: this.filteredRegistersbasedOnRegisterType[i].TagName,
            Units: record.UnitSymbol,
            isChecked : false,
            startAddress: this.filteredRegistersbasedOnRegisterType[i].StartRegisterAddress,

          }
          if(this.selectedRowsToDelete && this.selectedRowsToDelete.length>0){
            this.selectedRowsToDelete.forEach((record)=>{
              if(record.Address === modbusDataPoint.Address )
                  modbusDataPoint.isChecked = record.isChecked;
            })
          }
          this.modBusDataPoints.push(modbusDataPoint);
        }
      }
    }
  }

  private setUpMapDetailsForImport(): void {
    this.modBusDataPoints = [];
    let inxMap = this.modbusTemplateDetails.findIndex(m => m.Id === this.modbusId) ?? -1;
    if (inxMap != -1) {
      let mapRecords = this.modbusTemplateDetails[inxMap].MapRecords ?? [];
      let mapRecord = mapRecords.find(d => d.RegisterTableType === this.SelectedRegisterType);
      if (mapRecord && mapRecord.DataPoints.length > 0) {
        for (let i = 0; i < mapRecord.DataPoints.length; i++) {

          let rec = null;
          for (let j = 0; j < this.unitSystem.UnitQuantities.length; j++) {
            if (this.unitSystem.UnitQuantities[j].SupportedUnitSymbols.find(s => s.Key == mapRecord.DataPoints[i].UnitSymbol)) {
              rec = this.unitSystem.UnitQuantities[j].SupportedUnitSymbols;
              break;
            };
          }
          let record = rec != null ? this.unitSystem.UnitQuantities.find(s => s.SupportedUnitSymbols == rec) : null;

          let modbusDataPoint = {
            DeviceId: mapRecord.DataPoints[i].DeviceId,
            PointIndex: mapRecord.DataPoints[i].DataPointIndex,
            Address: this.modbusPointsService.formatRegisterValue(mapRecord.DataPoints[i].StartRegisterAddress, this.SelectedRegisterType),
            DataFormat: this.modbusPointsService.getModbusValueConversionFormatType_Value(mapRecord.DataPoints[i].SlaveDataType, this.endianness, this.bBytesSwapped),
            DataType: this.modbusPointsService.formatDataType(mapRecord.DataPoints[i].SlaveDataType),
            Description: mapRecord.DataPoints[i].TagName,
            Units: record != null? record.SelectedDisplayUnitSymbol : mapRecord.DataPoints[i].UnitSymbol
          }
          this.modBusDataPoints.push(modbusDataPoint);
        }
      }
      this.gridModbusDataPoints.notifyChanges(true);
    }
  }

  private filterRecords() {
    if (!this.dataPointDefinitionModels)
      return; // wait for data points to load

    if (UICommon.IsImportConfig)
      this.setUpMapDetailsForImport();
    else {
      this.filteredRegistersbasedOnRegisterType = null;
      this.modBusDataPoints = [];
      if (this.ModbusDeviceMap != null &&
        this.ModbusDeviceMap.length > 0 &&
        this.ModbusDeviceMap[0].ModbusSlaveRegisterMap != null
        && this.ModbusDeviceMap[0].ModbusSlaveRegisterMap.length > 0
        && this.ModbusDeviceMap[0].ModbusSlaveRegisterMap.find(c => c.RegisterTableType == this.SelectedRegisterType) != null) {
        this.filteredRegistersbasedOnRegisterType = this.ModbusDeviceMap[0].ModbusSlaveRegisterMap.find(c => c.RegisterTableType == this.SelectedRegisterType).DataPoints;
        this.setUpMapDetails();
      }
    }
  }

  private getMapBasedOnMapIDUI(result: any, mapID: number) {
    if (result != null) {
      let modbusDevicemapSlave = new ModbusDeviceConfigurationModelUIExtension();
      modbusDevicemapSlave.ModbusSlaveRegisterMap = new Array();

      //loop to get modbus register map
      for (var key2 in result) {
        let registerMaprecords = result[key2];//api dictionary format.convert it to class format
        if (isNaN(parseInt(registerMaprecords.toString()))) {
          let registerMapUIRecord = new ModbusSlaveRegisterMapUI();
          registerMapUIRecord.RegisterTableType = RegisterTableType[key2];//input or holding register type
          registerMapUIRecord.DataPoints = registerMaprecords;
          modbusDevicemapSlave.ModbusSlaveRegisterMap.push(registerMapUIRecord);
        }
      }
      this.ModbusDeviceMap = [];
      this.ModbusDeviceMap.push(modbusDevicemapSlave);
      this.modbusDeviceMapUpdatedEvent.emit({ mapID: mapID, modbusDeviceMap: modbusDevicemapSlave });
    }
    this.filterRecords();
  }

  postCallGetModbusTemplateDetails(): void {
    this.filterRecords();
  }

  postCallDeviceDataPoints(): void {
    this.dataPointDefinitionModels = this.datapointdefinitions;
    this.filterRecords();
  }

  setUpColumnVisibilty() {
    this.showDataFormat = this.displayType == ModbusPointsDisplayType.PublishingView ? true : false;
    this.columnDescWidth = (this.displayType == ModbusPointsDisplayType.PublishingView || this.displayType == ModbusPointsDisplayType.DefaultMap) ? "47%" : "42%";

    let hideDelete = (this.displayType == ModbusPointsDisplayType.PublishingView || this.displayType == ModbusPointsDisplayType.DefaultMap) ? true : false;
    if (this.gridModbusDataPoints.columns && this.gridModbusDataPoints.columns.length > 0) {
      let colIndex = this.gridModbusDataPoints.columns.findIndex(col => col.header === " "); // Delete column
      this.gridModbusDataPoints.columns[colIndex].hidden = hideDelete;
    }
  }

  private getModbusMapDetials(): void {
    if (UICommon.IsImportConfig) {
      this.initModbusMapTemplateDetails();
    }
    else {
      this.publishingService.getRegisteredModbusTemplateDetailsById(this.modbusId).subscribe(d => {
        this.modbusMap = d;
        this.getMapBasedOnMapIDUI(d, this.modbusId);
      });
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
  
  ngOnDestroy(): void {
    if (this.arrSubscriptions != null && this.arrSubscriptions.length > 0) {
      this.arrSubscriptions.forEach(subscription => {
        if (subscription != null)
          subscription.unsubscribe();
      });
    }

    this.arrSubscriptions = [];
    super.ngOnDestroy();
  }

  ngOnChanges(): void {
    this.getModbusMapDetials();
    this.setUpColumnVisibilty();
    this.deleteSelectedDataPoints();
  }

  ngAfterViewInit(): void {
    this.setUpColumnVisibilty();
    this.deleteSelectedDataPoints();
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.initUnitSystems();
    this.initDeviceDataPoints();

    //this.setUpColumnVisibilty();
    if (!this.showDataFormat) {
      let subscription = this.modbusPointsService.getModbusDataPointsToAdd().subscribe(x => {
        if (x) {
          if (x.modbusId === this.modbusId) {
            x.dataPointsToAdd.forEach(dataPoint => {
              let modbusDataPoint = {
                DeviceId: dataPoint.DeviceId,
                PointIndex: dataPoint.DataPointIndex,
                Address: this.modbusPointsService.formatRegisterValue(dataPoint.StartRegisterAddress, this.SelectedRegisterType),
                DataFormat: this.modbusPointsService.getModbusValueConversionFormatType_Value(dataPoint.SlaveDataType, this.endianness, this.bBytesSwapped),
                DataType: this.modbusPointsService.formatDataType(dataPoint.SlaveDataType),
                Description: dataPoint.TagName,
                Units: dataPoint.UnitSymbol
              };
              this.modBusDataPoints.push(modbusDataPoint);
            });
            this.gridModbusDataPoints.notifyChanges(true);

            if (this.displayType === ModbusPointsDisplayType.BrandNewMap)  // New Map
              this.createNewMaBasedOnAddDataPoints(x.dataPointsToAdd);
            else  // Edit/Modify existing Map
              this.updateMaBasedOnAddDataPoints(x.dataPointsToAdd);
          }
          // console.log(x.modbusId);
        }
      });
      this.arrSubscriptions.push(subscription);
    }
    let subscription = this.publishingService.getModbusDeviceMap().subscribe(() => {
      this.getModbusMapDetials();
      this.setUpColumnVisibilty();
    });
    this.deleteSelectedDataPoints();
    this.arrSubscriptions.push(subscription);
  }
}

class ModbusTemplateDetial {
  Address: string;
  DataFormat: string;
  DataType: string;
  Description: string;
  Units: string;
  DeviceId: number;
  PointIndex: number;
  isChecked?:boolean =false;
  startAddress?:any;
  isSelected?:boolean;
}

export enum ModbusPointsDisplayType {
  PublishingView = 0,
  DefaultMap,
  CustomMap,
  NewMapFromExisting,
  BrandNewMap
}
