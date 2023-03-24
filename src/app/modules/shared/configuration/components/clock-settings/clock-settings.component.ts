import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { LinuxSystemClockUIModel } from '@core/models/UIModels/linux-system-clock.model';
import { SystemClockService } from '@core/services/system-clock.service';
import { PanelConfigurationFacade } from '@core/facade/panelConfigFacade.service';
import { UICommon } from '@core/data/UICommon';
import { GatewayModalService } from '@shared/gateway-dialogs/services/gatewayModal.service';
import { TimeZoneModel } from '@core/models/webModels/TimeZone.model';

@Component({
  selector: 'app-clock-settings',
  templateUrl: './clock-settings.component.html',
  styleUrls: ['./clock-settings.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ClockSettingsComponent implements OnInit, OnDestroy {

  systemClockTime = new Date();
  browserClockTime: any;
  browserTimezone: string;
  systemTimezone: string;
  panelTypeName: string;
  private arrSubscriptions: Subscription[] = [];
  private timeZoneList: TimeZoneModel[] = [];
  systemTimeZone111: any;
  private timeZoneIdx: any;

  constructor(private router: Router,
    private datePipe: DatePipe,
    private panelConfigFacade: PanelConfigurationFacade,
    private modalService: GatewayModalService,
    private systemClockService: SystemClockService) {
    this.panelConfigFacade.initPanelConfigurationCommon().subscribe(panelConfigState => {
      if (panelConfigState) {
        this.panelTypeName = UICommon.getPanelType(panelConfigState.panelConfigurationCommon.PanelTypeId, true).name;
      }
    });
  }

  ngOnInit(): void {
    this.browserTimezone = this.getBrowserTimezone();
    const subscription = this.systemClockService.SystemClockTime$.subscribe((dt) => {
      this.browserClockTime = new Date();
      this.systemClockTime = dt;
    });
    const timeZoneSubscription = this.systemClockService.SystemTimeZone$.subscribe(
      (tz) => {
        if (tz) {
          this.timeZoneIdx = tz;
        }
      }
    );
    this.arrSubscriptions.push(subscription);
    this.arrSubscriptions.push(timeZoneSubscription);
    this.getSystemTimezone();
  }

  ngAfterViewInit(): void {
    console.log("ngAfterViewInit - System Timezone: " + this.systemTimezone);
    if(!this.systemTimezone) {
      const timeZoneSubscription = this.systemClockService.SystemTimeZone$.subscribe(
        (tz) => {
          if (tz) {
            this.timeZoneIdx = tz;
            this.getSystemTimezone();
          }
        }
      );
      this.arrSubscriptions.push(timeZoneSubscription);
    }
  }

  getBrowserTimezone(): string {

    this.browserTimezone = new Date().toTimeString();
    return this.browserTimezone.substr(19).substring(0, this.browserTimezone.substr(19).length - 1) +
      ' (' + this.browserTimezone.replace('GMT', 'UTC').substr(9, 8) + ')';
  }

  getSystemTimezone() {
    const subscription = this.systemClockService.SystemTimeZoneString$.subscribe((tz) =>{ 
      this.systemTimezone = tz;
      if(tz == null || tz == undefined){
        const subscription = this.systemClockService.getTimeZoneArray().subscribe((res) => {
          this.timeZoneList = res;
          if (this.timeZoneList && this.timeZoneList.length > 0) {
                  const systemclockDescription = this.getSystemClockTimeZoneDescription();
                  if (systemclockDescription) {
                    this.systemTimeZone111 =
                      systemclockDescription +
                      ' (' +
                      this.getSystemClockTimeZoneValue().replace(':', '') +
                      ')';
                      this.systemTimezone = this.systemTimeZone111;
                  }else{
                    this.systemTimezone = "...";
                  }
                }
        });        
        this.arrSubscriptions.push(subscription);
      }
    });
    this.arrSubscriptions.push(subscription);
  }

  getSystemClockTimeZoneValue(): string {
    const timezone = this.timeZoneList.find(
      (c) => c.Index === this.timeZoneIdx
    );
    if (timezone) {
      const isnegativeoffset = timezone.BaseUtcOffset.indexOf('-');
      if (isnegativeoffset === -1) {
        // +ve offset
        return 'UTC+' + timezone.BaseUtcOffset.substr(0, 5).replace(':', '');
      } else {
        // -ve offset
        return 'UTC' + timezone.BaseUtcOffset.substr(0, 6).replace(':', '');
      }
    }
  }
  getSystemClockTimeZoneDescription(): string {
    const timezone = this.timeZoneList.find(
      (c) => c.Index === this.timeZoneIdx
    );
    return timezone ? timezone.Id : null;
  }

  syncTimezone() {
    const dateTimeString = this.datePipe.transform(this.browserClockTime, 'yyyy-MM-dd HH:mm:ss');
    const data: LinuxSystemClockUIModel = {
      TimeZoneName: this.systemClockService.getBrowserTimezone(),
      DateTimeString: dateTimeString,
      NewTimeZoneName: ''
    };
    const subscription = this.systemClockService.updateTimezone(data).subscribe((res) => {
      this.modalService.openDialog(
        "Browser and System Clock are now synced.",
        () => {
          this.router.navigateByUrl(`/${this.panelTypeName}/dashboard`);
          this.modalService.closeModal();
        },
        null,
        'Info',
        null,
        false,
        'Ok',
        null
      );
    });
    this.arrSubscriptions.push(subscription);
  }

  ngOnDestroy(): void {
    if (this.arrSubscriptions != null && this.arrSubscriptions.length > 0) {
      this.arrSubscriptions.forEach((subscription) => {
        if (subscription) {
          subscription.unsubscribe();
        }
      });
    }

    this.arrSubscriptions = [];
  }

}
