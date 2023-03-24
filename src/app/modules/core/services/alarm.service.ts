import { Injectable } from '@angular/core';
import { GatewayBaseService } from './gatewayBase.service';
import { HttpClient } from '@angular/common/http';
import { catchError, delay, map, retryWhen, take, tap } from 'rxjs/operators';
import { AlarmDefinitionDataUIModel } from '@core/models/webModels/AlarmDefinitionDataUI.model';
import { AlarmAndLimitDefinition } from '@core/models/UIModels/alarmUIModel.model';
import { RealTimeDataSignalRService } from '@core/services/realTimeDataSignalR.service';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { InforceDeviceDataModel } from '@core/models/webModels/InforceDeviceData.model';
import { StateUtilities } from '@store/state/IState';
import * as UNIT_SYSTEM_ACTIONS from '@store/actions/unit-system.action';
import { IAlarmsState } from '@store/state/alarms.state';
import { Store } from '@ngrx/store';
import * as _ from "lodash";
import { IUnitSystemState } from '@store/state/unit-system.state';
import { AlarmsAndLimitsDataModel } from '@core/models/UIModels/PanelDefaultsDataModel.model';

@Injectable({
  providedIn: 'root'
})
export class AlarmService extends GatewayBaseService {

  public allalarmsurl: string = this.baseUrl + 'api/alarm';
  public configurl: string = this.baseUrl + 'api/Configuration/GetInforceDevices';
  private updateInFORCEAlarmDevicesURL = this.baseUrl + 'api/alarm/updateinforcealarms';

  // State Management
  private unitSystemModel$: Observable<IUnitSystemState>;

  public AllAlarmsDescription: any[] = [];
  private fatalCriticalcountOfAlarms = 0;
  private ActiveAlarmDescriptions: any[] = [];

  AlarmDescriptionList: AlarmDefinitionDataUIModel[] = [];
  private arrSubscriptions: Subscription[] = [];

  private _fatalCriticalcountOfAlarmsSubject = new Subject<number>();
  private _activeAlarmDescriptionsSubject = new BehaviorSubject<any[]>(null);
  private _alarmCountSubject = new BehaviorSubject<string>("0");
  private _alramsClickedSubject = new BehaviorSubject<boolean>(false);
  private _resetAlarmsSubject = new BehaviorSubject<boolean>(false);

  public PressureUnit: string;
  private countOfAlarms: string;
  totalactiveAlarmIds: number[] = new Array();
  totalactiveAlarmDescriptions: any[] = new Array();
  finalactiveAlarmDescriptions: AlarmDefinitionDataUIModel[] = new Array();
  consolidatedAlarmSevirity: string = "info";

  constructor(protected http: HttpClient,
    protected store: Store<{
      alarmsState: IAlarmsState;
      unitSystemState: IUnitSystemState;
    }>,
    private realtimeService: RealTimeDataSignalRService
  ) {
    super(http);
    this.unitSystemModel$ = store.select<IUnitSystemState>((state: any) => state.unitSystemState);
  }

  // HTTP API Calls
  getAllAlarmsData(): Observable<AlarmDefinitionDataUIModel[]> {
    return this.http.get<AlarmDefinitionDataUIModel[]>(this.allalarmsurl).pipe(
      catchError(this.handleError));
  }

  getAllInforceDevices(): Observable<InforceDeviceDataModel[]> {
    return this.http.get<InforceDeviceDataModel[]>(this.configurl).pipe(
      catchError(this.handleError));
  }

  updateInFORCEDevices(): Observable<any> {
    return this.http
      .post<any>(this.updateInFORCEAlarmDevicesURL, null)
      .pipe(catchError(this.handleError));
  }

  // Get Alarms and Limits
  getAlarmsAndLimits(): Observable<AlarmsAndLimitsDataModel> {
    const results: Observable<AlarmsAndLimitsDataModel> = this.http
      .get<AlarmAndLimitDefinition[]>(this.allalarmsurl + '/getconfigurable')
      .pipe(
        map(alarmsAndLimitsArr => {
          //GATE-1803 Starts - if object returns null, then retry
          if (alarmsAndLimitsArr === null) {
            console.log('alarmsAndLimits is null');
            throw alarmsAndLimitsArr;
          }
          //GATE-1803 Ends
          const alarmsAndLimits = new AlarmsAndLimitsDataModel();
          if (alarmsAndLimitsArr !== null) {
            for (const alarmObj of alarmsAndLimitsArr) {
              if (alarmObj.AlarmId === 0) {
                alarmsAndLimits.StartPumpPressure = alarmObj;
              }
              else if (alarmObj.AlarmId === 1) {
                alarmsAndLimits.StopPumpPressure = alarmObj;
              }
              else if (alarmObj.AlarmId === 2) {
                alarmsAndLimits.HighPumpPressure = alarmObj;
              }
              else if (alarmObj.AlarmId === 55) {
                alarmsAndLimits.HighOutputXPressure = alarmObj;
              }
              else if (alarmObj.AlarmId === 4) {
                alarmsAndLimits.HighSupplyPressure = alarmObj;
              }
              else if (alarmObj.AlarmId === 6) {
                alarmsAndLimits.LowReservoirLevel = alarmObj;
              }
            }
          }
          return alarmsAndLimits;
        }),
        retryWhen(errors => errors.pipe(delay(1000), tap(alarmsAndLimitsArr => console.log('alarmsAndLimitsArr retry')), take(2))), //GATE-1803
        catchError(this.handleError)
      );

    return results;
  }

  // Save Alarms and Limits
  updateAlarmsAndLimits(data: AlarmsAndLimitsDataModel): Observable<any> {
    const alarmsAndLimitsArr = [
      data.StartPumpPressure,
      data.StopPumpPressure,
      data.HighPumpPressure,
      data.HighOutputXPressure,
      data.HighSupplyPressure,
      data.LowReservoirLevel
    ];
    return this.http
      .post<AlarmAndLimitDefinition[]>(this.allalarmsurl + '/update', alarmsAndLimitsArr)
      .pipe(catchError(this.handleError));
  }

  // Bussiness Logic
  private updateInFORCEAlarmStatus(): void {
    this.totalactiveAlarmDescriptions = [];

    if (this.totalactiveAlarmIds.length > 0) {
      let fatalTypeCount = 0;
      let criticalTypeCount = 0;
      let infoTypeCount = 0;
      let warningTypeCount = 0;

      if (this.AllAlarmsDescription != null) {
        for (let k = 0; k < this.totalactiveAlarmIds.length; k++) {
          //find severityType of each alarm
          let alarm = this.AllAlarmsDescription.find(c => c.AlarmId == this.totalactiveAlarmIds[k]);
          if (alarm != null) {
            let severityType = alarm.SeverityType;

            if (severityType == 1) {
              fatalTypeCount++;
              this.totalactiveAlarmDescriptions.push(alarm);
            }
            else if (severityType == 2) {
              criticalTypeCount++;
              this.totalactiveAlarmDescriptions.push(alarm);
            }
            else if (severityType == 3) {
              warningTypeCount++;
              this.totalactiveAlarmDescriptions.push(alarm);
            }
            else if (severityType == 4)
              infoTypeCount++;
          }
        }
        this.totalactiveAlarmDescriptions.sort((a, b) => a.SeverityType.toString().localeCompare(b.SeverityType.toString()));
      }

      //if inforce driver lost communication, there is not need to show flowmeter communication error.
      if (this.totalactiveAlarmDescriptions.find(t => t.DataPointIndex === 98)) { //check if there is inforce driver communication error
        let idx = this.totalactiveAlarmDescriptions.findIndex(t => t.DataPointIndex === 101);
        if (idx >= 0) { //if there is inforce flowmeter communication error, then remove
          this.totalactiveAlarmDescriptions.splice(idx, 1);
          fatalTypeCount = fatalTypeCount - 1;
        }
      }

      let totCount = fatalTypeCount + warningTypeCount + criticalTypeCount;

      this.countOfAlarms = totCount > 0 ? (totCount > 50 ? "50+" : totCount.toString()) : "";
      if (fatalTypeCount > 0)
        this.consolidatedAlarmSevirity = "fatal";
      else if (criticalTypeCount > 0)
        this.consolidatedAlarmSevirity = "critical";
      else if (warningTypeCount > 0)
        this.consolidatedAlarmSevirity = "warning";
      else if (infoTypeCount > 0)
        this.consolidatedAlarmSevirity = "info";
      else
        this.consolidatedAlarmSevirity = "info";

      this.fatalCriticalcountOfAlarms = fatalTypeCount + criticalTypeCount;
      this._fatalCriticalcountOfAlarmsSubject.next(this.fatalCriticalcountOfAlarms);
      this.ActiveAlarmDescriptions = this.totalactiveAlarmDescriptions;
      this._activeAlarmDescriptionsSubject.next(this.ActiveAlarmDescriptions);
      this._alarmCountSubject.next(this.countOfAlarms);
      // AlarmService.Title = totCount == 0 ? "No alarms" : "Alarms(" + this.countOfAlarms + ")";
    }
    else {
      this.fatalCriticalcountOfAlarms = 0;
      this._fatalCriticalcountOfAlarmsSubject.next(this.fatalCriticalcountOfAlarms);
      this.ActiveAlarmDescriptions = [];
      this._activeAlarmDescriptionsSubject.next(this.ActiveAlarmDescriptions);
      this.countOfAlarms = "";
      this._alarmCountSubject.next(this.countOfAlarms);
    }
  }

  private updateAlarmStatus(isInFORCE: boolean = true) {
    if (isInFORCE) {
      this.updateInFORCEAlarmStatus();
    }
    else if (this.hasAlarms()) {
      let totCount = this.totalactiveAlarmIds.length;
      this.countOfAlarms = totCount > 0 ? (totCount > 50 ? "50+" : totCount.toString()) : "";

      this.fatalCriticalcountOfAlarms = this.totalactiveAlarmIds.length;
      this._fatalCriticalcountOfAlarmsSubject.next(this.fatalCriticalcountOfAlarms);
      this.ActiveAlarmDescriptions = this.AllAlarmsDescription;
      this._activeAlarmDescriptionsSubject.next(this.ActiveAlarmDescriptions);
      this._alarmCountSubject.next(this.countOfAlarms);
    }
    else {
      this.fatalCriticalcountOfAlarms = 0;
      this._fatalCriticalcountOfAlarmsSubject.next(this.fatalCriticalcountOfAlarms);
      this.ActiveAlarmDescriptions = [];
      this._activeAlarmDescriptionsSubject.next(this.ActiveAlarmDescriptions);
      this.countOfAlarms = "";
      this._alarmCountSubject.next(this.countOfAlarms);
    }
  }

  private initUnitSystem() {
    return new Promise((resolve, reject) => {
      let subscription = this.unitSystemModel$.subscribe((state: IUnitSystemState) => {

        if (state !== undefined) {
          if (state.isLoaded === false) {
            // Dispatch Action if not loaded
            this.store.dispatch(UNIT_SYSTEM_ACTIONS.UNITSYSTEM_LOAD());
          } else {
            if (StateUtilities.hasErrors(state)) {
              reject(state.error);
            } else {

              this.PressureUnit = state.unitSystem.UnitQuantities.find(c => c.UnitQuantityName === "pressure").SelectedDisplayUnitSymbol;
              resolve(true);
            }
          }
        }

      });

      this.arrSubscriptions.push(subscription);
    });
  }

  public alarmClicked(): void {
    this._alramsClickedSubject.next(true);
  }

  public subscribeToFatalCriticalAlarmsCount(): Subject<number> {
    return this._fatalCriticalcountOfAlarmsSubject;
  }

  public subscribeToActiveAlarms(): Subject<any[]> {
    return this._activeAlarmDescriptionsSubject;
  }

  public subscribeToActiveAlarmCount(): Subject<string> {
    return this._alarmCountSubject;
  }

  public subscribeToAlarmsClicked(): Subject<boolean> {
    return this._alramsClickedSubject;
  }

  public resetAlarms() {
    this._resetAlarmsSubject.next(true);
  }

  public subscribeToResetAlarms(): Subject<boolean> {
    return this._resetAlarmsSubject;
  }

  public AlarmsCleared() {
    this._resetAlarmsSubject.next(false);
  }

  public hasAlarms(): boolean {
    return this.AllAlarmsDescription?.length > 0 ? true : false;
  }

  updateAlarmDescription(alarms: any[]): void {
    this.AllAlarmsDescription = _.cloneDeep(alarms);
  }

  updateRealtimeAlarms(totalAlarmIds: any, isInFORCE: boolean = true): void {
    if (totalAlarmIds && totalAlarmIds.length >= 0) {
      this.totalactiveAlarmIds = totalAlarmIds;
      this.updateAlarmStatus(isInFORCE);
    }
  }
}
