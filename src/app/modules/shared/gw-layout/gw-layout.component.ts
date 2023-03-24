import { Component, OnInit, Input, OnChanges, AfterViewInit, ViewChild, OnDestroy } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { NavItem, NavService } from 'bh-theme';
import { MatStepper } from '@angular/material/stepper';
import { MatSidenav } from '@angular/material/sidenav';
import { Store } from '@ngrx/store';

import { UtilityService } from '@core/services/utility.service';
import { Subscription } from 'rxjs';
import { PanelConfigurationCommonModel } from '@core/models/webModels/PanelConfigurationCommon.model';

import { GatewayPanelBase, IGatewayPanelBase } from '@comp/GatewayPanelBase.component';
import { PanelConfigurationFacade } from '@core/facade/panelConfigFacade.service';
import { UICommon } from '@core/data/UICommon';

@Component({
  selector: 'app-gw-layout',
  templateUrl: './gw-layout.component.html',
  styleUrls: ['./gw-layout.component.scss'],
  providers: [{
    provide: STEPPER_GLOBAL_OPTIONS, useValue: { displayDefaultIndicatorType: false, showError: true }
  }]
})

export class GwLayoutComponent extends GatewayPanelBase implements OnInit, OnChanges, AfterViewInit, OnDestroy, IGatewayPanelBase {

  @ViewChild('appDrawer') appDrawer: MatSidenav;
  @ViewChild('gwStepper') gwStepper: MatStepper;
  isLinear = false;
  stepperVisibility = true;
  navItems: any[] = null;
  stepperDone: number;

  @Input()
  stepper?: any;

  @Input()
  nestedTree?: boolean = false;

  @Input()
  defNavItems: any;

  panelConfigurationCommon: PanelConfigurationCommonModel = new PanelConfigurationCommonModel();

  private arrSubscriptions: Subscription[] = [];

  constructor(protected store: Store,
    private router: Router,
    private navService: NavService,
    private utilityService: UtilityService,
    private panelConfigFacade: PanelConfigurationFacade,) {
    super(store, panelConfigFacade, null, null, null, null, null);

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if (event.url.toUpperCase().indexOf('DATASOURCE') > 0
          && this.navService.currentUrl.value.toUpperCase().indexOf('SELECTEDCHILD') > 0)
          this.navService.currentUrl.next(event.url.split(';')[0]);
        if (event.url.toUpperCase().indexOf('SIE') > 0
          && this.navService.currentUrl.value.toUpperCase().indexOf('SELECTEDCHILD') > 0)
          this.navService.currentUrl.next(event.url.split(';')[0]);

        if (event.url.toLowerCase().indexOf('downloads/reports') > 0) {
          // console.log("Navigation Start: " + event.url.toString());
          UICommon.isBusyWaiting = false;
        }
      }

      if (event instanceof NavigationStart) {
        if (event.url.toUpperCase().indexOf('DASHBOARD') > 0) {
          // console.log("Navigation Start: " + event.url.toString());
          this.navService.setParentDisplayName("");
        }
        if (event.url.toLowerCase().indexOf('downloads/reports') > 0) {
          // console.log("Navigation Start: " + event.url.toString());
          UICommon.isBusyWaiting = true;
        }
      }
    });
  }

  onNavItemSelected(item) {
    if (item.expandable) {
      if (item.displayName === 'Wells' || item.displayName === 'Data Sources' || item.displayName === 'Data Publishing' || item.displayName === 'Reports' || item.displayName === 'SIUs') {
        if (this.navService.getParentDisplayName() === item.displayName)
          return;

        if (item.children && item.children.length > 0) {
          this.router.navigate([item.children[0].route]);
        }
      }
    }
    else {
      if (item.displayName === 'Backup' && item?.route) {
        this.router.onSameUrlNavigation = 'reload';
        this.router.navigate([item.route], { state: { isNavItemClicked: true } });
      } else if (!this.navService.appDrawer.opened)
        this.navService.appDrawer.open();
    }
  }

  // IGatewayPanelBase methods
  postCallGetPanelConfigurationCommon(): void {
    GatewayPanelBase.ShowNavigation = GatewayPanelBase.ShowNavigation || this.panelConfigurationCommonState.panelConfigurationCommon.Id > 0 ? true : false;
    this.setSideNavType();
  }

  ngOnInit() {
    super.ngOnInit();
    this.initPanelConfigurationCommon();
    this.stepperDone = -1;
  }

  ngAfterViewInit(): void {
    this.navService.appDrawer = this.appDrawer;
    this.utilityService.setSideNavStatus(true);
    const subscription = this.utilityService.getForwardStepper().subscribe((res: number) => {
      if (res !== -1) {
        if (this.gwStepper) {
          this.stepperDone = res;
          this.updateStepperStatus(res);
        }
      }
    });
    this.arrSubscriptions.push(subscription);
  }

  ngOnDestroy(): void {
    this.utilityService.setSideNavStatus(false);
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

  ngOnChanges(): void {
    this.setSideNavType();
  }

  // Initial Stepper or Default navigation Post configuration Save
  setSideNavType() {
    if (!GatewayPanelBase.ShowNavigation && this.defNavItems === null || this.stepper && this.stepper.length > 0) {
      this.stepperVisibility = true;
      this.navItems = this.stepper ? this.stepper : [];
      this.updateStepperStatus(this.stepperDone);
    } else {
      this.stepperVisibility = false;
      this.stepperDone = -1;
      this.navItems = this.defNavItems ? this.defNavItems : [];
    }
  }

  // Stepper navigation
  selectionChange(event) {
    this.navItems[event.previouslySelectedIndex].state = 'done';
    this.navItems[event.previouslySelectedIndex].completed = true;
    this.navItems[event.selectedIndex].state = 'number';
    this.navItems[event.selectedIndex].completed = false;
  }

  private updateStepperStatus(selectedIndex) {
    for (let inxStep = 0; inxStep <= selectedIndex; inxStep++) {
      this.navItems[inxStep].state = 'done';
      this.navItems[inxStep].completed = true;
    }
  }
}
