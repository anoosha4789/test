import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RegisterTableType } from '@core/models/UIModels/modbusTemplate.model';
import { DataPointValueDataType } from '@core/models/webModels/DataPointDefinition.model';
import { DataPointModbusRegisterConfigurationModel } from '@core/models/webModels/DataPointModbusRegisterConfiguration.model';
import { GatewayCheckedFlatNode } from '@shared/gateway-treeview/components/gateway-checked-treeview/gateway-checked-treeview.component';
import { ModbusDataPointsService } from '@shared/publishing/services/modbus-data-points.service';

@Component({
  selector: 'gw-add-datapoints-to-custom-map',
  templateUrl: './add-datapoints-to-custom-map.component.html',
  styleUrls: ['./add-datapoints-to-custom-map.component.scss']
})
export class AddDatapointsToCustomMapComponent implements OnInit {

  dataPointDataTypes = DataPointValueDataType;
  arrDataPointDataTypes = null;
  selectedDataType = DataPointValueDataType.Float32Bit;
  startAddress: number;
  endAddress: number;
  bInValidAddress: boolean = false;

  addDataPointForm: FormGroup;
  validateStartAddresMssg: string = null;
  validateEndAddresMssg: string = null;

  private startRecordAddress: number;
  private endRecordAddress: number;

  constructor(public dialogRef: MatDialogRef<AddDatapointsToCustomMapComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AddSlaveDataPointsData,
    private modbusPointService: ModbusDataPointsService) {
  }

  OnSelectedDataTypeChange() {
    this.claculateRegisterAddress();
    this.validateStartAddress();
  }
  
  OnCancel(): void {
    this.dialogRef.close();
  }

  OnOk() {
    let selectedDataPoints: SlaveDataPointsRange = {
      startAddress: this.modbusPointService.getRegisterAddressFromFormat(this.startAddress, this.data.registerTableType),
      endAddress: this.modbusPointService.getRegisterAddressFromFormat(this.endAddress, this.data.registerTableType),
      dataType: this.selectedDataType
    }
    this.dialogRef.close(selectedDataPoints);
  }

  private validateAddressRange(address: number): string {
    let errMssg = null;
    if (address === undefined || address == null) {
      return "Integer Value required.";
    }

    switch(this.data.registerTableType) {
      case RegisterTableType.HoldingRegisters:
        if (address < 40000 || address > 49999)
          errMssg = "Valid register range is 40000 to 49999.";
        break;

      case RegisterTableType.InputRegisters:
        if (address < 30000 || address > 39999)
        errMssg = "Valid register range is 30000 to 39999.";
        break;

      case RegisterTableType.InputDiscretes:
        if (address < 10000 || address > 19999)
        errMssg = "Valid register range is 10000 to 19999.";
        break;

      case RegisterTableType.CoilDiscretes:
        if (address < 0 || address > 9999)
        errMssg = "Valid register range is 0000 to 9999.";
        break;
    }
    return errMssg;
  }

  validateStartAddress() {
   
    this.validateStartAddresMssg = this.validateAddressRange(this.startAddress);

    if (this.validateStartAddresMssg == null) {
      let noOfBytes = this.modbusPointService.getNoOfBysteUsed(this.selectedDataType);
      let addressValue = this.modbusPointService.getRegisterAddressFromFormat(this.startAddress, this.data.registerTableType);
      let endAddressValue = addressValue + (noOfBytes * this.data.noOfDataPoints) -1;
      // Validate start addresss
      let prevDataPoints = this.data.DataPoints.filter(d => d.StartRegisterAddress <= addressValue)??[];
      if (prevDataPoints.length > 0) {
        let nInx = prevDataPoints.length - 1;
        let nOfBytesUsed = this.modbusPointService.getNoOfBysteUsed(prevDataPoints[nInx].SlaveDataType);
        let registerAddress = prevDataPoints[nInx].StartRegisterAddress;
        let registerEndAddress = registerAddress + nOfBytesUsed;
        if (addressValue >= registerAddress && addressValue < registerEndAddress) {
          this.validateStartAddresMssg = `Register ${this.startAddress} already in use.`;
          this.updateError(true);
          return;
        }
      }

      let nIndex = this.data.DataPoints.findIndex(d => d.StartRegisterAddress >= addressValue && d.StartRegisterAddress < endAddressValue) ?? -1;
      if (nIndex != -1) {
        this.validateStartAddresMssg = `Register ${this.startAddress} already in use.`;
        this.updateError(true);
        return;
      }

      this.startAddress = this.modbusPointService.formatRegisterValue(addressValue, this.data.registerTableType);
      this.endAddress = this.modbusPointService.formatRegisterValue(endAddressValue, this.data.registerTableType);
    }
    this.validateEndAddress();
    this.bInValidAddress = (this.validateStartAddresMssg != null || this.validateEndAddresMssg != null) ? true : false;
    this.updateError(this.bInValidAddress);
  }

  private updateError(hasError: boolean) { 
    if (hasError) {
      if(this.validateStartAddresMssg != null ){
        let ctrl = this.addDataPointForm.controls['StartAddress'];
         ctrl.markAllAsTouched();
         ctrl.setErrors({"invalid": true});
      }
    }
  }

  validateEndAddress() {
    this.validateEndAddresMssg = this.validateAddressRange(this.endAddress);
    let noOfBytes = this.modbusPointService.getNoOfBysteUsed(this.selectedDataType);
    let addressValue = this.modbusPointService.getRegisterAddressFromFormat(this.endAddress, this.data.registerTableType);
    let endAddressValue = addressValue + noOfBytes * this.data.noOfDataPoints;
    if (this.validateEndAddresMssg == null) {
      //  if (addressValue < this.startRecordAddress) {
      //    this.validateEndAddresMssg = `Register ${this.endAddress} already in use.`;
      //  }
    
    let nIndex = this.data.DataPoints.findIndex(d => d.StartRegisterAddress >= addressValue && d.StartRegisterAddress < endAddressValue) ?? -1;
    if (nIndex != -1) {
      this.validateEndAddresMssg = `Register ${this.endAddress} already in use.`;
      //this.updateError(true);
      return;
    }
  }
    this.bInValidAddress = (this.validateStartAddresMssg != null || this.validateEndAddresMssg != null) ? true : false;
  }

  private claculateRegisterAddress() {
    this.startAddress = this.modbusPointService.formatRegisterValue(this.data.startAddress, this.data.registerTableType);
    this.startRecordAddress = this.data.startAddress;
    this.endRecordAddress = this.data.startAddress + (this.modbusPointService.getNoOfBysteUsed(this.selectedDataType) * this.data.noOfDataPoints)-1;
    this.endAddress = this.modbusPointService.formatRegisterValue(this.endRecordAddress, this.data.registerTableType);
  }

  ngOnInit(): void {
    this.addDataPointForm = new FormGroup({
      StartAddress: new FormControl(''),
    });
    if (this.data !== undefined && this.data !== null) {
      this.arrDataPointDataTypes = [];
      this.arrDataPointDataTypes = this.modbusPointService.getDataTypesBasedOnRegisterTableType(this.data.registerTableType);
      this.selectedDataType = (this.data.registerTableType == RegisterTableType.HoldingRegisters || 
        this.data.registerTableType == RegisterTableType.InputRegisters) ? DataPointValueDataType.Float32Bit : DataPointValueDataType.Boolean;
      this.claculateRegisterAddress();
    }
    this.validateStartAddress();
  }

}

export class AddSlaveDataPointsData {
  startAddress: number;
  DataPoints: DataPointModbusRegisterConfigurationModel[];
  registerTableType: RegisterTableType;
  noOfDataPoints: number;
}

export class SlaveDataPointsRange {
  startAddress: number;
  endAddress: number;
  dataType: DataPointValueDataType;
}
