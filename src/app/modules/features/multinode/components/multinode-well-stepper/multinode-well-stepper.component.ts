import { Component, OnInit, EventEmitter, Output, Input, ViewContainerRef, ViewChild } from '@angular/core';
import { MatStepper } from '@angular/material/stepper';
import { MultiNodeWellUIModel } from '@core/models/UIModels/MultinodeWell.model';
import { eFCVDataModel } from '@core/models/webModels/eFCVDataModel.model';
import { ColumnPinningPosition, IPinningConfig } from '@infragistics/igniteui-angular';
import { TecPowerSupplyComponent } from '../tec-power-supply/tec-power-supply.component';

@Component({
  selector: 'app-multinode-well-stepper',
  templateUrl: './multinode-well-stepper.component.html',
  styleUrls: ['./multinode-well-stepper.component.scss']
})
export class MultinodeWellStepperComponent implements OnInit {
  @Output() onAddeFCVBtnClick = new EventEmitter();
  @Output() onEditZone = new EventEmitter();
  @Output() onDeleteZone = new EventEmitter();
  @Output() isTecPowerSupplyFormValidEvent = new EventEmitter();
  @Output() tecPowerSupplyFormInValidEvent = new EventEmitter();
  @Output() onTecPowerSupplyFormChangeEvent = new EventEmitter();
  @Output() onStepperSelChange = new EventEmitter();

  @Input() efcvs: eFCVDataModel[];
  @Input() well: MultiNodeWellUIModel;
  @Input() tecPowerSupplyData: any;

  public pinningConfig: IPinningConfig = { columns: ColumnPinningPosition.End };

  @ViewChild('wellStepper', { static: false }) wellStepper: MatStepper;
  @ViewChild('efcvContainer', { static: false }) efcvContainer: ViewContainerRef;
  @ViewChild('powerSupplyComponent', { static: false }) powerSupplyComponent: TecPowerSupplyComponent;
  steps = [
    {
      'label': 'step1',
      'state': 'number',
      'completed': false
    },
    {
      'label': 'step2',
      'state': 'number',
      'completed': false
    }
  ];
  @Input() set selectedIndex(value: number) {
    this._selectedIndex = value;
    if (this.wellStepper) {
      this.setActiveStep();
    }
  };

  get selectedIndex(): number { return this._selectedIndex; }

  private _selectedIndex: number;

  get step1() {
    return this.powerSupplyComponent;
  }

  get step2() {
    return this.powerSupplyComponent;
  }

  constructor() { }

  setActiveStep() {
    this.wellStepper.selectedIndex = this._selectedIndex;
  }

  selectionChange(event) {
    this.onStepperSelChange.emit(event.selectedIndex);
  }

  ngOnInit(): void {
  }
}
