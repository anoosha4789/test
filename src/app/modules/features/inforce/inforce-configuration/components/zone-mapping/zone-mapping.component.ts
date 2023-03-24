import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { WellErrorNotifierModel } from '@core/models/UIModels/error-notifier-model';
import { InforceWellUIModel } from '@core/models/UIModels/InforceWell.model';
import { IZoneValveType } from '@core/models/UIModels/ValveType.model';
import { LineToZoneMappingModel } from '@core/models/webModels/LineToZoneMapping.model';
import { PanelToLineMappingModel } from '@core/models/webModels/PanelToLineMapping.model';
import { InFORCEZoneDataUIModel } from '@core/models/webModels/ZoneDataUIModel.model';
import { INFORCE_WELL_ARCHITECTURE, ZONE_VALVE_TYPE } from '@core/services/well.service';

@Component({
  selector: 'gw-inforce-zone-mapping',
  templateUrl: './zone-mapping.component.html',
  styleUrls: ['./zone-mapping.component.scss']
})
export class ZoneMappingComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() wellArchitecture: number;
  @Input() well: InforceWellUIModel;
  @Input() zoneMappings: LineToZoneMappingModel[];
  @Input() lineMappings: PanelToLineMappingModel[];
  @Input() valveTypes: IZoneValveType[];

  @Output() lineToZoneMappingChange = new EventEmitter<LineToZoneMappingModel[]>();
  @Output() isZoneMappingValid = new EventEmitter<boolean>();

  public isInValidZoneMapping: boolean = false;
  public downHoleMappings: string[] = [];
  public openLineErrors: Map<number, string> = new Map<number, string>();
  public closeLineErrors: Map<number, string> = new Map<number, string>();
  zoneMapErrorList: WellErrorNotifierModel[] = [];

  constructor(protected router: Router) { }

  onDownHoleOpenLineChanged(lineMapId, openLine): void {
    let inxZoneMap = this.zoneMappings.findIndex(z => z.Id === lineMapId) ?? -1;
    if (inxZoneMap != -1) {
      this.zoneMappings[inxZoneMap].OpenLine = openLine.value;
      this.lineToZoneMappingChange.emit(this.zoneMappings);
      this.validateZoneMappings(true);
    }
  }

  onDownHoleCloseLineChanged(lineMapId, closeLine): void {
    let inxZoneMap = this.zoneMappings.findIndex(z => z.Id === lineMapId) ?? -1;
    if (inxZoneMap != -1) {
      this.zoneMappings[inxZoneMap].CloseLine = closeLine.value;
      this.lineToZoneMappingChange.emit(this.zoneMappings);
      this.validateZoneMappings(false);
    }
  }

  private validateOpenLines(): boolean {
    this.openLineErrors.clear();
    let bisInValidMapping = false;
    for (let zoneMap of this.zoneMappings) {
      if (zoneMap.ValveType === ZONE_VALVE_TYPE.Monitoring)
        continue;

      if (zoneMap.OpenLine === "") {
        bisInValidMapping = true;
        this.openLineErrors.set(zoneMap.Id, "Select a valid Open Line");
        continue;
      }

      if (this.zoneMappings.filter(z => z.CloseLine === zoneMap.OpenLine)?.length > 0) {
        bisInValidMapping = true;
        this.openLineErrors.set(zoneMap.Id, "Connections must be unique");
      }

      let arrOpenLines = this.zoneMappings.filter(l => l.Id != zoneMap.Id && l.OpenLine === zoneMap.OpenLine)??[];
      if (arrOpenLines.length > 0) {
        bisInValidMapping = true;
        this.openLineErrors.set(zoneMap.Id, "Open lines should be unique");
        arrOpenLines.forEach(openLine => {
          this.openLineErrors.set(openLine.Id, "Open lines should be unique");
        });
      }
    }
    return bisInValidMapping;
  }

  private validateCloseLines(): boolean {
    let bisInValidMapping = false;
    this.closeLineErrors.clear();
    if (this.wellArchitecture == INFORCE_WELL_ARCHITECTURE.N_PlUS_ONE) {
      for (let zoneMap of this.zoneMappings) {
        if (zoneMap.ValveType === ZONE_VALVE_TYPE.Monitoring)
          continue;

        if (zoneMap.CloseLine === "") {
          bisInValidMapping = true;
          this.closeLineErrors.set(zoneMap.Id, "Select a valid Close Line");
          continue;
        }

        if (this.zoneMappings.filter(z => z.OpenLine === zoneMap.CloseLine)?.length > 0) {
          bisInValidMapping = true;
          this.closeLineErrors.set(zoneMap.Id, "Connections must be unique");
        }

        let arrCloseLines = this.zoneMappings.filter(l => l.Id != zoneMap.Id && l.ValveType != ZONE_VALVE_TYPE.Monitoring && l.CloseLine != zoneMap.CloseLine)??[];
        if (arrCloseLines.length > 0) {
          bisInValidMapping = true;
          arrCloseLines.forEach(closeLine => {
            this.closeLineErrors.set(closeLine.Id, "Close Lines must be same");
          });
        }
      }
      return bisInValidMapping;
    }
    else if (this.wellArchitecture === INFORCE_WELL_ARCHITECTURE.TWO_N) {
      for (let zoneMap of this.zoneMappings) {
        if (zoneMap.ValveType === ZONE_VALVE_TYPE.Monitoring)
          continue;
        
        if (zoneMap.CloseLine === "") {
          bisInValidMapping = true;
          this.closeLineErrors.set(zoneMap.Id, "Select a valid Close Line");
          continue;
        }

        if (this.zoneMappings.filter(z => z.OpenLine === zoneMap.CloseLine)?.length > 0) {
          bisInValidMapping = true;
          this.closeLineErrors.set(zoneMap.Id, "Connections must be unique");
        }

        let arrCloseLines = this.zoneMappings.filter(l => l.Id != zoneMap.Id && l.CloseLine === zoneMap.CloseLine)??[];
        if (arrCloseLines.length > 0) {
          bisInValidMapping = true;
          this.closeLineErrors.set(zoneMap.Id, "Close lines should be unique");
          arrCloseLines.forEach(openLine => {
            this.closeLineErrors.set(openLine.Id, "Close lines should be unique");
          });
        }
      }
      return bisInValidMapping;
    }
  }

  private validateZoneMappings(bIsOpenLine: boolean): void {
    if (bIsOpenLine) {
      this.isInValidZoneMapping = this.validateOpenLines();
      this.isInValidZoneMapping = this.validateCloseLines() || this.isInValidZoneMapping;
    }
    else {
      this.isInValidZoneMapping = this.validateCloseLines();
      this.isInValidZoneMapping = this.validateOpenLines() || this.isInValidZoneMapping;
    }  
    this.getZoneMappingErrorList();    
    this.isZoneMappingValid.emit(this.isInValidZoneMapping);  
  }

  private setUpLineMappings(): void {
    this.downHoleMappings = [];
    if (this.lineMappings && this.lineMappings.length > 0) {
      this.lineMappings.forEach(lineMapping => {
        this.downHoleMappings.push(lineMapping.DownholeLine);
      });
    }
  }

  private getZoneName(zoneId): string {
    let inxZone = this.well.Zones.findIndex(z => z.ZoneId === zoneId);
    return this.well.Zones[inxZone]?.ZoneName;
  }

  private isLineMappingChanged(lineName): boolean {
    let inxLine = this.lineMappings.findIndex(l => l.DownholeLine === lineName)??-1;
    return inxLine === -1 ? true : false;
  }

  private setUpLineToZoneMappings(): void {
    let bZoneMappingsExist = false;
    for (let zone of this.well.Zones) {
      if (zone.LineToZoneMapping) {
        bZoneMappingsExist = true;
        break;
      }
    }

    if (bZoneMappingsExist) { // Update zone mappings for any change in zones or Output Mappings
      this.zoneMappings.forEach(zoneMap => {
        let zoneName = this.getZoneName(zoneMap.ZoneId);
        if (zoneMap.ZoneName != zoneName)
          zoneMap.ZoneName = zoneName;

        if (this.isLineMappingChanged(zoneMap.OpenLine))
          zoneMap.OpenLine = "";

        if (this.isLineMappingChanged(zoneMap.CloseLine))
          zoneMap.CloseLine = "";
      });
      // loading with values show validations
      this.validateZoneMappings(true);
    }
    else {  // first time load - emit change to update Zones
      this.lineToZoneMappingChange.emit(this.zoneMappings);
    }
  }

  getZoneMappingErrorList() {
    this.zoneMapErrorList = [];
    const openLineErrorList = [...this.openLineErrors].map(([name, value]) => ({ name : name.toString(), value: 'Line to Zone Mapping has invalid data' }));
    const closeLineErrorList = [...this.closeLineErrors].map(([name, value]) => ({ name: name.toString(), value: 'Line to Zone Mapping has invalid data' }));
    const errorList = [...openLineErrorList, ...closeLineErrorList];
    if (errorList && errorList.length > 0) {
     
      if(this.zoneMapErrorList.length > 0) {
        errorList.forEach((error) => { 
          this.zoneMapErrorList.forEach(zoneMapError => {
          const errorIdx =  zoneMapError.errors.findIndex(e => e.value === error.value);
          if(errorIdx === -1 ) { 
            zoneMapError.errors.push(error);
          } else {
            zoneMapError.errors[errorIdx] = error;
          }
          });
        });
      } else {        
        this.zoneMapErrorList.push(
          {
          wellId: this.well.WellId,
          wellName: this.well.currentWellName,
          path: this.router.url,
          tabName: `${this.well.currentWellName} - Zone Mapping`,
          tabIndex: 2,
          errors: Array.from(new Set(errorList.map(a => a.value))).map(value => {
            return errorList.find(a => a.value === value)
          })
        });        
      }
      
    } 
    this.well.zoneMapErrors = this.zoneMapErrorList;
  }
  
  ngOnDestroy(): void {
    this.isZoneMappingValid.emit(false);
  }

  ngAfterViewInit(): void {
    this.setUpLineToZoneMappings();
  }

  ngOnInit(): void {
    this.isZoneMappingValid.emit(true);
    this.setUpLineMappings();
    //this.setUpLineToZoneMappings();
  }
}
