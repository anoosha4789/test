import { Component, Input, OnInit } from '@angular/core';
import { ManualModePowerSupply } from '../manual-mode-power-supply/manual-mode-power-supply.component';

@Component({
  selector: 'app-manual-mode-power-supply-cards',
  templateUrl: './manual-mode-power-supply-cards.component.html',
  styleUrls: ['./manual-mode-power-supply-cards.component.scss']
})
export class ManualModePowerSupplyCardsComponent implements OnInit {
  @Input()
  manualPowerSupply: ManualModePowerSupply;

  constructor() { }

  ngOnInit(): void {
  }

}