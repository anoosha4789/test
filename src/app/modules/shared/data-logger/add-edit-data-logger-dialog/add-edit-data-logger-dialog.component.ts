import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { DataLoggerTypesDataModel } from '@core/models/UIModels/dataLoggerTypes.model';
import { GatewayPanelBase } from '@comp/GatewayPanelBase.component';
import { ValidationService } from '@core/services/validation.service';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { CustomDataLoggerConfiguration, CustomDataLoggerDataPointUIModel } from '@core/models/webModels/DataLogger.model';
import { DATA_LOGGER_TYPE, UICommon } from '@core/data/UICommon';
import { DataLoggerFacade } from '@core/facade/dataLoggerFacade.service';
import { DataSourceFacade } from '@core/facade/dataSourceFacade.service';
import { ToolConnectionUIModel } from '@core/models/UIModels/tool-connection.model';
import * as LOGGER_ACTIONS from '@store/actions/dataLogger.entity.action';
import { DataLoggerUIModel } from '@core/models/UIModels/dataLogger.model';
import * as _ from 'lodash';
import { SurefloFacade } from '@core/facade/surefloFacade.service';
import { LoggerDataPointsDialogComponent } from '../logger-data-points-dialog/logger-data-points-dialog.component';
import { ButtonActions } from '@shared/gateway-dialogs/components/gateway-advanced-dialog/gateway-advanced-dialog.component';
import { GatewayModalService } from '@shared/gateway-dialogs/services/gatewayModal.service';
import { PanelConfigurationFacade } from '@core/facade/panelConfigFacade.service';
import { Router } from '@angular/router';
import { dataLoggerSchema } from '@core/models/schemaModels/DataLoggerUIModel.schema';
import { DeviceDataPointsFacade } from '@core/facade/deviceDataPointsFacade.service';
import { String } from 'typescript-string-operations';
import { SureSENSToolType, SureSENS_ESP_Type } from '@core/models/webModels/SureSENSGaugeData.model';

@Component({
  selector: 'app-add-edit-data-logger-dialog',
  templateUrl: './add-edit-data-logger-dialog.component.html',
  styleUrls: ['./add-edit-data-logger-dialog.component.scss']
})
export class AddEditDataLoggerDialogComponent extends GatewayPanelBase implements OnInit, OnDestroy {
  loggerTypes: DataLoggerTypesDataModel[] = [];
  toolConnections: ToolConnectionUIModel[] = [];
  scanRates = UICommon.LOGGER_LOGGING_RATES;
  isIFieldLoggerType = false;
  nameValidationMessage = "";
  loggerForm: FormGroup;
  isFormValid: boolean = false;
  isNoToolConnections: boolean = false;
  selectedWellName: string = "";
  dataLoggers: CustomDataLoggerConfiguration[];
  panelName: string;

  private arrSubscriptions: Subscription[] = [];
  private inputLabelMap = new Map();

  dataLoggerData: CustomDataLoggerConfiguration = { Id: null, DataLoggerType: DATA_LOGGER_TYPE.Custom, IsDeleted: 0, Name: "", ScanRate: -1, WellId: -1, customDataLoggerDataPoints: [] };

  constructor(protected store: Store,
    private panelConfigFacade: PanelConfigurationFacade,
    public dialogRef: MatDialogRef<any>,
    private dataSourceFacade: DataSourceFacade,
    dataLoggerFacade: DataLoggerFacade,
    dataPointsFacade: DeviceDataPointsFacade,
    surefloFacade: SurefloFacade,
    private router: Router,
    private validationService: ValidationService, private gatewayModalService: GatewayModalService) {
    super(store, panelConfigFacade, null, dataSourceFacade, null, dataPointsFacade, null, surefloFacade, dataLoggerFacade);
  }


  loggerTypeChange(event) {
    this.isIFieldLoggerType = event.value === DATA_LOGGER_TYPE.Saudi_Aramco_iField;
    if (this.isIFieldLoggerType) {
      this.dataLoggerData.ScanRate = -1;
    } else {
      this.onCustomSelected();
    }
    this.validateControl(event.id);
    // To invoke validation for Name field
    this.setName();
  }

  onCustomSelected() {
    this.dataLoggerData.WellId = -1;
    this.dataLoggerData.ScanRate = 1;
  }

  onWellSelChange(event) {
    if (event && event.value)
      this.setSelectedWellName(event.value);
    this.validateControl(event.id);
    // To invoke validation for Name field
    this.setName();
  }

  setName() {
    this.loggerForm.get("Name").setValue(this.dataLoggerData.Name);
  }

  onScanRateChange(event) {
    this.validateControl(event.id);
  }
  setSelectedWellName(wellId) {
    this.selectedWellName = this.toolConnections.find(toolConnection => toolConnection.WellId === wellId)?.WellName;
  }
  validateForm(event) {
    this.validateControl(event.currentTarget.id);
  }

  validateControl(id) {
    let ctrl = this.loggerForm.get(id);
    if (id === "Name") {
      if (ctrl && ctrl.errors) {
        this.nameValidationMessage = this.validationService.getValidationErrorMessage(ctrl.errors, this.inputLabelMap.get(id));
      } else {
        this.nameValidationMessage = "";
      }
    }

    if (this.dataLoggerData.DataLoggerType === DATA_LOGGER_TYPE.Saudi_Aramco_iField) {
      this.isFormValid = this.dataLoggerData.WellId >= 0;
    } else if (this.dataLoggerData.DataLoggerType === DATA_LOGGER_TYPE.Custom) {
      this.isFormValid = this.dataLoggerData.ScanRate >= 0;
    } else {
      this.isFormValid = this.nameValidationMessage === "";
    }
  }

  private createFormGroup(): void {
    this.loggerForm = new FormGroup({});
    for (const property in dataLoggerSchema.properties) {
      let formControl = new FormControl('');
      let validationFn: ValidatorFn[] = [];
      if (dataLoggerSchema.required.includes(property))
        validationFn.push(Validators.required);

      if (dataLoggerSchema.properties.hasOwnProperty(property)) {
        let prop = dataLoggerSchema.properties[property];
        if (prop.minLength !== undefined)
          validationFn.push(Validators.minLength(prop.minLength));

        if (prop.maxLength !== undefined)
          validationFn.push(Validators.maxLength(prop.maxLength));

        if (prop.pattern !== undefined)
          validationFn.push(Validators.pattern(prop.pattern));
      }
      if (property === 'Name') {
        validationFn.push(this.LoggerNameValidator(this.dataLoggerData?.Id));
      }
      formControl.setValidators(validationFn);
      this.loggerForm.addControl(property, formControl);
    }
  }

  private initInputLabelMap(): void {
    let loggerSchema = dataLoggerSchema;
    if (
      loggerSchema !== undefined &&
      loggerSchema !== null &&
      loggerSchema.properties !== undefined &&
      loggerSchema.properties !== null) {
      for (const property in loggerSchema.properties) {
        if (loggerSchema.properties.hasOwnProperty(property)) {
          const prop = loggerSchema.properties[property];
          if (prop.title !== undefined) {
            this.inputLabelMap.set(property, prop.title);
          }
        }
      }
    }
  }

  // Custom Form Validation functions
  private LoggerNameValidator(loggerId: number): ValidatorFn {
    return (c: AbstractControl): { [key: string]: any } | null => {
      if (c.value === undefined || c.value == null || c.value == '')
        return null;

      if (this.nameValidationMessage = 'Logger with same name already exists.') {
        this.nameValidationMessage = "";
      }

      if (!this.isValidLoggerName(loggerId, c.value)) {
        this.nameValidationMessage = 'Logger with same name already exists.';
        return { customError: this.nameValidationMessage };
      }

      return null;
    };
  }

  isValidLoggerName(loggerId: number, loggerName: string): boolean {
    let bIsValid = true;
    if (this.dataLoggers && this.dataLoggers.length > 0) {
      bIsValid = this.dataLoggers.findIndex(logger => logger.Id !== loggerId && logger.Name.trim().replace( /\s/g, '').toLowerCase() === loggerName.trim().replace( /\s/g, '').toLowerCase()) !== -1 ? false : true;
    }

    if (bIsValid && this.surefloEnity && this.surefloEnity.length > 0) {
      bIsValid = this.surefloEnity.findIndex(sureflo => sureflo.WellId === this.dataLoggerData.WellId && sureflo.DeviceName.trim().toLowerCase() === loggerName.trim().toLowerCase()) !== -1 ? false : true;
    }
    return bIsValid;
  }

  public postCallDeviceDataPoints(): void {

  }

  postCallGetToolConnections(): void {
    this.isNoToolConnections = !this.toolConnectionEntity || this.toolConnectionEntity?.length === 0;
    if (this.isNoToolConnections) {
      this.dataLoggerData.DataLoggerType = DATA_LOGGER_TYPE.Custom;
      this.onCustomSelected();
    } else {
      this.toolConnectionEntity.forEach(toolConnection => {
        if (toolConnection.WellId > 0) {
          let toolGauge = this.dataSourceFacade.getToolGauge(toolConnection.ChannelId, toolConnection.CardDeviceId, toolConnection.DeviceId);
          let isESPtool = this.dataSourceFacade.isESPTool(toolGauge);
          if (!isESPtool) {
            const tools = this.toolConnections.find(tool => tool.WellId === toolConnection.WellId);
            if (!tools) {
              const logger = this.dataLoggers.find(dataLogger => dataLogger.WellId === toolConnection.WellId && dataLogger.IsDeleted === 0);
              if (!logger) {
                this.toolConnections.push(toolConnection);
              }
            }
          }
        }
      })

    }
  }

  postCallGetDataLoggers(): void {
    this.dataLoggers = this.dataLoggerEntity;
    if (this.dataLoggerData?.Id === null || this.dataLoggerData?.Id === undefined) {
      const newId = this.dataLoggers.length + 1;
      this.dataLoggerData.Id = -newId;
    }
    this.createFormGroup();
    this.initInputLabelMap();
    this.initToolConnections();
  }

  postCallGetLoggerTypes(): void {
    this.loggerTypes = this.loggerTypesEntity;
    if (this.dataLoggerData && this.dataLoggerData.DataLoggerType) {
      this.dataLoggerData.DataLoggerType = DATA_LOGGER_TYPE.Custom;
      this.onCustomSelected();
    }
  }

  postCallGetPanelConfigurationCommon(): void {
    let panelConfigurationCommon = this.panelConfigurationCommonState.panelConfigurationCommon;
    let panelInfo = UICommon.getPanelType(panelConfigurationCommon.PanelTypeId, true);
    this.panelName = panelConfigurationCommon.PanelTypeId > 0 ? panelInfo.name : null;
  }

  private fillSaudiAramcoDataPoints(): CustomDataLoggerDataPointUIModel[] {
    let dataPointsToAdd: CustomDataLoggerDataPointUIModel[] = [];
    let tools = this.toolConnectionEntity.filter(t => t.WellId === this.dataLoggerData.WellId) ?? [];
    if (tools && tools.length > 0) {
      tools.forEach(tool => {
        let isDataPointsAdded = false;
        let dataPoints = this.datapointdefinitions.filter(d => d.DeviceId === tool.DeviceId) ?? [];
        dataPoints.forEach(dtPoint => {
          if (dtPoint.TagName === "Pressure" || dtPoint.TagName === "Temperature") {
            dataPointsToAdd.push({
              DataPointIndex: dtPoint.DataPointIndex,
              DeviceId: dtPoint.DeviceId,
              Id: -1,
              IdDataLogger: this.dataLoggerData.Id,
              Precision: 4,
              TagName: String.Format("{0}_{1}_{2}_{3}", tool.ChannelName, tool.CardDeviceName, tool.DeviceName, dtPoint.TagName),
              UnitQuantityType: dtPoint.UnitQuantityType,
              UnitSymbol: dtPoint.UnitSymbol
            });
            isDataPointsAdded = true;
          }
        });
      });
    }
    return dataPointsToAdd;
  }

  postCallGetFlowMeters(): void {
  }

  OnCancel(): void {
    this.dialogRef.close();
  }

  OnSubmit() {
    let dataLoggerToAdd: DataLoggerUIModel = _.cloneDeep(this.dataLoggerData);
    if (dataLoggerToAdd.DataLoggerType === DATA_LOGGER_TYPE.Saudi_Aramco_iField) {
      // const newId = this.dataLoggers.length + 1;
      // dataLoggerToAdd.Id = -newId;
      dataLoggerToAdd.IsDirty = true;
      dataLoggerToAdd.IsValid = true;
      dataLoggerToAdd.customDataLoggerDataPoints = this.fillSaudiAramcoDataPoints();
      const logger = { dataLogger: dataLoggerToAdd }
      this.store.dispatch(LOGGER_ACTIONS.DATALOGGER_ADD(logger));
      this.dialogRef.close(true);
    } else {
      const logger = { dataLogger: dataLoggerToAdd };
      this.dialogRef.close();
      this.showLoggerDataPointDialog(logger);
    }
  }

  showLoggerDataPointDialog(dialogData) {
    this.gatewayModalService.openAdvancedDialog(
      dialogData.dataLogger.Name,
      ButtonActions.None,
      LoggerDataPointsDialogComponent,
      dialogData,
      (result) => {
        if (result) {
          this.router.navigate([`/${this.panelName}/datalogger/` + dialogData.dataLogger.Id]);
        }
      },
      "980px",
      null,
      null,
      null
    );
  }

  ngOnDestroy(): void {
    if (this.arrSubscriptions != null && this.arrSubscriptions.length > 0) {
      this.arrSubscriptions.forEach((subscription) => {
        if (subscription != null) {
          subscription.unsubscribe();
          subscription = null;
        }
      });
    }
    super.ngOnDestroy();
  }

  ngOnInit(): void {
    this.initPanelConfigurationCommon();
    this.initFlowMeters();
    this.initDeviceDataPoints();
    this.initDataLoggers();
    this.initLoggerTypes();
    this.createFormGroup();
    this.initInputLabelMap();
  }
}