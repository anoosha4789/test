import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { LinuxDiskSpaceViewModel } from '@core/models/webModels/LinuxDiskSpaceView.model';
import { LinuxGatewayProcessInfoViewModel } from '@core/models/webModels/LinuxGatewayProcessInfoView.model';
import { ConfigurationService } from '@core/services/configurationService.service';
import { SystemClockService } from '@core/services/system-clock.service';

import { ngxLoadingAnimationTypes } from 'ngx-loading';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-system-info',
  templateUrl: './system-info.component.html',
  styleUrls: ['./system-info.component.scss']
})
export class SystemInfoComponent implements OnInit, OnDestroy {

  systemClockTime: Date = new Date();
  memory: string;
  cpuUtilization: LinuxGatewayProcessInfoViewModel[];
  diskUtilization: LinuxDiskSpaceViewModel[];

  systemClockSubscription: Subscription = null;

  public ngxLoadingAnimationTypes = ngxLoadingAnimationTypes;
  public primaryColour = '#ffffff';
  public secondaryColour = '#ccc';
  
  constructor(public dialogRef: MatDialogRef<SystemInfoComponent>,
    private systemClockService: SystemClockService,
    private configurationService: ConfigurationService) { }
  
  onClose() {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    if (this.systemClockSubscription != null) {
      this.systemClockSubscription.unsubscribe();
      this.systemClockSubscription = null;
    }
  }

  ngOnInit(): void {
    this.systemClockSubscription = this.systemClockService.SystemClockTime$.subscribe(
      (dt) => {
        this.systemClockTime = dt;
      }
    );

    this.configurationService.getProcessUtilization().subscribe(result => {
      this.cpuUtilization = result;
    });

    this.configurationService.getDiscUtilization().subscribe(result => {
      this.diskUtilization = result;
    });

    this.configurationService.getMemoryUtilization().subscribe(result => {
      this.memory = result.MemoryUsage;
    });
  }

}
