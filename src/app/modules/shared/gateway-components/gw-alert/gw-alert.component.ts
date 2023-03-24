import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

@Component({
  selector: 'gw-alert',
  templateUrl: './gw-alert.component.html',
  styleUrls: ['./gw-alert.component.scss']
})

export class GwAlertComponent implements OnInit, OnChanges {

  @Input() data: any;
  alertInfo : GatewayAlertModel;
  alertClassName: string;
  constructor() { }
  
  ngOnChanges(): void {
    this.alertInfo = this.data;
    this.alertClassName = `gw-alert-${this.alertInfo.Type}`;
  }

  ngOnInit(): void {
    this.alertInfo = this.data;
    this.alertClassName = `gw-alert-${this.alertInfo.Type}`;
  }

}

export interface GatewayAlertModel {
  Type: string,
  IconType: string,
  content: string;
  field?: string;
  cusomClass: boolean;
}