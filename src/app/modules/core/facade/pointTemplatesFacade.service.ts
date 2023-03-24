import { Injectable } from "@angular/core";
import { PointTemplatesExtension } from "@core/models/UIModels/PointTemplatesExtension.model";
import { Store } from "@ngrx/store";
import { selectAllPointTemplates, selectPointsTemplatesState } from "@store/reducers/dataPointTemplate.entity.reducer";
import { IPointTemplateExtensionEntityState } from "@store/state/dataPointTemplates.state";
import { BehaviorSubject, Subscription } from "rxjs";

import * as ACTIONS from '@store/actions/dataPointTemplates.entity.action';
import * as _ from "lodash";
import { UICommon } from "@core/data/UICommon";

@Injectable({
    providedIn: 'root',
})
export class PointTemplatesFacade {

    // Store Entity objects
    pointTemplatesEntity: PointTemplatesExtension[];

    // State Objects BehaviorSubject variables
    private pointTemplatesSubject = new BehaviorSubject<PointTemplatesExtension[]>([]);
    
    // State Objects subscriptions variables
    private pointTemplatesSubscription: Subscription = null;

    constructor(protected store: Store<any>) {
    }

    private subscribeToPointTemplatesEntityStore(deviceTypeId: number) {
        if (this.pointTemplatesSubscription == null) {
          this.pointTemplatesSubscription = this.store.select<any>(selectPointsTemplatesState).subscribe((state: IPointTemplateExtensionEntityState) => {
            if (!state.isLoaded) {
                this.store.dispatch(ACTIONS.POINTTEMPLATES_LOAD({deviceTypeId: deviceTypeId}));
            }
            else {
                this.store.select<any>(selectAllPointTemplates).subscribe(pointTemplates=>{
                    this.pointTemplatesEntity = _.cloneDeep(pointTemplates);
                    this.pointTemplatesSubject.next(this.pointTemplatesEntity);
                });
            }
          });
        }
      }

    private subscribeToShiftPointTemplatesEntityStore() {
    if (this.pointTemplatesSubscription == null) {
        this.pointTemplatesSubscription = this.store.select<any>(selectPointsTemplatesState).subscribe((state: IPointTemplateExtensionEntityState) => {
        if (!state.isLoaded) {
            this.store.dispatch(ACTIONS.SHIFT_POINTTEMPLATES_LOAD());
        }
        else {
            this.store.select<any>(selectAllPointTemplates).subscribe(pointTemplates=>{
                this.pointTemplatesEntity = _.cloneDeep(pointTemplates);
                this.pointTemplatesSubject.next(this.pointTemplatesEntity);
            });
        }
        });
    }
    }

    public initPointTemplates(deviceTypeId: number): BehaviorSubject<PointTemplatesExtension[]>{
        if (this.pointTemplatesEntity == null || this.pointTemplatesEntity.length == 0)
            this.subscribeToPointTemplatesEntityStore(deviceTypeId);
        else {
            let pointDeviceType = this.pointTemplatesEntity.find(pt => pt.deviceTypeId === deviceTypeId);
            if (!pointDeviceType)
                this.store.dispatch(ACTIONS.POINTTEMPLATES_LOAD({deviceTypeId: deviceTypeId}));
        }

        return this.pointTemplatesSubject;
    }

    public initShiftPointTemplates(): BehaviorSubject<PointTemplatesExtension[]>{
        if (this.pointTemplatesEntity == null || this.pointTemplatesEntity.length == 0)
            this.subscribeToShiftPointTemplatesEntityStore();
        else {
            let pointDeviceType = this.pointTemplatesEntity.find(pt => pt.deviceTypeId === UICommon.SHIFT_DEVICE_TYPEID);
            if (!pointDeviceType)
                this.store.dispatch(ACTIONS.SHIFT_POINTTEMPLATES_LOAD());
        }

        return this.pointTemplatesSubject;
    }
}