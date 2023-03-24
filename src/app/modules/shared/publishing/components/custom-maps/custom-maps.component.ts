import { AfterViewInit, Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTabGroup } from '@angular/material/tabs';
import { GatewayPanelBase } from '@comp/GatewayPanelBase.component';
import { RegisteredModbusMap } from '@core/models/UIModels/RegisteredModbusMap.model';
import { Store } from '@ngrx/store';
import { ButtonActions } from '@shared/gateway-dialogs/components/gateway-advanced-dialog/gateway-advanced-dialog.component';
import { GatewayModalService } from '@shared/gateway-dialogs/services/gatewayModal.service';
import { AddCustomModbusMapComponent } from '../add-custom-modbus-map/add-custom-modbus-map.component';
import { ModbusPointsDisplayType } from '../modbus-template-points/modbus-template-points.component';
import { ModbusMapTemplateUIModel } from '@core/models/UIModels/modbusTemplate.model';
import { PublishingChannelFacade } from '@core/facade/publishingChannelFacade.service';
import { MatButton } from '@angular/material/button';
import { AddEditCustomModbusMapComponent } from '../create-custom-modbus-map/addEdit-custom-modbus-map.component';

@Component({
  selector: 'gw-custom-maps',
  templateUrl: './custom-maps.component.html',
  styleUrls: ['./custom-maps.component.scss']
})
export class CustomMapsComponent extends GatewayPanelBase implements OnInit, AfterViewInit, OnDestroy { 

  @ViewChild('btnSelect')
  btnSelect: MatButton;

  @ViewChild(AddEditCustomModbusMapComponent) addEditCustomModbusMapComponent: AddEditCustomModbusMapComponent;

  mapTemplateList: ModbusMapTemplateUIModel[];
  newModbusMap: RegisteredModbusMap;
  selectedTabIndex = 0;
  displayType: ModbusPointsDisplayType = ModbusPointsDisplayType.DefaultMap;
  isNewMap: boolean = false;
  isEdit: boolean = false;
  hasChanges: boolean = false;
  saveMap: boolean = false;
  tablblAddTemplate: string = "+ Add New Map Template";
  selectedMap: ModbusMapTemplateUIModel;
  selectedMapName: string = "";
  IsDefaultMap: boolean = false;
  isMapUpdated: boolean = false;
  isValid: boolean = false;
  isFormDirty: boolean = false;


  constructor(protected store: Store,
    public dialogRef: MatDialogRef<CustomMapsComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private gwModalService: GatewayModalService,
    private publishingFacade: PublishingChannelFacade) {
    super(store, null, null, null, publishingFacade, null, null);
  }

  modbusMapChanged(bIsMapChanged: boolean) {
    this.hasChanges = bIsMapChanged;
  }
  mapEditUpdated(){
    this.dialogRef.close(this.selectedMap.Id);
  }
  modbusNewMapUpdated() {
    this.isMapUpdated = true;
  }

  updateModbusMap(){
    this.newModbusMap = null;
    this.selectedTabIndex = 0;
    setTimeout(() => {      
      this.selectedTabIndex = this.modbusTemplateDetails.length - 1;
      let modbusMapId = this.mapTemplateList[this.selectedTabIndex].Id;
      this.dialogRef.close(modbusMapId);
    }, 0);
  }

  modbusMapDeleted() {
    this.selectedTabIndex = 0;
  }

  onTabChanged(event) {
    if (event.tab.textLabel === this.tablblAddTemplate) {
      let dialogAddCustomMap = this.gwModalService.openDialogInsideModal(
        null,
        ButtonActions.None,
        AddCustomModbusMapComponent,
        null,
        (result) => {
          if (result) {
            this.newModbusMap = {
              Id: result.modbusMapId,
              MapName: result.mapName,
              MapTypeId : result.mapTypeId
            };
            this.isNewMap = true;
            this.displayType = result.modbusMapId == -1 ? ModbusPointsDisplayType.BrandNewMap : ModbusPointsDisplayType.NewMapFromExisting;
            dialogAddCustomMap.close();
          }
          else {
            this.isNewMap = false;
            this.selectedTabIndex = 0;
            dialogAddCustomMap.close();
          }
        },
        '390px',
      );
    }
    else {
      this.btnSelect.focus();
      // this.displayType = this.getCustomMapType();
      this.isNewMap = false;
    }
  }

  OnCancel(): void {
    this.dialogRef.close();
  }

  OnOk() {
    let modbusMapId = this.mapTemplateList[this.selectedTabIndex].Id;
    if (this.hasChanges) {  // custom modbus has changes - ask to Save here
      this.gwModalService.openDialog(
        `Changes have been made to ${this.mapTemplateList[this.selectedTabIndex].MapName}.
        <br>Do you want to save the changes?</br>`,
        () => this.gwModalService.closeModal(),   // Yes - save changes first   
        () => {
          this.gwModalService.closeModal();
          this.dialogRef.close(modbusMapId);  // No - discard changes and close dialog
        },
        'Warning',
        null,
        true,
        "Save",
        "Cancel"
      );
    }
    else
      this.dialogRef.close(modbusMapId);  // close dialog
  }

  private getCustomMapType(mapId): ModbusPointsDisplayType {
    // let mapId = this.mapTemplateList[this.selectedTabIndex].Id;
    let indexMap = GatewayPanelBase.DefaultModbusMapdIds.findIndex(m => m == mapId) ?? -1;
    return indexMap === -1 ? ModbusPointsDisplayType.CustomMap : ModbusPointsDisplayType.DefaultMap;
  }

  postCallGetModbusTemplateDetails() {   
    this.selectedTabIndex = this.modbusTemplateDetails.findIndex((value) => value.Id === this.data.modbusMap.Id);
    this.mapTemplateList = this.modbusTemplateDetails;
    this.isEdit = this.data.isEdit;
    if (this.isEdit) {
      this.displayType = this.getCustomMapType(this.data.modbusMap.Id) === ModbusPointsDisplayType.CustomMap ? ModbusPointsDisplayType.CustomMap : ModbusPointsDisplayType.DefaultMap;
    } else {
      this.displayType = this.data.modbusMap.Id <= -1 ? ModbusPointsDisplayType.BrandNewMap : ModbusPointsDisplayType.NewMapFromExisting;
    }
    this.IsDefaultMap = this.displayType == ModbusPointsDisplayType.DefaultMap ? true : false;
    this.selectedMap = this.data.modbusMap;
    this.selectedMapName = this.data.modbusMap.MapName;
    if(this.isMapUpdated){
      this.updateModbusMap();
    }    
  }

  validationMessage(valid){
    this.isValid = valid;
  }

  isFormDirtyEvent(valid){
    this.isFormDirty = valid;
  }
  
  saveMapData() {
    this.addEditCustomModbusMapComponent.onSaveMap();
  }
  ngAfterViewInit(): void {

    /* if (!this.matTabGroupCustomMap) {
      throw Error('ViewChild(matTabGroupCustomMap) matTabGroupCustomMap is not defined.');
    }

    this.matTabGroupCustomMap._handleClick = (tab, header, index) => {
      if (this.selectedTabIndex === index)
        return;

      if (this.hasChanges) {  // custom modbus has changes - ask to Save here
        this.saveMap = false;
        let mapName = this.isNewMap ? this.newModbusMap.MapName : this.mapTemplateList[this.selectedTabIndex].MapName;
        this.gwModalService.openDialog(
          `Changes have been made to ${mapName}.<br>Do you want to save the changes?</br>`,
          () => {
            this.gwModalService.closeModal();   // Yes - don't allow selected Tab changed event
            this.saveMap = true;                // Save Map before changing tab
            this.selectedTabIndex = index;      // No - set selected Tab to new index
          },
          () => {
            this.gwModalService.closeModal();
            this.selectedTabIndex = index;      // No - set selected Tab to new index
          },
          'Warning',
          null,
          true,
          "Save",
          "Cancel"
        );
      }
      else {
        this.selectedTabIndex = index;  // No - set selected Tab to new index
      }
    }; */
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.initModbusMapTemplateDetails();
  }
}
