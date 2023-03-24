import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { NavItem } from 'bh-theme';
import { Subscription } from 'rxjs';
import { BuiltInDeviceType } from '@core/models/webModels/DeviceInfo.model';

import * as _ from 'lodash';
import { GatewayPanelBase } from '@comp/GatewayPanelBase.component';
import { DeviceDataPointsFacade } from '@core/facade/deviceDataPointsFacade.service';
import { NavigationStart, Router } from '@angular/router';

@Component({
  selector: 'app-diagnostics-home',
  templateUrl: './diagnostics-home.component.html',
  styleUrls: ['./diagnostics-home.component.scss'],
})
export class DiagnosticsHomeComponent
  extends GatewayPanelBase
  implements OnInit, OnDestroy {
  private arrSubscriptions: Subscription[] = [];
  private deviceTypeIconMap: Map<number, string>;
  private routerEventSubscription: Subscription;

  navItems: NavItem[] = [];

  constructor(protected store: Store<any>, private devicesFacade: DeviceDataPointsFacade, protected router: Router) {
    super(store, null, null, null, null, devicesFacade, null);
  }

  ngOnInit() {
    super.ngOnInit();
    this.initIconMap();
    this.setNavigation();
    this.initDeviceDataPoints();
    this.routerEventSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        if (event.url.endsWith('/Diagnostics/PointViewer')) {
          this.router.navigateByUrl('/Diagnostics/PointViewer/1').then(() => {
            this.router.routeReuseStrategy.shouldReuseRoute = () =>  true;
          })
        }
        
        if (!event.url.includes('/Diagnostics/PointViewer')) {
          this.router.routeReuseStrategy.shouldReuseRoute = () =>  false;
        }

        if (!event.url.includes('/Diagnostics')){
          this.router.routeReuseStrategy.shouldReuseRoute = () =>  null;
        }
      }
    });
  }

  private getdeviceIcon(deviceTypeId: number): string {
    if (this.deviceTypeIconMap.has(deviceTypeId)) {
      return this.deviceTypeIconMap.get(deviceTypeId);
    }
    return 'dns';
  }

  private initIconMap(): void {
    this.deviceTypeIconMap = new Map<number, string>();
    this.deviceTypeIconMap.set(BuiltInDeviceType.SystemClock, 'schedule');
    this.deviceTypeIconMap.set(
      BuiltInDeviceType.SureSENSInChargeTool,
      'flash_on'
    );
    this.deviceTypeIconMap.set(
      BuiltInDeviceType.SureSENSStarInterfaceCard,
      'dns'
    );
    this.deviceTypeIconMap.set(BuiltInDeviceType.SureSENSQPTGauge, 'dns');
    this.deviceTypeIconMap.set(BuiltInDeviceType.SureSENSSPTVGauge, 'dns');

    // export enum BuiltInDeviceType {
    //   SureSENSStarInterfaceCard = 1,
    //   SureSENSHarvestInterfaceCard,
    //   SureSENSIWISInterfaceCard,
    //   SureSENSQPTGauge = 4,
    //   SureSENSESPGauge = 5,
    //   SureSENSSPTVGauge = 6,
    //   SureSENSFlowmeter298Gauge = 7,
    //   SureSENSFlowmeter298EXGauge = 8,
    //   SystemClock = 9,
    //   InForceHPU = 10,
    //   InForceModule2542 = 11,
    //   InForceModuleE1211 = 12,
    //   InForceModuleE1240 = 13,
    //   InForceModuleE1260 = 14,
    //   InForceModuleFlowMeter = 15,
    //   InForceHCM = 16,
    //   InForceWell = 17,
    //   SystemAlarm = 18,
    //   CustomAlarm = 19,
    //   InChargeHCMP = 20,
    //   InChargeWell = 21,
    //   InterfaceCardDownlink = 22,
    //   InChargePowerSupplyModule = 23,
    //   SureSENSInChargeTool = 24,
  }
  private setNavigation() {
    this.navItems = [
      {
        parent: null,
        displayName: 'Point Viewer',
        iconName: 'list',
        route: '/Diagnostics/PointViewer',
        children: [],
        expandable: true
      },
      {
        parent: null,
        displayName: 'Point Trend',
        iconName: 'show_chart',
        route: '/Diagnostics/PointTrend',
        children: [],
      },
      {
        parent: null,
        displayName: 'Historian Trend',
        iconName: 'stacked_line_chart',
        route: '/Diagnostics/HistorianTrend',
        children: [],
      },
     /*  {
        parent: null,
        displayName: 'Message Viewer',
        iconName: 'preview',
        route: '/Diagnostics/LogMessagesViewer',
        children: [],
      }, */
    ];
  }

  ngOnDestroy(): void {
    if (this.routerEventSubscription != null) {
      this.routerEventSubscription.unsubscribe();
      this.routerEventSubscription = null;
    }

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
  postCallDeviceDataPoints(): void {
    if (!this.navItems[0].children || this.navItems[0].children?.length === 0) {
      const owner = 'Point Viewer';
      const deviceRoute = '/Diagnostics/PointViewer/';
      const deviceOwnerNavItems: NavItem[] = [];
      // Add owner device first
      this.devices.forEach((element) => {
        if (element !== null) {
          if (element.Id === element.OwnerId) {
            const ownerNode: any = {
              displayName: element.Name,
              iconName: this.getdeviceIcon(element.IdDeviceType),
              route: deviceRoute + element.Id,
              children: []
            };
            deviceOwnerNavItems.push(ownerNode);
          }
        }
      });
      const allDeviceOwnerNavItems: NavItem[] = [];
      deviceOwnerNavItems.forEach((deviceCardElement) => {
        if (deviceCardElement !== null) {
          /*  const tempArray = deviceCardElement.route.split('/');
           const ownerDeviceId = Number(tempArray[3]);
 
           let childNavItems: NavItem[] = [];
           this.devices.forEach((device) => {
             if (device.OwnerId === ownerDeviceId && device.Id !== ownerDeviceId) {
               const childnode: NavItem = {
                 parent: deviceCardElement.displayName,
                 displayName: device.Name,
                 iconName: this.getdeviceIcon(device.IdDeviceType),
                 route: deviceRoute + device.Id,
                 children: []
               };
               childNavItems.push(childnode);
             }
           }); */
          deviceCardElement.children = this.getChildren(deviceCardElement, deviceRoute);
          allDeviceOwnerNavItems.push(deviceCardElement);

        }
      });
      this.navItems[0].children = allDeviceOwnerNavItems;
    }
  }

  getChildren(parentElement, deviceRoute) {
    const tempArray = parentElement.route.split('/');
    const ownerDeviceId = Number(tempArray[3]);
    let childNavItems: NavItem[] = [];
    this.devices.forEach((device) => {
      if (device.OwnerId === ownerDeviceId && device.Id !== ownerDeviceId) {
        const childnode: NavItem = {
          parent: parentElement.displayName,
          displayName: device.Name,
          iconName: this.getdeviceIcon(device.IdDeviceType),
          route: deviceRoute + device.Id,
          children: []
        };
        childnode.children = this.getChildren(childnode, deviceRoute) ?? [];
        childNavItems.push(childnode);
      }
    });
    return childNavItems;
  }
}
