import { Injectable } from "@angular/core";
import { BehaviorSubject, of, Subscription } from "rxjs";
import { map, switchMap, take } from "rxjs/operators";
import * as _ from "lodash";
import { Validator } from "jsonschema";
import { String } from 'typescript-string-operations';
import { Store } from "@ngrx/store";

import { ISurefloEntityState } from "@store/state/sureflo.state";
import { DeleteOrder } from "@core/models/UIModels/models.model";
import { DeleteObjectTypesEnum } from "@core/models/webModels/DeleteObjectTypesEnum";
import { DeleteObject, UICommon } from "@core/data/UICommon";
import { FlowMeterTypes as fmTypes, WellFlowTypes as welFmTypes } from '@core/models/webModels/SureFLODataModel.model';

import * as SUREFLO_ACTIONS from '@store/actions/sureflo.entity.action';
import { FlowMeterTypes, SureFLOFlowMeterUIModel, WellFlowTypes } from '@core/models/UIModels/sureflo.model';
import { selectAllflowMeters, selectflowMetersState } from "@store/reducers/sureflo.entity.reducer";
import { BuiltInDeviceType } from "@core/models/webModels/DeviceInfo.model";
import { SureFLO298UIFlowMeterUIModel } from "@core/models/UIModels/sureflo-flowmeter-model";
import { ToolConnectionUIModel } from "@core/models/UIModels/tool-connection.model";
import { DeviceDataPointsFacade } from "./deviceDataPointsFacade.service";
import { DataPointDefinitionModel } from "@core/models/webModels/DataPointDefinition.model";
import { SureFLO298ExUIFlowMeterUIModel } from "@core/models/UIModels/sureflo-ex-flowmeter-model";

@Injectable({
  providedIn: 'root',
})
export class SurefloFacade {


  // Store Entity objects
  surefloEnity: SureFLOFlowMeterUIModel[];

  // State Objects BehaviorSubject variables
  private surefloSubject = new BehaviorSubject<SureFLOFlowMeterUIModel[]>([]);

  private newFlowMeter: any;

  // State Objects subscriptions variables
  private surefloSubscription: Subscription = null;

  constructor(protected store: Store<any>, private dataPointDefFacade: DeviceDataPointsFacade) { 
  }

  private subscribeToSurefloEntityStore() {
    if (this.surefloSubscription == null) {
      this.surefloSubscription = this.store.select<any>(selectflowMetersState).subscribe((state: ISurefloEntityState) => {
        if (state && !state.isLoaded) {
          this.store.dispatch(SUREFLO_ACTIONS.FLOWMETERS_LOAD());
        }
        else {
          this.store.select<any>(selectAllflowMeters).subscribe(flowmeters => {
            this.surefloEnity = _.cloneDeep(flowmeters);
            this.surefloSubject.next(this.surefloEnity);
          });
        }
      });
    }
  }

  // New FlowMeter
  getNewFlowMeter(Id: number, wellId: number) {

    this.newFlowMeter = {
      Active:  true,
      Serial: null,
      DeviceId: UICommon.IsImportConfig ? UICommon.getImportNextDeviceId() : -Id,
      WellId: wellId,
      FluidType: "1",
      Technology: "1",
      DeviceName: null,
      CalibrationFileName: null,
      flowMeterDimensions: null,
      flowMeterPTMapping: null,
      fluidPVTData: null,
      additionalParameters: null,
      filterParameters: null,
      IsValid: true,
      IsDirty: true
    };
    return this.newFlowMeter;
  }


  // Save FlowMeter
  saveFlowMeter(flowMeterData: SureFLOFlowMeterUIModel): void {
    let flowMeter = Object.assign({}, flowMeterData);
    flowMeter.DeviceName = flowMeter.DeviceName.trim();
    const action = { flowMeter: flowMeter };
    if (this.newFlowMeter) {
      this.store.dispatch(SUREFLO_ACTIONS.FLOWMETERS_ADD(action));
    } else {
      this.store.dispatch(SUREFLO_ACTIONS.FLOWMETERS_UPDATE(action));
      
    }
    this.newFlowMeter = null;
  }

  // Delete FlowMeter
  deleteFlowMeter(deviceId: number): void {
    let flowMeterIdx = this.surefloEnity.findIndex(f => f.DeviceId === deviceId) ?? -1;
    if (flowMeterIdx != -1) {
      let flowmeter = this.surefloEnity[flowMeterIdx] ?? null;
      if (deviceId > -1) {
        let deleteFlowMeter: DeleteObject = {
          deleteOrder: DeleteOrder.SureFLOFlowMeter, 
          id: deviceId, 
          name: flowmeter?.DeviceName,  
          objectType: DeleteObjectTypesEnum.SureFLOFlowMeter,
          data: flowmeter
        };
        UICommon.deletedObjects.push(deleteFlowMeter);
      };
      this.store.dispatch(SUREFLO_ACTIONS.FLOWMETERS_DELETE({ flowMeterId: deviceId }));
    }
  }

  public getSureFLO298ExFlowratePointIndex(fluidType: string): number {
    let pointIndex = 7;
    const floMeterFluidType: any = fluidType;
    switch(floMeterFluidType) {
      case WellFlowTypes['Oil Producer']:
        pointIndex = 7;
        break;

      case WellFlowTypes['Gas Injector']:
      case WellFlowTypes['Gas Producer']:
        pointIndex = 5;
        break;

      case WellFlowTypes['Water Injector']:
        pointIndex = 5;
        break;
    }

    return pointIndex;
  }

  public getSureFLO298ExActivePointIndex(fluidType: string): number {
    let pointIndex = 26;
    const floMeterFluidType: any = fluidType;
    switch(floMeterFluidType) {
      case WellFlowTypes['Oil Producer']:
        pointIndex = 26;
        break;

      case WellFlowTypes['Gas Injector']:
      case WellFlowTypes['Gas Producer']:
        pointIndex = 15;
        break;

      case WellFlowTypes['Water Injector']:
        pointIndex = 16;
        break;
    }

    return pointIndex;
  }

  public getSureFLO298ExDeltaPPointIndex(fluidType: string): number {
    let pointIndex = 62;
    const floMeterFluidType: any = fluidType;
    switch(floMeterFluidType) {
      case WellFlowTypes['Oil Producer']:
        pointIndex = 62;
        break;

      case WellFlowTypes['Gas Injector']:
      case WellFlowTypes['Gas Producer']:
        pointIndex = 35;
        break;

      case WellFlowTypes['Water Injector']:
        pointIndex = 38;
        break;
    }

    return pointIndex;
  }

  public getSureFLO298FlowratePointIndex(fluidType: string): number {
    let pointIndex = 5;
    const floMeterFluidType: any = fluidType;
    switch(floMeterFluidType) {
      case WellFlowTypes['Oil Producer']:
        pointIndex = 5;
        break;

      case WellFlowTypes['Gas Injector']:
      case WellFlowTypes['Gas Producer']:
        pointIndex = 4;
        break;

      case WellFlowTypes['Water Injector']:
        pointIndex = 4;
        break;
    }

    return pointIndex;
  }

  public getSureFLO298ActivePointIndex(fluidType: string): number {
    let pointIndex = 15;
    const floMeterFluidType: any = fluidType;
    switch(floMeterFluidType) {
      case WellFlowTypes['Oil Producer']:
        pointIndex = 15;
        break;

      case WellFlowTypes['Gas Injector']:
      case WellFlowTypes['Gas Producer']:
        pointIndex = 5;
        break;

      case WellFlowTypes['Water Injector']:
        pointIndex = 10;
        break;
    }

    return pointIndex;
  }

  public getSureFLO298DeltaPPointIndex(fluidType: string): number {
    let pointIndex = 38;
    const floMeterFluidType: any = fluidType;
    switch(floMeterFluidType) {
      case WellFlowTypes['Oil Producer']:
        pointIndex = 38;
        break;

      case WellFlowTypes['Gas Injector']:
      case WellFlowTypes['Gas Producer']:
        pointIndex = 11;
        break;

      case WellFlowTypes['Water Injector']:
        pointIndex = 22;
        break;
    }

    return pointIndex;
  }

  public getSureFLODeviceTypeId(technology: string, fluidType: string): number {
    const floMeterTechnology: any = technology;
    const floMeterFluidType: any = fluidType;
    let deviceIdType: number = BuiltInDeviceType.SureSENSFlowmeter298OilProducerGauge;

    switch(floMeterTechnology) {
      case FlowMeterTypes["SureFLO298"]:
        switch(floMeterFluidType) {
          case WellFlowTypes["Oil Producer"]:
            deviceIdType = BuiltInDeviceType.SureSENSFlowmeter298OilProducerGauge;
            break;

          case WellFlowTypes["Gas Producer"]:
            deviceIdType = BuiltInDeviceType.SureSENSFlowmeter298GasProducerGauge;
            break;

          case WellFlowTypes["Gas Injector"]:
            deviceIdType = BuiltInDeviceType.SureSENSFlowmeter298GasInjectorGauge;
            break;

          case WellFlowTypes["Water Injector"]:
            deviceIdType = BuiltInDeviceType.SureSENSFlowmeter298WaterInjectorGauge;
            break;
        }
        break;

      case FlowMeterTypes["SureFLO298 EX"]:
        switch(floMeterFluidType)
        {
          case WellFlowTypes["Oil Producer"]:
            deviceIdType = BuiltInDeviceType.SureSENSFlowmeter298ExOilProducerGauge;
            break;

          case WellFlowTypes["Gas Producer"]:
            deviceIdType = BuiltInDeviceType.SureSENSFlowmeter298ExGasProducerGauge;
            break;

          case WellFlowTypes["Gas Injector"]:
            deviceIdType = BuiltInDeviceType.SureSENSFlowmeter298ExGasInjectorGauge;
            break;

          case WellFlowTypes["Water Injector"]:
            deviceIdType = BuiltInDeviceType.SureSENSFlowmeter298ExWaterInjectorGauge;
            break;
        }
        break;
    }

    return deviceIdType;
  }

  // Logic to update Pressure/ Temprature Tag names for Flow Meters when Well or Tools are changed
  private updateFlowMeterDataPointTagName(fmDataPoint: DataPointDefinitionModel, toolConnections: ToolConnectionUIModel[], dataPoints: DataPointDefinitionModel[]): void {
    let inxTool = toolConnections.findIndex(t => t.DeviceId === fmDataPoint.DeviceId);
    if (inxTool != -1) {
      const wellName = toolConnections[inxTool].WellName;
      const toolName = toolConnections[inxTool].DeviceName;

      let inxDataPoint = dataPoints.findIndex(dp => dp.DeviceId === fmDataPoint.DeviceId && dp.DataPointIndex === fmDataPoint.DataPointIndex);
      if (inxDataPoint != -1) {
        const dataPoint = dataPoints[inxDataPoint];
        fmDataPoint.TagName = `${wellName}_${toolName}_${dataPoint.TagName}`;
      }
    }
  }

  private update298ExFlowMeterPTMappings(flMeter: SureFLOFlowMeterUIModel, toolConnections: ToolConnectionUIModel[], dataPoints: DataPointDefinitionModel[]): void {
    let sureFlo298Ex = flMeter as SureFLO298ExUIFlowMeterUIModel;
    if (sureFlo298Ex.flowMeterPTMapping.InletPressureSource) {
      this.updateFlowMeterDataPointTagName(sureFlo298Ex.flowMeterPTMapping.InletPressureSource, toolConnections, dataPoints);
    }

    if (sureFlo298Ex.flowMeterPTMapping.OutletPressureSource) {
      this.updateFlowMeterDataPointTagName(sureFlo298Ex.flowMeterPTMapping.OutletPressureSource, toolConnections, dataPoints);
    }

    if (sureFlo298Ex.flowMeterPTMapping.InletTemperatureSource) {
      this.updateFlowMeterDataPointTagName(sureFlo298Ex.flowMeterPTMapping.InletTemperatureSource, toolConnections, dataPoints);
    }

    if (sureFlo298Ex.flowMeterPTMapping.OutletTemperatureSource) {
      this.updateFlowMeterDataPointTagName(sureFlo298Ex.flowMeterPTMapping.OutletTemperatureSource, toolConnections, dataPoints);
    }

    if (sureFlo298Ex.flowMeterPTMapping.UseRemoteGauge) {
      if (sureFlo298Ex.flowMeterPTMapping.RemotePressureSource)
        this.updateFlowMeterDataPointTagName(sureFlo298Ex.flowMeterPTMapping.RemotePressureSource, toolConnections, dataPoints);

      if (sureFlo298Ex.flowMeterPTMapping.RemoteTemperatureSource)
        this.updateFlowMeterDataPointTagName(sureFlo298Ex.flowMeterPTMapping.RemoteTemperatureSource, toolConnections, dataPoints);
    }

    this.store.dispatch(SUREFLO_ACTIONS.FLOWMETERS_UPDATE({ flowMeter: sureFlo298Ex }));
  }

  private update298FlowMeterPTMappings(flMeter: SureFLOFlowMeterUIModel, toolConnections: ToolConnectionUIModel[], dataPoints: DataPointDefinitionModel[]): void {
    let sureFlo298 = flMeter as SureFLO298UIFlowMeterUIModel;
    if (sureFlo298.flowMeterPTMapping.InletPressureSource) {
      this.updateFlowMeterDataPointTagName(sureFlo298.flowMeterPTMapping.InletPressureSource, toolConnections, dataPoints);
    }

    if (sureFlo298.flowMeterPTMapping.ThroatPressureSource) {
      this.updateFlowMeterDataPointTagName(sureFlo298.flowMeterPTMapping.ThroatPressureSource, toolConnections, dataPoints);
    }

    if (sureFlo298.flowMeterPTMapping.TemperatureSource) {
      this.updateFlowMeterDataPointTagName(sureFlo298.flowMeterPTMapping.TemperatureSource, toolConnections, dataPoints);
    }

    if (sureFlo298.flowMeterPTMapping.UseRemoteGauge && sureFlo298.flowMeterPTMapping.RemotePressureSource) {
      this.updateFlowMeterDataPointTagName(sureFlo298.flowMeterPTMapping.RemotePressureSource, toolConnections, dataPoints);
    }

    this.store.dispatch(SUREFLO_ACTIONS.FLOWMETERS_UPDATE({ flowMeter: sureFlo298 }));
  }

  private upDateFloMeterPTMappings(flMeter: SureFLOFlowMeterUIModel, toolConnections: ToolConnectionUIModel[], dataPoints: DataPointDefinitionModel[]): void {
    const technology: any = flMeter.Technology;
    if (technology === FlowMeterTypes.SureFLO298)
      this.update298FlowMeterPTMappings(flMeter, toolConnections, dataPoints);
    else
      this.update298ExFlowMeterPTMappings(flMeter, toolConnections, dataPoints);
  }

  public updateSureFLOMeterPTMappings(toolConnections: ToolConnectionUIModel[]): void {
    if (this.surefloEnity && this.surefloEnity.length > 0) {
      let fmToUpdate = this.surefloEnity.filter(f => f.DeviceId < 0)??[];
      if (fmToUpdate.length > 0) {  // Update only if new FloMeter
        this.dataPointDefFacade.initDeviceDataPoints().subscribe(deviceData => {
          fmToUpdate.forEach(sf => {
            this.upDateFloMeterPTMappings(sf, toolConnections, deviceData.dataPoints);
          });
        });
      }
    }
  }

  public initFlowMeters(): BehaviorSubject<SureFLOFlowMeterUIModel[]> {
    if (this.surefloEnity == null || this.surefloEnity.length == 0)
      this.subscribeToSurefloEntityStore();
    return this.surefloSubject;
  }

  public unSubscribeSurefloSubscription(): void {
    if (this.surefloSubscription != null)
      this.surefloSubscription.unsubscribe();
    // Reset state/entity objects here
    this.surefloEnity = [];
  }

  validateFlowMeterData(data : SureFLOFlowMeterUIModel) {
      const isflowMeterDataValid = data.IsDirty && (fmTypes[data.Technology] === fmTypes.SureFLO298EX ? 
                          (data as SureFLO298ExUIFlowMeterUIModel).flowMeterPTMapping !== null && (data as SureFLO298ExUIFlowMeterUIModel).flowMeterDimensions !== null: 
                          (data as SureFLO298UIFlowMeterUIModel).flowMeterPTMapping !== null && (data as SureFLO298UIFlowMeterUIModel).flowMeterDimensions !== null);
    
    return isflowMeterDataValid;
  }

}