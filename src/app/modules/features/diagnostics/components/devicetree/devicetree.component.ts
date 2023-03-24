import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { DeviceModel } from '@core/models/webModels/DeviceInfo.model';
import { Observable } from 'rxjs';
import { IDeviceDataPoints } from '@store/state/deviceDataPoints.state';
import { Store } from '@ngrx/store';
import {NestedTreeControl} from '@angular/cdk/tree';
import {MatTreeNestedDataSource} from '@angular/material/tree';
import * as DEVICEPOINTS_ACTIONS from '@store/actions/deviceDataPoints.action';
import { GatewayChartService } from '@shared/gateway-chart/gatewayChart.service';
import { ActivatedRoute } from '@angular/router';

export class DeviceTreeNode {
  childrenTreeNodes: DeviceTreeNode[];
  deviceModel: DeviceModel;
  displayName: string;
}

@Component({
  selector: 'app-devicetree',
  templateUrl: './devicetree.component.html',
  styleUrls: ['./devicetree.component.scss']
})

export class DevicetreeComponent implements OnInit {
  private deviceTreeNodes: DeviceTreeNode[] = [];
  private deviceDataPointsModels$: Observable<IDeviceDataPoints>;

  activeNode: DeviceTreeNode;
  treeControl = new NestedTreeControl<DeviceTreeNode>(node => node.childrenTreeNodes);
  dataSource = new MatTreeNestedDataSource<DeviceTreeNode>();

  constructor(
    private route: ActivatedRoute,
    private gatewayChartService: GatewayChartService,
    private store: Store<{ deviceDataPointsState: IDeviceDataPoints }>) {
    this.deviceDataPointsModels$ = this.store.select<any>(
      (state: any) => state.deviceDataPointsState
    );
  }

  ngOnInit(): void {
    this.getParameter();
    this.deviceDataPointsModels$.subscribe((state: IDeviceDataPoints) => {
      if (state !== undefined ) {
        if (state.isLoaded === false) {
          this.store.dispatch(DEVICEPOINTS_ACTIONS.LOAD_DEVICES());
          this.store.dispatch(DEVICEPOINTS_ACTIONS.LOAD_DATAPOINTDEF());
        }
        if (state.devices !== undefined) {
          this.buildDeviceTree(state.devices);
        }
      }
    });
  }
  getParameter(): void {
    this.route.params.subscribe(params => {
      console.log (params.deviceId);
    });
  }
  SelectDeviceNode(node: DeviceTreeNode): void {
    if (node !== undefined) {
      this.activeNode = node;
//      this.gatewayChartService.UpdateSelectedDataPointViewerDevice(this.activeNode.deviceModel);
      console.log(this.activeNode.deviceModel);
    }
  }
  hasChild = (_: number, node: DeviceTreeNode) => !!node.childrenTreeNodes && node.childrenTreeNodes.length > 0;
  private buildDeviceTree(deviceModels: DeviceModel[]): void {
    this.deviceTreeNodes = [];  // clear nodes
    // Add owner device first
    deviceModels.forEach((element) => {
      if (element !== null) {
        if (element.Id === element.OwnerId) {
          const node = new DeviceTreeNode();
          node.displayName = element.Name;
          node.deviceModel = element;
          this.deviceTreeNodes.push(node);
        }
      }
    });
    // Add owner device child devices
    this.deviceTreeNodes.forEach((deviceElement) => {
      if (deviceElement !== null) {
        const ownerDeviceId = deviceElement.deviceModel.OwnerId;
        deviceElement.childrenTreeNodes = null;
        deviceModels.forEach((element) => {
          if (
            element.OwnerId === ownerDeviceId &&
            element.Id !== ownerDeviceId
          ) {
            const node = new DeviceTreeNode();
            node.displayName = element.Name;
            node.deviceModel = element;
            node.childrenTreeNodes = null;
            if (deviceElement.childrenTreeNodes === null) {
              deviceElement.childrenTreeNodes = [];
            }
            deviceElement.childrenTreeNodes.push(node);
          }
        });
      }
    });
    this.dataSource.data = this.deviceTreeNodes;
  }
}
