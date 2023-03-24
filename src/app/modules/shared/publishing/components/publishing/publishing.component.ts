import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';

import { CommunicationChannelType, deleteUIModal, UICommon } from '@core/data/UICommon';
import { GatewayPanelBase } from '@comp/GatewayPanelBase.component';
import { PublishingDataUIModel } from '@core/models/UIModels/dataPublishing.model';
import { ValidationService } from '@core/services/validation.service';
import { GatewayModalService } from '@shared/gateway-dialogs/services/gatewayModal.service';
import { PublishingChannelFacade } from '@core/facade/publishingChannelFacade.service';
import * as _ from 'lodash';
import { PublishingErrorNotifierModel } from '@core/models/UIModels/error-notifier-model';
import { PanelConfigurationFacade } from '@core/facade/panelConfigFacade.service';
import { ButtonActions } from '@shared/gateway-dialogs/components/gateway-advanced-dialog/gateway-advanced-dialog.component';
import { AddCustomModbusMapComponent } from '../add-custom-modbus-map/add-custom-modbus-map.component';
import { RegisteredModbusMap } from '@core/models/UIModels/RegisteredModbusMap.model';
import { ModbusPointsDisplayType } from '../modbus-template-points/modbus-template-points.component';
import { CustomMapsComponent } from '../custom-maps/custom-maps.component';
import { MapTemplateDetailsComponent } from '../map-template-details/map-template-details.component';


@Component({
  selector: 'gw-publishing',
  templateUrl: './publishing.component.html',
  styleUrls: ['./publishing.component.scss']
})
export class PublishingComponent extends GatewayPanelBase implements OnInit, OnDestroy {

  @ViewChild("mapTemplateComponent")
  mapTemplateComponent: MapTemplateDetailsComponent;

  bIsUnloading = false;
  isFormValid = false;
  hasPublishingChanged = false;
  backBtnVisibility = true;
  bShowBackButton = true;
  bShowDeleteButton: boolean = true;
  publishing: PublishingDataUIModel;
  publishingToUpdate: any;
  selectedTabIndex = 0;
  actionBtnTxt = 'Create Publishing';
  sideNavBtnTxt = 'Add Publishing';
  publishingName = 'New Publishing';
  isConfigSaved = false;
  hasPublishingErrors = false;

  panelTypeId: number;
  publishingId: number;
  private nextPubId: number;
  private prevPubId: number;
  private currentPubIndex: number;
  private arrSubscriptions: Subscription[] = [];
  isImportVisible: boolean = false;


  constructor(protected store: Store,
    private router: Router,
    protected route: ActivatedRoute,
    private panelConfigFacade: PanelConfigurationFacade,
    private publishingFacade: PublishingChannelFacade,
    private validationService: ValidationService,
    private gwModalService: GatewayModalService) {
    super(store, panelConfigFacade, null, null, publishingFacade, null, null);
  }

  postCallGetDataPublishing() {

    if (this.bIsUnloading) {
      return;
    }

    this.currentPubIndex = -1;
    if (!this.publishingId) {
      this.publishing = this.publishingFacade.getNewDataPublishing(this.panelTypeId, this.publishingEntity.length + 1, 0);
      this.hasPublishingChanged = true;
      this.bShowBackButton = false;
    } else {
      if (this.publishingEntity && this.publishingEntity.length > 0) {
        this.publishing = new PublishingDataUIModel();
        this.currentPubIndex = this.publishingEntity
          .findIndex(x => x.Id === this.publishingId);

        if (this.currentPubIndex === -1) {  // Data Publishing does not exist - Navigate to Add Publishing page
          let panelTypeName = UICommon.getPanelType(this.panelTypeId, true).name;
          this.router.navigate([`${panelTypeName}/publishing`]);
          return;
        }

        this.publishing = _.cloneDeep(this.publishingEntity[this.currentPubIndex]);
        this.publishingName = this.publishingFacade.getPublishingName(this.publishing).Name;
        if (this.publishing.Channel.channelType == CommunicationChannelType.SERIAL) 
          this.publishing.Channel.IdCommConfig = -1;

        this.nextPubId = this.currentPubIndex + 1 < this.publishingEntity.length ? this.publishingEntity[this.currentPubIndex + 1].Id : null;
        this.prevPubId = this.currentPubIndex > 0 ? this.publishingEntity[this.currentPubIndex - 1].Id : null;

        //this.prevPubCount = this.currentPubIndex > 0 ? this.publishingEntity[this.currentPubIndex - 1].Id  : 0;
        this.bShowBackButton = this.prevPubId ? true : false;
      }
      // else {
      //   this.router.navigate(['incharge/dashboard']);
      // }
    }
    this.setSaveButtonText();
  }

  onTabChanged(event): void {
    this.setSaveButtonText(event.tab.textLa);
  }

  isFormValidEvent(isFormValid: boolean) {
    this.isFormValid = isFormValid;
  }

  publishingFormInvalidEvent(error: PublishingErrorNotifierModel[]) {
    this.hasPublishingErrors = error?.length > 0;
    this.publishing.Error = error;
  }

  hasPublishingChangedEvent(hasChanged: boolean) {
    this.hasPublishingChanged = hasChanged;
    this.publishing.IsDirty = this.publishing.IsDirty || hasChanged;
  }

  hasPublishingUpdatedEvent(data: any) {
    this.publishingToUpdate = data;
    if (this.publishingToUpdate && this.publishingToUpdate.Channel.channelType === CommunicationChannelType.SERIAL) {
      this.publishingToUpdate.Channel.ComPort = parseInt(this.publishingToUpdate.Channel.ComPort, 10);
      this.publishingToUpdate.Channel.BaudRate = parseInt(this.publishingToUpdate.Channel.BaudRate, 10);
      this.publishingToUpdate.Channel.TimeoutInMs = this.publishingToUpdate.Channel.TimeoutInMs ?? 0;
      this.publishingToUpdate.Channel.Retries = this.publishingToUpdate.Channel.Retries ?? 0;
    }
    this.publishing = this.publishingToUpdate;
    if (this.publishing) { this.publishing.IsDirty = this.publishing.IsDirty || this.hasPublishingChanged; }
  }

  private setSaveButtonText(tabName: string = null) {
    this.actionBtnTxt = this.publishingId ? 'Next' : 'Create Publishing';
    if (this.selectedTabIndex !== 0) {
      this.actionBtnTxt = (this.nextPubId == null && this.selectedTabIndex == 1) ? 'Done' : 'Next';
    }
    this.bShowDeleteButton = this.selectedTabIndex == 0 ? (this.publishingId ? true : false) : false;
  }


  private savePublishing() {
    this.publishing.IsValid = true;
    const errMssg = this.publishingFacade.validateDataPublishing(this.publishing);
    if (errMssg) {
      this.publishing.IsValid = false;
    }
    this.publishingId = this.publishing.Id;
    this.publishingFacade.saveDataPublishing(this.publishing);
  }


  saveDataPubBtnClick(): void {
    if (this.publishing) {
      this.savePublishing();
      if (this.publishing.Id < 0) // New Publishing
        this.router.navigated = false;

      if (this.selectedTabIndex !== 0) {
        let panelTypeName = UICommon.getPanelType(this.panelTypeId, true).name;
        if (this.nextPubId) {
          this.router.navigate([`${panelTypeName}/publishing`, this.nextPubId]);
        } else {
          this.router.navigate([`${panelTypeName}/dashboard`]);
        }
      } else {
        this.selectedTabIndex += 1;
      }
    }
  }

  private navigateOnDelete(): void {
    let panelTypeName = UICommon.getPanelType(this.panelTypeId, true).name;
    if (this.nextPubId == null && this.prevPubId == null) {
      this.router.navigate([`${panelTypeName}/publishing`]);
    }
    else if (this.nextPubId != null) {
      this.router.navigate([`${panelTypeName}/publishing`, this.nextPubId]);
    }
    else {
      this.router.navigate([`${panelTypeName}/publishing`, this.prevPubId]);
    }
  }

  deletePublishingClick(): void {
    if (this.publishing) {
      this.gwModalService.openDialog(
        `Do you want to delete the channel '${this.publishing.Name}'?`,
        () => {
          this.gwModalService.closeModal();
          this.publishingFacade.deleteDataPublishing(this.publishingId, this.publishing);
          this.navigateOnDelete();
        },
        () => this.gwModalService.closeModal(),
        deleteUIModal.title,
        null,
        true,
        deleteUIModal.primaryBtnText,
        deleteUIModal.secondaryBtnText
      );
    }
  }

  createPublishing(): void {

  }

  onBackBtnClick(): void {

    if (this.selectedTabIndex > 0) {
      this.selectedTabIndex -= 1;
    } else {
      if (this.prevPubId) {
        let panelTypeName = UICommon.getPanelType(this.panelTypeId, true).name;
        // this.router.navigate([`${panelTypeName}/publishing`],
        //   { queryParams: { selectedId: this.prevPubId, selectedChild: 0 } });
        this.router.navigate([`${panelTypeName}/publishing`,this.prevPubId]);
      }
    }
  }

  private setDefaultModbusMaps() {
    GatewayPanelBase.DefaultModbusMapdIds = [];
    GatewayPanelBase.DefaultModbusMapdIds.push(1);  // SureSENS Default Map
    GatewayPanelBase.DefaultModbusMapdIds.push(5);  // InCHARGE Default Map
    GatewayPanelBase.DefaultModbusMapdIds.push(2);  // InFORCE Default Map
    GatewayPanelBase.DefaultModbusMapdIds.push(6);  // Multinode Default Map
    GatewayPanelBase.DefaultModbusMapdIds.push(7);  // Saudi Aramco iField Default Map
  }

  loadDataPublishing() {
    this.route.queryParams.subscribe(params => {
      if (params && params.selectedId) {
        this.publishingId = parseInt(params.selectedId, 10);
        this.selectedTabIndex = params.selectedChild ? parseInt(params.selectedChild, 10) : 0;
        this.initDataPublishing();
      } else {
        this.getParameter();
      }
    });
  }

  getParameter(): void {
    this.route.params.subscribe(params => {
      this.publishingId = parseInt(params.Id, 10);
      this.selectedTabIndex = 0;
      this.initDataPublishing();
    });
  }

  postCallGetPanelConfigurationCommon(): void {
    if (this.panelConfigurationCommonState.panelConfigurationCommon.Id > 0) {
      this.isConfigSaved = true;
    }
    this.panelTypeId = this.panelConfigurationCommonState.panelConfigurationCommon.PanelTypeId;
  }

  showNewCustomMapDialog() {
    this.gwModalService.openAdvancedDialog(
      null,
      ButtonActions.None,
      AddCustomModbusMapComponent,
      null,
      (result) => {
        if (result) {
          const dialogData = {
            isEdit: false, modbusMap: {
              Id: result.modbusMapId,
              MapName: result.mapName,
              MapTypeId : result.mapTypeId
            }
          }
          this.gwModalService.closeModal();
          this.onAddCustomMap(dialogData);
        }
        else {
          this.gwModalService.closeModal();
        }
      },
      '390px',
    );
  }

  onAddCustomMap(mapTemplate) {
    const mapName = mapTemplate.modbusMap.MapName ? mapTemplate.modbusMap.MapName : "Custom Map";
    this.gwModalService.openAdvancedDialog(
      mapName,
      ButtonActions.None,
      CustomMapsComponent,
      mapTemplate,
      result => {
        if (result) {
          // this.checkIfMapDeleted(); 
          this.publishing.IsDirty = this.publishing.IsDirty || (this.publishing.RegisteredModbusMapId != result ? true : false);
          this.publishing.RegisteredModbusMapId = result;
          if (this.mapTemplateComponent) {
            this.mapTemplateComponent.checkMapAlreadyUsed();
            this.mapTemplateComponent.checkIfDefaultMap();
          }
        }
      },
      '1224px',
      '95vw'
    );
  }

  editMap(modbusMap) {
    const dialogData = {
      isEdit: true, modbusMap: modbusMap
    }
    this.onAddCustomMap(dialogData);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.initPanelConfigurationCommon();
    this.loadDataPublishing();
    this.setDefaultModbusMaps();
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.isImportVisible = UICommon.IsImportConfig && isNaN(this.publishingId);
  }

  ngOnDestroy(): void {
    this.bIsUnloading = true;
    if (this.arrSubscriptions != null && this.arrSubscriptions.length > 0) {
      this.arrSubscriptions.forEach(subscription => {
        if (subscription != null) {
          subscription.unsubscribe();
        }
      });
    }

    this.arrSubscriptions = [];
    this.validationService.clearError();
    if (this.currentPubIndex !== -1) {
      this.savePublishing();
    }
    super.ngOnDestroy();
  }
}
