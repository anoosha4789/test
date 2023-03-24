import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { GatewayPanelBase } from '@comp/GatewayPanelBase.component';
import { HyrdraulicPowerUnitPointIndex, InFORCEZone_HCM_PointIndex, SHIFT_STATUS_MESSAGE } from '@features/inforce/common/InForceModbusRegisterIndex';
import { DeviceDataPointsFacade } from '@core/facade/deviceDataPointsFacade.service';
import { PointTemplatesFacade } from '@core/facade/pointTemplatesFacade.service';
import { WellFacade } from '@core/facade/wellFacade.service';
import { InforceWellShiftUIModel } from '@core/models/UIModels/inforce.well.shift.model';
import { InforceWellUIModel } from '@core/models/UIModels/InforceWell.model';
import { DataPointDefinitionModel } from '@core/models/webModels/DataPointDefinition.model';
import { ValveShiftTravelParamsDataModel } from '@core/models/webModels/ValveShiftTravelParamsData.model';
import { ConfigurationService } from '@core/services/configurationService.service';
import { RealTimeDataSignalRService } from '@core/services/realTimeDataSignalR.service';
import { InforceShiftStatus, ShiftControlReciepe } from '@features/inforce/common/InforceUICommon';
import { Store } from '@ngrx/store';
import { IInforceDeviceState } from '@store/state/inforcedevices.state';
import { interval } from 'rxjs';
import { Subscription } from 'rxjs/internal/Subscription';
import { take } from 'rxjs/operators';
import * as _ from 'lodash';

@Component({
  selector: 'gw-inforce-shift-hierarchy',
  templateUrl: './inforce-shift-hierarchy.component.html',
  styleUrls: ['./inforce-shift-hierarchy.component.scss']
})
export class InforceShiftHierarchyComponent extends GatewayPanelBase implements OnInit, OnChanges, OnDestroy {

  @Input() well: InforceWellShiftUIModel;
  @Input() hpuId: number;
  @Output() updateActiveZone = new EventEmitter();
  @Output() updateCurrentValvePosition = new EventEmitter();

  currentReciepeStep: number;
  currentZoneIdx: number;
  isReciepeValChanged: boolean;
  hpuDevice: IHPUDataPoint;
  deviceIndexArray: DataPointDefinitionModel[] = [];
  wellWithFilteredZones: InforceWellShiftUIModel = new InforceWellShiftUIModel();
  activeZone: IZoneNode;
  wellZoneList: IZoneNode[];
  zoneNodeList: IZoneNode[] = [];
  isShiftStarted:boolean = false;
  currentValvePosition: IValvePositionNode;

  private dataSubscriptions: Subscription[] = [];

  constructor(protected store: Store<{ inforcedevicesState: IInforceDeviceState; }>,
    private wellDataFacade: WellFacade,
    private dataPointFacade: DeviceDataPointsFacade,
    private pointTemplateFacade: PointTemplatesFacade,
    private configService: ConfigurationService,
    private realTimeService: RealTimeDataSignalRService) {
    super(store, null, wellDataFacade, null, null, dataPointFacade, pointTemplateFacade);
  }

  get inforceShiftStatus() {
    return InforceShiftStatus;
  }

  private subscribeToCurrentShiftZone(): void {
    this.zoneNodeList.forEach(zoneNode => {
      let subscription = this.realTimeService.GetRealtimeData(zoneNode.shiftStatusDataPoint.DeviceId, zoneNode.shiftStatusDataPoint.DataPointIndex)
                          .subscribe(d => {
                            if (d !== undefined && d !== null && d.Value === InforceShiftStatus.InProgress) {
                              this.updateZonePositionNode();
                            }
                          });
      this.dataSubscriptions.push(subscription);

      let currPosSubscription = this.realTimeService.GetRealtimeData(zoneNode.currentPosition.DeviceId, zoneNode.currentPosition.DataPointIndex)
      .subscribe(d => {
        if (d !== undefined && d !== null) {
          this.updateZonePositionNode();
        }
      });
      this.dataSubscriptions.push(currPosSubscription);
    });
  }
  
  private setUpRealtimeSubscription(): void {
    if (this.deviceIndexArray.length > 0) {
      this.deviceIndexArray.forEach((element) => {
        let deviceSubs = this.realTimeService
          .GetRealtimeData(element.DeviceId, element.DataPointIndex)
          .subscribe((d) => {
            if (d !== undefined && d !== null) {              
              if(element.DataPointIndex===InFORCEZone_HCM_PointIndex.ShiftStatus){
                if(d.Value === InforceShiftStatus.InProgress) 
                  this.isShiftStarted = true;

                let shiftZone = this.zoneNodeList.find((zone)=>zone.shiftStatusDataPoint.DeviceId===element.DeviceId);
                if(shiftZone && shiftZone.shiftStatusDataPoint)
                  shiftZone.shiftStatusDataPoint.RawValue = this.isShiftStarted ? d.Value: -999;
              }
              else{
                element.RawValue = d.Value;
              }
            }
          });
          this.dataSubscriptions.push(deviceSubs);
      });
    }
  }

  constructZoneTree() {
      this.zoneNodeList = [];
      this.wellWithFilteredZones.wellZoneShiftRecords = [];
      this.well.wellZoneShiftRecords.forEach(zoneShiftRecord => {
        if (zoneShiftRecord.isFullShift === 1 || zoneShiftRecord.currentDownholePosition != zoneShiftRecord.targetDownholePosition && zoneShiftRecord.currentPositionUnknownFlag != 1) {
          this.wellWithFilteredZones.wellZoneShiftRecords.push(zoneShiftRecord);
          
          const zoneNode: IZoneNode = {
            name: zoneShiftRecord.zoneName,
            zoneId: zoneShiftRecord.zoneId,
            shiftStatus: SHIFT_STATUS_MESSAGE.NotStarted,
            expand: false,
            visited: false,
            isFullShift: zoneShiftRecord.isFullShift,
            shiftStatusDataPoint: this.getDeviceByPointIndex(zoneShiftRecord.HcmId, InFORCEZone_HCM_PointIndex.ShiftStatus),
            currentPosition: this.getDeviceByPointIndex(zoneShiftRecord.HcmId, InFORCEZone_HCM_PointIndex.CurrentPosition),
            targetPosition: this.getDeviceByPointIndex(zoneShiftRecord.HcmId, InFORCEZone_HCM_PointIndex.TargetPosition),
            valvePositionNodeList: []
          };
          this.zoneNodeList.push(zoneNode);
          this.setUpRealtimeSubscription();
          this.buildTreeHierarchyForZone(zoneShiftRecord.currentDownholePositionId, zoneShiftRecord.targetDownholePositionId, zoneNode);
        }
      });   
    
  }

  buildTreeHierarchyForZone(currentPositionId: number, targetPositionId: number, zoneNode: IZoneNode) {
    let valveShiftParamData: ValveShiftTravelParamsDataModel = {
      WellId: this.well.wellId,
      ZoneId: zoneNode.zoneId,
      CurrentPositionId: currentPositionId,      
      TargetPositionId: targetPositionId,
      IsRoundTripShift: zoneNode.isFullShift
    };
    
    //for full shift cycle to get the heirarchy we should sent current pos equal to target position
    if (zoneNode.isFullShift == 1) {
      valveShiftParamData.CurrentPositionId = valveShiftParamData.TargetPositionId;
    }
    this.getTravelPositions(valveShiftParamData);
  }

  buildZoneTreeNodes(positionList: any, valveShiftParamData: ValveShiftTravelParamsDataModel) {
    const zoneIdx = this.zoneNodeList.findIndex(z => z.zoneId === valveShiftParamData.ZoneId);
    const currentZoneNode = this.zoneNodeList.find(z => z.zoneId === valveShiftParamData.ZoneId);
    this.zoneNodeList[zoneIdx].visited = currentZoneNode.currentPosition?.RawValue === currentZoneNode.targetPosition?.RawValue ? true : false;
    this.zoneNodeList[zoneIdx].valvePositionNodeList = [];
    let travelPositions: number[] = positionList;    
    let validSleevePositionDesc: string[] = [];
    if (travelPositions && travelPositions.length > 0) {
        const well:InforceWellUIModel = this.wellEnity.find(w => w.WellId === this.well.wellId);
        let zone = well.Zones.find(z => z.ZoneId == valveShiftParamData.ZoneId);
        for (let i = 0; i < travelPositions.length; i++) {
          validSleevePositionDesc.push(zone.ValvePositionsAndReturns.find(c => c.ToPosition == travelPositions[i]).Description);
        }
        for (let j = 0; j < validSleevePositionDesc.length - 1; j++) {
            let valvePositionNode:IValvePositionNode = {
              visited: false, // this.getZoneValveShiftStatus(currentZoneNode, travelPositions[j], zone.CurrentPosition)
              currentPositionId: travelPositions[j],
              current: validSleevePositionDesc[j],
              target: validSleevePositionDesc[j + 1],
              shiftStatus: InforceShiftStatus.Idle              
            };
            this.zoneNodeList[zoneIdx].valvePositionNodeList.push(valvePositionNode);
        }
        // this.zoneNodeList.push(zoneNode);
        // const zoneIdx = this.zoneNodeList.findIndex(z => z.zoneId === zoneNode.zoneId);
        // if(zoneIdx === -1) { 
        //   this.zoneNodeList.push(zoneNode);
        // }
    }
    
    if (this.zoneNodeList.length == this.wellWithFilteredZones.wellZoneShiftRecords.length) {        
      this.setUpRealtimeSubscription();
    }
    this.activeZone = this.zoneNodeList[0]; // for initial load
    this.updateActiveZone.emit(this.activeZone.zoneId);
    this.subscribeToCurrentShiftZone();    
    // let shiftStatuSubscription = interval(1000).subscribe(() => {
    //   this.updateZonePositionNode();
    // });
    // this.dataSubscriptions.push(shiftStatuSubscription);
  }

  getTravelPositions(valveShiftParamData: ValveShiftTravelParamsDataModel) {
    const currentZone = this.zoneNodeList.find(z => z.zoneId === valveShiftParamData.ZoneId);
    this.configService.getTotalTravelPosition(valveShiftParamData).pipe(take(1)).subscribe(result => {
      if(result) { 
        this.buildZoneTreeNodes(result, valveShiftParamData);
      }
    });
  }

  /*getZoneValveShiftStatus(zoneNode: IZoneNode, valvePositionId: number, zonePositionId: number) {
    const currentPositionId = zoneNode.currentPosition?.RawValue;
    const targetPositionId = zoneNode.targetPosition?.RawValue;
    if (zoneNode.shiftStatusDataPoint?.RawValue === InforceShiftStatus.InProgress) {            
        if (targetPositionId > valvePositionId) {
          return currentPositionId >= valvePositionId ? true : false;
        } else if (targetPositionId < valvePositionId) {
          return currentPositionId <= valvePositionId ? false : true;
        } else if(zoneNode.isFullShift==1){
          return targetPositionId == valvePositionId ? true : false;
        }else
        {
          return currentPositionId == valvePositionId ? true : false;
        }
      
    }
  }*/

  updateZonePositionNode() {
    this.zoneNodeList.forEach((zoneNode) => {
      if (zoneNode.shiftStatusDataPoint?.RawValue === InforceShiftStatus.InProgress) {
        this.activeZone = this.activeZone.zoneId === zoneNode.zoneId ? this.activeZone : zoneNode;
        this.updateActiveZone.emit(zoneNode.zoneId);
        zoneNode.expand = true;
        let currentPositionId = zoneNode.currentPosition.RawValue;
        if (zoneNode.valvePositionNodeList && zoneNode.valvePositionNodeList?.length > 0) {
          let currPosIndex = zoneNode.valvePositionNodeList.findIndex(vp => vp.currentPositionId === currentPositionId);
          if (currPosIndex === -1) {
            // Last Position reached, target value position is not in valvePositionNodeList, so need to set all positions as shift done
            currPosIndex = zoneNode.valvePositionNodeList?.length;
          }
          for (let i = 0; i < zoneNode.valvePositionNodeList.length; i++) {
              zoneNode.valvePositionNodeList[i].visited = i <= currPosIndex ? true : false;
              zoneNode.valvePositionNodeList[i].shiftStatus = zoneNode.valvePositionNodeList[i].visited ? InforceShiftStatus.Successfull : InforceShiftStatus.Idle;
              if (i == currPosIndex) {
                zoneNode.valvePositionNodeList[i].visited = true;
                zoneNode.valvePositionNodeList[i].shiftStatus = this.hpuDevice.CurrentRecipeControlTypeInExecution.RawValue === ShiftControlReciepe.Shift ? 
                                                                      InforceShiftStatus.InProgress : InforceShiftStatus.Successfull;
                this.currentValvePosition = _.cloneDeep(zoneNode.valvePositionNodeList[i]);
                this.updateCurrentValvePosition.emit(this.currentValvePosition);
              }
          }
        }
      }
      else {
        zoneNode.expand = false;
        zoneNode.shiftStatus = SHIFT_STATUS_MESSAGE.FindValue(zoneNode.shiftStatusDataPoint?.RawValue);
      }
    });
  }

  private getDeviceByPointIndex(deviceId: number, pointIndex: number): DataPointDefinitionModel {
    let index = this.datapointdefinitions.findIndex(d => d.DeviceId === deviceId && d.DataPointIndex == pointIndex) ?? -1;
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

      this.deviceIndexArray.push(dp);
      return dp;
    }

    return null;
  }

  setHPUDataPoint() {
    // HPU Device Details
    this.hpuDevice = {
      CurrentRecipeControlTypeInExecution: this.getDeviceByPointIndex(this.hpuId, HyrdraulicPowerUnitPointIndex.CurrentRecipeControlTypeInExecution),     
    };
    this.setUpRealtimeSubscription();
  }
  
  public postCallDeviceDataPoints() {
    this.setHPUDataPoint();
    this.constructZoneTree();
  
  }

  ngOnInit(): void {
    this.initWells(); 
    this.initDeviceDataPoints();
  }

  ngOnChanges(changes: SimpleChanges): void {}

  ngOnDestroy(): void {
    super.ngOnDestroy();
    if (this.dataSubscriptions != null && this.dataSubscriptions.length > 0) {
      this.dataSubscriptions.forEach(subscription => {
        if (subscription != null) {
          subscription.unsubscribe();
          subscription = null;
        }
      });
    }
    this.dataSubscriptions = [];
  }

}

interface IZoneNode {
  zoneId?: number,
  name: string,
  expand: boolean,
  visited: boolean,
  isFullShift?: number,
  shiftStatusDataPoint?: DataPointDefinitionModel,
  currentPosition?: DataPointDefinitionModel,
  targetPosition?: DataPointDefinitionModel,
  shiftStatus: string, 
  valvePositionNodeList: IValvePositionNode[]
}

interface IValvePositionNode {
  visited: boolean,
  shiftStatus: number,
  currentPositionId?: number,
  current: string,
  target: string
}

interface IHPUDataPoint {
  CurrentRecipeControlTypeInExecution: DataPointDefinitionModel;
}
