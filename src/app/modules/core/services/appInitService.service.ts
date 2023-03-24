import { Injectable } from '@angular/core';
import { UICommon } from '@core/data/UICommon';

import { RealTimeDataSignalRService } from '@core/services/realTimeDataSignalR.service';
import { Subscription } from 'rxjs';
import { SystemClockService } from './system-clock.service';
import { UserService } from './user.service';


@Injectable({
  providedIn: 'root',
})
export class AppInitService {
  private isRealTimeWebHostUp:boolean = false;
  private isSystemClockUp: boolean = true;
  private SystemClock: Subscription;

  constructor(
    private userService: UserService,
    private realTimeService: RealTimeDataSignalRService,
    private systemClockService: SystemClockService
  ) { }

  private subscribeToSystemClock(): void {
    this.isSystemClockUp = false;
    
      this.SystemClock = this.systemClockService.SystemClockTime$.subscribe(dt => { 
        if (dt) {
          this.isSystemClockUp = this.isRealTimeWebHostUp && true;
          this.updateUIStatus();
          this.unsubscribeSystemClock();
        }
      }, error=> {
        this.isSystemClockUp = false; // Disconnected
      });
    
  }

  private unsubscribeSystemClock(): void {
    if (this.SystemClock != null) {
      this.SystemClock.unsubscribe();
      this.SystemClock = null;
    }
  }

  updateUIStatus(): void {
    if (this.isRealTimeWebHostUp === true && this.isSystemClockUp === true) {
        UICommon.isBusyWaiting = false;
        UICommon.loadingMssg = null;
    }
    else {
        UICommon.isBusyWaiting = true;
        UICommon.loadingMssg = this.isRealTimeWebHostUp ? "Waiting for data acquisition..." : "Connecting to SureFIELD™ Gateway...";
    }
  }

  logInInit(): void {
    this.userService.GetCurrentLoginUser().then ( currentUser => {
      if (currentUser) { // User not logged in already
        this.realTimeService.startConnection();   // Connect to SignalR connection and Streaming
      }
      else {
        this.userService.LoginOpenUser();
      }
    });

    // Subscribe to realtime status here
    this.realTimeService.IsRealtimeUp().subscribe(isRealtimeUp => {
        this.isRealTimeWebHostUp = isRealtimeUp;
        // Subscribe to system clock to check for data acquisition
        this.subscribeToSystemClock();
        this.updateUIStatus();
    });
  }
}
export function appInitFactory(configService: AppInitService) {
  return () => configService.logInInit();
}
