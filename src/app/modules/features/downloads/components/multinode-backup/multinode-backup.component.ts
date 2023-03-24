import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { DataBackupDetailsModel } from '@core/models/webModels/DataBackupDetailsModel';
import { MultinodeBackupService } from '@core/services/multinode-backup.service';
import { RealTimeDataSignalRService } from '@core/services/realTimeDataSignalR.service';
import { MultiNodeControlDataPointIndex } from '@features/multinode/common/MultiNodeRegisterIndex';
import { Store } from '@ngrx/store';
import { IDeviceDataPoints } from '@store/state/deviceDataPoints.state';
import { ngxLoadingAnimationTypes } from 'ngx-loading';
import { Observable, Subscription } from 'rxjs';
import * as DEVICEPOINTS_ACTIONS from '@store/actions/deviceDataPoints.action';
import { Router } from '@angular/router';

@Component({
  selector: 'app-multinode-backup',
  templateUrl: './multinode-backup.component.html',
  styleUrls: ['./multinode-backup.component.scss']
})
export class MultinodeBackupComponent implements OnInit, OnDestroy {
  backupUIData: BackupUIData;
  loadconfig = { animationType: ngxLoadingAnimationTypes.threeBounce, backdropBorderRadius: '3px', fullScreenBackdrop: true };
  isCreationInProgress: boolean = false;
  private dataSubscriptions: Subscription[] = [];
  private deviceDataPointsModels$: Observable<IDeviceDataPoints>;

  constructor(protected store: Store<any>,
    private backupService: MultinodeBackupService,
    private realTimeService: RealTimeDataSignalRService,
    private router: Router,
    private datePipe: DatePipe) {
    this.deviceDataPointsModels$ = this.store.select<any>((state: any) => state.deviceDataPointsState);
  }

  onPrimaryBtnClick(data: BackupUIData) {
    if (data.BackupStatus === BackupStatus.NEW) {
      // Ok button click
      this.saveData(data);
    } else if (data.BackupStatus === BackupStatus.CREATED) {
      // Save button click after created
      this.downloadData(data);
    } else if (data.BackupStatus === BackupStatus.EXISTING) {
      // Save Existing button click
      this.downloadData(data);
    }
  }

  onSecondaryBtnClick(data: BackupUIData) {
    if (data.BackupStatus === BackupStatus.EXISTING) {
      // Create new backup button click
      this.newBackupData();
    }
  }

  saveData(data: BackupUIData) {
    const subscription = this.backupService.dataBackup(data.PackageName).subscribe(response => { });
    this.dataSubscriptions.push(subscription);
  }

  downloadData(data: BackupUIData) {
    const subscription = this.backupService.downloadBackup(data.FilePath).subscribe(response => {
      if (response) {
        saveAs(new Blob([response], { type: 'octet/stream' }), this.backupUIData.PackageName);
      }
    });
    this.dataSubscriptions.push(subscription);
  }

  createdBackupData(data: DataBackupDetailsModel) {
    this.backupUIData = {
      primaryBtnText: "Download",
      MainContentText: "Backup created successfully. Click the Download button to save the backup file.",
      InputLabel: "Save Backup:",
      PackageName: data.PackageName,
      FilePath: data.FilePath,
      BackupStatus: BackupStatus.CREATED,
      isEditable: false
    };
  }

  newBackupData() {
    let date = this.datePipe.transform(new Date(), "yyyy-MM-dd_hh-mm");
    this.backupUIData = {
      primaryBtnText: "Backup",
      MainContentText: "Enter a name for the backup file in the following textbox and then click the Backup button.",
      InputLabel: "Backup Filename:",
      PackageName: date + "_backup",
      FilePath: "",
      BackupStatus: BackupStatus.NEW,
      isEditable: true
    };
  }

  existingBackupData(data: DataBackupDetailsModel) {
    this.backupUIData = {
      primaryBtnText: "Download",
      secondaryBtnText: "Create New Backup",
      MainContentText: "A previous backup exists on the system. Click the Download button to save the existing backup file or click the Create New Backup button and save a new backup file.",
      SubContentText: "Days since previous backup created: " + this.calculateDiff(data.CreationTime),
      InputLabel: "Existing Backup:",
      PackageName: data.PackageName,
      FilePath: data.FilePath,
      BackupStatus: BackupStatus.EXISTING,
      isEditable: false
    };
  }

  calculateDiff(createdDate) {
    let days = 0;
    if (createdDate) {
      let date = new Date(createdDate);
      let currentDate = new Date();
      days = Math.floor((currentDate.getTime() - date.getTime()) / 1000 / 60 / 60 / 24);
    }
    return days;
  }

  isBackUpCompletedCallback = (value): void => {
    this.isCreationInProgress = value.Value === BackupSaveStatus.INPROGRESS;
    if (!this.isCreationInProgress) {
      this.setView();
    }
  }

  private subscribeToRealtimeData(deviceId, pointIndex, callBack) {
    let subscription = this.realTimeService.GetRealtimeData(deviceId, pointIndex).subscribe(value => {
      if (value != undefined && value != null) {
        callBack(value);
      }
    });
    this.dataSubscriptions.push(subscription);
  }

  private subscribeToDeviceDataPoints() {
    const subscription = this.deviceDataPointsModels$.subscribe((state: IDeviceDataPoints) => {
      if (state) {
        if (!state.isLoaded) {
          this.store.dispatch(DEVICEPOINTS_ACTIONS.LOAD_DEVICES());
        }
        if (state.devices) {
          let devices = state.devices;
          this.subscribeToMultinodeControlRealtimeData(devices);
        }
      }
    });
    this.dataSubscriptions.push(subscription);
  }

  subscribeToMultinodeControlRealtimeData(devices) {
    let multinodeControlDeviceId = devices.find(c => c.Name == "MultiNodeControl")?.Id;
    if (multinodeControlDeviceId)
      this.subscribeToRealtimeData(multinodeControlDeviceId, MultiNodeControlDataPointIndex.IsDataBackupCompleted, this.isBackUpCompletedCallback);
  }

  setView() {
    const subscription = this.backupService.getDataBackupDetails().subscribe((data: DataBackupDetailsModel) => {
      if (data) {
        if (this.backupUIData?.BackupStatus === BackupStatus.NEW) {
          this.createdBackupData(data);
        }
        else {
          this.existingBackupData(data);
        }
      } else {
        this.newBackupData();
      }
    });
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

  ngOnInit(): void {
    this.setView();
    this.subscribeToDeviceDataPoints();
    this.router.routeReuseStrategy.shouldReuseRoute = function () {
      return false;
    };
  }

}

export class BackupUIData {
  primaryBtnText: string;
  secondaryBtnText?: string;
  MainContentText: string;
  SubContentText?: string;
  InputLabel: string;
  PackageName: string;
  FilePath: string;
  BackupStatus: number;
  isEditable: boolean;
}

export enum BackupStatus {
  NEW = 0,
  EXISTING,
  CREATED
}

export enum BackupSaveStatus {
  INPROGRESS = 0,
  COMPLETED = 1
}
