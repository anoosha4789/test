import { Component, HostListener, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UICommon } from '@core/data/UICommon';
import { AlarmDefinitionDataUIModel } from '@core/models/webModels/AlarmDefinitionDataUI.model';
import { AlarmKeyModel, MultiNodeAlarmDefinitionDataUI, MultiNodeAlarmState } from '@core/models/webModels/MultiNodeUIDataModel.model';
import { AlarmService } from '@core/services/alarm.service';
import { UserService } from '@core/services/user.service';
import { MultinodeService } from '@features/multinode/services/multinode.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-gateway-alarms-dialog',
  templateUrl: './gateway-alarms-dialog.component.html',
  styleUrls: ['./gateway-alarms-dialog.component.scss']
})
export class GatewayAlarmsDialogComponent implements OnInit {
  Title: string;
  IsMobileView: boolean = false;
  ActiveAlarmDescriptions: AlarmDefinitionDataUIModel[] = [];
  private dataSubscriptions: Subscription[] = [];
  defaultRoute = "/multinode/monitoring/alarm";
  
  constructor(public dialogRef: MatDialogRef<GatewayAlarmsDialogComponent>,
    protected alarmService: AlarmService, private multiNodeService: MultinodeService, private userService: UserService, private router: Router) { }

  styles = {
    padding: '2px'
  }

  private assignAlarms() {
    let subscription = this.alarmService.subscribeToActiveAlarms().subscribe(alarmDesc => {
      this.ActiveAlarmDescriptions = alarmDesc;
    });
    this.dataSubscriptions.push(subscription);
  }

  getAlarmMessage(alarm: AlarmDefinitionDataUIModel): string {
    if (this.ActiveAlarmDescriptions != null) {
      return alarm.Details
    }
    else {
      return null;
    }
  }

  AlarmStateDescriptionsMap = new Map<number, string>([
    [MultiNodeAlarmState.ACKNOWLEDGED, 'Acknowledged'],
    [MultiNodeAlarmState.ACTIVE, 'Active'],
    [MultiNodeAlarmState.INACTIVE, 'Inactive'],
    [MultiNodeAlarmState.SUSPENDED, 'Suspended'],
    [MultiNodeAlarmState.UNKNOWN, 'Unknown']
  ]);
  
  getAlarmStateDescription(alarmState: number): string {
    return this.AlarmStateDescriptionsMap.get(alarmState) ?? "";
  }

  private getAlarmCount(): void {
    let subscription = this.alarmService.subscribeToActiveAlarmCount().subscribe(alarmCount => {
      this.Title = alarmCount ? "Alarms(" + alarmCount + ")" : "No active alarms";
    });
    this.dataSubscriptions.push(subscription);
  }

  private detectScreenSize() {
    this.IsMobileView = window.innerWidth < 480 ? true : false;
  }

  ChangeAlarmState(data: MultiNodeAlarmDefinitionDataUI, action: string) {
    this.userService.GetCurrentLoginUser().then((user) => {
      if (user && user?.Name !== UICommon.OPENUSER_NAME) {
         const alarm: AlarmKeyModel= { EquipmentId: data.AlarmEquipmentId, ParentId: data.AlarmParentId, AlarmType: data.AlarmType, Action: action };

        this.multiNodeService.changealarmstate(alarm).subscribe(response => {
          console.log(action);
        });
      } else {
        this.dialogRef.close();
        UICommon.LogInRouteURL = `${this.defaultRoute}`;
        this.router.navigate(['/Login']);
      }
    });
  }

  OnCancel() {
    this.unsubscribeSubscriptions();
    this.dialogRef.close();
  }

  unsubscribeSubscriptions(): void {
    if (this.dataSubscriptions && this.dataSubscriptions.length > 0) {
      this.dataSubscriptions.forEach(subscription => {
        subscription.unsubscribe();
        subscription = null;
      });
    }
    this.dataSubscriptions = [];
  }

  @HostListener("window:resize", [])
  public onResize() {
    this.detectScreenSize();
  }

  ngAfterViewInit(): void {
    this.detectScreenSize();
    this.assignAlarms();
  }

  ngOnInit(): void {
    this.getAlarmCount();
  }
}
