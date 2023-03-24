import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  Subject,
  Subscription,
  Observable,
  timer as observableTimer,
} from 'rxjs';

import * as signalR from '@aspnet/signalr';

import { TokenStorageService } from '@core/services/tokenStorage.service';
import { DataPointValue } from '@core/models/webModels/PointTemplate.model';
import { environment } from 'src/environments/environment';
import { UICommon } from '@core/data/UICommon';
import * as SERVER_RUNNING_STATUS_ACTIONS from '@store/actions/serverRunningStatus.action';
import { Store } from '@ngrx/store';
import { IServerRunningStatusState } from '@store/state/serverRunningStatus.state';
import { RealtimeLogMessageModel } from '@core/models/webModels/RealtimeLogMessageModel.model';
import { MultiNodeEquipmentAlarm } from '@core/models/webModels/MultiNodeUIDataModel.model';

// Server will send out an boolean array, the enum is used to index the boolean value.
enum ServerRunningStatusType {
  ConfigurationSavingInProgress = 0,
  ConfigurationResetingInProgress = 1,
}

@Injectable({
  providedIn: 'root',
})
export class RealTimeDataSignalRService {
  private _dataSourceMap = new Map<number, BehaviorSubject<DataPointValue>>();
  private _realTimeLogMessage = new Subject<RealtimeLogMessageModel>();
  private _dateTimeUpdate = new BehaviorSubject<Date>(null);
  private _configurationUpdatedFlag = new Subject<boolean>();
  private _configurationResetFlag = new Subject<boolean>();
  private _userDeletedFlag = new Subject<string>();
  private _reloadConfiguration = new Subject<boolean>();
  private _isRealtimeServiceUp = new Subject<boolean>();
  private _isTokenInvalidated = new Subject<boolean>();
  private _sensorCalibrationUpdatedFlag = new Subject<boolean>();
  private _multiNodePackageLoadEvent = new Subject<boolean>();
  private _multiNodeEquipmentAlarmUpdate = new Subject<MultiNodeEquipmentAlarm>();
  private _stopConnection: boolean;
  private _hubConnection: signalR.HubConnection;
  private signalRReconnectSubscrition: Subscription;
  private serverRunningStatus: boolean[] = [false, false];

  private _saveEventNotified: boolean = false;
  private _resetEventNotified: boolean = false;

  constructor(
    private tokenStorage: TokenStorageService,
    private store: Store<{
      serverRunningStatusState: IServerRunningStatusState;
    }>
  ) {}

  get SaveEventNotifiedEvent(): boolean {
    return this._saveEventNotified;
  }

  set SaveEventNotifiedEvent(bValue: boolean) {
    this._saveEventNotified = bValue;
  }

  get ResetEventNotifiedEvent(): boolean {
    return this._resetEventNotified;
  }

  set ResetEventNotifiedEvent(bValue: boolean) {
    this._resetEventNotified = bValue;
  }
  
  public getOS(): string {
    const userAgent = window.navigator.userAgent;
    const platform = window.navigator.platform;
    const macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'];
    const windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'];
    const iosPlatforms = ['iPhone', 'iPad', 'iPod'];
    let os = null;

    if (macosPlatforms.indexOf(platform) !== -1) {
      os = 'Mac OS';
    } else if (iosPlatforms.indexOf(platform) !== -1) {
      os = 'iOS';
    } else if (windowsPlatforms.indexOf(platform) !== -1) {
      os = 'Windows';
    } else if (/Android/.test(userAgent)) {
      os = 'Android';
    } else if (!os && /Linux/.test(platform)) {
      os = 'Linux';
    }

    return os;
  }

  public async startConnection(): Promise<boolean> {
    console.log('Starting signalr connection...');
    console.log(environment.realTimeWebhostURL);

    if (this.getOS() === 'iOS') {
      // Build Connection
      this._hubConnection = new signalR.HubConnectionBuilder()
        .withUrl(environment.realTimeWebhostURL, {
          transport: signalR.HttpTransportType.LongPolling,
          accessTokenFactory: () => this.tokenStorage.getToken(),
        })
        // .configureLogging(signalR.LogLevel.Trace)
        .build();
    } else {
      // Build Connection
      this._hubConnection = new signalR.HubConnectionBuilder()
        .withUrl(environment.realTimeWebhostURL, {
          transport:
            signalR.HttpTransportType.WebSockets |
            signalR.HttpTransportType.ServerSentEvents |
            signalR.HttpTransportType.LongPolling,
          accessTokenFactory: () => this.tokenStorage.getToken(),
        })
        // .configureLogging(signalR.LogLevel.Trace)
        .build();
    }

    // Subscribe Events here
    this.SubscribeTransferringRealTimeData();
    this.SubscribeReceiveConfigurationUpdatedEvent();
    this.SubscribeRecieveResetConfigurationEvent();
    this.SubscribeReceiveSensorCalibrationUpdatedEvent();
    this.SubsribeRecieveDeleteUserEvent();
    this.SubscribeToMultiNodePackageLoadEvent();
    this.SubsribeToOnCloseEvent();
    this.SubscribeServerRunningStatusWord();
    this.SubscribeToRecieveRealtimeLogMessageEvent();
    this.SubscribeRecieveMultiNodeEquipmentAlarmUpdateEvent();

    let hubConnectionStatus = false;
    // Connect to SignalR
    await this._hubConnection
      .start()
      .then(() => {
        hubConnectionStatus = true;
        console.log('SignalR Service Connected successfully.');
      })
      .catch((err) => {
        if (err.statusCode === 401) { // Unauthorized - Token invalidated
          console.log(err);
          this.stopConnection(false);
          this._isTokenInvalidated.next(true);
          hubConnectionStatus = false;
        }
        else {
          if(this._hubConnection.state == signalR.HubConnectionState.Connected)  {  // if by previous call - error returned
            console.log("Error occured but SignalR is already connected");
            hubConnectionStatus = true;
          }
          else {
            console.log('Error while starting SignalR Service connection: ' + err);
            hubConnectionStatus = false;
            this.reConnectRealtimeServer();
          }
        }
      });

    this.upDateRealtimeStatus(hubConnectionStatus);
    return Promise.resolve(hubConnectionStatus);
  }

  public stopConnection(bStopStatus: boolean = true): void {
    this._stopConnection = bStopStatus;
    this._hubConnection
      .stop()
      .then(() => {
        console.log('SignalR Service Connection stopped.');
      })
      .catch((err) =>
        console.log('Error while stoping SignalR Service connection: ' + err)
      );
  }

  private upDateRealtimeStatus(bStatus: boolean) {
    this._isRealtimeServiceUp.next(bStatus);
  }

  private reConnectRealtimeServer(): void {
    console.log('Reconnection SignalR service...');
    if (this.signalRReconnectSubscrition != null) {
      this.signalRReconnectSubscrition.unsubscribe();
      this.signalRReconnectSubscrition = null;
    }
    this.signalRReconnectSubscrition = observableTimer(0, 5000) // start new subscrition
      .subscribe(() => {
        if (this._hubConnection.state === signalR.HubConnectionState.Disconnected) {
          this.startConnection()
            .then((x) => {
              if (x === true) {
                console.log('Realtime SignalR service reconnected.');
              }
            })
            .catch((err) => {
              this.upDateRealtimeStatus(false); //disconnected
              console.log(
                'Error while reconnecting SignalR Service connection: ' + err
              );
            });
        }
        else {
          this.upDateRealtimeStatus(true);  // already connected
          this.signalRReconnectSubscrition.unsubscribe();
          this.signalRReconnectSubscrition = null;
        }
      });
  }

  private SubsribeToOnCloseEvent(): void {
    // Connection Closed/Disconnected
    this._hubConnection.onclose(() => {
      console.log('SignalR Service Connection closed.');
      //this.upDateRealtimeStatus(false);
      if (!this._stopConnection) {
        this.reConnectRealtimeServer();
      }
      this._stopConnection = false;
    });
  }

  // Process the server running status word
  private SubscribeServerRunningStatusWord = () => {
    this._hubConnection.on('ReceiveServerRunningStatusWord', (word) => {
      if (word && Array.isArray(word)) {
        let index = 0;
        for (const entry in ServerRunningStatusType) {
          if (
            entry ===
            ServerRunningStatusType.ConfigurationSavingInProgress.toString()
          ) {
            index = ServerRunningStatusType.ConfigurationSavingInProgress;

            if (this.serverRunningStatus[index] !== word[index]) {
              this.serverRunningStatus[index] = word[index];
              if (this.serverRunningStatus[index]) {
                this.store.dispatch(
                  SERVER_RUNNING_STATUS_ACTIONS.SAVING_CONFIGURATION()
                );
              } else {
                this.store.dispatch(
                  SERVER_RUNNING_STATUS_ACTIONS.DONE_SAVING_CONFIGURATION()
                );
              }
            }
          } else if (
            entry ===
            ServerRunningStatusType.ConfigurationResetingInProgress.toString()
          ) {
            index = ServerRunningStatusType.ConfigurationResetingInProgress;

            if (this.serverRunningStatus[index] !== word[index]) {
              this.serverRunningStatus[index] = word[index];
              if (this.serverRunningStatus[index]) {
                this.store.dispatch(
                  SERVER_RUNNING_STATUS_ACTIONS.RESETTING_CONFIGURATION()
                );
              } else {
                this.store.dispatch(
                  SERVER_RUNNING_STATUS_ACTIONS.DONE_RESETTING_CONFIGURATION()
                );
              }
            }
          }
        }
      }
    });
  };

  // ReceiveRealTimeData from realtimewebhost via signalR data broadcast
  private SubscribeTransferringRealTimeData = () => {
    const pointVal: DataPointValue = null;
    this._hubConnection.on('ReceiveRealTimeData', (data) => {
      this.UpdateData(data); // Update buffer
    });
  };

  // Receive the configuration updated event
  private SubscribeReceiveConfigurationUpdatedEvent = () => {
    this._hubConnection.on('ReceiveConfigurationUpdatedEvent', (data) => {
      this._configurationUpdatedFlag.next(true);
      console.log('Configuration is updated');
    });
  };

  // Receive the configuration Reset event
  private SubscribeRecieveResetConfigurationEvent = () => {
    this._hubConnection.on('ReceiveResetConfigurationEvent', (data) => {
      this._configurationResetFlag.next(true);
      console.log('Configuration Reset');
    });
  };

  private SubscribeReceiveSensorCalibrationUpdatedEvent = () => {
    this._hubConnection.on('ReceiveSensorCalibrationUpdatedEvent', (data) => {
      this._sensorCalibrationUpdatedFlag.next(true);
      console.log("Sensor Calibration is updated");
    });
  };

  private SubsribeRecieveDeleteUserEvent(): void {
    this._hubConnection.on('RecieveDeleteUserEvent', (loginName) => {
      this._userDeletedFlag.next(loginName);
      console.log('User deleted from server');
    });
  }

  private SubscribeToRecieveRealtimeLogMessageEvent(): void {
    this._hubConnection.on('RecieveRealtimeLogMessageEvent', (logMessage) => {
      this._realTimeLogMessage.next(logMessage);
    });
  }

  private SubscribeToMultiNodePackageLoadEvent(): void {
    this._hubConnection.on('RecieveMultiNodePackageLoadEvent', (data: boolean) => {
      this._multiNodePackageLoadEvent.next(data);
      console.log("MultiNode Package Load status: " + data);
    });
  }

    // Receive the multiNode Equipment alarm update event
    private SubscribeRecieveMultiNodeEquipmentAlarmUpdateEvent = () => {
      this._hubConnection.on('RecieveMultiNodeEquipmentAlarmUpdateEvent', (multiNodeAlarm) => {
        this._multiNodeEquipmentAlarmUpdate.next(multiNodeAlarm);
        //console.log('MultiNode Equipment Alarm Is Update');
      });
    };

  // Notify other clients about the system configuration is updated
  public NotifyOthersForConfigurationUpdatedEvent = () => {
    this._saveEventNotified = true;
    this._hubConnection
      .invoke('NotifyAllForConfigurationUpdatedEvent')
      .then((x) => {
        console.log('Other clients notified');
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // Notify other clients about the system configuration is updated
  public NotifyOthersForConfigurationResetEvent = () => {
    this._resetEventNotified = true;
    this._hubConnection
      .invoke('NotifyAllForResetConfigurationEvent')
      .then((x) => {
        console.log('Other clients notified of Reset');
      })
      .catch((err) => {
        console.log(err);
      });
  };

  //Notify other clients about the system configuration is updated
  public NotifyOthersForSensorCalibrationUpdateEvent = () => {
    this._hubConnection.invoke('NotifyAllForSensorCalibrationUpdateEvent').then(x => {
      console.log("Other clients notified of Panel Sensor calibration update")
    })
      .catch(err => {
        console.log(err)
      });
  }

  public NotifyOthersForUserDeletedEvent = (loginName: string) => {
    this._hubConnection
      .invoke('NotifyAllForDeletedUser', loginName)
      .then((x) => {
        console.log('Other clients notified of User delete operation');
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // Fetch updated data from this method.
  public GetRealtimeData(
    devideId: number,
    pointIndex: number
  ): Observable<DataPointValue> {
    const index = devideId * 10000 + pointIndex;
    let serverDataPointSubject = this._dataSourceMap.get(index);
    if (
      serverDataPointSubject === undefined ||
      serverDataPointSubject === null
    ) {     
      const pointVal = new DataPointValue(
        devideId,
        pointIndex,
        UICommon.defaultBadValue,
        null
      );
      this._dataSourceMap.set(index, new BehaviorSubject(pointVal));
      serverDataPointSubject = this._dataSourceMap.get(index);
    }
    return serverDataPointSubject.asObservable();
  }

  public GetRealtimeLogMessages(): Observable<RealtimeLogMessageModel> {
    return this._realTimeLogMessage.asObservable();
  }

  // Notification subscription logic for pages to respond to configuration update, Reset Configuration
  public NotifyReloadConfiguration(bReloadConfig: boolean) {
    this._reloadConfiguration.next(bReloadConfig);
  }

  public GetUpdateDateValue(): Observable<Date> {
    return this._dateTimeUpdate.asObservable();
  }

  public GetConfigurationUpdatedEventFlag(): Subject<boolean> {
    return this._configurationUpdatedFlag;
  }

  public GetConfigurationResetEventFlag(): Subject<boolean> {
    return this._configurationResetFlag;
  }

  public GetSensorCalibrationEventFlag(): Subject<boolean> {
    return this._sensorCalibrationUpdatedFlag;
  }

  public GetDeletedUserEventFlag(): Subject<string> {
    return this._userDeletedFlag;
  }

  public GetMultiNodePackageLoadEventFlag(): Subject<boolean> {
    return this._multiNodePackageLoadEvent;
  }

  public GetMultiNodeEquipmentAlarmUpdate(): Subject<MultiNodeEquipmentAlarm> {
    return this._multiNodeEquipmentAlarmUpdate;
  }

  public ReloadConfiguration(): Subject<boolean> {
    return this._reloadConfiguration;
  }

  public IsRealtimeUp(): Subject<boolean> {
    return this._isRealtimeServiceUp;
  }

  public IsUserTokenInvalidated(): Subject<boolean> {
    return this._isTokenInvalidated;
  }

  public ResetData(): void {
    this._dataSourceMap.clear();
  }
  // New logic for data buffer
  private UpdateData(data: any): void {
    let pointVal;
    let pointValOrig: DataPointValue = null;
    let pointValSubs = null;
    let pointIndex = -1;

    const newDateValue = new Date(data.UpdatedTimeStamp);
    if (this._dateTimeUpdate.value == null || (newDateValue.getTime() - this._dateTimeUpdate.value.getTime()) / 1000 > 1) {
      this._dateTimeUpdate.next(newDateValue);
    }

    for (let i = 0; i < data.DataPoints.length; i++) {
      // convert Realtime DataPoint values to ServerDataPointValue
      pointVal = new DataPointValue(
        data.DataPoints[i].DeviceId,
        data.DataPoints[i].DataPointIndex,
        data.DataPoints[i].RawValue,
        null
      );
      pointIndex = pointVal.DeviceId * 10000 + pointVal.PointIndex;
      pointValSubs = this._dataSourceMap.get(pointIndex);

      if (pointValSubs !== undefined && pointValSubs !== null) {
        pointValOrig = pointValSubs.value;
        if (Math.abs(pointValOrig.Value - pointVal.Value) > 0.00001) {
          pointValOrig.Value = pointVal.Value;
          pointValSubs.next(pointValOrig);
        }
      } else {
        this._dataSourceMap.set(pointIndex, new BehaviorSubject(pointVal));
        this._dataSourceMap.get(pointIndex).next(pointVal);
      }
    }
  }
}
