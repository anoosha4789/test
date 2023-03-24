import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '@env/environment';

import { SystemClockDataPointIndex } from '@core/models/webModels/DeviceInfo.model';
import { TimeZoneModel } from '@core/models/webModels/TimeZone.model';
import { LinuxSystemClockUIModel } from '@core/models/UIModels/linux-system-clock.model';
import { GatewayBaseService } from './gatewayBase.service';
import { RealTimeDataSignalRService } from '@core/services/realTimeDataSignalR.service';

@Injectable({
  providedIn: 'root'
})


export class SystemClockService extends GatewayBaseService {
  
  private panelTimeZoneUrl: string = environment.webHostURL + 'api/timezone';
  SystemClockTime$: BehaviorSubject<Date>;
  SystemTimeZone$: BehaviorSubject<number>;
  SystemTimeZoneString$: BehaviorSubject<string>;
  private year: number;
  private month: number;
  private day: number;
  private hour: number;
  private minute: number;
  private second: number;
  private deviceId = 1;

  private dataSubscriptions: Subscription[] = [];

  constructor(protected http: HttpClient, private realTimeDataService: RealTimeDataSignalRService) {
    super(http);
    this.SystemClockTime$ = new BehaviorSubject<Date>(new Date());
    this.SystemTimeZone$ = new BehaviorSubject<number>(null);
    this.SystemTimeZoneString$ = new BehaviorSubject<string>(null);
    this.subscribetDataPoints();
  }

  // Subscribe DateTime  ==>  Year, Month, Daya, Hour, Minute, Second and Timezone
  private subscribetDataPoints() {
    let subscription = this.realTimeDataService.GetRealtimeData(this.deviceId, SystemClockDataPointIndex.Year)
      .subscribe((data) => {
        if (data) {
          this.year = data.Value;
        }
      });
      this.dataSubscriptions.push(subscription);

      subscription = this.realTimeDataService.GetRealtimeData(this.deviceId, SystemClockDataPointIndex.Month)
      .subscribe((data) => {
        if (data) {
          this.month = data.Value;
        }
      });
      this.dataSubscriptions.push(subscription);

      subscription = this.realTimeDataService.GetRealtimeData(this.deviceId, SystemClockDataPointIndex.Day)
      .subscribe((data) => {
        if (data) {
          this.day = data.Value;
        }
      });
      this.dataSubscriptions.push(subscription);

      subscription = this.realTimeDataService.GetRealtimeData(this.deviceId, SystemClockDataPointIndex.Hour)
      .subscribe((data) => {
        if (data) {
          this.hour = data.Value;
        }
      });
      this.dataSubscriptions.push(subscription);

      subscription = this.realTimeDataService.GetRealtimeData(this.deviceId, SystemClockDataPointIndex.Minute)
      .subscribe((data) => {
        if (data) {
          this.minute = data.Value;
        }
      });
      this.dataSubscriptions.push(subscription);

      subscription = this.realTimeDataService.GetRealtimeData(this.deviceId, SystemClockDataPointIndex.Second)
      .subscribe((data) => {
        if (data) {
          this.second = data.Value;
          this.TickClockSecond();
        }
      });
      this.dataSubscriptions.push(subscription);

      subscription = this.realTimeDataService.GetRealtimeData(this.deviceId, SystemClockDataPointIndex.TimeZone)
      .subscribe((data) => {
        if (data) {
          this.SystemTimeZone$.next(data.Value);
        }
      });
      this.dataSubscriptions.push(subscription);
  }

  private clearDataSubscriptions(): void {
    if (this.dataSubscriptions && this.dataSubscriptions.length > 0) {
      this.dataSubscriptions.forEach(subscription => {
        subscription.unsubscribe();
        subscription = null;
      });
    }
    this.dataSubscriptions = [];
  }

  private TickClockSecond(): void {
    const clock: Date = new Date(
      this.year,
      this.month - 1,
      this.day,
      this.hour,
      this.minute,
      this.second,
      0
    );
    this.SystemClockTime$.next(clock);
  }

  public restartClock(): void {
    this.clearDataSubscriptions();
    this.subscribetDataPoints();
  }

  // Get All Timezone values from server
  getTimeZoneArray(): Observable<TimeZoneModel[]> {
    return this.http
      .get<TimeZoneModel[]>(this.panelTimeZoneUrl)
      .pipe(catchError(this.handleError));
  }

  stdTimezoneOffset(): number {
    const jan = new Date(new Date().getFullYear(), 0, 1);
    const jul = new Date(new Date().getFullYear(), 6, 1);
    return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
  }

  // Check Daylight savings is applied or not
  isDstObserved(): boolean {
    return new Date().getTimezoneOffset() < this.stdTimezoneOffset();
  }

  // Browser Timezone
  setSystemTimezone(timezone) {
    return this.SystemTimeZoneString$.next(timezone);
 }

  // Browser Timezone
  getBrowserTimezone(): string {
    const browserTime = new Date().toTimeString();
    let browserTimeZoneName = browserTime.substr(19).substring(0, browserTime.substr(19).length - 1);
    if (this.isDstObserved()) {
        const timeZone = TimezonesDaylightStandardMismatchList.find(c => c.DaylightTimeZoneName === browserTimeZoneName);
        if (timeZone) {
            browserTimeZoneName = timeZone.StandardTimeZoneName;
        }
    }
    return browserTimeZoneName;
  }

  // Sync Timezone data
  updateTimezone(data: LinuxSystemClockUIModel): Observable<LinuxSystemClockUIModel> {

    return this.http
        .post<LinuxSystemClockUIModel>(this.panelTimeZoneUrl, data)
        .pipe(catchError(this.handleError));
  }

}

export class DaylightSavingTimeZone {
  public StandardTimeZoneName: string;
  public DaylightTimeZoneName: string;
}

// list of time zones from windows where description of timezone differs when daylight savings is applied.
// the time zone names which are similar when daylight savings is applied is not part of this list. 
export let TimezonesDaylightStandardMismatchList: DaylightSavingTimeZone[] = [
  { StandardTimeZoneName: "Hawaii-Aleutian Standard Time", DaylightTimeZoneName: "Hawaii-Aleutian Daylight Time" },
  { StandardTimeZoneName: "Mountain Standard Time", DaylightTimeZoneName: "Mexican Pacific Daylight Time" },
  { StandardTimeZoneName: "Mountain Standard Time", DaylightTimeZoneName: "Mountain Daylight Time" },
  { StandardTimeZoneName: "Central Standard Time", DaylightTimeZoneName: "Central Daylight Time" },
  { StandardTimeZoneName: "Central Standard Time", DaylightTimeZoneName: "Easter Island Standard Time" },
  { StandardTimeZoneName: "Eastern Standard Time", DaylightTimeZoneName: "Eastern Daylight Time" },
  { StandardTimeZoneName: "Eastern Standard Time", DaylightTimeZoneName: "Cuba Daylight Time" },
  { StandardTimeZoneName: "Bolivia Time", DaylightTimeZoneName: "Paraguay Standard Time" },
  { StandardTimeZoneName: "Bolivia Time", DaylightTimeZoneName: "Atlantic Daylight Time" },
  { StandardTimeZoneName: "Bolivia Time", DaylightTimeZoneName: "Amazon Standard Time" },
  { StandardTimeZoneName: "Bolivia Time", DaylightTimeZoneName: "Chile Standard Time" },
  { StandardTimeZoneName: "Argentina Standard Time", DaylightTimeZoneName: "Brasilia Standard Time" },
  { StandardTimeZoneName: "Argentina Standard Time", DaylightTimeZoneName: "West Greenland Summer Time" },
  { StandardTimeZoneName: "Argentina Standard Time", DaylightTimeZoneName: "St. Pierre & Miquelon Daylight Time" },
  { StandardTimeZoneName: "Cape Verde Standard Time", DaylightTimeZoneName: "Azores Summer Time" },
  { StandardTimeZoneName: "Greenwich Mean Time", DaylightTimeZoneName: "Western European Summer Time" },
  { StandardTimeZoneName: "Greenwich Mean Time", DaylightTimeZoneName: "British Summer Time" },
  { StandardTimeZoneName: "West Africa Standard Time", DaylightTimeZoneName: "Central European Summer Time" },
  { StandardTimeZoneName: "West Africa Standard Time", DaylightTimeZoneName: "Central Africa Time" },
  { StandardTimeZoneName: "Eastern European Standard Time", DaylightTimeZoneName: "Eastern European Summer Time" },
  { StandardTimeZoneName: "Eastern European Standard Time", DaylightTimeZoneName: "Israel Daylight Time" },
  { StandardTimeZoneName: "Petropavlovsk-Kamchatski Standard Time", DaylightTimeZoneName: "Fiji Standard Time" },
  { StandardTimeZoneName: "GMT", DaylightTimeZoneName: "Chatham Standard Time" },
  { StandardTimeZoneName: "Tonga Standard Time", DaylightTimeZoneName: "Apia Standard Time" },
];
