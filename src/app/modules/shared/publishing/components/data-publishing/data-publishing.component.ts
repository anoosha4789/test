import { Component, OnInit, ViewEncapsulation, Input, OnChanges, Output, EventEmitter, OnDestroy, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ValidatorFn, Validators, FormBuilder, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';

import { publishingDataModelSchema } from '@core/models/schemaModels/PublishingDataUIModel.schema';
import { modbusConfigurationSchema } from '@core/models/schemaModels/ModbusConfigurationUIModel.schema';
import { ModbusProtocolModel } from '@core/models/UIModels/ModbusProtocol.model';
import { PublishingDataUIModel } from '@core/models/UIModels/dataPublishing.model';
import { GatewayPanelBase, IPublishingBase } from '@comp/GatewayPanelBase.component';
import { Store } from '@ngrx/store';
import { SerialPortSettingsModel } from '@core/models/webModels/SerialPortSettings.model';
import { SerialChannelProperty } from '@core/models/UIModels/SerialChannel.model';
import { CommunicationChannelType, UICommon } from '@core/data/UICommon';
import { Observable, Subscription } from 'rxjs';
import { ISerialChannelPropertiesState } from '@store/state/serialChannelProperties.state';
import { StateUtilities } from '@store/state/IState';
import * as ACTIONS from '@store/actions/serialChannelProperties.action';
import { SlaveSettingsProperty } from '@core/models/UIModels/SlaveSettings.model';
import { UtilityService } from '@core/services/utility.service';
import { filter } from 'rxjs/operators';
import { SerialPortCommunicationChannelDataUIModel } from '@core/models/webModels/SerialPortCommunicationChannelDataUIModel.model';
import { TcpIpCommunicationChannelDataUIModel } from '@core/models/webModels/TcpIpCommunicationChannelDataUIModel.model';
import { ValidationService } from '@core/services/validation.service';
import { RangeValidator } from '@core/customValidators/rangeValidator.validator';
import { ModbusMapTemplateUIModel } from '@core/models/UIModels/modbusTemplate.model';
import { PublishingChannelFacade } from '@core/facade/publishingChannelFacade.service';
import { PublishingErrorNotifierModel } from '@core/models/UIModels/error-notifier-model';
import { PanelConfigurationFacade } from '@core/facade/panelConfigFacade.service';
import { ButtonActions } from '@shared/gateway-dialogs/components/gateway-advanced-dialog/gateway-advanced-dialog.component';
import { AddCustomModbusMapComponent } from '../add-custom-modbus-map/add-custom-modbus-map.component';
import { ModbusPointsDisplayType } from '../modbus-template-points/modbus-template-points.component';
import { GatewayModalService } from '@shared/gateway-dialogs/services/gatewayModal.service';
import { RegisteredModbusMap } from '@core/models/UIModels/RegisteredModbusMap.model';
import { CustomMapsComponent } from '../custom-maps/custom-maps.component';
import { MatSelect } from '@angular/material/select';

@Component({
  selector: 'gw-data-publishing',
  templateUrl: './data-publishing.component.html',
  styleUrls: ['./data-publishing.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DataPublishingComponent extends GatewayPanelBase implements OnInit, OnDestroy, OnChanges, IPublishingBase {
  @ViewChild('RegisteredModbusMapId')
  RegisteredModbusMapId: MatSelect;

  @Input()
  publishing: PublishingDataUIModel;

  @Output()
  isFormValidEvent = new EventEmitter();

  @Output()
  publishingFormInvalidEvent = new EventEmitter();

  @Output()
  publishingChangedEvent = new EventEmitter();

  @Output()
  publishingUpdatedEvent = new EventEmitter();

  @Output()
  showCustomMapDialogEvent = new EventEmitter();

  dataPublishingForm: FormGroup;
  private inputLabelMap = new Map();
  serialChannel: SerialPortCommunicationChannelDataUIModel;
  tcpChannel: TcpIpCommunicationChannelDataUIModel;
  selectedProtocolId: number = 0;

  isFormValid = false;
  isNewPublishing = true;
  systemIpAddress: string = "";
  selectedComPort: string;
  private maxSlaveId = 255;
  serialCannelProperties$: Observable<ISerialChannelPropertiesState>;
  serialChannelProperty: SerialChannelProperty;
  slaveSettingsProperty: SlaveSettingsProperty;
  serialPorts: SerialPortSettingsModel[] = [];
  private arrSubscriptions: Subscription[] = [];
  protocolList: ModbusProtocolModel[];
  mapTemplateList: ModbusMapTemplateUIModel[];
  serialChannelSchema: any;
  tcpChannelSchema: any;
  panelTypeId: number;
  publishingName: string;
  portNumber: number;
  publishingErrorsList: PublishingErrorNotifierModel[] = [];
  selectedMapName: string;
  // Validations
  ipAddressValidationMsg: string = null;
  ipPortValidationMsg: string = null;
  slaveIdValidationMsg: string = null;
  noSerialPortsAvailableMsg: string = null;

  displayType: ModbusPointsDisplayType = ModbusPointsDisplayType.DefaultMap;
  isNewMap: boolean = false;
  isImportConfig: boolean = false;

  constructor(protected store: Store<{ serialChannelPropertiesState: ISerialChannelPropertiesState }>,
    private fb: FormBuilder,
    private router: Router,
    private utilityService: UtilityService,
    private validationService: ValidationService,
    private gwModalService: GatewayModalService,
    private panelConfigFacade: PanelConfigurationFacade,
    private publishingFacade: PublishingChannelFacade) {
    super(store, panelConfigFacade, null, null, publishingFacade, null, null);
    this.serialCannelProperties$ = this.store.select<any>((state: any) => state.serialChannelPropertiesState);
    this.dataPublishingForm = this.fb.group(
      {
        Channel: this.fb.group({}),
        ModbusConfiguration: this.fb.group({})
      },
    );
  }

  modelValue(value: number): string {
    return value.toString();
  }

  onProtocolSelectChange(event) {
    this.clearValidtions();
    this.publishing.Channel.Protocol = event.value;
    if (event.value === 0) {
      const publishingId = this.getPublishingId();
      this.publishing = this.publishingFacade.getNewDataPublishing(this.panelTypeId, publishingId, 0, event.value);
      //this.publishing.RegisteredModbusMapId = this.panelConfigurationCommonState.panelConfigurationCommon.PanelTypeId === PanelTypeList.SURESENS ? 1 : 5;
      this.createFormGroup();
    } else {
      const publishingId = this.getPublishingId();
      this.publishing = this.publishingFacade.getNewDataPublishing(this.panelTypeId, publishingId, 1, event.value);
      //this.publishing.RegisteredModbusMapId = this.panelConfigurationCommonState.panelConfigurationCommon.PanelTypeId === PanelTypeList.SURESENS ? 1 : 5;
      this.createFormGroup();
    }
    this.loadChannel();
    this.subscribeSerialSettings();
  }

  getPublishingId() {
    return this.publishing && this.publishing ?
      (this.publishing.Id < 0 ? Math.abs(this.publishing.Id) :
        this.publishing.Id) : 1;
  }

  onSelectChange(event) {

    // console.log(event.value, event.source.ngControl.name);

    switch (event.source.ngControl.name) {
      case 'ComPort':
        this.selectedComPort = event.value;
        this.serialChannel.ComPort = parseInt(event.value, 10);
        const port = this.serialPorts.find(p => p.Name === event.value);
        if (port) {
          this.serialChannel.PortNamePath = port.Path;
          this.serialChannel.Description = port.Description;
        } else {
          this.serialChannel.PortNamePath = `COM${event.value}`;
        }
        break;

      case 'BaudRate':
        this.serialChannel.BaudRate = event.value.toString().trim();
        break;

      case 'DataBits':
        this.serialChannel.DataBits = Number(event.value.toString().trim());
        break;

      case 'Parity':
        break;

      case 'StopBits':
        this.serialChannel.StopBits = Number(event.value.toString().trim());
        break;

      case 'RegisteredModbusMapId':
        const mapName = this.mapTemplateList.find(map => map.Id === event.value).MapName;
        this.selectedMapName = mapName;
        this.publishing.MapType = mapName;
        break;
    }
    this.publishingUpdatedEvent.emit(this.publishing);
  }

  private isValidForm() {
    this.dataPublishingForm.statusChanges
      .pipe(filter(() => this.dataPublishingForm.valid)).subscribe((val) => {
        if (!this.ipAddressValidationMsg)
          this.isFormValidEvent.emit(true);
      });

    this.dataPublishingForm.statusChanges
      .pipe(filter(() => this.dataPublishingForm.invalid)).subscribe((val) => {
        this.isFormValidEvent.emit(false);
      });
  }

  private hasChanges() {
    this.dataPublishingForm.valueChanges.subscribe((val) => {
      if (!this.dataPublishingForm.pristine && this.dataPublishingForm.valid) {
        this.publishingChangedEvent.emit(true);
      }
    });
  }

  private initInputLabelMap(): void {
    if (
      modbusConfigurationSchema !== undefined &&
      modbusConfigurationSchema !== null &&
      modbusConfigurationSchema.properties !== undefined &&
      modbusConfigurationSchema.properties !== null) {
      for (const property in modbusConfigurationSchema.properties) {
        if (modbusConfigurationSchema.properties.hasOwnProperty(property)) {
          const prop = modbusConfigurationSchema.properties[property];
          if (prop.title !== undefined) {
            this.inputLabelMap.set(property, prop.title);
          }
        }
      }
    }
  }

  private loadChannel(): void {
    if (this.publishing) {
      this.publishing.Channel.channelType === CommunicationChannelType.SERIAL ?
        this.setSerialCommSettings() : this.setTcpCommSettings();
    }
    this.isValidForm();
    this.hasChanges();
    // this.initInputLabelMap();
    // to enable create/update button
    this.validateOnInit();
  }

  createFormGroup() {
    this.dataPublishingForm = null;
    this.dataPublishingForm = this.fb.group(
      {
        Channel: this.fb.group({}),
        ModbusConfiguration: this.fb.group({})
      },
    );
  }
  // Custom Form Validation functions
  serialPortValidator(): ValidatorFn {
    return (c: AbstractControl): { [key: string]: any } | null => {
      if (c.value === undefined || c.value == null)
        return null;

      if (this.serialPorts.length === 0)
        return { customError: "No Serial Ports are available." };
      return null;
    };
  }

  // Communication Settings - Serial
  setSerialCommSettings() {
    this.selectedProtocolId = 0;
    this.tcpChannel = null;

    this.serialChannelSchema = publishingDataModelSchema.definitions.SerialPortCommunicationChannelDataModel;
    (this.dataPublishingForm.get('Channel') as FormGroup)
    for (const prop in this.serialChannelSchema.properties) {
      if (this.serialChannelSchema.properties.hasOwnProperty(prop)) {
        const formControl = new FormControl('');
        const validationFn: ValidatorFn[] = [];
        if (this.serialChannelSchema.required.includes(prop)) {
          validationFn.push(Validators.required);
        }
        if (prop === 'ComPort')
          validationFn.push(this.serialPortValidator());
        formControl.setValidators(validationFn);
        (this.dataPublishingForm.get('Channel') as FormGroup).addControl(prop, formControl);
      }
    }

    this.serialChannel = this.publishing.Channel as SerialPortCommunicationChannelDataUIModel;
    this.selectedComPort = this.serialChannel.ComPort.toString();

    this.dataPublishingForm.controls.Channel.patchValue({
      Id: this.publishing.Id,
      IdCommConfig: this.serialChannel.IdCommConfig ?? -1,
      BaudRate: this.serialChannel.BaudRate.toString(),
      ComPort: this.serialChannel.ComPort,
      DataBits: this.serialChannel.DataBits,
      Description: this.serialChannel.Description,
      StopBits: this.serialChannel.StopBits,
      Parity: this.serialChannel.Parity,
      PortNamePath: this.serialChannel.PortNamePath,
      SupportSoftwareFlowControl: this.serialChannel.SupportSoftwareFlowControl,
      FlowControlTimeIntervalInMs: this.serialChannel.FlowControlTimeIntervalInMs,
      channelType: this.serialChannel.channelType,
      TimeoutInMs: this.serialChannel.TimeoutInMs ?? 0,
      Retries: this.serialChannel.Retries ?? 0,
      PollRateInMs: this.serialChannel.PollRateInMs,
      Protocol: this.serialChannel.Protocol,
      SinglePollRateMode: this.serialChannel.SinglePollRateMode,
      Purpose: this.serialChannel.Purpose
    });

    // Slave Settings
    this.setSlaveSettings();

  }

  // Communication Settings - TCP/IP
  setTcpCommSettings() {
    this.selectedProtocolId = this.publishing.Channel.Protocol;
    this.serialChannel = null;
    this.tcpChannel = this.publishing.Channel as TcpIpCommunicationChannelDataUIModel;
    // this.tcpChannel.IpAddress = this.tcpChannel.IpAddress || this.systemIpAddress;
    this.tcpChannel.IpAddress = this.systemIpAddress;
    this.portNumber = this.tcpChannel.IpPortNumber;
    this.tcpChannelSchema = publishingDataModelSchema.definitions.TcpIpCommunicationChannelDataModel;
    for (const prop in this.tcpChannelSchema.properties) {
      if (this.tcpChannelSchema.properties.hasOwnProperty(prop)) {
        let formControl;
        const validationFn: ValidatorFn[] = [];
        switch (prop) {
          case 'IpAddress':
            formControl = new FormControl({ value: this.tcpChannel.IpAddress, disabled: true });
            break;

          case 'IpPortNumber':
            formControl = new FormControl({ value: this.tcpChannel.IpPortNumber });
            validationFn.push(this.publishingFacade.portIPPortsValidator(this.publishing));

            let propIpPortNumber = this.tcpChannelSchema.properties[prop];
            if (propIpPortNumber.minimum !== undefined && propIpPortNumber.maximum !== undefined) {
              validationFn.push(RangeValidator.range(propIpPortNumber.minimum, propIpPortNumber.maximum));
            }
            else {
              if (propIpPortNumber.minimum !== undefined)
                validationFn.push(Validators.min(propIpPortNumber.minimum));

              if (propIpPortNumber.maximum !== undefined)
                validationFn.push(Validators.max(propIpPortNumber.maximum));
            }
            break;

          default:
            formControl = new FormControl('');
            break;
        }
        if (this.tcpChannelSchema.required.includes(prop)) {
          validationFn.push(Validators.required);
        }
        formControl.setValidators(validationFn);
        (this.dataPublishingForm.get('Channel') as FormGroup).addControl(prop, formControl);
      }
    }

    this.dataPublishingForm.controls.Channel.patchValue({
      Id: this.publishing.Id,
      IdCommConfig: this.tcpChannel.IdCommConfig ?? -1,
      IpAddress: this.tcpChannel.IpAddress,
      IpPortNumber: this.tcpChannel.IpPortNumber,
      SupportSoftwareFlowControl: this.tcpChannel.SupportSoftwareFlowControl,
      FlowControlTimeIntervalInMs: this.tcpChannel.FlowControlTimeIntervalInMs,
      Description: this.tcpChannel.Description,
      channelType: this.tcpChannel.channelType,
      Protocol: this.tcpChannel.Protocol,
      SinglePollRateMode: this.tcpChannel.SinglePollRateMode,
      Purpose: this.tcpChannel.Purpose
    });
    this.validatePort();  // Validate Port Number here

    // Slave settings
    this.setSlaveSettings();
  }

  // Slave Settings - Modbus Configuration
  setSlaveSettings() {

    this.slaveSettingsProperty = {
      PublishingConnectionTypes: UICommon.PublishingConnectionTypes,
      WordOrderTypes: UICommon.WordOrderTypes,
      ByteOrderTypes: UICommon.ByteOrderTypes
    };

    for (const property in modbusConfigurationSchema.properties) {
      let formControl = new FormControl('');
      let validationFn: ValidatorFn[] = [];
      if (modbusConfigurationSchema.required.includes(property))
        validationFn.push(Validators.required);

      if (modbusConfigurationSchema.properties.hasOwnProperty(property)) {


        if (property.toLowerCase() === 'channel')
          continue;

        let prop = modbusConfigurationSchema.properties[property];
        if (prop.minimum !== undefined && prop.maximum !== undefined) {
          validationFn.push(RangeValidator.range(prop.minimum, prop.maximum));
        }
        else {
          if (prop.minimum !== undefined)
            validationFn.push(Validators.min(prop.minimum));

          if (prop.maximum !== undefined)
            validationFn.push(Validators.max(prop.maximum));
        }

        if (prop.type !== undefined && prop.type === 'integer') {
          validationFn.push(this.validationService.ValidateInteger);
        }
      }
      formControl.setValidators(validationFn);
      (this.dataPublishingForm.get('ModbusConfiguration') as FormGroup).addControl(property, formControl);
    }

    this.dataPublishingForm.controls.ModbusConfiguration.patchValue({
      SlaveId: this.publishing.SlaveId,
      Channel: this.publishing.Channel,
      Serial: this.publishing.Serial,
      Tcp: this.publishing.Tcp,
      ModbusDeviceMap: this.publishing.ModbusDeviceMap,
      UnitSystem: this.publishing.UnitSystem,
      IsForModbusMaster: this.publishing.IsForModbusMaster,
      Endianness: this.publishing.Endianness,
      WordOrder: this.publishing.WordOrder,
      ByteOrder: this.publishing.ByteOrder,
      IsBytesSwapped: this.publishing.IsBytesSwapped,
      RegisteredModbusMapId: this.publishing.RegisteredModbusMapId,
      ModbusConfigurationId: this.publishing.ModbusConfigurationId,
      MapType: this.publishing.MapType,
      ConnectionTo: this.publishing.ConnectionTo
    });

    // console.log('this.dataPublishingForm', this.dataPublishingForm.value);
    this.publishingUpdatedEvent.emit(this.publishing);
  }

  private setDefaultComPort() {
    this.dataPublishingForm.controls.Channel.patchValue({
      ComPort: this.selectedComPort,
    });
  }

  private subscribeSerialSettings() {
    const subscription = this.serialCannelProperties$.subscribe((state: ISerialChannelPropertiesState) => {
      if (state) {
        if (!state.isLoaded && !StateUtilities.hasErrors(state)) {   // Dispatch Action if not loaded
          this.store.dispatch(ACTIONS.SERIALCHANNELPROPERTIES_LOAD());
        } else {
          this.serialChannelProperty = state.serialChannelProperties;
          this.setUpSerialPorts();
        }
      }
    });

    this.arrSubscriptions.push(subscription);
  }

  private setUpSerialPorts() {
    this.serialPorts = [];
    if (!this.serialChannelProperty) {
      return;
    }

    if (this.serialChannel) {
      this.serialChannelProperty.CommPorts.forEach(comPort => {
        if (comPort.SourcePublishBoth.toLowerCase() !== UICommon.COMPORT_SOURCE.toLowerCase()) {
          const portInUse = UICommon.comPortsInUse.find(x => x.portNumber === parseInt(comPort.Name, 10));
          if (!portInUse || portInUse.portNumber === this.serialChannel.ComPort) {
            this.serialPorts.push(comPort);
          }
        }
      });

      // Set Default Com Port
      if (this.serialChannel.ComPort === -1 && this.serialPorts.length > 0) {
        // No Com Port assigned - New Data Source
        this.selectedComPort = this.serialPorts[0].Name;
        this.serialChannel.ComPort = parseInt(this.serialPorts[0].Name, 10);
        this.serialChannel.PortNamePath = this.serialPorts[0].Path;
        this.serialChannel.Description = this.serialPorts[0].Description;
        this.publishingUpdatedEvent.emit(this.publishing);
      }
    }
    this.setDefaultComPort();
    this.validateSerialPort();
  }

  decSlaveId(): void {
    if (this.publishing.SlaveId > 1) {
      // tslint:disable-next-line: max-line-length
      this.publishing.SlaveId = Number(this.publishing.SlaveId) - 1 !== -1
        ? this.publishing.SlaveId - 1 : 0;
      this.publishingChangedEvent.emit(true);
    }
  }

  incSlaveId(): void {
    if (this.publishing.SlaveId < this.maxSlaveId) {
      // tslint:disable-next-line: max-line-length
      this.publishing.SlaveId = Number(this.publishing.SlaveId) + 1;
      this.publishingChangedEvent.emit(true);
    }
  }

  private validateOnInit(): void {

    this.publishingName = this.publishingFacade.getPublishingName(this.publishing).Name.split(':')[0];
    if (this.dataPublishingForm) {
      this.dataPublishingForm.markAllAsTouched();
      this.validateSlave();
      //this.validateIPAddress();
      if (this.tcpChannel) this.validatePort();
      if (this.ipAddressValidationMsg != null || this.ipPortValidationMsg != null || this.slaveIdValidationMsg != null) {
        this.isFormValidEvent.emit(false);
      }
    }
  }

  validateIPAddress() {
    if (this.tcpChannel && this.tcpChannel.IpAddress) {
      let isIpAddressInUse = UICommon.ipAddressesInUse.find((data) => data.id !== this.tcpChannel.Id && data.ipAddress === this.tcpChannel.IpAddress && data.portNumber === this.tcpChannel.IpPortNumber);

      if (isIpAddressInUse) {
        this.ipAddressValidationMsg = "Ip Address & Port are used.";
        const error: PublishingErrorNotifierModel = {
          path: this.router.url,
          tabName: this.publishingName + ":" + this.portNumber,
          pubId: this.publishing.Id,
          fieldName: 'Ip Address',
          errors: [
            {
              name: 'Ip Address',
              value: `Ip Address : ${this.ipAddressValidationMsg}`
            }
          ]
        };
        this.setErrorNotifierList(error);
      }
    }
  }

  validateSlave() {
    this.slaveIdValidationMsg = null;
    let modbusConfigForm = this.dataPublishingForm.get('ModbusConfiguration') as FormGroup;
    let ctrl = modbusConfigForm.get('SlaveId');
    if (ctrl && ctrl.touched && ctrl.invalid) {
      this.slaveIdValidationMsg = this.validationService.getValidationErrorMessage(ctrl.errors, 'SlaveId');
      const error: PublishingErrorNotifierModel = {
        path: this.router.url,
        tabName: this.publishingName,
        pubId: this.publishing.Id,
        fieldName: 'SlaveId',
        errors: [
          {
            name: 'SlaveId',
            value: `Slave ID : ${this.slaveIdValidationMsg}`
          }
        ]
      };
      this.setErrorNotifierList(error);
    } else {
      this.updateErrorNotifierList("SlaveId");
    }
  }

  validatePort() {

    this.ipPortValidationMsg = null;
    let modbusConfigForm = this.dataPublishingForm.get('Channel') as FormGroup;
    let ctrl = modbusConfigForm.get('IpPortNumber');
    if (ctrl && ctrl.touched && ctrl.invalid) {
      this.ipPortValidationMsg = this.validationService.getValidationErrorMessage(ctrl.errors, 'Port Number');
      const error: PublishingErrorNotifierModel = {
        path: this.router.url,
        tabName: this.publishingName + ":" + this.portNumber,
        pubId: this.publishing.Id,
        fieldName: 'Port Number',
        errors: [
          {
            name: 'Port Number',
            value: `Port Number : ${this.ipPortValidationMsg}`
          }
        ]
      };
      this.setErrorNotifierList(error);
    } else {

      this.portNumber = this.tcpChannel.IpPortNumber;
      this.updateErrorNotifierList("Port Number");
      this.updateErrorNotifierList("Ip Address");
    }
  }

  validateSerialPort() {

    this.noSerialPortsAvailableMsg = null;
    let modbusConfigForm = this.dataPublishingForm.get('Channel') as FormGroup;
    let ctrl = modbusConfigForm.get('ComPort');
    if (ctrl && ctrl.touched && ctrl.invalid) {
      this.noSerialPortsAvailableMsg = this.validationService.getValidationErrorMessage(ctrl.errors, 'Serial Port');
      const error: PublishingErrorNotifierModel = {
        path: this.router.url,
        tabName: this.publishingName,
        pubId: this.publishing.Id,
        fieldName: 'Serial Port',
        errors: [
          {
            name: 'Serial Port',
            value: `Serial Port : ${this.noSerialPortsAvailableMsg}`
          }
        ]
      };
      this.setErrorNotifierList(error);
    } else {
      this.updateErrorNotifierList("Serial Port");
    }
  }

  // GATE- 1239 Publishing Error Validation
  setErrorNotifierList(data: PublishingErrorNotifierModel) {
    if (this.publishingErrorsList && this.publishingErrorsList.length > 0) {
      const pubErrorIdx = this.publishingErrorsList.findIndex((item) => item.pubId === this.publishing.Id);
      if (pubErrorIdx !== -1) {
        const fieldIdx = this.publishingErrorsList[pubErrorIdx].errors.findIndex(e => e.name === data.errors[0].name);
        if (fieldIdx === -1) {
          this.publishingErrorsList[pubErrorIdx].errors.push(data.errors[0]);
        } else {
          this.publishingErrorsList[pubErrorIdx].errors[fieldIdx] = data.errors[0];
        }
      }
    } else {
      this.publishingErrorsList.push(data);
    }
    this.publishingFormInvalidEvent.emit(this.publishingErrorsList);
  }

  updateErrorNotifierList(fieldName: string) {

    if (fieldName && this.publishingErrorsList && this.publishingErrorsList.length > 0) {
      const errorIdx = this.publishingErrorsList.findIndex((item) => item.pubId === this.publishing.Id);
      if (errorIdx !== -1) {
        const pubErrorIdx = this.publishingErrorsList.findIndex(pubError => pubError.pubId === this.publishing.Id);
        const fieldIdx = this.publishingErrorsList[pubErrorIdx].errors.findIndex(e => e.name === fieldName);
        if (fieldIdx !== -1) {
          if (this.publishingErrorsList[pubErrorIdx].errors.length > 1) {
            this.publishingErrorsList[pubErrorIdx].errors.splice(fieldIdx, 1);
          } else {
            this.publishingErrorsList.splice(pubErrorIdx, 1);
          }
        }
      }
    } else {
      this.publishingErrorsList = [];
    }
    const errorsList = this.publishingErrorsList.length > 0 ? this.publishingErrorsList : null;
    this.publishingFormInvalidEvent.emit(errorsList);
  }

  clearValidtions() {
    this.validationService.clearError();
  }

  showNewCustomMapDialog() {
    this.showCustomMapDialogEvent.emit();
    this.RegisteredModbusMapId && this.RegisteredModbusMapId.close();
  }

  postCallGetPanelConfigurationCommon(): void {
    this.panelTypeId = this.panelConfigurationCommonState.panelConfigurationCommon.PanelTypeId;
  }

  postCallGetModbusProtocols() {
    this.protocolList = this.modbusProtocols;
  }

  postCallGetModbusTemplateDetails() {
    this.mapTemplateList = this.modbusTemplateDetails;
    if (this.publishing?.RegisteredModbusMapId) {
      this.setTooltipText(this.publishing.RegisteredModbusMapId);
    }
  }

  postCallGetDataPublishing() {
    this.isNewPublishing = true;
    if (this.publishingEntity && this.publishingEntity.length > 0) {
      let inxPublishing = this.publishingEntity.findIndex(p => p.Id === this.publishing.Id);
      this.isNewPublishing = inxPublishing === -1 ? true : false;
    }
  }

  setTooltipText(mapId) {
    const map = this.mapTemplateList.find(m => m.Id == mapId);
    this.selectedMapName = map ? map.MapName : null;
  }

  ngOnChanges(): void {
    this.createFormGroup();
    this.loadChannel();
    this.setUpSerialPorts();
    this.validateOnInit();
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.utilityService.getSystemIPAdress().subscribe((res) => {
      if (res) {
        this.systemIpAddress = res[0].IpAddress;
        this.createFormGroup();
        this.loadChannel();
        this.subscribeSerialSettings();
        this.validateOnInit();
      }
    });
    this.initPanelConfigurationCommon();
    this.initDataPublishing();
    this.initModbusMapTemplateDetails();
    this.initModbusProtocols();
    this.maxSlaveId = modbusConfigurationSchema.properties?.SlaveId?.maximum;
    this.isImportConfig = UICommon.IsImportConfig;
  }
}
