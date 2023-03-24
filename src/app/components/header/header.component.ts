import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router, NavigationStart, GuardsCheckEnd } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { BhHeaderLinks, NavService } from 'bh-theme';
import { Store } from '@ngrx/store';
import { PanelConfigurationFacade } from '@core/facade/panelConfigFacade.service';
import { HeaderNavigationLinks } from '@core/models/webModels/HeaderNavigationLinks.model';
import { NavigationService } from '@core/services/navigation.service';
import { UserService } from '@core/services/user.service';
import { UserRoles } from '@core/models/webModels/Login.model';
import { ProfileDetails } from 'bh-theme/lib/types/profile-details';
import { UtilityService } from '@core/services/utility.service';
import { GatewayPanelConfigurationService } from '@core/services/gateway-panel-configuration.service';
import { GatewayModalService } from '@shared/gateway-dialogs/services/gatewayModal.service';
import { PanelTypeList, UICommon } from '@core/data/UICommon';
import { GatewayPanelBase } from '@comp/GatewayPanelBase.component';
import { AlarmsDialogComponent } from '@shared/gateway-dialogs/components/alarms-dialog/alarms-dialog.component';
import { ButtonActions } from '@shared/gateway-dialogs/components/gateway-advanced-dialog/gateway-advanced-dialog.component';
import { AlarmService } from '@core/services/alarm.service';
// import { ReportService } from '@core/services/report.service';
// import { take } from 'rxjs/operators';
// import { PublishingChannelFacade } from '@core/facade/publishingChannelFacade.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})

export class HeaderComponent extends GatewayPanelBase implements OnInit, OnDestroy {

  panelTypeId: number;
  isUserLoggedIn = false;
  isSideNav = true;
  isMenuOpen = false;
  selectedNavItem: string = null;
  headerLinks$: Observable<HeaderNavigationLinks[]>;
  loggedInUser: LoggedUser;
  badgeCounter: string;
  isConfigSaved = false;
  profileDetails: GwProfileDetails = {
    profileFirstName: 'admin',
    profileLastName: '',
    profileEmail: null,
    profileImageUrl: null,
    loginUrl: 'Login',
    logoutUrl: 'logout',
    profileMenuItems: [
      //   { displayName: 'System Preferences', iconName: 'settings', route: 'tree' }
    ],
    loginStatus: this.isUserLoggedIn
  };
  isMobileView: boolean = false;

  mobileMenuData: any = {
    profileFirstName: this.profileDetails.profileFirstName,
    profileLastName: this.profileDetails.profileLastName,
    profileEmail: this.profileDetails.profileEmail,
    profileImageUrl: this.profileDetails.profileImageUrl,
    loginUrl: this.profileDetails.loginUrl,
    logoutUrl: this.profileDetails.logoutUrl,
    loginStatus: this.profileDetails.loginStatus,
    mobileMenuItems: []
  };
  //childnavItems:any=[]

  constructor(protected store: Store,
    private panelConfigFacade: PanelConfigurationFacade,
    private headerLikeNavigationService: NavigationService,
    private router: Router,
    private navService: NavService,
    private userService: UserService,
    private panelConfigService: GatewayPanelConfigurationService,
    private utilityService: UtilityService,
    private alarmService: AlarmService,
    private gwModalService: GatewayModalService
    // ,
    // private reportService: ReportService,
    // private publishingFacade: PublishingChannelFacade

  ) {

    super(store, panelConfigFacade, null, null, null, null, null);
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        const url = event.url.toLowerCase();
        if (url === '/logout') {
          this.logout();
          this.setActiveHeaderLink("Monitoring");
        }
        else if (url == '/home') {
          this.setActiveHeaderLink("Monitoring");
        }
        else if (url.indexOf('diagnostics') > 0) {
          this.setActiveHeaderLink("Diagnostics");
        }
        else if (url.indexOf('downloads') > 0) {
          this.setActiveHeaderLink("Downloads");
        }
        else if (url.indexOf('monitoring') > 0 && url.indexOf('alarm') > 0) {
          this.router.navigateByUrl('/multinode/monitoring');
          this.setActiveHeaderLink("Monitoring");          
          this.alarmService.alarmClicked();          
        }          
        else if (url.indexOf('monitoring') > 0 && url.indexOf('fromcard') === -1 || url.indexOf('shift') > 0) {
          this.setActiveHeaderLink("Monitoring");
        }      
        else if (url.indexOf('toolbox') > 0 || url.indexOf('card') > 0) {
          this.setActiveHeaderLink("Toolbox");
        }
        else if (url.indexOf('incharge') > 0) {
          this.setActiveHeaderLink("Configuration");
        }
        else {
          this.setActiveHeaderLink("Configuration");
        }
      }

      if (event instanceof GuardsCheckEnd) {
        if (event.url === '/logout') {
          this.router.navigateByUrl(this.router.url);
        }
      }

    });

  }

  private showNoAlarms(): void {
    this.gwModalService.openDialog(
      `No active alarms`,
      () => this.gwModalService.closeModal(),
      null,
      null,
      null,
      false,
      "Ok"
    );
  }

  onAlarmClick() {
    if (this.alarmService.hasAlarms()) {
      switch(this.panelTypeId) {
        case PanelTypeList.INFORCE:
          if (parseInt(this.badgeCounter) > 0){
            this.gwModalService.openAdvancedDialog(
              "",
              ButtonActions.None,
              AlarmsDialogComponent,
              null,
              (result) => {
                if (result) {
                  this.closeDialog();
                } else {
                  this.closeDialog();
                }
              },
              '850px',
              null,
              null,
              null,
              'gw-alarm-dialog-box'
            );
          }
          else {
            this.showNoAlarms();
          }
          break;

        case PanelTypeList.MultiNode:
          this.alarmService.alarmClicked();
          break;

        default:
          this.showNoAlarms();
          break;
      }
    } else {
      this.showNoAlarms();
    }
  }



  closeDialog() {
    this.gwModalService.closeModal();
  }
  getAccessRole(role: UserRoles) {
    return UserRoles[role].toString();
  }

  // Click the Header Link
  public setActiveHeaderLink(displayName: string) {
    this.selectedNavItem = displayName;
    this.headerLikeNavigationService.selectHeaderLink(displayName);
  }

  private getNavigationURL(): string {
    let url = UICommon.HomeURL;
    switch (this.panelTypeId) {
      case PanelTypeList.SURESENS:
        url = 'suresens/monitoring';
        break;
      case PanelTypeList.InCHARGE:
        url = 'incharge/monitoring';
        break;
    }

    return url;
  }

  // Handle Login or Logout Header Click
  logout(): void {
    if (this.panelConfigurationCommonState && this.panelConfigurationCommonState.panelConfigurationCommon && this.panelConfigurationCommonState.panelConfigurationCommon.PanelTypeId < 0) {
      this.doLogOut();
      return;
    }
    this.panelConfigService.checkDirtyStatus().then(result => {
      if (result) {
        this.gwModalService.openDialog(
          `Are you sure you want to logout?<br>Changes made to the configuration will be discarded.</br>`,
          () => {
            this.gwModalService.closeModal();
            this.doLogOut();
          },
          () => this.gwModalService.closeModal(),
          'Warning',
          null,
          true,
          "Logout",
          "Cancel"
        );
      }
      else
        this.doLogOut();
    })
  }

  private doLogOut() {
    UICommon.isBusyWaiting = true;
    this.userService.LogOut().then(() => {
      this.loggedInUser = null;
      const url = this.getNavigationURL();
      this.router.navigateByUrl(url);
      UICommon.isBusyWaiting = false;
    }
      ,
      (error) => {
        UICommon.isBusyWaiting = false;
      });
  }

  private GetDisplayName(userName): string {
    const arrNames = userName.split(' ');
    if (arrNames.length > 1) {
      return arrNames[0].substring(0, 1).toUpperCase() + arrNames[1].substring(0, 1).toUpperCase();
    } else {
      return userName.substring(0, 2).toUpperCase();
    }
  }

  private SetUpLoginHeader(): void {

    this.userService.GetCurrentLoginUser().then(user => {
      if (user) {
        this.loggedInUser = {
          DisplayName: this.GetDisplayName(user.Name),
          Name: user.Name,
          AccessLevel: UserRoles[user.AccessLevel].toString()
        };
        const username = user.Name.split(' ');
        this.profileDetails.profileFirstName = username.length > 1 ? username[0].toUpperCase() : user.Name;
        this.profileDetails.profileLastName = username.length > 1 ? username[1].toUpperCase() : '';
        this.profileDetails.profileEmail = UserRoles[user.AccessLevel].toString();
        this.mobileMenuData.profileFirstName = this.profileDetails.profileFirstName;
        this.mobileMenuData.profileLastName = this.profileDetails.profileLastName;
        this.mobileMenuData.profileEmail = this.profileDetails.profileEmail;

        // GATE-1306 
        if (this.userService.isAdminUser(user) || this.panelConfigurationCommonState.panelConfigurationCommon.Id > 0) {
          this.isUserLoggedIn = user.Name === 'Open' ? false : true;
          this.headerLikeNavigationService.setHeaderLinksByUserRoles(user);
          // if (!this.isUserLoggedIn)
          //   this.router.navigate(['Home']);
        }
      }
      else {
        this.isUserLoggedIn = false;
      }
      this.mobileMenuData.loginStatus = this.isUserLoggedIn;
    });
  }

  toggleSidenav() {
    if (this.navService.appDrawer) {
      if (this.navService.appDrawer.opened)
        this.navService.appDrawer.close();
      else
        this.navService.appDrawer.open();
    }
  }

  toggleMobileMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  navigationSelected() {
    this.isMenuOpen = false;
  }
  // setDownloadSubmenu(){
  //   if(this.childnavItems.length === 0){
  //     this.childnavItems.push({
  //       displayName: 'Configuration Report',
  //       iconName: 'receipt_long',
  //       route: 'downloads/reports/configuration'
  //     });
  //     this.publishingFacade?.initDataPublishing().subscribe(res => {
  //       if(Array.isArray(res) && res.length) {
  //         this.childnavItems.splice(1,0,
  //           {
  //             displayName: 'Modbus Map',
  //             iconName: 'receipt_long',
  //             route: 'downloads/reports/modbusmap'
  //           })
  //         }
  //     });
  //     if(this.panelTypeId==PanelTypeList.INFORCE){
  //       this.reportService.getAlarmHistoryData().pipe(take(1)).subscribe(res => {
  //         if(Array.isArray(res) && res.length) {
  //           this.childnavItems.push(
  //             {

  //               displayName: 'Alarm history Report',
  //               iconName: 'receipt_long',
  //               route: 'downloads/reports/alarmhistory'
  //             })
  //           }
  //       });
  //       this.reportService.getShiftHistoryData().pipe(take(1)).subscribe(res => {
  //         if(Array.isArray(res) && res.length) {
  //           this.childnavItems.push(
  //             {

  //               displayName: 'Shift history Report',
  //               iconName: 'receipt_long',
  //               route: 'downloads/reports/shifthistory'
  //             }
  //           )
  //         }
  //       })
  //    }
  // }
  // }
  setMobileMenuDetails(menuItem: BhHeaderLinks) {
    if (menuItem.displayName.toLowerCase() === 'downloads') {
      const menuIdx = this.mobileMenuData.mobileMenuItems.findIndex(m => m.subTitle.toLowerCase() === 'downloads');
      if (menuIdx === -1) {
        // this.setDownloadSubmenu();
        this.mobileMenuData.mobileMenuItems.push(
          {
            subTitle: 'Downloads',
            navList: [
              { displayName: 'Data Files', iconName: 'folder', route: 'downloads/datafiles' },
              { displayName: 'Reports', iconName: 'description', route: 'downloads/reports' }]
          });
      }
    } else {
      const menuIdx = this.mobileMenuData.mobileMenuItems.findIndex(m => m.subTitle.toLowerCase() === 'menu');
      if (menuIdx === -1) {
        const menuItemObj = {
          subTitle: 'Menu',
          navList: []
        };
        menuItemObj.navList.push(menuItem);
        this.mobileMenuData.mobileMenuItems.push(menuItemObj);
      } else {
        const menuItemIdx = this.mobileMenuData.mobileMenuItems[menuIdx].navList.findIndex(navItem => navItem.route === menuItem.route);
        if (menuItemIdx === -1) this.mobileMenuData.mobileMenuItems[menuIdx].navList.push(menuItem);
      }
    }
  }

  postCallGetPanelConfigurationCommon(): void {
    this.panelTypeId = this.panelConfigurationCommonState.panelConfigurationCommon.PanelTypeId;
    this.SetUpLoginHeader();
  }

  // Alarms service methods start
  subscribeToAlarmCounts() {
    this.badgeCounter = "";//this.headerLikeNavigationService.badgeCounter;
    this.alarmService.subscribeToActiveAlarmCount().subscribe(count => this.badgeCounter = (count === "0" ? "" : count));
  }

  initAlarms() {
    //this.alarmService.initAlarms(this.panelTypeId);
    this.subscribeToAlarmCounts();
  }
  // Alarms service methods end


  @HostListener('window:resize', ['$event'])
  onResize(event?): void {
    this.isMobileView = window.outerWidth < 1020;
    let currentURL = this.router.url;
    if(this.isMobileView){
      if(this.isConfigSaved){
        let panelTypeName = UICommon.getPanelType(this.panelTypeId).name;
        if(currentURL.includes('dashboard') || currentURL.includes('Diagnostics')){
          let url= "/"+ panelTypeName+"/monitoring";
          this.router.navigateByUrl(url);
        }
        
      }else{
        if(currentURL.includes('dashboard') || currentURL.includes('Diagnostics')){
          this.router.navigateByUrl(UICommon.HomeURL);
        }
      }
    }
  }

  ngOnInit(): void {
    this.initPanelConfigurationCommon();
    this.headerLinks$ = this.headerLikeNavigationService.GetheaderLinksSuject();
    this.headerLikeNavigationService.GetheaderLinksSuject().subscribe(res => {
      // console.log('response.....', res)
      if (res) {
        this.mobileMenuData.mobileMenuItems = [];
        const removeDiagonsiticsLink = res.filter(item => item.displayName.toLowerCase() !== 'diagnostics');
        const data = removeDiagonsiticsLink.filter(item => item.displayName.toLowerCase() !== 'configuration');
        data.forEach(item => {
          this.setMobileMenuDetails(item);
        });

      }
      const isConfigSaved = JSON.parse(window.sessionStorage.getItem('isConfigSaved'));
      if (isConfigSaved)
        this.isConfigSaved = true;
      else
        this.isConfigSaved = false;

    })
    //console.log(this.headerLinks$)
    this.userService.GetLoginLogoutStatus().subscribe(bIsLoggedIn => {

      this.SetUpLoginHeader();
    });

    this.utilityService.getSideNavStatus().subscribe((showNav) => {
      this.isSideNav = showNav && (this.navService.appDrawer !== undefined && this.navService.appDrawer != null);
    });

    this.headerLikeNavigationService.GetSelectedHeaderSubject().subscribe(headerLink => {


      this.selectedNavItem = headerLink.displayName;
    });
    this.initAlarms();
  }

  ngOnDestroy() {
    //this.headerLikeNavigationService.GetheaderLinksSuject().unsubscribe();
    super.ngOnDestroy();
  }

}

class LoggedUser {
  DisplayName: string;
  Name: string;
  AccessLevel: string;
}

export interface GwProfileDetails extends ProfileDetails {
  loginUrl?: string
  loginStatus?: boolean;
}
