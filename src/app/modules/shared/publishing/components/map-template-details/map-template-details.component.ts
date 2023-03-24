import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatSelect } from '@angular/material/select';
import { GatewayPanelBase, IPublishingBase } from '@comp/GatewayPanelBase.component';
import { deleteUIModal, PanelTypeList, UICommon } from '@core/data/UICommon';
import { PublishingChannelFacade } from '@core/facade/publishingChannelFacade.service';
import { PublishingDataUIModel } from '@core/models/UIModels/dataPublishing.model';
import { ModbusMapTemplateUIModel } from '@core/models/UIModels/modbusTemplate.model';
import { RegisteredModbusMap } from '@core/models/UIModels/RegisteredModbusMap.model';
import { Store } from '@ngrx/store';
import { ButtonActions } from '@shared/gateway-dialogs/components/gateway-advanced-dialog/gateway-advanced-dialog.component';
import { GatewayModalService } from '@shared/gateway-dialogs/services/gatewayModal.service';
import { IServerRunningStatusState } from '@store/state/serverRunningStatus.state';
import { Observable, Subscription } from 'rxjs';
import { CustomMapsComponent } from '../custom-maps/custom-maps.component';
import * as ACTIONS from '@store/actions/mapTemplateDetails.action';
import { PublishingChannelService } from '@core/services/publishingChannel.service';
import { String } from 'typescript-string-operations';
import { ModbusPointsDisplayType } from '../modbus-template-points/modbus-template-points.component';

@Component({
  selector: 'gw-map-template-details',
  templateUrl: './map-template-details.component.html',
  styleUrls: ['./map-template-details.component.scss']
})
export class MapTemplateDetailsComponent extends GatewayPanelBase implements OnInit, OnDestroy, OnChanges, IPublishingBase {

  @ViewChild('RegisteredModbusMap')
  RegisteredModbusMap: MatSelect;

  @Input()
  publishing: PublishingDataUIModel;

  @Output()
  showCustomMapDialogEvent = new EventEmitter();

  @Output()
  editMapEvent = new EventEmitter();

  mapTemplateList: ModbusMapTemplateUIModel[];
  endianness: number;
  bBytesSwapped: boolean;
  refresh: boolean = false;
  isImportConfig: boolean = false;
  selectedMapName: string;
  isConfigSaveInProgress: boolean = false;
  IsDefaultMap: boolean = false;
  isMapAlreadyUsed: boolean = false;
  mapTypeId:number;
  serverRunningStatusState$: Observable<IServerRunningStatusState>;
  private arrSubscriptions: Subscription[] = [];

  constructor(protected store: Store,
    private gwModalService: GatewayModalService,
    private publishingService: PublishingChannelService,
    private publishingFacade: PublishingChannelFacade) {
    super(store, null, null, null, publishingFacade, null, null);
    this.serverRunningStatusState$ = this.store.select<any>((state: any) => state.serverRunningStatusState);
  }

  onMapTemplateChange(event) {
    this.publishing.RegisteredModbusMapId = event.value;
    const mapName = this.mapTemplateList.find(map => map.Id === event.value).MapName;
    this.mapTypeId = this.mapTemplateList.find(map => map.Id === event.value).MapTypeId;
    this.publishing.MapType = mapName;
    this.selectedMapName = mapName;
    this.publishing.IsDirty = true;
    this.checkIfDefaultMap();
    this.checkMapAlreadyUsed();
  }
  showNewCustomMapDialog() {
    if (this.isConfigSaveInProgress) return;
    this.showCustomMapDialogEvent.emit();
    this.RegisteredModbusMap && this.RegisteredModbusMap.close();
  }

  modbusDeviceMapUpdated(event) {
    if (event && event.mapID && event.modbusDeviceMap) {
      this.publishing.ModbusDeviceMap = [];
      this.publishing.ModbusDeviceMap.push(event.modbusDeviceMap);
      this.publishing.RegisteredModbusMapId = event.mapID;//default map ID
      const mapName = this.mapTemplateList.find(map => map.Id === event.mapID).MapName;
      this.selectedMapName = mapName;
    }
  }

  private checkIfMapDeleted() {
    let inx = this.mapTemplateList.findIndex(m => m.Id === this.publishing.RegisteredModbusMapId) ?? -1;
    if (inx == -1) {  // map deleted
      this.publishing.RegisteredModbusMapId = this.panelConfigurationCommonState.panelConfigurationCommon.PanelTypeId === PanelTypeList.SURESENS ? 1 : 5;  // Default InCharge Map
    }
  }

  postCallGetModbusTemplateDetails() {
    this.mapTemplateList = this.modbusTemplateDetails;
    if (this.publishing?.RegisteredModbusMapId) {
      this.setTooltipText(this.publishing.RegisteredModbusMapId);
    }
    if(this.publishing?.MapType){
      this.mapTypeId = this.mapTemplateList.find(map => map.Id === this.publishing.RegisteredModbusMapId).MapTypeId;
    }
  }

  setTooltipText(mapId) {
    const map = this.mapTemplateList.find(m => m.Id == mapId);
    this.selectedMapName = map ? map.MapName : null;
  }

  onEditMap() {
    this.mapTypeId = this.mapTemplateList.find(map => map.MapName === this.selectedMapName).MapTypeId;
    const modMap: RegisteredModbusMap = { Id: this.publishing.RegisteredModbusMapId, MapName: this.selectedMapName, MapTypeId: this.mapTypeId }
    this.editMapEvent.emit(modMap);
  }

  private subscribeToServerRunningStatus(): void {
    const subscription = this.serverRunningStatusState$.subscribe(
      (state: IServerRunningStatusState) => {
        if (state) {
          this.isConfigSaveInProgress = state.ConfigurationSavingInProgress;
        }
      }
    );
    this.arrSubscriptions.push(subscription);
  }

  onDeleteMap() {
    this.gwModalService.openDialog(
      `Do you want to delete custom map '${this.selectedMapName}'?`,
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
    this.publishingService.deleteModbusMap(this.publishing.RegisteredModbusMapId).subscribe(r => {
      this.store.dispatch(ACTIONS.MAPTEMPLATES_LOAD());
      // this.mapDeletedEmitter.emit();
      this.publishing.RegisteredModbusMapId = this.mapTemplateList[0].Id;
      this.checkIfDefaultMap();
      UICommon.isBusyWaiting = false;
    },
      error => {
        // console.log(error);
        UICommon.isBusyWaiting = false;
      })
  }

  private getCustomMapType(mapId): ModbusPointsDisplayType {
    let indexMap = GatewayPanelBase.DefaultModbusMapdIds.findIndex(m => m == mapId) ?? -1;
    return indexMap === -1 ? ModbusPointsDisplayType.CustomMap : ModbusPointsDisplayType.DefaultMap;
  }

  checkMapAlreadyUsed() {
    let currentPublishing = this.publishingEntity?.find(p => p.RegisteredModbusMapId === this.publishing.RegisteredModbusMapId);
    let pub = this.publishingEntity?.filter(p => p.RegisteredModbusMapId === this.publishing.RegisteredModbusMapId) ?? [];
    if (currentPublishing && currentPublishing.Id < 0) {
      this.isMapAlreadyUsed = false;
    } else {
      if (pub && pub.length > 0) {
        this.isMapAlreadyUsed = true;
      } else {
        this.isMapAlreadyUsed = false;
      }
    }
  }

  checkIfDefaultMap() {
    this.IsDefaultMap = this.getCustomMapType(this.publishing.RegisteredModbusMapId) == ModbusPointsDisplayType.DefaultMap ? true : false;
  }

  postCallGetDataPublishing() {
    this.checkMapAlreadyUsed();
  }

  ngOnChanges(): void {
    this.checkIfDefaultMap();
    this.checkMapAlreadyUsed();
    this.endianness = this.publishing.WordOrder == UICommon.WordOrderTypes[0] ? 2 : 1;
    if (this.endianness == 2) { //MSW-LSW
      if (this.publishing.ByteOrder == UICommon.ByteOrderTypes[0])//MSB-LSB
        this.bBytesSwapped = false;
      else
        this.bBytesSwapped = true;
    }
    else {  //LSW-MSW
      if (this.publishing.ByteOrder == UICommon.ByteOrderTypes[0])//MSB-LSB
        this.bBytesSwapped = true;
      else
        this.bBytesSwapped = false;
    }
  }

  ngOnDestroy(): void {
    if (this.arrSubscriptions != null && this.arrSubscriptions.length > 0) {
      this.arrSubscriptions.forEach((subscription) => {
        if (subscription !== null) {
          subscription.unsubscribe();
        }
      });
    }
    this.arrSubscriptions = [];
    super.ngOnDestroy();
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.initDataPublishing();
    this.initModbusMapTemplateDetails();
    this.subscribeToServerRunningStatus();
    this.isImportConfig = UICommon.IsImportConfig;
  }
}


