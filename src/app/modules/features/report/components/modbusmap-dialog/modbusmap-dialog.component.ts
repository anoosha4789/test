import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-modbusmap-dialog',
  templateUrl: './modbusmap-dialog.component.html',
  styleUrls: ['./modbusmap-dialog.component.scss']
})

export class ModbusmapDialogComponent implements OnInit {

  
  selModbusMap: any;
  modbusMapList = [];

  constructor(private router: Router, public dialogRef: MatDialogRef<ModbusmapDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ModbusDialogData) { }

  onModbusMapSelChange(event) {
    this.selModbusMap = event.value;
  }

  onCancelBtnClick() {
    this.dialogRef.close();
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigateByUrl("/downloads/reports");
  }

  onOkBtnClick() {

    this.dialogRef.close(this.selModbusMap);
  }

  ngOnInit(): void {
    this.modbusMapList = this.data.modbusMapList;
    this.selModbusMap = this.data.modbusMapList[0];
  }

}

export class ModbusDialogData  {
  modbusMapList: any[];
  selectedModbusMap: any 
}
