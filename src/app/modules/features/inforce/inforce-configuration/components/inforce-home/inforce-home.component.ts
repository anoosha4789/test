import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';

import { DataSourceUIModel } from '@core/models/UIModels/dataSource.model';
import { PublishingDataUIModel } from '@core/models/UIModels/dataPublishing.model';
import { SerialPortCommunicationChannelDataUIModel } from '@core/models/webModels/SerialPortCommunicationChannelDataUIModel.model';
import { InforceWellUIModel } from '@core/models/UIModels/InforceWell.model';
import { CommunicationChannelType, PANEL_ROUTES, SerialPortInUse, SerialPortPurpose, UICommon } from '@core/data/UICommon';

import { GatewayPanelBase, ICommunicationBase } from '@comp/GatewayPanelBase.component';
import { PanelConfigurationFacade } from '@core/facade/panelConfigFacade.service';
import { WellFacade } from '@core/facade/wellFacade.service';
import { DataSourceFacade } from '@core/facade/dataSourceFacade.service';
import { PublishingChannelFacade } from '@core/facade/publishingChannelFacade.service';
import { GwSideNavigationService } from '@core/services/gw-side-navigation.service';
import { UtilityService } from '@core/services/utility.service';
import { CustomDataLoggerConfiguration } from '@core/models/webModels/DataLogger.model';
import { DataLoggerFacade } from '@core/facade/dataLoggerFacade.service';
@Component({
  selector: 'gw-inforce-home',
  templateUrl: './inforce-home.component.html',
  styleUrls: ['./inforce-home.component.scss']
})

export class InforceHomeComponent extends GatewayPanelBase implements OnInit, OnDestroy, ICommunicationBase {

  stepper: any;
  navItems: any;
  wellList: InforceWellUIModel[] = [];
  dataSources: DataSourceUIModel[] = [];
  publishingList: PublishingDataUIModel[] = [];
  dataLoggerList: CustomDataLoggerConfiguration[] = [];
  private arrSubscriptions: Subscription[] = [];

  constructor(protected store: Store,
    private panelConfigFacade: PanelConfigurationFacade,
    private wellDataFacade: WellFacade,
    private dataSourceFacade: DataSourceFacade,
    private publishingFacade: PublishingChannelFacade,
    private gwSideNavigationService: GwSideNavigationService,
    private utilService: UtilityService,
    dataLoggerFacade: DataLoggerFacade) {
    super(store, panelConfigFacade, wellDataFacade, dataSourceFacade, publishingFacade, null, null, null, dataLoggerFacade);
  }

  private setUpSideNavigation() {
    const sideNavData = this.gwSideNavigationService.constructSideNavigation(PANEL_ROUTES.INFORCE_CONFIGURATION, this.wellList, this.dataSources, this.publishingList, this.dataLoggerList,null);
    this.navItems = sideNavData.navItems;
    this.stepper = sideNavData.stepper;
  }

  postCallGetPanelConfigurationCommon(): void {
    GatewayPanelBase.ShowNavigation = GatewayPanelBase.ShowNavigation || this.panelConfigurationCommonState.panelConfigurationCommon.Id > 0 ? true : false;
  }

  postCallGetWells(): void {
    this.wellList = this.wellEnity ?? [];
    this.setUpSideNavigation();
  }

  postCallGetDataSources(): void {
    this.dataSources = this.dataSourcesEntity ?? [];
    this.utilService.setComPortsInUse_DataSource(this.dataSources);
    this.utilService.setIpAddressInUse_DataSource(this.dataSources);
    this.utilService.setIpPortsInUse_DataSource(this.dataSources);
    this.setUpSideNavigation();
  }

  postCallGetDataPublishing(): void {
    this.publishingList = this.publishingEntity ?? [];
    this.utilService.setComPortsInUse_Publishing(this.publishingList);
    this.utilService.setIpAddressInUse_Publishing(this.publishingList);
    this.utilService.setIpPortsInUse_Publishing(this.publishingList);
    this.setUpSideNavigation();
  }

  postCallGetDataLoggers() {
    this.dataLoggerList = this.dataLoggerEntity ?? [];
    this.setUpSideNavigation();
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

  ngOnInit() {
    super.ngOnInit();
    this.initPanelConfigurationCommon();
    this.initWells();
    this.initDataSources();
    if (UICommon.IsImportConfig || UICommon.IsConfigSaved) {
      this.initDataPublishing();
      this.initDataLoggers();
    }
  }
}
