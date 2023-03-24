import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PerformActuationZoneModel } from '../perform-actuation-dialog.component';
import { Subscription } from 'rxjs';
import { UserService } from '@core/services/user.service';
import { MultinodeService } from '@features/multinode/services/multinode.service';
import { RehomeAFCD } from '@core/models/webModels/MultiNodeUIDataModel.model';
import { DEFAULT_eFCV_POSITIONS_STAGES, UICommon } from '@core/data/UICommon';

@Component({
  selector: 'app-confirm-actuation',
  templateUrl: './confirm-actuation.component.html',
  styleUrls: ['./confirm-actuation.component.scss']
})
export class ConfirmActuationComponent implements OnInit, OnDestroy {
  zone: PerformActuationZoneModel;
  private dataSubscriptions: Subscription[] = [];
  openPosition: string = "";
  closePosition: string = "";

  constructor(public dialogRef: MatDialogRef<ConfirmActuationComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private multinodeService: MultinodeService,
    private userService: UserService) { }

  updateShiftOperationUser() {
    this.userService.GetCurrentLoginUser().then(currentUser => {
      if (currentUser) {
        const subscription = this.userService.updateShiftOperationUser(currentUser.Name).subscribe(d => { });
        this.dataSubscriptions.push(subscription);
      }
    });
  }

  OnCancel() {
    this.dialogRef.close();
  }

  OnActuateBtnClick() {
    if (this.zone.isPositionValid) {
      this.multinodeService.actuateEFCV(this.zone).subscribe(response => {
        this.updateShiftOperationUser();
        this.dialogRef.close("ok");
      });
    } else {
      const rehome: RehomeAFCD = { WellId: this.zone.WellId + "", SIUID: this.zone.SIEGuid, AFCDId: this.zone.eFCVGuid, efcvDeviceId: this.zone.HcmId }
      this.multinodeService.reHomeAFCD(rehome).subscribe(response => {
        this.updateShiftOperationUser();
        this.dialogRef.close("ok");
      });
    }
  }

  getPositionName(positionStage) {
    return this.zone.TargetValvePositionDd?.find(pos => pos.PositionStage === positionStage)?.Description ?? "";
  }

  ngOnInit(): void {
    this.zone = this.data?.actuateZone;
    //Rehome
    if (!this.zone.isPositionValid) {
      this.openPosition = this.getPositionName(DEFAULT_eFCV_POSITIONS_STAGES.STAGE_OPEN);
      this.closePosition = this.getPositionName(DEFAULT_eFCV_POSITIONS_STAGES.STAGE_CLOSE);
    }
  }
  ngOnDestroy(): void {
    if (this.dataSubscriptions != null && this.dataSubscriptions.length > 0) {
      this.dataSubscriptions.forEach((subscription) => {
        if (subscription != null) {
          subscription.unsubscribe();
          subscription = null;
        }
      });
    }
  }
}
