import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'inforce-user-intervention',
  templateUrl: './inforce-user-intervention.component.html',
  styleUrls: ['./inforce-user-intervention.component.scss']
})
export class InforceUserInterventionComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<UserInterventionMessage>,
    @Inject(MAT_DIALOG_DATA) public data: UserInterventionMessage) { }

  
  OnUserIntervention(userIntervention) {
    this.dialogRef.close(userIntervention);
  }

  ngOnInit(): void {
  }
}

export class UserInterventionMessage {
  interventionMessageType: string;
  interventionMessage: string;
  actionTobeTaken: string;
  showNextSequenceBtn: boolean;
}
