import { Component, Inject, Injectable, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Injectable({
  providedIn: 'platform',
})
export class GatewayDialogDataService {
  content: string;
  title: string;
  subtitle: string;
  showCancelButton: boolean;
  primaryBtnText: string;
  secondaryBtnText: string;
  actionCallback;
  closeCallback;
}

@Component({
  selector: 'app-gateway-dialog',
  templateUrl: './gateway-dialog.component.html',
  styleUrls: ['./gateway-dialog.component.scss']
})
export class GatewayDialogComponent implements OnInit {
  title: string;
  subtitle: string;
  content: string;
  showCancelButton = true;
  isDeleteBtn = false;
  primaryBtnText: string;
  secondaryBtnText: string;

  constructor(public dialogRef: MatDialogRef<GatewayDialogComponent>,
    private gatewayDialogDataService: GatewayDialogDataService) { }

  OnOk(): void {
    this.gatewayDialogDataService.actionCallback();
  }

  OnCancel(): void {
    this.gatewayDialogDataService.closeCallback();
  }

  ngOnInit(): void {
    this.content = this.gatewayDialogDataService.content;
    this.title = this.gatewayDialogDataService.title;
    this.subtitle = this.gatewayDialogDataService.subtitle;
    this.showCancelButton = this.gatewayDialogDataService.showCancelButton;
    this.primaryBtnText = this.gatewayDialogDataService.primaryBtnText;
    this.secondaryBtnText = this.gatewayDialogDataService.secondaryBtnText;
    this.isDeleteBtn = this.primaryBtnText?.toLowerCase() === 'delete' ? true : false;
  }

}
