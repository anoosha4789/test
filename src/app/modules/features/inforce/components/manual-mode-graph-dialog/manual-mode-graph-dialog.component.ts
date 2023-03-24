import { AfterViewInit, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HyrdraulicPowerUnitPointIndex, Module2542PointIndex } from '@features/inforce/common/InForceModbusRegisterIndex';
import { UIChartColors } from '@core/data/UICommon';
import { UnitSystemUIModel } from '@core/models/UIModels/unit-system.model';
import { ConfigurationService } from '@core/services/configurationService.service';
import { ChartOptions, SeriesPoints, XAxes, YAxes } from '@shared/gateway-chart/multiaxis-chart/multiaxis-chart.model';
import { Observable, Subscription } from 'rxjs';

import { UNITSYSTEM_LOAD } from '@store/actions/unit-system.action';
import { IUnitSystemState } from '@store/state/unit-system.state';
import { Store } from '@ngrx/store';
import { StateUtilities } from '@store/state/IState';

@Component({
  selector: 'app-manual-mode-graph-dialog',
  templateUrl: './manual-mode-graph-dialog.component.html',
  styleUrls: ['./manual-mode-graph-dialog.component.scss']
})
export class ManualModeGraphDialogComponent implements OnInit, OnDestroy, AfterViewInit {
  public chartId: string = "manualmode";
  public dataPointChartOptions: ChartOptions = new ChartOptions();
  private selectedUnitSystem: UnitSystemUIModel;
  private dataSubscriptions: Subscription[] = [];
  showChart = false;
  returnsUnit = "mL";

  private unitSystemState$: Observable<IUnitSystemState>;
  
  constructor(protected store: Store, public dialogRef: MatDialogRef<ManualModeGraphDialogComponent>, @Inject(MAT_DIALOG_DATA) public data,
    private configService: ConfigurationService) { 
      this.unitSystemState$ = this.store.select<IUnitSystemState>((state: any) => state.unitSystemState);
    }

  OnClose() {
    this.dialogRef.close();
  }

  private subscribeToUnitSystems() {
    const subscription = this.unitSystemState$.subscribe(
      (state: IUnitSystemState) => {
        if (state !== undefined) {
          if (state.isLoaded === false || StateUtilities.hasErrors(state)) {
            // Dispatch Action if not loaded
            this.store.dispatch(UNITSYSTEM_LOAD());
          } else {
            this.selectedUnitSystem = state.unitSystem.UnitQuantities.find(unit => unit.UnitQuantityName == "pressure");
            this.setupChart();
            this.showChart = true;
          }
        }
      }
    );

    this.dataSubscriptions.push(subscription);
  }
  
  setupChart() {
    let chartOptions = new ChartOptions();
    let inxColor = 0;
    let unitSymbol = this.selectedUnitSystem ? this.selectedUnitSystem.SelectedUnitSymbol : "";
    let formattedSymbol = unitSymbol ? `(${unitSymbol})` : ""
    let selectSeries: SeriesPoints[] = [];
    this.data.wells.forEach(well => {
      well.outputPosition.forEach(position => {
        selectSeries.push({ deviceId: this.data.hpuId, pointIndex: position.outputDataPoint.pointIndex, label: position.PanelConnection+" "+formattedSymbol });
      });
    });

    chartOptions.selectSeries = selectSeries;
    
    chartOptions.yAxes = [{ label: `Pressure ${formattedSymbol}`, unit: unitSymbol, Min: null, Max: null },
    { label: `Return Volume(${this.returnsUnit})`, unit: this.returnsUnit, Min: null, Max: null }];

    chartOptions.dataSeries = [
      { deviceId: this.data.module2542Id, pointIndex: Module2542PointIndex.PumpDischargePressure, label: `Pump Pressure ${formattedSymbol}`, unit: unitSymbol, decimalPoints: 1, brush: UIChartColors.getChartBrush(inxColor++), isFixed: true },
      { deviceId: this.data.hpuId, pointIndex: selectSeries[0].pointIndex, label: selectSeries[0].label, unit: unitSymbol, decimalPoints: 1, brush: UIChartColors.getChartBrush(inxColor++), isFixed: false },
      { deviceId: this.data.hpuId, pointIndex: HyrdraulicPowerUnitPointIndex.ReturnsFlowmeterTotal, label: `Return Volume(${this.returnsUnit})`, unit: this.returnsUnit, decimalPoints: 1, brush: UIChartColors.getChartBrush(inxColor++), isFixed: true },
      { deviceId: this.data.module2542Id, pointIndex: Module2542PointIndex.SupplyPressure, label: `Supply Pressure ${formattedSymbol}`, unit: unitSymbol, decimalPoints: 1, brush: UIChartColors.getChartBrush(inxColor++), isFixed: true },
      { deviceId: this.data.hpuId, pointIndex: selectSeries[1].pointIndex, label: selectSeries[1].label, unit: unitSymbol, decimalPoints: 1, brush: UIChartColors.getChartBrush(inxColor++), isFixed: false }
    ];
    chartOptions.selectSeries = selectSeries;
    this.dataPointChartOptions = chartOptions;
  }


  ngOnDestroy(): void {
    if (this.dataSubscriptions != null && this.dataSubscriptions.length > 0) {
      this.dataSubscriptions.forEach(subscription => {
        if (subscription != null)
          subscription.unsubscribe();
      });
    }

    this.dataSubscriptions = [];
  }

  ngAfterViewInit(): void {
  }

  ngOnInit(): void {
    this.subscribeToUnitSystems();
  }

}
