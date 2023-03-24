import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  ViewChild,
  Output,
  EventEmitter,
} from '@angular/core';
import { IDeviceDataPoints } from '@store/state/deviceDataPoints.state';
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { RealTimeDataSignalRService } from '@core/services/realTimeDataSignalR.service';
import {
  DataPointDefinitionModel,
  DataPointValueDataType,
} from '@core/models/webModels/DataPointDefinition.model';
import { ConfigurationService } from '@core/services/configurationService.service';
import { WriteToServerDataModel } from '@core/models/webModels/WriteToServerData.model';
import { SatPopover } from '@ncstate/sat-popover';
import * as DEVICEPOINTS_ACTIONS from '@store/actions/deviceDataPoints.action';
import { SelectionModel } from '@angular/cdk/collections';
import { IUnitSystemState } from '@store/state/unit-system.state';
import * as UNITSYSTEM_ACTIONS from '@store/actions/unit-system.action';
import { GatewayChartService } from '@shared/gateway-chart/gatewayChart.service';
import { ActivatedRoute, Router } from '@angular/router';
@Component({
  selector: 'app-datapointtable',
  templateUrl: './datapointtable.component.html',
  styleUrls: ['./datapointtable.component.scss'],
})
export class DatapointtableComponent implements OnInit, OnDestroy {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<{
      deviceDataPointsState: IDeviceDataPoints;
      unitSystemState: IUnitSystemState;
    }>,
    private realTimeDataService: RealTimeDataSignalRService,
    private configurationService: ConfigurationService,
    private gatewayChartService: GatewayChartService
  ) {
    this.deviceDataPointsModels$ = this.store.select<any>(
      (state: any) => state.deviceDataPointsState
    );
    this.unitSystemModel$ = this.store.select<any>(
      (state: any) => state.unitSystemState
    );
  }

  @ViewChild(SatPopover, { static: true }) popover: SatPopover;
  autoFocus = true;
  restoreFocus = true;
  setpoint = 0;

  private deviceDataPointsModels$: Observable<IDeviceDataPoints>;
  private dataSubscriptions: Subscription[] = [];
  private dataPointDefinitionModels: DataPointDefinitionModel[];

  private unitSystemModel$: Observable<IUnitSystemState>;
  private unitSystemSelections: Map<string, string> = new Map<string, string>();

  private selectedDataPointsForTrend: DataPointDefinitionModel[] = [];

  selectedDeviceDataPointSource: DataPointDefinitionModel[] = [];
  selection: SelectionModel<DataPointDefinitionModel> = null;
  SelectedDeviceModelId: number;
  SelectedDevice:string;
  displayedColumns: string[] = [
 //   'select',
    'TagName',
    'RawValue',
//    'ReadOnly',
    'UnitSymbol',
    // 'UnitQuantityType',
    // 'DeviceId',
    // 'DataPointIndex',
    // 'DataType',
  ];

  ngOnInit(): void {

    this.deviceDataPointsModels$.subscribe((state: IDeviceDataPoints) => {
      if (state !== undefined) {
        if (state.isLoaded === false) {
          this.store.dispatch(DEVICEPOINTS_ACTIONS.LOAD_DEVICES());
          this.store.dispatch(DEVICEPOINTS_ACTIONS.LOAD_DATAPOINTDEF());
        }
        this.dataPointDefinitionModels = [];
        state.datapointdefinitions.forEach((element) => {
          const dp = new DataPointDefinitionModel();
          dp.DataPointIndex = element.DataPointIndex;
          dp.DataType = element.DataType;
          dp.DeviceId = element.DeviceId;
          dp.RawValue = -999;
          //dp.ReadOnly = element.ReadOnly;
          dp.TagName = element.TagName;
          dp.UnitQuantityType = element.UnitQuantityType;
          dp.UnitSymbol = element.UnitSymbol;
          this.dataPointDefinitionModels.push(dp);
        });

        this.route.params.subscribe((params) => {
          if (params.deviceId) {
            this.SelectedDeviceModelId = parseInt(params.deviceId, 10);
             let device = state.devices.find((device)=> device.Id === this.SelectedDeviceModelId);
             this.SelectedDevice = device?.Name;
             if(device?.Id !== device?.OwnerId){
                let parentdevice = state.devices.find((d)=> d.Id === device.OwnerId);
                this.SelectedDevice = state.devices.find((d)=> d.Id === device.OwnerId)?.Name + " > "+ this.SelectedDevice;
                if(parentdevice?.Id !== parentdevice?.OwnerId){
                  this.SelectedDevice = state.devices.find((d)=> d.Id === parentdevice.OwnerId)?.Name + " > "+ this.SelectedDevice;
                }
                //this.SelectedDevice = state.devices.find((d)=> d.Id === device.OwnerId)?.Name + " > "+ this.SelectedDevice;
             }
            //  state.devices.forEach((device) => {
            //   if (device?.OwnerId === this.SelectedDeviceModelId && device.Id !== this.SelectedDeviceModelId) {
            //    this.SelectedDevice = this.SelectedDevice+ ' > ' + device?.Name;
            //  }
            // });
            this.selectedDeviceDataPointSource = this.GetSelectedDeviceDataPoints();
            this.unSubscribeRealtimeData();
          }
        });
      }
    });
    this.unitSystemModel$.subscribe((state: IUnitSystemState) => {
      if (state) {
        if (state.isLoaded === false) {
          this.store.dispatch(UNITSYSTEM_ACTIONS.UNITSYSTEM_LOAD());
        }
        this.unitSystemSelections.clear();
        state.unitSystem.UnitQuantities.forEach((element) => {
          this.unitSystemSelections.set(
            element.UnitQuantityName,
            element.SelectedUnitSymbol
          );
        });
      }
    });

    // re-set the previous selections.
    this.selection = new SelectionModel<DataPointDefinitionModel>(
      true,
      [],
      true
    );
    this.gatewayChartService.selectedDataPointsUpdatedEvent.subscribe(
      (dps) => (this.selectedDataPointsForTrend = dps)
    );

    // reset the selected data points
    const selectedDps = this.findSelectedDataPointsFromSource();
    if (selectedDps != null && selectedDps.length > 0) {
      this.selection.select(...selectedDps);
    }

    this.selection.changed.subscribe();
  }
  // Only fire the selected data points when switching to Trend component
  // This will reduce the number of this.selection.changed calls and limit trend data points  to 8
  ngOnDestroy(): void {
    if (this.selection.selected) {
      this.gatewayChartService.UpdateSelectedDataPoints(
        this.selection.selected
      );
    }
    this.unSubscribeRealtimeData();
    this.selection.changed.unsubscribe();
  }
  private findSelectedDataPointsFromSource(): DataPointDefinitionModel[] {
    const dps: DataPointDefinitionModel[] = [];
    if (
      this.dataPointDefinitionModels != null &&
      this.dataPointDefinitionModels.length > 0 &&
      this.selectedDataPointsForTrend !== undefined &&
      this.selectedDataPointsForTrend != null &&
      this.selectedDataPointsForTrend.length > 0
    ) {
      this.dataPointDefinitionModels.forEach((element) => {
        this.selectedDataPointsForTrend.forEach((dp) => {
          if (
            dp.DeviceId === element.DeviceId &&
            dp.DataPointIndex === element.DataPointIndex
          ) {
            dps.push(element);
          }
        });
      });
    }

    return dps;
  }

  public getCustomUnitSymbol(unitQuantity: string): string {
    if (
      this.unitSystemSelections !== null &&
      this.unitSystemSelections.size > 0
    ) {
      if (this.unitSystemSelections.has(unitQuantity)) {
        return this.unitSystemSelections.get(unitQuantity);
      }
    }
    return '';
  }
  // private dataPointfilter(element: DataPointDefinitionModel): boolean {
  //   if (
  //     this.selectedDataPointsForTrend !== undefined &&
  //     this.selectedDataPointsForTrend != null &&
  //     this.selectedDataPointsForTrend.length > 0
  //   ) {
  //     this.selectedDataPointsForTrend.forEach((dp) => {
  //       if (
  //         dp.DeviceId === element.DeviceId &&
  //         dp.DataPointIndex === element.DataPointIndex
  //       ) {
  //         return true;
  //       }
  //     });
  //   }
  //   return false;
  // }
  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows =
      this.selectedDeviceDataPointSource !== null
        ? this.selectedDeviceDataPointSource.length
        : 0;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    if (this.selectedDeviceDataPointSource !== null) {
      this.isAllSelected()
        ? this.selection.clear()
        : this.selectedDeviceDataPointSource.forEach((row) =>
            this.selection.select(row)
          );
    }
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: DataPointDefinitionModel): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${
      row.DataPointIndex + 1
    }`;
  }

  private unSubscribeRealtimeData(): void {
    if (this.dataSubscriptions != null) {
      this.dataSubscriptions.forEach((sb) => {
        if (sb != null) {
          sb.unsubscribe();
        }
      });

      this.dataSubscriptions = [];
    }
  }

  private GetSelectedDeviceDataPoints(): DataPointDefinitionModel[] {
    const deviceDatapoints: DataPointDefinitionModel[] = [];
    if (this.SelectedDeviceModelId) {
      this.dataPointDefinitionModels.forEach((element,index) => {
        if (element.DeviceId === this.SelectedDeviceModelId) {
          deviceDatapoints.push(element);
        }
      });

      deviceDatapoints.forEach((element) => {
        let deviceSubs = null;
        deviceSubs = this.realTimeDataService
          .GetRealtimeData(element.DeviceId, element.DataPointIndex)
          .subscribe((d) => {
            if (d !== undefined && d !== null) {
              element.RawValue = d.Value;
            }
            this.dataSubscriptions.push(deviceSubs);
          });
      });
    }


    return deviceDatapoints;
  }
  public formatRawValue(item: DataPointDefinitionModel): string {
    if (item.DataType > 8) {
      return (Math.round(item.RawValue * 100) / 100).toFixed(3);
    } else {
      return item.RawValue.toString();
    }
  }
  public InitSetPoint(element: DataPointDefinitionModel): void {
    if (element !== undefined) {
      this.setpoint = element.RawValue;
    }
  }
  closeOnEnter(event: KeyboardEvent, element: DataPointDefinitionModel) {
    if (event.code === 'Enter') {
      this.WriteDataPoint(element, this.setpoint);
    }
  }
  public WriteDataPoint(element: DataPointDefinitionModel, setValue?: number ): void {
    if (element !== undefined) {
      if (element.ReadOnly !== true) {
        let writtenValue = 0;
        if (element.DataType === DataPointValueDataType.Boolean) {
          if (element.RawValue === 0) {
            writtenValue = 1;
          }
        } else {
          writtenValue = setValue;
        }

        const writeVar = new WriteToServerDataModel();
        writeVar.DeviceId = element.DeviceId;
        writeVar.PointIndex = element.DataPointIndex;
        writeVar.PointName = element.TagName;
        writeVar.Value = writtenValue;
        writeVar.WriteToServerCommandEnum = 1;
        writeVar.Unit = element.UnitSymbol;
        // Why we need to call .subscribe(d => {}); here ????
        this.configurationService.WriteToServer(writeVar).subscribe((d) => {});
      }
    }
  }
  public GetDataPointValueDataType(datatype: number): string {
    return DataPointValueDataType[datatype];
  }
  public IsBooleanDataPoint(element: DataPointDefinitionModel): boolean {
    if (element !== undefined) {
      return element.DataType === DataPointValueDataType.Boolean;
    }
    return false;
  }
}
