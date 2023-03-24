import { Injectable } from "@angular/core";
import { AbstractControl, FormArray, ValidatorFn } from "@angular/forms";
import { Store } from "@ngrx/store";
import { BehaviorSubject, of, Subscription } from "rxjs";
import { map, switchMap, take } from "rxjs/operators";
import * as _ from "lodash";
import { Validator } from "jsonschema";
import { Update } from "@ngrx/entity";
import { String } from 'typescript-string-operations';

import { selectAllWells, selectWellState } from "@store/reducers/well.entity.reducer";
import { IWellEntityState } from "@store/state/well.state";

import { wellSchema } from "@core/models/schemaModels/WellDataModel.schema";
import { zoneSchema } from "@core/models/schemaModels/ZoneDataModel.schema";
import { inforceWellSchema } from "@core/models/schemaModels/InFORCEWellDataUIModel.schema";
import { DeleteOrder } from "@core/models/UIModels/models.model";
import { DeleteObjectTypesEnum } from "@core/models/webModels/DeleteObjectTypesEnum";
import { DeleteObject, PanelTypeList, UICommon } from "@core/data/UICommon";

import * as WELL_ACTIONS from '@store/actions/well.entity.action';
import * as TOOL_CONNECTION_ACTIONS from '@store/actions/tool-connection.entity.action';
import { DataSourceFacade } from "./dataSourceFacade.service";
import { ToolConnectionModel } from "@core/models/webModels/ToolConnection.model";

import { WellUIModel } from "@core/models/UIModels/well.model";
import { InchargeZoneUIModel } from "@core/models/UIModels/incharge.zone.model";
import { SuresensWellUIModel } from "@core/models/UIModels/suresens.well.model";
import { InchargeWellUIModel } from "@core/models/UIModels/Incharge.well.model";
import { PanelConfigurationFacade } from "./panelConfigFacade.service";
import { SurefloFacade } from "./surefloFacade.service";
import { InforceWellUIModel } from "@core/models/UIModels/InforceWell.model";
import { ValvePositionsAndReturnsModel } from "@core/models/webModels/ValvePositionsAndReturns.model";
import { INFORCE_WELL_ARCHITECTURE } from "@core/services/well.service";
import { ZONE_VALVE_TYPE } from '@core/data/UICommon';
import { WellTypeEnum } from "@core/models/webModels/WellDataUIModel.model";
import { MultiNodeWellUIModel } from "@core/models/UIModels/MultinodeWell.model";
import { multinodeWellSchema } from "@core/models/schemaModels/MultinodeWell.schema";
@Injectable({
  providedIn: 'root',
})
export class WellFacade {

  // Panel Type
  private panelTypeId: number;

  // Store Entity objects
  wellEnity: any[];

  // State Objects BehaviorSubject variables
  private wellSubject = new BehaviorSubject<WellUIModel[]>([]);

  private newWell: any;

  // State Objects subscriptions variables
  private wellSubscription: Subscription = null;

  constructor(protected store: Store<any>,
    private panelConfigurationFacade: PanelConfigurationFacade,
    private dataSourcesFacade: DataSourceFacade,
    private sureFLOFacade: SurefloFacade) {
    this.setWellModelByPanelType();
  }

  private setWellModelByPanelType() {
    this.panelConfigurationFacade.initPanelConfigurationCommon().subscribe(panelConfigState => {
      if (panelConfigState) {
        this.panelTypeId = panelConfigState.panelConfigurationCommon.PanelTypeId;
        this.wellEnity = this.panelTypeId === PanelTypeList.SURESENS ? this.wellEnity as SuresensWellUIModel[] : this.wellEnity as InchargeWellUIModel[];
      }
    });
  }

  private subscribeToWellEntityStore() {
    if (this.wellSubscription == null) {
      this.wellSubscription = this.store.select<any>(selectWellState).subscribe((state: IWellEntityState) => {
        if (state && !state.isLoaded) {
          this.store.dispatch(WELL_ACTIONS.WELL_LOAD());
        }
        else {
          this.store.select<any>(selectAllWells).subscribe(wells => {
            this.wellEnity = _.cloneDeep(wells);
            if (this.wellEnity && this.wellEnity.length > 0) {
              this.mapWellName();
            }
            this.wellSubject.next(this.wellEnity);
          });
        }
      });
    }
  }

  // Hold Database Value of Well Name
  mapWellName() {
    this.wellEnity.forEach((well) => {
      well.currentWellName = well.currentWellName ? well.currentWellName : well.WellName
    });
    return this.wellEnity;
  }

  private getNewWellName(wellId: number): string {
    let wellName = `Well ${wellId}`;
    while(this.wellEnity.findIndex(w => w.WellName === wellName) > -1) {
      wellId++;
      wellName = `Well ${wellId}`;
    }
    return wellName;
  }

  getNewWell(Id: number, wellTypeId: number) {

    let name = this.getNewWellName(Id);
    switch (wellTypeId) {

      case WellTypeEnum.MultiNode:
        this.newWell = {
          WellId: -Id,
          WellName: name,
          currentWellName: name,
          WellType: wellTypeId,
          Zones: [],
          eFCVPositions: [],
          // TEC: { "MaxVoltage": 150, "RampRate": 25, "MaxCurrent": 250, "SettleVoltage": 90, "TargetVoltage": 125, "SettleRampRate": -10 },
          TEC: {
            Id: -1,
            TECGuid: "",
            WellId: -Id,
            TecNumber: -1,
            PowerSupplySettings: {
              MaxVoltage: 150, MaxCurrent: 250, TargetVoltage: 125, RampRate: 25, SettleVoltage: 90, SettleRampRate: -10
            }
          },
          WellDeviceId: UICommon.IsImportConfig ? UICommon.getImportNextDeviceId() : -1,
          IsValid: true,
          IsDirty: true
        };  // No limit of zones
        break;
      default:
        this.newWell = {
          WellId: -Id,
          WellName: name,
          currentWellName: name,
          WellType: wellTypeId,
          Zones: [],
          WellDeviceId: UICommon.IsImportConfig ? UICommon.getImportNextDeviceId() : -1,
          IsValid: true,
          IsDirty: true
        };  ///Default is N+1
        break;
    }

    return this.newWell;
  }

  validateWell(well: any): string {

    let errMssg = null;

    let validator = new Validator();
    let result = validator.validate(well, wellSchema);
    if (!result.valid) {
      errMssg = String.Format("{0} - {1}", result.errors[0].property.replace("instance.", ""), result.errors[0].message);
      return errMssg;
    }

    if (this.panelTypeId !== PanelTypeList.SURESENS && well.Zones && well.Zones.length == 0) {
      // No Wells added yet
      errMssg = "No Zones added to the well";
      return errMssg;
    }

    // if (this.wellEnity && this.wellEnity.length > 0) { 
    //   const wellIdx = this.wellEnity.findIndex(well => well.WellName.trim() === well.WellName.trim());
    //   errMssg = "Well Name should be unique";
    //   return errMssg;
    // }

    validator = new Validator();  // reinitialize
    if (this.panelTypeId !== PanelTypeList.SURESENS) {
      for (let i = 0; i < well.Zones.length; i++) {
        result = validator.validate(well.Zones[i], zoneSchema);
        if (!result.valid) {
          errMssg = String.Format("{0} - {1}", result.errors[0].property.replace("instance.", ""), result.errors[0].message);
          return errMssg;
        }
      }
    }
    return errMssg;
  }

  validateWells(wells: WellUIModel[]): boolean {
    let bIsValid = true;
    for (let i = 0; i < wells.length; i++) {
      if (this.validateWell(wells[i]) != null) {
        bIsValid = false;
        break;
      }
    }
    return bIsValid;
  }

  validateInforceWells(wells: InforceWellUIModel[]): boolean {
    let bIsValid = true;
    for (let i = 0; i < wells.length; i++) {
      if (this.validateInforceWell(wells[i]) != null) {
        bIsValid = false;
        break;
      }
    }
    return bIsValid;
  }

  getZoneLimit(selArchitectId, selNumOfOutput): number {
    let count = 0;
    switch (selArchitectId) {
      case INFORCE_WELL_ARCHITECTURE.TWO_N:
        count = selNumOfOutput / 2;
        break;

      case INFORCE_WELL_ARCHITECTURE.N_PlUS_ONE:
        count = selNumOfOutput - 1;
        break;

      case INFORCE_WELL_ARCHITECTURE.SURESENS:
        count = 999;  // No limit of zones
        break;

      default:
        count = selNumOfOutput - 1;  ///Default is N+1
        break;
    }
    return count;
  }

  validateInforceWell(well: InforceWellUIModel): string {

    let errMssg = null;
    let validator = new Validator();
    let result = well.ControlArchitectureId !== INFORCE_WELL_ARCHITECTURE.SURESENS ? validator.validate(well, inforceWellSchema) :
      validator.validate(well, wellSchema);
    if (!result.valid) {
      errMssg = String.Format("{0} - {1}", result.errors[0].property.replace("instance.", ""), result.errors[0].message);
      return errMssg;
    }
    if (well.Zones && well.Zones.length == 0) {
      errMssg = "No Zones added to the well";
      return errMssg;
    }
    if (well.ControlArchitectureId !== INFORCE_WELL_ARCHITECTURE.SURESENS) {
      const zoneCount = well.Zones.reduce((count, zone) => (zone.ValveType !== ZONE_VALVE_TYPE.Monitoring ? count + 1 : count), 0);
      let outputCount = this.getZoneLimit(well.ControlArchitectureId, well.NumberOfOutputs);
      if (outputCount > zoneCount) {
        errMssg = "Number of Zones with Valve Type should be equal" + outputCount.toString();
        return errMssg;
      }
    }

    let LineToZoneMapping = well.LineToZoneMapping;
    if (LineToZoneMapping && LineToZoneMapping.length > 0) {
      for (let i = 0; i < LineToZoneMapping.length; i++) {
        if (LineToZoneMapping[i].ValveType !== ZONE_VALVE_TYPE.Monitoring) {
          if (!LineToZoneMapping[i].CloseLine || !LineToZoneMapping[i].OpenLine) {
            errMssg = "No Zone Mapping added";
            break;
          }
        }
      }
    } else {
      errMssg = "No Zone Mapping added";
    }

    let zones = well.Zones;
    if (zones && zones.length > 0) {
      zones.forEach(zone => {
        if (zone.ValveType !== ZONE_VALVE_TYPE.Monitoring) {
          let ValvePositionsAndReturns = zone.ValvePositionsAndReturns;
          if (ValvePositionsAndReturns) {
            for (let i = 0; i < ValvePositionsAndReturns.length; i++) {
              if (!ValvePositionsAndReturns[i].Description) {
                errMssg = "Valve Position and Returns not added";
                break;
              }
            }
          } else {
            errMssg = "Valve Position and Returns not added";
          }
        }
      });
    }
    return errMssg;

  }

  validateMultiNodeWell(well: MultiNodeWellUIModel): string {
    let errMssg = null;
    let validator = new Validator();
    let result = validator.validate(
      well,
      multinodeWellSchema
    );
    if (!result.valid) {
      errMssg = String.Format("{0} - {1}", result.errors[0].property.replace("instance.", ""), result.errors[0].message);
      return errMssg;
    }

    if (well.Zones?.length == 0) { // No Cards added yet
      errMssg = "No eFCVs added to the Well";
      return errMssg;
    }
    return errMssg;
  }


  isValidWellName(wellId: number, wellName: string): boolean {
    // this.initWells();
    let bIsValid = true;
    if (this.wellEnity && this.wellEnity.length > 0) {
      bIsValid = this.wellEnity.findIndex(well => well.WellId !== wellId && well.WellName.toUpperCase().trim() === wellName.toUpperCase().trim()) !== -1 ? false : true;
    }

    return bIsValid;
  }

  saveWell(well: any): void {
    well.WellName = well?.WellName?.trim();
    const action = { well: well };
    if (this.newWell) {
      this.store.dispatch(WELL_ACTIONS.WELL_ADD(action));
    } else {
      this.store.dispatch(WELL_ACTIONS.WELL_UPDATE(action));
      // GATE - 1254 Well or Zone Name update
      this.dataSourcesFacade.initToolConnections().pipe(
        map(res => res.filter(tc => tc.WellId === well.WellId)),
        take(1)).subscribe(data => {
          // console.log('tool conn data...', data);
          if (data) {
            const toolConnectionList: Update<ToolConnectionModel>[] = data.map(tc => {
              return {
                id: tc.Id,
                changes: {
                  WellName: tc.WellId === well.WellId ? well.WellName : tc.WellName,
                  ZoneName: this.panelTypeId !== PanelTypeList.SURESENS ? this.updateZoneName(well?.Zones, tc.ZoneId, tc.ZoneName) : ""
                }
              };
            });
            this.store.dispatch(TOOL_CONNECTION_ACTIONS.TOOL_CONNECTIONS_UPDATE_WELL_ZONE_NAME({ toolConnection: toolConnectionList }))
            this.sureFLOFacade.updateSureFLOMeterPTMappings(this.dataSourcesFacade.toolConnectionEntity);
          }
        });
    }
    this.newWell = null;
  }

  updateZoneName(zones, zoneId, zoneName) {
    // Update zone name
    zones.forEach(zone => {
      if (zone.ZoneId === zoneId) {
        zoneName = zone.ZoneName;
      }
    });
    return zoneName;
  }

  deleteWell(wellId: number): void {
    let inxWell = this.wellEnity.findIndex(w => w.WellId === wellId) ?? -1;
    if (inxWell != -1) {
      let wellName = this.wellEnity[inxWell].WellName ?? "";
      if (wellId > -1) {
        let deleteWell: DeleteObject = {
          deleteOrder: DeleteOrder.Well,
          id: wellId,
          name: wellName,
          objectType: DeleteObjectTypesEnum.Well,
          children: []
        };        

        // Delete already deleted zones for the well being deleted.
        let deletedZones = UICommon.deletedObjects.filter(z => z.parentId === wellId) ?? [];
        if (deletedZones.length > 0) {
          deletedZones.forEach(delZone => {
            let inx = UICommon.deletedObjects.findIndex(z => z.parentId === wellId && z.id === delZone.id) ?? -1;
            if (inx != -1)
              UICommon.deletedObjects.splice(inx, 1);
          });
        }

        // Add Zones to deleted Well children to show in Configuration Summary dialog
        if (this.panelTypeId === PanelTypeList.MultiNode) {
          deleteWell.data = this.wellEnity[inxWell];
          this.wellEnity[inxWell].Zones.forEach(zone => {
            deleteWell.children.push({
              deleteOrder: DeleteOrder.eFCV,
              id: zone.ZoneId,
              name: String.Format("{0} - {1}", wellName, zone.ZoneName),
              data: zone,
              objectType: DeleteObjectTypesEnum.eFCV
            });
          });
        } else if (this.panelTypeId !== PanelTypeList.SURESENS) {
          this.wellEnity[inxWell].Zones.forEach(zone => {
            deleteWell.children.push({
              deleteOrder: DeleteOrder.Zone,
              id: zone.ZoneId,
              name: String.Format("{0} - {1}", wellName, zone.ZoneName),
              data: zone,
              objectType: DeleteObjectTypesEnum.Zone
            });
          });
        }

        UICommon.deletedObjects.push(deleteWell);
      }
      this.store.dispatch(WELL_ACTIONS.WELL_DELETE({ wellId: wellId }));
    }
  }

  public initWells(): BehaviorSubject<WellUIModel[]> {
    if (this.wellEnity == null || this.wellEnity.length == 0)
      this.subscribeToWellEntityStore();

    return this.wellSubject;
  }

  public unSubscribeWellSubscription(): void {
    if (this.wellSubscription != null)
      this.wellSubscription.unsubscribe();

    // Reset state/entity objects here
    this.wellEnity = [];
  }

  // Custom Form Validation functions
  public wellNameValidator(wellID: number): ValidatorFn {
    return (c: AbstractControl): { [key: string]: any } | null => {
      if (c.value === undefined || c.value == null || c.value == '')
        return null;

      if (!this.isValidWellName(wellID, c.value))
        return { customError: 'Name already exists.' };

      return null;
    };
  }

  // InFORCE Custom Validation Rules

  public zoneNameValidator(currentZoneName: string, zones: any[]): ValidatorFn {
    return (c: AbstractControl): { [key: string]: any } | null => {
      if (c.value === undefined || c.value == null)
        return null;

      let zoneName = c.value.toString().trim();
      if (zones.length > 0 && zoneName) {
        const zoneIdx = zones.findIndex(z => z.ZoneName.toUpperCase() === zoneName.toUpperCase() && zoneName !== currentZoneName);
        if (zoneIdx !== -1)
          return { customError: 'Name already exists.' };
      }

      return null;
    };
  }


  public zoneDepthValidator(currentMeasuredDepth: number, zones: any[]): ValidatorFn {
    return (c: AbstractControl): { [key: string]: any } | null => {
      if (c.value === undefined || c.value == null)
        return null;

      // Multiple zones with same measured depth
      let depth = parseInt(c.value, 10);
      if (zones.length > 0 && depth) {
        const zoneIdx = zones.findIndex(z => z.MeasuredDepth === depth && depth !== currentMeasuredDepth);
        if (zoneIdx !== -1)
          return { customError: 'Same depth already exists.' };
      }

      return null;
    };
  }

  // Postion Description unique validator
  public valvePosandReturnDescValidator(id: number, data: FormArray): ValidatorFn {
    return (ctrl: AbstractControl): { [key: string]: any } | null => {

      if (ctrl.value === undefined || ctrl.value == null)
        return null;

      let description: string = ctrl.value.trim();
      if (data.controls.length > 0) {
        const rowIdx = data.controls.findIndex((formGroup) => (formGroup.value as ValvePositionsAndReturnsModel).Id !== id && (formGroup.value as ValvePositionsAndReturnsModel).Description?.toLowerCase() === description.toLowerCase());
        if (rowIdx !== -1) {
          return { customError: 'Enter unique description.' };
        }
      }

    };
  }

}