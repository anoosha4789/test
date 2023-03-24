import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { UserService } from '@core/services/user.service';

@Component({
  selector: 'app-configuration-reset-dialog',
  templateUrl: './configuration-reset-dialog.component.html',
  styleUrls: ['./configuration-reset-dialog.component.scss']
})
export class ConfigurationResetDialogComponent implements OnInit {

  isManufacturingUser: boolean;
  constructor(public dialogRef: MatDialogRef<any>, private userService: UserService) {
    this.isManufacturingUser = false;
  }

  ngOnInit(): void {
    this.userService.GetCurrentLoginUser().then( (currentUser) => {
      this.isManufacturingUser = this.userService.IsManufacturingUser(currentUser);
      }
    );
  }

  OnCancel(): void {
    this.dialogRef.close();
  }
}
