import { Component, OnInit,Output,EventEmitter } from '@angular/core';
import { HyrdraulicPowerUnitPointIndex } from '@features/inforce/common/InForceModbusRegisterIndex';
import { RealTimeDataSignalRService } from '@core/services/realTimeDataSignalR.service';
import { Subscription,Observable } from 'rxjs';
import { IInforceDeviceState } from '@store/state/inforcedevices.state';
import { InforceDeviceDataModel } from '@core/models/webModels/InforceDeviceData.model';
import { Store } from '@ngrx/store';
import { StateUtilities } from '@store/state/IState';
import { INFORCEDEVICES_LOAD } from '@store/actions/inforcedevices.action';
@Component({
  selector: 'gw-maintenance-mode-indicator',
  templateUrl: './gw-maintenance-mode-indicator.component.html',
  styleUrls: ['./gw-maintenance-mode-indicator.component.scss']
})
export class GwMaintenanceModeIndicatorComponent implements OnInit {

  showMaintenenceMode: boolean = false;
  private dataSubscriptions: Subscription[] = [];
  private inforcedevices: InforceDeviceDataModel[] = [];
  InforceDeviceState$: Observable<IInforceDeviceState>;
  @Output() showMaintenenceModeEvent = new EventEmitter<boolean>();
  constructor(
    protected store: Store<{ inforcedevicesState: IInforceDeviceState; }>,
    private realTimeDataSignalRService: RealTimeDataSignalRService
  ) {
    this.InforceDeviceState$ = this.store.select<any>((state: any) => state.inforcedevicesState);
   }

  ngOnInit(): void {
    this.subscribeToInforceDevices();
  }
  private subscribeToMaintenanceMode(): void {
    let hpuDeviceId = this.inforcedevices.find(d => d.DeviceName === "HPU")?.DeviceId;

    const subscription = this.realTimeDataSignalRService.GetRealtimeData(hpuDeviceId, HyrdraulicPowerUnitPointIndex.iFieldSlaveLockOutMode).subscribe(value => {
      if (value != undefined && value != null) {
       if(value.Value === 1){
        this.showMaintenenceMode = true;
        this.showMaintenenceModeEvent.emit(true);
       }
       else if(value.Value === 0){
        this.showMaintenenceMode = false;
        this.showMaintenenceModeEvent.emit(false);
       }
      }
    });
    this.dataSubscriptions.push(subscription);
  }
  private subscribeToInforceDevices(): void {
    const subscription = this.InforceDeviceState$.subscribe(
      (state: IInforceDeviceState) => {
        if (state !== undefined) {
          if (state.isLoaded === false && !StateUtilities.hasErrors(state)) {
            this.store.dispatch(INFORCEDEVICES_LOAD());
          } else {
            Object.assign(this.inforcedevices, state.inforcedevices);
          }
          this.subscribeToMaintenanceMode();
        }
      }
    );
    this.dataSubscriptions.push(subscription);
    
  }

  ngOnDestroy(): void {
    if (this.dataSubscriptions != null && this.dataSubscriptions.length > 0) {
      this.dataSubscriptions.forEach(subscription => {
        if (subscription != null)
          subscription.unsubscribe();
          subscription = null;
      });
    }
    this.dataSubscriptions = [];
  }
}
