import { string } from '@amcharts/amcharts4/core';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ZONE_VALVE_TYPE } from '@core/data/UICommon';
import { WellErrorNotifierModel } from '@core/models/UIModels/error-notifier-model';
import { InforceWellUIModel } from '@core/models/UIModels/InforceWell.model';
import { LineToZoneMappingModel } from '@core/models/webModels/LineToZoneMapping.model';
import { PanelToLineMappingModel } from '@core/models/webModels/PanelToLineMapping.model';
import { INFORCE_WELL_ARCHITECTURE } from '@core/services/well.service';
import { cloneDeep as _cloneDeep } from 'lodash';

@Component({
  selector: 'gw-inforce-output-mapping',
  templateUrl: './output-mapping.component.html',
  styleUrls: ['./output-mapping.component.scss']
})
export class OutputMappingComponent implements OnInit, OnDestroy {

  displayedColumns: string[] = ['PanelConnection', 'DownholeLine'];

  @Input() wellArchitecture: number;
  @Input() wellEnity: any[];
  @Input() well: InforceWellUIModel;
  @Input() hydraulicOutput = 0;
  @Input() outputCount = 0;

  @Output() panelToLineMappingChange = new EventEmitter<{ panelToLineMapping: PanelToLineMappingModel[], dirty: boolean }>();
  @Output() outputMappingValidEvent = new EventEmitter<boolean>();

  isTableValid = true;
  outMapErrorList: WellErrorNotifierModel[] = [];

  allOutputOptions = [
    { value: 'Output A', label: 'Output A' },
    { value: 'Output B', label: 'Output B' },
    { value: 'Output C', label: 'Output C' },
    { value: 'Output D', label: 'Output D' },
    { value: 'Output E', label: 'Output E' },
    { value: 'Output F', label: 'Output F' },
    { value: 'Output G', label: 'Output G' },
    { value: 'Output H', label: 'Output H' },
    { value: 'Output I', label: 'Output I' },
    { value: 'Output J', label: 'Output J' },
    { value: 'Output K', label: 'Output K' },
    { value: 'Output L', label: 'Output L' },
    { value: 'Output M', label: 'Output M' },
    { value: 'Output N', label: 'Output N' },
    { value: 'Output O', label: 'Output O' },
    { value: 'Output P', label: 'Output P' },
    { value: 'Output Q', label: 'Output Q' },
    { value: 'Output R', label: 'Output R' },
    { value: 'Output S', label: 'Output S' },
    { value: 'Output T', label: 'Output T' },
    { value: 'Output U', label: 'Output U' },
    { value: 'Output V', label: 'Output V' },
    { value: 'Output W', label: 'Output W' },
    { value: 'Output X', label: 'Output X' },
  ];
  outputOptions = [];
  panelToLineList: PanelToLineMappingModel[] = [];
  errorMessages = [];

  constructor(protected router: Router) { }

  setOutputOptions() {
    this.outputOptions = [];
    this.panelToLineList = [];
    if (this.hydraulicOutput === undefined || this.outputCount === undefined || this.well === undefined) {
      return;
    }
    for (let i = 0; i < this.hydraulicOutput; i++) {
      this.outputOptions.push({ ...this.allOutputOptions[i] });
    }
    if (this.well.PanelToLineMappings?.length) {
      this.panelToLineList = _cloneDeep(this.well.PanelToLineMappings);
    } else {
      for (let i = 0, j = 0; i < this.outputCount && j < this.allOutputOptions.length; j++) {
        if (!this.isInSelectedOutputs(this.allOutputOptions[j].value)) {
          this.panelToLineList.push({
            WellId: this.well.WellId,
            PanelConnection: this.allOutputOptions[j].value,
            DownholeLine: i === 0 && this.wellArchitecture == INFORCE_WELL_ARCHITECTURE.N_PlUS_ONE ? 'Common Close' : this.allOutputOptions[j].label,
            PanelToLineMappingsId: -(i + 1)
          });
          i++;
        }
      }
    }
    this.errorMessages = [];
    this.panelToLineList.forEach(item => {
      this.errorMessages.push({
        PanelConnection: '',
        DownholeLine: ''
      });
    });
    this.panelToLineMappingChange.emit({
      panelToLineMapping: this.panelToLineList,
      dirty: false
    });
  }

  getOutputLabel(value: string) {
    return this.outputOptions.find(option => option.value === value)?.label || '';
  }

  isInSelectedOutputs(value: string) {
    let found = false;
    if (this.wellEnity) {
      for (let well of (this.wellEnity as InforceWellUIModel[])) {
        if (well.PanelToLineMappings?.some(row => row.PanelConnection === value)) {
          found = true;
          break;
        }
      }
    }
    if (!found) {
      if (this.panelToLineList.some(row => row.PanelConnection === value)) {
        found = true;
      }
    }
    return found;
  }

  getMappingsWithConnection(value: string) {
    let mappings: PanelToLineMappingModel[] = [];
    if (this.wellEnity) {
      for (let well of (this.wellEnity as InforceWellUIModel[])) {
        for (let mapping of (well.PanelToLineMappings || [])) {
          if (mapping.PanelConnection === value) {
            mappings.push(mapping);
          }
        }
      }
    }
    if (!this.well?.PanelToLineMappings?.length) {
      for (let mapping of this.panelToLineList) {
        if (mapping.PanelConnection === value) {
          mappings.push(mapping);
        }
      }
    }
    return mappings;
  }

  validatePanelToLineMappings(index: number, field: string) {
    const mapping = this.panelToLineList[index];
    const errorObj = this.errorMessages[index];
    // this.panelToLineList.forEach((mapping, mappingIndex) => {
    //   if (mappingIndex === index || this.errorMessages[mappingIndex][field] !== '') {
    // const errorObj = this.errorMessages[mappingIndex];
    errorObj[field] = '';

    if (field === 'PanelConnection') {
      const mappingsWithConnection = this.getMappingsWithConnection(mapping.PanelConnection);
      if (mappingsWithConnection.length > 1) {
        const existingMapping = mappingsWithConnection.find(m => {
          return m.WellId !== mapping.WellId || // same connection in other well
            m.PanelToLineMappingsId !== mapping.PanelToLineMappingsId; // same connection in other mapping of same well
        });
        if (existingMapping) {
          // let wellName = (this.wellEnity as InforceWellUIModel[]).find(well => well.WellId === existingMapping.WellId)?.WellName || '';
          const outputLabel = this.outputOptions.find(option => option.value === existingMapping.PanelConnection)?.label || '';
          errorObj.PanelConnection = errorObj.PanelConnection || `${outputLabel} already in use.`;
        }
      }
    }

    if (field === 'DownholeLine') {
      if (mapping.DownholeLine === '') {
        errorObj.DownholeLine = errorObj.DownholeLine || 'Required field.';
      }

      const alphaNumericRegex = /^[a-z0-9\s]+$/i;
      if (!alphaNumericRegex.test(mapping.DownholeLine)) {
        errorObj.DownholeLine = errorObj.DownholeLine || 'Alphanumeric characters only.';
      }

      if (mapping.DownholeLine.length > 50) {
        errorObj.DownholeLine = errorObj.DownholeLine || 'Max. of 50 characters allowed.';
      }

      const mappingsWithLine = this.panelToLineList.filter(item => item.DownholeLine.toLowerCase() === mapping.DownholeLine.toLowerCase());
      if (mappingsWithLine.length > 1) {
        errorObj.DownholeLine = errorObj.DownholeLine || 'Enter unique mapping name.';
      }
    }
    this.getOutputMapErrorList();
    this.isTableValid = this.errorMessages.every(error => Object.values(error).every(value => value === ''));
    this.outputMappingValidEvent.emit(this.isTableValid);
  }

  getOutputMapErrorList() {
    this.outMapErrorList = [];

    const errorList: errorModel[] = [];
    this.errorMessages.forEach(error => {
      if (errorList.length > 0) {
        if (error.PanelConnection) {
          const errorIdx = errorList.findIndex(e => e.name === 'PanelConnection' && e.value === `PanelConnection: ${error.PanelConnection}`);
          const errorObj: errorModel = {
            name: 'PanelConnection',
            value: `Panel Connection : ${error.PanelConnection}`
          };
          if (errorIdx === -1) {
            errorList.push(errorObj);
          } else {
            errorList[errorIdx] = errorObj;
          }
        }

        if (error.DownholeLine) {
          const errorIdx = errorList.findIndex(e => e.name === 'DownholeLine' && e.value === `DownholeLine: ${error.DownholeLine}`);
          const errorObj: errorModel = {
            name: 'DownholeLine',
            value: `Downhole Line : ${error.DownholeLine}`
          };
          if (errorIdx === -1) {
            errorList.push(errorObj);
          } else {
            errorList[errorIdx] = errorObj;
          }
        }

      } else {
        if (error.PanelConnection) {
          const errorObj: errorModel = {
            name: 'PanelConnection',
            value: `Panel Connection : ${error.PanelConnection}`
          };
          errorList.push(errorObj);
        }
        if (error.DownholeLine) {
          const errorObj = {
            name: 'DownholeLine',
            value: `Downhole Line : ${error.DownholeLine}`
          };
          errorList.push(errorObj);
        }
      }
    });
    this.outMapErrorList.push(
      {
        wellId: this.well.WellId,
        wellName: this.well.currentWellName,
        path: this.router.url,
        tabName: `${this.well.currentWellName} - Output Mapping`,
        tabIndex: 1,
        errors: errorList
      });
    this.well.outMapErrors = errorList.length > 0 ? this.outMapErrorList : [];
  }

  onOutputValueChange(index, event) {
    this.panelToLineList[index].PanelConnection = event.value;
    // this.validatePanelToLineMappings(index, 'PanelConnection');
    this.validateAllRows();
    this.panelToLineMappingChange.emit({
      panelToLineMapping: this.panelToLineList,
      dirty: true
    });
    this.clearLineToZoneMapping();
  }

  onDownholeLineChange(index, event) {
    this.panelToLineList[index].DownholeLine = event.target.value;
    // this.validatePanelToLineMappings(index, 'DownholeLine');
    this.validateAllRows();
    this.panelToLineMappingChange.emit({
      panelToLineMapping: this.panelToLineList,
      dirty: true
    });
    this.clearLineToZoneMapping();
  }

  clearLineToZoneMapping() {
    this.well.LineToZoneMapping.forEach(lineMapping => {
      lineMapping.CloseLine = "";
      lineMapping.OpenLine = "";
    });
    this.well.Zones.forEach(zone => {
      if (zone.ValveType != ZONE_VALVE_TYPE.Monitoring && zone.LineToZoneMapping != undefined) {
        zone.LineToZoneMapping.CloseLine = "";
        zone.LineToZoneMapping.OpenLine = "";
      }
    });
  }

  validateAllRows() {
    for (let i = 0; i < this.panelToLineList.length; i++) {
      const fields = ['PanelConnection', 'DownholeLine'];
      for (let field of fields) {
        this.validatePanelToLineMappings(i, field);
      }
    }
  }

  ngOnDestroy(): void {
    this.outputMappingValidEvent.emit(true);
  }

  ngOnInit(): void {
    this.setOutputOptions();
    this.validateAllRows();
  }

}

class errorModel {
  name: string;
  value: string;
}
