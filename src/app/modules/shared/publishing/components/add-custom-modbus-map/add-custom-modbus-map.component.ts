import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { GatewayPanelBase } from '@comp/GatewayPanelBase.component';
import { PublishingChannelFacade } from '@core/facade/publishingChannelFacade.service';
import { RegisteredModbusMap } from '@core/models/UIModels/RegisteredModbusMap.model';
import { ValidationService } from '@core/services/validation.service';
import { Store } from '@ngrx/store';
import { ModbusDataPointsService, modbusMapNameSchema } from '@shared/publishing/services/modbus-data-points.service';
import { UICommon } from '@core/data/UICommon';
import { RegisteredModbusMapTypeEnum } from '@core/models/UIModels/modbusTemplate.model';

@Component({
  selector: 'gw-add-custom-modbus-map',
  templateUrl: './add-custom-modbus-map.component.html',
  styleUrls: ['./add-custom-modbus-map.component.scss']
})
export class AddCustomModbusMapComponent extends GatewayPanelBase implements OnInit, OnDestroy {

  mapTemplateList: RegisteredModbusMap[];
  mapName: string;
  selectedModBusMapId: number;
  selectedMapName: string;
  bIsValidMap: boolean = false;

  mapTemplateForm: FormGroup;
  validationMessage: string = null;
  
  customMapId = UICommon.CUSTOMMAP_ID;
  diagnosticMapId = UICommon.DIAGNOSTICMAP_ID;
  mapTypeId:number = RegisteredModbusMapTypeEnum.Custom;
  constructor(protected store: Store, 
    public dialogRef: MatDialogRef<any>, 
    private modbusPointService: ModbusDataPointsService,
    private publishingFacade: PublishingChannelFacade,
    private validationService: ValidationService) {
    super(store, null, null, null, publishingFacade, null, null);
  }

  validateCustomMap() {
    this.mapTemplateForm.markAllAsTouched();
    this.validationMessage = null;
    let ctrl = this.mapTemplateForm.controls['MapName'];
    if (ctrl != null) {
      this.validationMessage = null;
      this.validationMessage = this.validationService.getValidationErrorMessage(ctrl.errors, 'Map Name');
      this.bIsValidMap = this.validationMessage  == null ? true : false;
      if (!this.bIsValidMap)
        return;
    }
  }

  onMapTemplateChange(event) {
    let indexMap = this.mapTemplateList.findIndex(map => map.Id === event.value)??-1;
    this.selectedMapName = indexMap !== -1 ? this.mapTemplateList[indexMap].MapName : "";
    this.mapTypeId = indexMap !== -1 ?  
    this.mapTemplateList[indexMap].MapTypeId == 1 ? RegisteredModbusMapTypeEnum.Custom: this.mapTemplateList[indexMap].MapTypeId : 
    event.value == -1 ? RegisteredModbusMapTypeEnum.Custom: RegisteredModbusMapTypeEnum.Diagnostic;
  }

  OnCancel(): void {
    this.dialogRef.close();
  }

  OnOk() {
    this.dialogRef.close({mapName: this.mapName, modbusMapId: this.selectedModBusMapId, mapTypeId: this.mapTypeId });
  }

  postCallGetModbusTemplateDetails() {
    this.mapTemplateList = this.modbusTemplateDetails;
    this.selectedModBusMapId = -1;
    //this.selectedMapName = this.modbusTemplateDetails[0].MapName;
    this.createFormGroup();
  }

  private createFormGroup(): void {
    this.mapTemplateForm = new FormGroup({});
    for (const property in modbusMapNameSchema.properties) {
      let formControl = new FormControl('');
      let validationFn: ValidatorFn[] = [];
      if (modbusMapNameSchema.required.includes(property))
        validationFn.push(Validators.required);

      if (modbusMapNameSchema.properties.hasOwnProperty(property)) {
        let prop = modbusMapNameSchema.properties[property];
        if (prop.minLength !== undefined)
          validationFn.push(Validators.minLength(prop.minLength));

        if (prop.maxLength !== undefined)
          validationFn.push(Validators.maxLength(prop.maxLength));

        if (prop.pattern !== undefined)
          validationFn.push(Validators.pattern(prop.pattern));

        if (property === 'MapName')
          validationFn.push(this.modbusPointService.mapNameValidator(-1, this.mapName, this.mapTemplateList));
      }
      formControl.setValidators(validationFn); 
      this.mapTemplateForm.addControl(property, formControl);
    }
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.initModbusMapTemplateDetails();
  }
}
