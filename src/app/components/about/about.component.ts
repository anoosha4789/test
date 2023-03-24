import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SystemInfoComponent } from '@comp/system-info/system-info.component';
import { ButtonActions } from '@shared/gateway-dialogs/components/gateway-advanced-dialog/gateway-advanced-dialog.component';
import { GatewayModalService } from '@shared/gateway-dialogs/services/gatewayModal.service';

export interface AboutComponentData {
  buildNumber: string;
}

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent implements OnInit {
  versionNumber: string;
  firmwareVersionNumber: string;
  result: string;
  year: number;

  constructor(
    public dialogRef: MatDialogRef<AboutComponent>,
    private gwModalService: GatewayModalService,
    @Inject(MAT_DIALOG_DATA) public data: AboutComponentData) {}

  showSystemInfo(): void {
    this.gwModalService.openAdvancedDialog(
      "System Information",
      ButtonActions.Confirm,
      SystemInfoComponent,
      null,
      () => this.gwModalService.closeModal(),
      '485px',
      null,
      null,
      null,
      'gw-system-info-dialog'
    );
  }

  ngOnInit(): void {
    this.versionNumber = 'Version ????';
    if (this.data !== undefined && this.data !== null) {
      
      if(this.data[0]?.Id ==='softwareversion'){
        this.versionNumber = 'Version ' + this.data[0]?.Version;
      }
      if(this.data[1]?.Id ==='firmwareversion'){
        this.firmwareVersionNumber = 'Linux Firmware Version : ' + this.data[1]?.Version;
      }
      this.data.buildNumber = '2.x.x.x';
    }
    this.year = (new Date()).getFullYear();
  }
  OnClose(): void {
    this.dialogRef.close();
  }
}
