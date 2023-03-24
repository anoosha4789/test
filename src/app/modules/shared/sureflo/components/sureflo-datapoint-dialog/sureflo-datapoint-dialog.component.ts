import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'sureflo-datapoint-dialog',
  templateUrl: './sureflo-datapoint-dialog.component.html',
  styleUrls: ['./sureflo-datapoint-dialog.component.scss']
})
export class SurefloDatapointDialogComponent implements OnInit {

  activeIdx: number;
  selectedPath: string = null;
  selectedNode: SurefloDataPointListNode;
  dataPointList : SurefloDataPointListNode[] = [];
  actionBtnDisabled =  true;
  
  constructor(public dialogRef: MatDialogRef<SurefloDatapointDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SurefloDatapointDialogData) { }

   
  setActiveNode(index) {
    this.activeIdx = this.activeIdx === index ? null : index;
  }

  radioChange(node: SurefloDataPointListNode) {
    this.selectedNode = node;
    this.setActiveNode(node.index);
    this.actionBtnDisabled = false;
  }

  OnCancel() {
    this.dialogRef.close();
  }

  OnSubmit() {
    this.dialogRef.close(this.selectedNode);
  }

  ngOnInit(): void {
    this.dataPointList = this.data.dataList;
  }

}

export class SurefloDatapointDialogData  {
  dataList: SurefloDataPointListNode[];
}

export class SurefloDataPointListNode {
  name: string;
  displayLabel: string;
  path: string;
  deviceId: number;
  index: number;
}

export class SurefloDataPointFlatNode {
  name: string;
  displayLabel: string;
  path: string;
  deviceId: number;
  level: number;
  index: number;
  expandable: boolean;
}
