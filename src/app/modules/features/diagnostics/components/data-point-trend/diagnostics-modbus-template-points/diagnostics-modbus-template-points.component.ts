import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { GatewayPanelBase } from '@comp/GatewayPanelBase.component';
import { deleteUIModal } from '@core/data/UICommon';
import { DeviceDataPointsFacade } from '@core/facade/deviceDataPointsFacade.service';
import { PublishingChannelFacade } from '@core/facade/publishingChannelFacade.service'; 
import { IgxColumnComponent, IgxGridComponent } from '@infragistics/igniteui-angular';
import { Store } from '@ngrx/store';
import { GatewayModalService } from '@shared/gateway-dialogs/services/gatewayModal.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'gw-diagnostics-modbus-template-points',
  templateUrl: './diagnostics-modbus-template-points.component.html',
  styleUrls: ['./diagnostics-modbus-template-points.component.scss']
})
export class DiagnosticsModbusTemplatePointsComponent extends GatewayPanelBase implements OnInit, AfterViewInit, OnChanges, OnDestroy {

  @Input()
  selectedDataPoints: any[];

  @Output()
  dataPointDeletedEvent = new EventEmitter();

  @ViewChild("gridDiagnosticsModbusDataPoints", { static: true })
  public gridModbusDataPoints: IgxGridComponent;

  showDataFormat: boolean = true;
  columnDescWidth: string = "67%"

  private arrSubscriptions: Subscription[] = [];

  constructor(protected store: Store,
    private publishingFacade: PublishingChannelFacade,
    private devicesFacade: DeviceDataPointsFacade,
    private gatewayModalService: GatewayModalService) {
    super(store, null, null, null, publishingFacade, devicesFacade, null);
  }

  onDeleteDataPoint(rowIndex, rowId) {
    let toDeleteDataPoint = this.selectedDataPoints[rowIndex];
    this.gatewayModalService.openDialog(
      `Do you want to delete data point address '${toDeleteDataPoint.TagName}'?`,
      () => {
        this.gatewayModalService.closeModal();
        this.dataPointDeletedEvent.emit({ dataPoint: toDeleteDataPoint, pointsDeleted: true });
      },
      () => this.gatewayModalService.closeModal(),
      deleteUIModal.title,
      null,
      true,
      deleteUIModal.primaryBtnText,
      deleteUIModal.secondaryBtnText
    );
  }

  setUpColumnVisibilty() {
    let hideDelete = false;
    if (this.gridModbusDataPoints.columns && this.gridModbusDataPoints.columns.length > 0) {
      let colIndex = this.gridModbusDataPoints.columns.findIndex(col => col.header === ""); // Delete column
      this.gridModbusDataPoints.columns[colIndex].hidden = hideDelete;
    }
  }

  ngOnDestroy(): void {
    if (this.arrSubscriptions != null && this.arrSubscriptions.length > 0) {
      this.arrSubscriptions.forEach(subscription => {
        if (subscription != null)
          subscription.unsubscribe();
      });
    }

    this.arrSubscriptions = [];
    super.ngOnDestroy();
  }

  ngOnChanges(): void {
    this.setUpColumnVisibilty();
  }

  ngAfterViewInit(): void {
    this.setUpColumnVisibilty();
  }

  ngOnInit(): void {
    super.ngOnInit();
  }
}
