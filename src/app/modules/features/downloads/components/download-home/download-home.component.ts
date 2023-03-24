import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Store } from '@ngrx/store';
import { NavItem } from 'bh-theme';

import { PanelTypeList, UICommon } from '@core/data/UICommon';
import { Router } from '@angular/router';
import { GatewayPanelBase } from '@comp/GatewayPanelBase.component';
import { PanelConfigurationFacade } from '@core/facade/panelConfigFacade.service';
// import { ReportService } from '@core/services/report.service';
// import { take } from 'rxjs/operators';
// import { PublishingChannelFacade } from '@core/facade/publishingChannelFacade.service';
// import { PanelConfigurationFacade } from '@core/facade/panelConfigFacade.service';
// import { PanelTypeList } from '@core/data/UICommon';
// import { forkJoin, Observable, Subscription } from 'rxjs';
@Component({
  selector: 'app-download-home',
  templateUrl: './download-home.component.html',
  styleUrls: ['./download-home.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DownloadHomeComponent extends GatewayPanelBase implements OnInit, OnDestroy {

  activeTabIndex = 0;

  panelConfig: any;

  navItems: NavItem[] = [];
  // childnavItems: NavItem[] = [];
  // private arrSubscriptions: Subscription[] = [];
  // private hasAlarms: boolean= false;
  // private hasshifts:boolean= false;

  // constructor(
  //   private publishingFacade: PublishingChannelFacade,
  //   private reportService: ReportService,
  //   private panelConfigFacade: PanelConfigurationFacade,
  //   private router: Router) {
  //    }

  constructor(protected store: Store, private router: Router,
    private panelConfigFacade: PanelConfigurationFacade,) {
    super(store, panelConfigFacade, null, null, null, null, null, null, null);
  }

  onTabChanged(event) {
  }
  // getSubmenuInfo(): Observable<any[]> {
  //   let responsealarms = this.reportService.getAlarmHistoryData();
  //   let responseshifts = this.reportService.getShiftHistoryData();
  //   return forkJoin([responsealarms, responseshifts]);
  // }
  setSideNavItems() {
    // this.setDownloadSubmenu();

    this.navItems.push(
      {
        parent: null,
        displayName: 'Reports',
        iconName: 'description',
        route: 'downloads/reports',
        children: [],
      }
    );

    if (this.panelConfigurationCommonState?.panelConfigurationCommon?.PanelTypeId === PanelTypeList.MultiNode) {
      this.navItems.push(
        {
          parent: null,
          displayName: 'Backup',
          iconName: 'download',
          route: 'downloads/backup',
          children: [],
        }
      );
    }

  }
  public postCallGetPanelConfigurationCommon(): void {
    if (UICommon.IsConfigSaved) this.setSideNavItems();
  }
  // setDownloadSubmenu(){

  //   this.childnavItems = [
  //     {
  //       parent: 'Reports',
  //       displayName: 'Configuration Report',
  //       iconName: 'receipt_long',
  //       route: 'downloads/reports/configuration'
  //     }
  //   ];

  //   this.publishingFacade?.initDataPublishing().subscribe(res => {
  //     if(Array.isArray(res) && res.length) {
  //       this.childnavItems.splice(1,0,
  //         {
  //           parent: 'Reports',
  //           displayName: 'Modbus Map',
  //           iconName: 'receipt_long',
  //           route: 'downloads/reports/modbusmap'
  //         })
  //       }
  //     })
  //     const panelTypeId = this.panelConfigFacade.getPanelTypeId();
  //     if(panelTypeId==PanelTypeList.INFORCE){
  //       if(this.hasAlarms){
  //         this.childnavItems.push(
  //           {
  //             parent: 'Reports',
  //             displayName: 'Alarm history Report',
  //             iconName: 'receipt_long',
  //             route: 'downloads/reports/alarmhistory'
  //           })
  //       }
  //       if(this.hasshifts){
  //         this.childnavItems.push(
  //           {
  //             parent: 'Reports',
  //             displayName: 'Shift history Report',
  //             iconName: 'receipt_long',
  //             route: 'downloads/reports/shifthistory'
  //           }
  //         )
  //       }
  //   }
  // }

  ngOnInit(): void {
    this.router.onSameUrlNavigation = "ignore"
    this.navItems = [
      {
        parent: null,
        displayName: 'Data Files',
        iconName: 'folder',
        route: 'downloads/datafiles',
        children: [],
      }
    ];

    this.initPanelConfigurationCommon();
  }

}
