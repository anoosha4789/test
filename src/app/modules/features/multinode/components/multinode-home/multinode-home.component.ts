import { Component, OnDestroy, OnInit } from '@angular/core';
import { GatewayPanelBase } from '@comp/GatewayPanelBase.component';
import { PANEL_ROUTES, UICommon } from '@core/data/UICommon';
import { DataLoggerFacade } from '@core/facade/dataLoggerFacade.service';
import { DataSourceFacade } from '@core/facade/dataSourceFacade.service';
import { PanelConfigurationFacade } from '@core/facade/panelConfigFacade.service';
import { PublishingChannelFacade } from '@core/facade/publishingChannelFacade.service';
import { SieFacade } from '@core/facade/sieFacade.service';
import { WellFacade } from '@core/facade/wellFacade.service';
import { PublishingDataUIModel } from '@core/models/UIModels/dataPublishing.model';
import { DataSourceUIModel } from '@core/models/UIModels/dataSource.model';
import { CustomDataLoggerConfiguration } from '@core/models/webModels/DataLogger.model';
import { SieModel } from '@core/models/webModels/Sie.model';
import { MultiNodeWellDataUIModel } from '@core/models/webModels/WellDataUIModel.model';
import { GwSideNavigationService } from '@core/services/gw-side-navigation.service';
import { UtilityService } from '@core/services/utility.service';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-multinode-home',
  templateUrl: './multinode-home.component.html',
  styleUrls: ['./multinode-home.component.scss']
})
export class MultinodeHomeComponent extends GatewayPanelBase implements OnInit, OnDestroy {
  stepper: any;
  navItems: any;
  sies: SieModel[] = [];
  private arrSubscriptions: Subscription[] = [];
  wellList: MultiNodeWellDataUIModel[] = [];
  dataSources: DataSourceUIModel[];
  publishingList: PublishingDataUIModel[] = [];
  dataLoggerList: CustomDataLoggerConfiguration[] = [];
  constructor(protected store: Store,
    private panelConfigFacade: PanelConfigurationFacade,

    private gwSideNavigationService: GwSideNavigationService,
    private utilService: UtilityService,
    private wellDataFacade: WellFacade,
    private dataSourceFacade: DataSourceFacade,
    private publishingFacade: PublishingChannelFacade,
    dataLoggerFacade: DataLoggerFacade,
    protected sieFacade: SieFacade) {
    super(store, panelConfigFacade, wellDataFacade, dataSourceFacade, publishingFacade, null, null, null, dataLoggerFacade,sieFacade);
  }

  private setUpSideNavigation() {
    const sideNavData = this.gwSideNavigationService.constructSideNavigation(PANEL_ROUTES.MULTINODE, this.wellList, this.dataSources, this.publishingList, this.dataLoggerList,this.sies);
    this.navItems = sideNavData.navItems;
    this.stepper = sideNavData.stepper;
  }
  postCallGetPanelConfigurationCommon(): void {
    GatewayPanelBase.ShowNavigation = GatewayPanelBase.ShowNavigation || this.panelConfigurationCommonState.panelConfigurationCommon.Id > 0 ? true : false;
    this.setUpSideNavigation();    
  }
  postCallGetSie(){
    this.sies = this.sieEntity ?? [];
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
    this.initDataSources();
    this.initSie();
    this.initDataLoggers();
    if (UICommon.IsImportConfig || UICommon.IsConfigSaved) {
      this.initDataPublishing();
    }
  }
}
