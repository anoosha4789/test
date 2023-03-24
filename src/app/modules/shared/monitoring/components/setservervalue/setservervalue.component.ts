import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UICommon } from '@core/data/UICommon';
import { DataPointDefinitionModel, DataPointValueDataType } from '@core/models/webModels/DataPointDefinition.model';
import { WriteToServerDataModel } from '@core/models/webModels/WriteToServerData.model';
import { ConfigurationService } from '@core/services/configurationService.service';
import { String } from 'typescript-string-operations';

@Component({
  selector: 'gw-setservervalue',
  templateUrl: './setservervalue.component.html',
  styleUrls: ['./setservervalue.component.scss']
})
export class SetServerValueComponent implements OnInit {

  deviceDataPoint: DataPointDefinitionModel;
  label: string;
  currentValue: string;
  newValue: number;
  minValue: number;
  maxValue: number;
  precision: number;
  dataType: ServerDataType;

  newValueFormControl: FormControl;
  bIsValid: boolean = true;
  errMessage: string = null;
  warning: string = null;
  isInteger: boolean = false;
  constructor(public dialogRef: MatDialogRef<SetServerValueComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SetServerComponentData,
    private configurationService: ConfigurationService) { }

  public WriteDataPoint(): void {
    let writtenValue = 0;
    if (this.deviceDataPoint.DataType === DataPointValueDataType.Boolean) {
      if (this.newValue === 0)
        writtenValue = 1;
    }
    else
      writtenValue = this.newValue;

    const writeVar = new WriteToServerDataModel();
    writeVar.DeviceId = this.deviceDataPoint.DeviceId;
    writeVar.PointIndex = this.deviceDataPoint.DataPointIndex;
    writeVar.PointName = this.deviceDataPoint.TagName;
    writeVar.Value = this.data.multiplicationFactor ? (writtenValue*this.data.multiplicationFactor) : writtenValue;
    writeVar.WriteToServerCommandEnum = 1;
    writeVar.Unit = this.deviceDataPoint.UnitSymbol;
    this.configurationService.WriteToServer(writeVar).subscribe((d) => {});
  }

  validateDataValue() {
    this.errMessage = null;
    this.bIsValid = true;

    if (this.newValue === undefined || this.newValue == null) {
      this.newValueFormControl.markAllAsTouched();
      this.errMessage = 'Required field.';
      this.bIsValid = false;
      this.newValueFormControl.setErrors({"invalid": true});
      return;
    }

    if (this.newValue < this.minValue || this.newValue > this.maxValue) {
      this.newValueFormControl.markAllAsTouched();
      this.errMessage = (this.data.min && this.data.max) ? String.Format("Min = {0}, Max = {1}.", this.minValue, this.maxValue) : "Invalid Entry";
      this.bIsValid = false;
      this.newValueFormControl.setErrors({"invalid": true});
      return;
    }
  }

  incrementValue(): void {
   
    if (!isNaN(this.newValue) && this.newValue < this.maxValue){
      this.newValue++;
      this.newValue = parseFloat(this.newValue.toFixed(1));
    }
      

    this.validateDataValue();
  }

  decrementValue(): void {
    if (this.newValue >  this.minValue)
    {
      this.newValue--;
      this.newValue = parseFloat(this.newValue.toFixed(1));
    }
      
    
    this.validateDataValue();
  }

  OnCancel(): void {
    this.dialogRef.close();
  }
  
  OnOk() {
    this.WriteDataPoint();
    this.dialogRef.close(true);
  }

  setCurrentValue() {
    if (this.deviceDataPoint) {
      switch(this.dataType) {
        case ServerDataType.NUMERIC:
          if (this.deviceDataPoint.DataType == DataPointValueDataType.Float32Bit || this.deviceDataPoint.DataType == DataPointValueDataType.Double64Bit)
            this.currentValue = this.deviceDataPoint.RawValue.toFixed(this.precision);
          else
            this.currentValue = this.deviceDataPoint.RawValue.toString();
          break;

        case ServerDataType.SELECT:
          this.currentValue = this.deviceDataPoint.RawValue.toString();
          break;

        case ServerDataType.BOOLEAN:
          break;

        default:
          this.currentValue = this.deviceDataPoint.RawValue.toString();
          break;
      }
    }
  }

  private setNewValue() {
    if (this.deviceDataPoint) {
      switch(this.dataType) {
         case ServerDataType.NUMERIC:
          if (this.deviceDataPoint.DataType == DataPointValueDataType.Float32Bit || this.deviceDataPoint.DataType == DataPointValueDataType.Double64Bit)
            this.newValue = UICommon.getValuewithPrecision(this.deviceDataPoint.RawValue, this.precision);
          else
            this.newValue = this.deviceDataPoint.RawValue;
          break;

        case ServerDataType.SELECT:
          this.newValue = this.deviceDataPoint.RawValue;
          break;

        case ServerDataType.BOOLEAN:
          break;

        default:
          this.newValue = this.deviceDataPoint.RawValue;
          break;
      }
    }
  }

  ngOnInit(): void {
    if (this.data !== undefined && this.data !== null) {
      this.label = this.data.fieldName;
      this.deviceDataPoint = this.data.device;
      this.isInteger =this.data.serverDataType == ServerDataType.INTEGER  ? true : false;
      this.dataType = (this.data.serverDataType == ServerDataType.INTEGER || this.data.serverDataType==undefined)?ServerDataType.NUMERIC:this.data.serverDataType;
      this.minValue = this.data.min??0;
      this.maxValue = this.data.max??Number.MAX_VALUE;
      this.precision = this.data.precision??0;
      this.warning = this.data.warning;
      this.setCurrentValue(); // Set current value
      this.setNewValue();
    }
    this.newValueFormControl = new FormControl('', [Validators.required]);
  }

}

export class SetServerComponentData {
  fieldName: string;
  min?: number;
  max?: number;
  precision: number;
  serverDataType?: ServerDataType;
  selectValues?: ServerDataSelectValues[];
  device: DataPointDefinitionModel;
  warning?: string;
  multiplicationFactor?:number = undefined;
}

export enum ServerDataType {
  NUMERIC = 0,
  BOOLEAN,
  SELECT,
  INTEGER
}

export class ServerDataSelectValues {
  key: number;
  value: string;
}
