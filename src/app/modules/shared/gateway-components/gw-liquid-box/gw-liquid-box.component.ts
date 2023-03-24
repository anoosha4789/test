import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

@Component({
  selector: 'gw-liquid-box',
  templateUrl: './gw-liquid-box.component.html',
  styleUrls: ['./gw-liquid-box.component.scss']
})
export class GwLiquidBoxComponent implements OnInit, OnChanges {

  @Input() value : number;
  @Input() unit : string;
  @Input() options: LiquidBoxConfig;
  @Input() badDataValue: number;

  bgFillColor:string;
  fillColor:string;
  liquidBoxData = new LiquidBoxDataModel();

  constructor() { }

  setBoxFillColor(value) {
    const boxheight = 66;
    if(value < 0) {
      document.getElementById("gw-liquid-box-child").setAttribute("fill", "#FFBDBD");
      document.getElementById("gw-liquid-box-child").setAttribute("y", "60");      
      document.getElementById("gw-liquid-box-child").setAttribute("transition", 'fill .5s ease');
      document.getElementById("gw-liquid-box-text").setAttribute("fill", "#E12D39");      
    } else {
      const value = (boxheight - ((boxheight*this.value)/100));
      document.getElementById("gw-liquid-box-child").setAttribute("fill", "#BBEBFF");
      document.getElementById("gw-liquid-box-child").setAttribute("y", `${value}`);
      document.getElementById("gw-liquid-box-child").setAttribute("transition", 'fill .5s ease');
      document.getElementById("gw-liquid-box-text").setAttribute("fill", "#1A2321");
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes.value.firstChange) {    
      this.setBoxFillColor(this.value);
    }
  }

  ngOnInit(): void {       
    this.value = this.value === -999 ? this.badDataValue : this.value; 
    this.liquidBoxData.unitSymbol = this.unit;
    this.liquidBoxData.value = this.value;  
    this.fillColor = this.options?.bgFillColor;      
    this.setBoxFillColor(this.value);
  }

}

class LiquidBoxDataModel {
  value: number;
  unitSymbol: string;
}

class LiquidBoxConfig {
  bgFillColor: string;
  fillColor: string;
  with: string;
  height: string;
  border: string;
}
