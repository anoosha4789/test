import { Injectable } from "@angular/core";
import { DataPointDefinitionModel } from "@core/models/webModels/DataPointDefinition.model";
import { DeviceModel } from "@core/models/webModels/DeviceInfo.model";
import { Store } from "@ngrx/store";
import { IDeviceDataPoints } from "@store/state/deviceDataPoints.state";
import { BehaviorSubject, Observable, Subscription } from "rxjs";

import * as DEVICEPOINTS_ACTIONS from '@store/actions/deviceDataPoints.action';

@Injectable({
    providedIn: 'root',
})
export class DeviceDataPointsFacade {

    // Store Observables
    private deviceDataPointsModels$: Observable<IDeviceDataPoints>;

    // State Objects
    private devices: DeviceModel[] = [];
    private datapointdefinitions: DataPointDefinitionModel[] = [];

    // State Objects BehaviorSubject variables
    private devicesSubject = new BehaviorSubject<DeviceDataPoints>({devices: [], dataPoints: []});

    // State Objects subscriptions variables
    private devicePointSubscription: Subscription = null;

    constructor(protected store: Store<any>) {
        this.deviceDataPointsModels$ = this.store.select<any>((state: any) => state.deviceDataPointsState);
    }

    private subscribeToDeviceDataPoints() {
        if (this.devicePointSubscription == null) {
            this.devicePointSubscription = this.deviceDataPointsModels$.subscribe((state: IDeviceDataPoints) => {
                if (state) {
                    if (!state.isLoaded) {
                        this.store.dispatch(DEVICEPOINTS_ACTIONS.LOAD_DEVICES());
                        this.store.dispatch(DEVICEPOINTS_ACTIONS.LOAD_DATAPOINTDEF());
                    }
                    if (state.devices) {
                        this.devices = state.devices;
                    }
                    if (state.datapointdefinitions) {
                        this.datapointdefinitions = state.datapointdefinitions;
                    }
                    this.devicesSubject.next({devices: this.devices, dataPoints: this.datapointdefinitions});
                }
            });
        }
    }

    public getDeviceByPoint(deviceId: number, pointIndex: number): DataPointDefinitionModel {
        let index = this.datapointdefinitions.findIndex(d => d.DeviceId === deviceId && d.DataPointIndex == pointIndex)??-1;
        if (index !== -1) {
          const dp = new DataPointDefinitionModel();
          dp.DataPointIndex = this.datapointdefinitions[index].DataPointIndex;
          dp.DataType = this.datapointdefinitions[index].DataType;
          dp.DeviceId = this.datapointdefinitions[index].DeviceId;
          dp.RawValue = -999;
          dp.ReadOnly = this.datapointdefinitions[index].ReadOnly;
          dp.TagName = this.datapointdefinitions[index].TagName;
          dp.UnitQuantityType = this.datapointdefinitions[index].UnitQuantityType;
          dp.UnitSymbol = this.datapointdefinitions[index].UnitSymbol;
    
          return dp;
        }
    
        return null;
    }

    public initDeviceDataPoints(): BehaviorSubject<DeviceDataPoints> {
        if ((this.devices == null || this.devices.length == 0) || (this.datapointdefinitions == null || this.datapointdefinitions.length == 0))
            this.subscribeToDeviceDataPoints();

        return this.devicesSubject;
    }

    public unSubscribeDeviceSubscription(): void {
        if (this.devicePointSubscription != null) {
            this.devicePointSubscription.unsubscribe();
            this.devicePointSubscription = null;
        }

        // Reset state/entity objects here
        this.devices = [];
        this.datapointdefinitions = [];
    }
}

export class DeviceDataPoints {
    devices: DeviceModel[];
    dataPoints: DataPointDefinitionModel[];
}