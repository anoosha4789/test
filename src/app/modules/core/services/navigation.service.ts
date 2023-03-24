import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { NavItem, BhHeaderLinks } from 'bh-theme';

import { HeaderNavigationLinks } from '@core/models/webModels/HeaderNavigationLinks.model';
import { UserRoles, LoginModel } from '@core/models/webModels/Login.model';
import { UICommon } from '@core/data/UICommon';
import { PanelConfigurationFacade } from '@core/facade/panelConfigFacade.service';
import { GatewayPanelBase } from '@comp/GatewayPanelBase.component';
import { SerialPortCommunicationChannelDataUIModel } from '@core/models/webModels/SerialPortCommunicationChannelDataUIModel.model';
import { TcpIpCommunicationChannelDataUIModel } from '@core/models/webModels/TcpIpCommunicationChannelDataUIModel.model';
import { DataSourceUIModel } from '@core/models/UIModels/dataSource.model';
import { PublishingDataUIModel } from '@core/models/UIModels/dataPublishing.model';
import { PublishingChannelFacade } from '@core/facade/publishingChannelFacade.service';
import { SuresensWellUIModel } from '@core/models/UIModels/suresens.well.model';
import { InchargeWellUIModel } from '@core/models/UIModels/Incharge.well.model';
import { InforceWellUIModel } from '@core/models/UIModels/InforceWell.model';

@Injectable({
  providedIn: 'root',
})

export class NavigationService {
  private headerNavigationMap: Map<string, HeaderNavigationLinks>;
  private headerLinks: BhHeaderLinks[];
  private headerLinksSuject = new Subject<BhHeaderLinks[]>();
  private selectedHeaderSubject = new Subject<HeaderNavigationLinks>();
  public handle: number;

  constructor(private panelConfigFacade: PanelConfigurationFacade,
    private publishingFacade: PublishingChannelFacade) {
    this.initNavigationMap();
  }

  public GetheaderLinksSuject(): Subject<BhHeaderLinks[]> {
    return this.headerLinksSuject;
  }

  public GetSelectedHeaderSubject(): Subject<HeaderNavigationLinks> {
    return this.selectedHeaderSubject;
  }

  public selectHeaderLink(headerDisplayName: string): void {
    if (this.headerNavigationMap.has(headerDisplayName)) {
      this.selectedHeaderSubject.next(
        this.headerNavigationMap.get(headerDisplayName)
      );
    }
  }

  // getcounter() {
  //   this.badgeCounter = AlarmService.countOfAlarms;
  // }

  // initAlarms() {
  //   this.alarmService.subscribeToInforceDevices();
  //   this.alarmService.subscribeToAlarms();
  //   this.alarmService.initUnitSystem();
  //   this.alarmService.startalarmAquasition(this.realTimeDataSignalRService, this.alarmService.getHPUID());
  //   this.handle = window.setInterval(() => this.getcounter(), 10);
  // }

  public setHeaderLinksByUserRoles(loginUserInfor: LoginModel): void {
    this.headerLinks = [];
    const isConfigSaved = JSON.parse(window.sessionStorage.getItem('isConfigSaved'));
    const panelTypeId = this.panelConfigFacade.getPanelTypeId();
    // if (isConfigSaved) {
    //   this.initAlarms();
    // }
    if (panelTypeId != -1) {
      let configPanelTypeName = UICommon.getPanelType(panelTypeId, true).name;
      let panelTypeName = UICommon.getPanelType(panelTypeId).name;
      // let loginLink: HeaderNavigationLinks;
      if (typeof loginUserInfor.AccessLevel === 'string') {
        loginUserInfor.AccessLevel = parseInt(loginUserInfor.AccessLevel, 10);
      }
      if (isConfigSaved) {
        let headerHome = this.headerNavigationMap.get('Monitoring');
        if (headerHome) {
          headerHome.route = `/${panelTypeName}/monitoring`;
          this.headerLinks.push(headerHome);
        }
      }

      switch (loginUserInfor.AccessLevel) {
        case UserRoles.Open:
          // this.headerLinks.push(this.headerNavigationMap.get('About'));
          // this.headerLinks.push(this.headerNavigationMap.get('Help'));
          break;
        case UserRoles.Operator:
          this.headerLinks.push(this.headerNavigationMap.get('Downloads'));
          // this.headerLinks.push(this.headerNavigationMap.get('Download'));
          // this.headerLinks.push(this.headerNavigationMap.get('About'));
          // this.headerLinks.push(this.headerNavigationMap.get('Help'));
          break;
        case UserRoles.Administrator:
          if (isConfigSaved) {
            let headerToolBox = this.headerNavigationMap.get('Toolbox');
            if (headerToolBox) {
              headerToolBox.route = `/${panelTypeName}/toolbox`;
              this.headerLinks.push(headerToolBox);
            }
          }
          let headerConfiguration = this.headerNavigationMap.get('Configuration');
          if (headerConfiguration) {
            headerConfiguration.route = `/${configPanelTypeName}/dashboard`;
            this.headerLinks.push(headerConfiguration);
          }
          // this.headerLinks.push(this.headerNavigationMap.get('About'));
          // this.headerLinks.push(this.headerNavigationMap.get('Help'));
          this.headerLinks.push(this.headerNavigationMap.get('Downloads'));
          if (isConfigSaved) {
          this.headerLinks.push(this.headerNavigationMap.get('Diagnostics'));
          }
          break;

        default:
          break;
      }
    }
    this.headerLinksSuject.next(this.headerLinks);
  }


  // from this link: https://material.io/resources/icons/?style=baseline
  // Add this to the index.html
  // <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  // <i class="material-icons">face</i>
  // Define the side navigation menu for each header navigation bar
  private initNavigationMap(): void {
    this.headerNavigationMap = new Map<string, HeaderNavigationLinks>();
    this.setupNavigationHome();
    this.setupNavigationConfiguration();
    this.setupNavigationAbout();
    this.setupNavigationHelp();
    this.setupNavigationLogin();
    this.setupNavigationToolbox();
    this.setupNavigationReport();
    this.setupNavigationDownload();
    this.setupNavigationDiagnostics();
  }

  private setupNavigationHome(): void {
    const navbar: HeaderNavigationLinks = {
      displayName: 'Monitoring',
      enabled: true,
      selected: false,
      route: '/Home',
      iconName: 'home',
    };
    this.headerNavigationMap.set(navbar.displayName, navbar);
  }

  public setupNavigationConfiguration(path?: string): void {
    const navbar: HeaderNavigationLinks = {
      displayName: 'Configuration',
      enabled: true,
      selected: false,
      route: path ? path : '/incharge/dashboard',
      iconName: '',
    };
    const generalSetting = 'General Settings';
    navbar.SideNavItems = [];
    navbar.StepperNavItems = [];
    this.headerNavigationMap.set(navbar.displayName, navbar);
  }

  getDiagSideNav() {
    const navList = {
      navItems: [],
      stepper: [],
    };
    const navbar: HeaderNavigationLinks = {
      displayName: 'Diagnostics',
      enabled: true,
      selected: false,
      route: '/Diagnostics/PointViewer',
      iconName: 'support',
    };

    const sidebarParent = 'Diagnostics';
    const panelType = 'incharge'; // To Do - Should be dynamic based on panel selection
    const sideNavItems: NavItem[] = [
      {
        parent: navbar.displayName,
        displayName: 'Point Viewer',
        iconName: 'table_rows',
        route: '/Diagnostics/PointViewer',
        children: [
          {
            parent: 'Point Viewer',
            displayName: 'System Clock',
            iconName: 'developer_board',
            route: '/Diagnostics/PointViewer/1',
          },
          {
            parent: 'Point Viewer',
            displayName: 'Card 1',
            iconName: 'developer_board',
            route: '/Diagnostics/PointViewer/2',
            children: [
              {
                parent: 'Card 1',
                displayName: 'Tool 1',
                iconName: 'developer_board',
                route: '/Diagnostics/PointViewer/2/4',
              },
              {
                parent: 'Card 1',
                displayName: 'Tool 2',
                iconName: 'developer_board',
                route: '/Diagnostics/PointViewer/2/5',
              },
              {
                parent: 'Card 1',
                displayName: 'Tool 3',
                iconName: 'developer_board',
                route: '/Diagnostics/PointViewer/2/6',
              },
            ],
          },
          {
            parent: 'Point Viewer',
            displayName: 'Card 2',
            iconName: 'developer_board',
            route: '/Diagnostics/PointViewer/3',
          },
        ],
      },
      {
        parent: navbar.displayName,
        displayName: 'Point Trend',
        iconName: 'show_chart',
        route: '/Diagnostics/PointTrend',
      },
      {
        parent: navbar.displayName,
        displayName: 'Historian Trend',
        iconName: 'stacked_line_chart',
        route: '/Diagnostics/HistorianTrend',
      },
      {
        parent: navbar.displayName,
        displayName: 'Message Viewer',
        iconName: 'list',
        route: '/Diagnostics/LogMessagesViewer',
      },
      // {
      //   parent: navbar.displayName,
      //   displayName: 'Modbus Slave Viewer',
      //   iconName: 'settings_input_component',
      //   // route: '/Diagnostics/DataPublishing',
      //   children: [
      //     {
      //       parent: sidebarParent,
      //       displayName: 'TCP/IP 192.168.100.10:502',
      //       iconName: 'wifi',
      //       route: '/Diagnostics/DataPublishing/\'192.168.100.10:502\'',
      //     },
      //     {
      //       parent: sidebarParent,
      //       displayName: 'TCP/IP 192.168.100.10:512',
      //       iconName: 'wifi',
      //       route: '/Diagnostics/DataPublishing/\'192.168.100.10:512\'',
      //     },
      //     {
      //       parent: sidebarParent,
      //       displayName: 'COM6',
      //       iconName: 'developer_board',
      //       route: '/Diagnostics/DataPublishing/\'COM6\'',
      //     },
      //   ],
      // },
    ];
    navList.navItems = sideNavItems;
    navList.stepper = [];
    return navList;
  }

  private setupNavigationAbout(): void {
    const navbar: HeaderNavigationLinks = {
      displayName: 'About',
      enabled: true,
      selected: false,
      route: 'About',
      iconName: 'info',
    };
    this.headerNavigationMap.set(navbar.displayName, navbar);
  }

  private setupNavigationHelp(): void {
    const navbar: HeaderNavigationLinks = {
      displayName: 'Help',
      enabled: true,
      selected: false,
      route: '/Help',
      iconName: 'help_center',
    };
    this.headerNavigationMap.set(navbar.displayName, navbar);
  }

  private setupNavigationLogin(): void {
    const navbar: HeaderNavigationLinks = {
      displayName: 'Login',
      enabled: true,
      selected: false,
      route: '/Login',
      iconName: 'login',
    };
    this.headerNavigationMap.set(navbar.displayName, navbar);
  }

  private setupNavigationToolbox(): void {
    const navbar: HeaderNavigationLinks = {
      displayName: 'Toolbox',
      enabled: true,
      selected: false,
      route: '/incharge/toolbox',
      iconName: 'business_center',
    };
    this.headerNavigationMap.set(navbar.displayName, navbar);
  }

  private setupNavigationReport(): void {
    const navbar: HeaderNavigationLinks = {
      displayName: 'Report',
      enabled: true,
      selected: false,
      route: '/Report',
      iconName: 'article',
    };
    this.headerNavigationMap.set(navbar.displayName, navbar);
  }

  private setupNavigationDownload(): void {
    const navbar: HeaderNavigationLinks = {
      displayName: 'Downloads',
      enabled: true,
      selected: false,
      route: '/downloads/datafiles',
      iconName: 'save_alt',
    };
    this.headerNavigationMap.set(navbar.displayName, navbar);
  }

  private setupNavigationDiagnostics(): void {
    const navbar: HeaderNavigationLinks = {
      displayName: 'Diagnostics',
      enabled: true,
      selected: false,
      route: '/Diagnostics/PointViewer/1',
      iconName: 'support',
    };

    const sidebarParent = 'Diagnostics';
    const sideNavItems: NavItem[] = [
      {
        parent: navbar.displayName,
        displayName: 'Point Viewer',
        iconName: 'table_rows',
        route: '/Diagnostics/PointViewer',
      },
      {
        parent: navbar.displayName,
        displayName: 'Point Trend',
        iconName: 'show_chart',
        route: '/Diagnostics/PointTrend',
      },
      {
        parent: navbar.displayName,
        displayName: 'Point Trend',
        iconName: 'stacked_line_chart',
        route: '/Diagnostics/HistorianTrend',
      },
      {
        parent: navbar.displayName,
        displayName: 'Log Message Viewer',
        iconName: 'list',
        route: '/Diagnostics/LogMessagesViewer',
      },
      {
        parent: navbar.displayName,
        displayName: 'Modbus Slave Viewer',
        iconName: 'settings_input_component',
        // route: '/Diagnostics/DataPublishing',
        children: [
          {
            parent: sidebarParent,
            displayName: 'TCP/IP 192.168.100.10:502',
            iconName: 'wifi',
            route: "/Diagnostics/DataPublishing/'192.168.100.10:502'",
          },
          {
            parent: sidebarParent,
            displayName: 'TCP/IP 192.168.100.10:512',
            iconName: 'wifi',
            route: "/Diagnostics/DataPublishing/'192.168.100.10:512'",
          },
          {
            parent: sidebarParent,
            displayName: 'COM6',
            iconName: 'developer_board',
            route: "/Diagnostics/DataPublishing/'COM6'",
          },
        ],
      },
    ];
    navbar.SideNavItems = sideNavItems;
    this.headerNavigationMap.set(navbar.displayName, navbar);
  }
}
