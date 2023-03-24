import { Component, OnInit, Input, Output, EventEmitter, OnChanges, OnDestroy, AfterViewInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { serialPortChannelSchema } from '@core/models/schemaModels/SerialPortCommunicationChannelDataUIModel.schema';
import { SerialChannelProperty } from '@core/models/UIModels/SerialChannel.model';
import { Store } from '@ngrx/store';
import { StateUtilities } from '@store/state/IState';
import { ISerialChannelPropertiesState } from '@store/state/serialChannelProperties.state';
import { Observable, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { String } from 'typescript-string-operations';

import * as ACTIONS from '@store/actions/serialChannelProperties.action';
import * as DATASOURCES_ACTIONS from '@store/actions/dataSources.entity.action';
import { ValidationService } from '@core/services/validation.service';

import { SerialPortSettingsModel } from '@core/models/webModels/SerialPortSettings.model';
import { CommunicationChannelType, PanelTypeList, SerialPortPurpose, UICommon } from '@core/data/UICommon';
import { RangeValidator } from '@core/customValidators/rangeValidator.validator';
import { SerialPortCommunicationChannelDataUIModel } from '@core/models/webModels/SerialPortCommunicationChannelDataUIModel.model';
import { GatewayModalService } from '@shared/gateway-dialogs/services/gatewayModal.service';
import { ChannelErrorNotifierModel } from '@core/models/UIModels/error-notifier-model';
import { ModbusProtocolModel } from '@core/models/UIModels/ModbusProtocol.model';
import { GatewayPanelBase } from '@comp/GatewayPanelBase.component';
import { PublishingChannelFacade } from '@core/facade/publishingChannelFacade.service';
import { PanelConfigurationFacade } from '@core/facade/panelConfigFacade.service';
import { dataSourceTcpIpChannelSchema } from '@core/models/schemaModels/DataSourceTcpCommunicationChannelDataUIModel.schema';
import { TcpIpCommunicationChannelDataUIModel } from '@core/models/webModels/TcpIpCommunicationChannelDataUIModel.model';
import { DataSourceFacade } from '@core/facade/dataSourceFacade.service';

@Component({
  selector: 'gw-multiProtocol-channel',
  templateUrl: './multiProtocolChannel.component.html',
  styleUrls: ['./multiProtocolChannel.component.scss']
})
export class MultiProtocolChannelComponent extends GatewayPanelBase implements OnInit, OnChanges, AfterViewInit, OnDestroy {

  @Input()
  channel: any;

  @Input()
  isDirty: boolean;

  @Output()
  isFormValidEvent = new EventEmitter();

  @Output()
  channelChangedEvent = new EventEmitter();

  @Output()
  channelUpdatedEvent = new EventEmitter();

  @Output()
  channelFormInvalidEvent = new EventEmitter();

  serialChannelSchema: any;
  // ModbusRTUOverSerial = UICommon.ProtocolList;
  serialPorts: SerialPortSettingsModel[] = [];
  pollModes: string[] = ['Burst', 'Continuous'];
  isFormValid: boolean = false;
  hasChannelChanged: boolean = false;
  communicationSettingsFormGroup: FormGroup;
  private inputLabelMap = new Map();

  serialCannelProperties$: Observable<ISerialChannelPropertiesState>;
  serialChannelProperty: SerialChannelProperty;
  private arrSubscriptions: Subscription[] = [];

  // Validation messages
  private mapErrMessages: Map<string, string> = new Map<string, string>();
  channelErrorsList = [];
  noSerialPortsAvailableMsg: string = null;
  protocolList: ModbusProtocolModel[];
  isSerialProtocol: boolean;
  panelTypeId: number;
  selectedProtocolId: number = 0;
  IpAddressList = ["", "", "", ""];
  serialChannel: SerialPortCommunicationChannelDataUIModel;
  tcpChannel: TcpIpCommunicationChannelDataUIModel;
  tcpChannelSchema: any;
  selectedComPort: string;
  portNumber: number;
  isNewDataSource: boolean = true;
  ipAddressErrorMessage = "";

  constructor(private router: Router,
    private formBuilder: FormBuilder,
    protected store: Store<{ serialChannelPropertiesState: ISerialChannelPropertiesState }>,
    private validationService: ValidationService,
    private publishingFacade: PublishingChannelFacade,
    private dataSourceFacade: DataSourceFacade,
    private panelConfigFacade: PanelConfigurationFacade,
    private gwModalService: GatewayModalService) {
    super(store, panelConfigFacade, null, dataSourceFacade, publishingFacade, null, null, null);
    this.serialCannelProperties$ = this.store.select<any>((state: any) => state.serialChannelPropertiesState);
    this.communicationSettingsFormGroup = this.formBuilder.group({ IpAddressList: this.formBuilder.group({}) });
  }

  modelValue(value: number): string {
    return value?.toString();
  }

  private isValidForm() {
    if (this.communicationSettingsFormGroup) {
      this.communicationSettingsFormGroup.statusChanges
        .pipe(filter(() => this.communicationSettingsFormGroup.valid)).subscribe(() => {
          this.isFormValidEvent.emit(true);
        });

      this.communicationSettingsFormGroup.statusChanges
        .pipe(filter(() => this.communicationSettingsFormGroup.invalid)).subscribe(() => {
          this.isFormValidEvent.emit(false);
        });
    }
  }

  private hasChanges() {
    this.communicationSettingsFormGroup?.valueChanges.subscribe((val) => {
      if (!this.communicationSettingsFormGroup.pristine) {
        this.channelChangedEvent.emit(true);
      }
    });
  }

  onChange(event) {
    switch (event.source.id) {
      case "SerialPort":
        this.channel.ComPort = parseInt(event.value);
        let port = this.serialPorts.find(p => p.Name === event.value);
        if (port !== undefined && port != null) {
          this.channel.PortNamePath = port.Path;
          this.channel.Description = port.Description;
        } else {
          this.channel.PortNamePath = String.Format("COM{0}", event.value);
        }
        break;

      case "BaudRate":
        this.channel.BaudRate = parseInt(event.value);
        break;

      case "PollMode":
        this.channel.SinglePollRateMode = event.value;
    }
    this.channelUpdatedEvent.emit(this.channel);
  }

  deleteChannel() {
    this.gwModalService.openDialog(
      'Do you want to delete the communication channel?',
      () => {
        this.store.dispatch(DATASOURCES_ACTIONS.DATASOURCES_DELETE({ idComConfig: this.channel.IdCommConfig }));
        this.gwModalService.closeModal();
      },
      null,
      'Info',
      null,
      true,
      "Yes",
      "No"
    );
    ;
  }

  private validateOnInit(): void {
    if (this.communicationSettingsFormGroup) {
      this.communicationSettingsFormGroup.markAllAsTouched();
      Object.keys(this.communicationSettingsFormGroup.controls).forEach(key => {
        this.validateControl(key, this.communicationSettingsFormGroup.controls[key]);
      });
    }
  }

  private validateControl(ctrlId, ctrl) {
    if (this.channel.channelType === CommunicationChannelType.SERIAL && ctrlId === "ComPort") {
      if (this.serialPorts.length > 0) {
        this.mapErrMessages.delete(ctrlId);
      } else {
        this.mapErrMessages.set(ctrlId, this.validationService.getValidationErrorMessage(ctrl.errors, this.inputLabelMap.get(ctrlId)));
      }
    } else if (this.channel.channelType === CommunicationChannelType.TCPIP && ctrlId === "IpAddress") {
      if (this.ipAddressErrorMessage) {
        this.mapErrMessages.set(ctrlId, this.ipAddressErrorMessage);
      } else
        this.mapErrMessages.delete(ctrlId);
    } else if (ctrlId !== "IpAddressList" && ctrlId !== "IpAddress" && ctrl) {
      if (ctrl.touched && ctrl.invalid) {
        this.mapErrMessages.set(ctrlId, this.validationService.getValidationErrorMessage(ctrl.errors, this.inputLabelMap.get(ctrlId)));
      } else
        this.mapErrMessages.delete(ctrlId);
    }
    this.setChannelErrorsList()
  }

  private getIpAddressValidationMessage() {
    if (this.ipAddressErrorMessage)
      return this.ipAddressErrorMessage;
    let errMssg = '';
    this.IpAddressList.forEach(ipAddress => {
      if (!ipAddress) {
        errMssg = "Invalid IP Address."
      }
    });
    return errMssg;
  }

  setIpAddress(event, index) {
    this.IpAddressList[index] = event.currentTarget.value;
    let ipAddress = this.IpAddressList.join(".");
    (this.channel as TcpIpCommunicationChannelDataUIModel).IpAddress = ipAddress;
    this.tcpChannel.IpAddress = ipAddress;
    this.channel.Description = String.Format("{0}:{1}",
      (this.channel as TcpIpCommunicationChannelDataUIModel)?.IpAddress,
      (this.channel as TcpIpCommunicationChannelDataUIModel)?.IpPortNumber);
    this.communicationSettingsFormGroup.patchValue({
      IpAddress: this.tcpChannel.IpAddress
    });
    this.validateControl(event, "IpAddress");
  }

  // GATE- 128 Data Source Error Notification
  setChannelErrorsList() {
    const errors = [...this.mapErrMessages].map(([name, value]) => ({ name, value }));
    if (errors && errors.length > 0) {
      const errorDetails: ChannelErrorNotifierModel[] = [{
        path: this.setPageRoute(this.panelConfigurationCommonState.panelConfigurationCommon.PanelTypeId, 'datasource', this.channel.IdCommConfig),
        channelId: this.channel.IdCommConfig,
        tabName: this.dataSourceFacade.getDataSourceName(this.channel),
        tabIndex: 1,
        errors: [...this.mapErrMessages].map(([name, value]) => ({ name, value }))
      }];
      errorDetails.forEach(data => {
        data.errors.map(e => {
          const fieldName: string = this.inputLabelMap.get(e.name);
          e.value = `${fieldName} : ${e.value}`;
        });
      });
      this.channelFormInvalidEvent.emit(errorDetails);
    } else {
      this.channelFormInvalidEvent.emit([])
    }
  }

  getChannelPath() {
    let path = this.router.url;
    path = path.includes(';') ? this.router.url.split(';')[0] : path;
    return `${path}`;
  }

  validate(event) {
    let ctrl = this.communicationSettingsFormGroup.get(event.currentTarget.id);
    this.validateControl(event.currentTarget.id, ctrl);
  }

  getError(fieldName: string) {
    return this.mapErrMessages.get(fieldName);
  }

  clearValidtions() {
    this.validationService.clearError();
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

  ipAddressGroupValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      let ipPartOne = control.get('ipPartOne');
      let ipPartTwo = control.get('ipPartTwo');
      let ipPartThree = control.get('ipPartThree');
      let ipPartFour = control.get('ipPartFour');

      if (ipPartOne && ipPartTwo && ipPartThree && ipPartFour) {
        let ipList = [ipPartOne.value, ipPartTwo.value, ipPartThree.value, ipPartFour.value];
        let emptyIp = ipList.filter(ip => ip === "" || ip === null || ip === undefined);
        let invalidIp = ipList.filter(ip => ip >= 256);

        if (emptyIp.length === ipList.length) {
          this.ipAddressErrorMessage = "Required field.";
          return { customError: this.ipAddressErrorMessage };
        }
        if (emptyIp && emptyIp.length > 0) {
          this.ipAddressErrorMessage = "Invalid IP Address.";
          return { customError: this.ipAddressErrorMessage };
        }
        if (invalidIp && invalidIp.length > 0) {
          this.ipAddressErrorMessage = "Invalid IP Address.";
          return { customError: this.ipAddressErrorMessage };
        }

        let ipAddress = ipList.join(".");
        let isIpAddressInUse = UICommon.ipAddressesInUse.find((data) => data.id !== this.channel.IdCommConfig && data.ipAddress === ipAddress && data.portNumber === this.channel.IpPortNumber);

        if (isIpAddressInUse) {
          this.ipAddressErrorMessage = "Ip Address & Port are used.";
          return { customError: this.ipAddressErrorMessage };
        }
      }
      this.ipAddressErrorMessage = "";
      if (this.ipAddressErrorMessage === "Ip Address & Port are used.") {
        this.communicationSettingsFormGroup.get("IpPortNumber").setErrors(null);
      }
      return null;
    };
  }

  ipPortValidator(): ValidatorFn {
    return (c: AbstractControl): { [key: string]: any } | null => {
      if (c.value === undefined || c.value == null) {
        if (this.ipAddressErrorMessage === "Ip Address & Port are used.") this.ipAddressErrorMessage = "";
        return null;
      }

      let isIpAddressInUse = UICommon.ipAddressesInUse.find((data) => data.id !== this.channel.IdCommConfig && data.ipAddress === this.channel.IpAddress && data.portNumber === c.value);

      if (isIpAddressInUse) {
        this.ipAddressErrorMessage = "Ip Address & Port are used.";
        return { customError: this.ipAddressErrorMessage };
      }
      if (this.ipAddressErrorMessage === "Ip Address & Port are used.") {
        this.ipAddressErrorMessage = "";
        this.communicationSettingsFormGroup.get("IpAddressList").setErrors(null);
      };
      return null;
    };
  }

  createFormGroup() {
    this.communicationSettingsFormGroup = null;
    this.communicationSettingsFormGroup = this.formBuilder.group({});
    // this.communicationSettingsFormGroup = new FormGroup({});  
  }

  private initInputLabelMap(): void {
    let schema = this.channel.channelType === CommunicationChannelType.SERIAL ? this.serialChannelSchema : this.tcpChannelSchema;;

    if (
      schema !== undefined &&
      schema !== null &&
      schema.properties !== undefined &&
      schema.properties !== null) {
      this.inputLabelMap.clear();
      for (const property in schema.properties) {

        if (schema.properties.hasOwnProperty(property)) {
          const prop = schema.properties[property];
          if (prop.title !== undefined) {
            let title = property === "ComPort" ? "Serial Port" : prop.title;
            this.inputLabelMap.set(property, title);
          }
        }
      }
    }
  }

  private setUpSerialPorts() {
    this.serialPorts = [];
    if (this.serialChannelProperty === undefined || this.serialChannelProperty == null)
      return;

    this.serialChannelProperty.CommPorts.forEach(comPort => {
      if (comPort.SourcePublishBoth.toLowerCase() !== UICommon.COMPORT_PUBLISH.toLowerCase()) {
        let portInUse = UICommon.comPortsInUse.find(x => x.portNumber == parseInt(comPort.Name));
        if (portInUse === undefined || portInUse.portNumber == this.channel.ComPort)
          this.serialPorts.push(comPort);
      }
    });

    if (this.channel.ComPort == -1 && this.serialPorts.length > 0) { // No Com Port assigned - New Data Source
      this.channel.ComPort = parseInt(this.serialPorts[0].Name);
      this.channel.PortNamePath = this.serialPorts[0].Path;
      this.channel.Description = this.serialPorts[0].Description;
      this.channelUpdatedEvent.emit(this.channel);
    }
    this.validateOnInit();
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

  onProtocolSelectChange(event) {
    this.clearValidtions();
    if (event.value === 0) {
      const dataSourceId = this.getDataSourceId();
      let dataSource = this.dataSourceFacade.getNewDataSource(dataSourceId, 0, event.value);
      this.channel = dataSource?.Channel as SerialPortCommunicationChannelDataUIModel;
      this.createFormGroup();
    } else {
      const dataSourceId = this.getDataSourceId();
      let dataSource = this.dataSourceFacade.getNewDataSource(dataSourceId, 1, event.value);
      this.channel = dataSource?.Channel as TcpIpCommunicationChannelDataUIModel;
      this.createFormGroup();
    }
    this.channel.Protocol = event.value;
    this.loadChannel();
    this.subscribeSerialSettings();
  }

  getDataSourceId() {
    return this.channel && this.channel ?
      (this.channel.Id < 0 ? Math.abs(this.channel.Id) :
        this.channel.Id) : 1;
  }

  // Communication Settings - Serial
  setSerialCommSettings() {
    this.isSerialProtocol = true;
    this.selectedProtocolId = 0;
    this.tcpChannel = null;

    // this.serialChannelSchema = publishingDataModelSchema.definitions.SerialPortCommunicationChannelDataModel;
    this.serialChannelSchema = serialPortChannelSchema;
    this.serialChannel = this.channel as SerialPortCommunicationChannelDataUIModel;
    this.selectedComPort = this.serialChannel.ComPort.toString();

    for (const property in this.serialChannelSchema.properties) {
      let formControl = new FormControl('');
      let validationFn: ValidatorFn[] = [];
      if (this.serialChannelSchema.required.includes(property))
        validationFn.push(Validators.required);

      if (this.serialChannelSchema.properties.hasOwnProperty(property)) {
        let prop = this.serialChannelSchema.properties[property];
        if (prop.minLength !== undefined)
          validationFn.push(Validators.minLength(prop.minLength));

        if (prop.maxLength !== undefined)
          validationFn.push(Validators.maxLength(prop.maxLength));

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
      if (property === 'ComPort') {
        validationFn.push(this.serialPortValidator());
      }
      formControl.setValidators(validationFn);
      /*  if (property === 'Protocol')
         formControl.disable(); */
      this.communicationSettingsFormGroup.addControl(property, formControl);
    }

    // This is required because all the properties are not loaded into the UI form and hence the form has missing values when bind to data object
    this.communicationSettingsFormGroup.patchValue({
      Id: this.channel.Id,
      IdCommConfig: this.channel.IdCommConfig,
      Description: this.channel.Description,
      ComPort: this.channel.ComPort?.toString(),
      BaudRate: this.channel.BaudRate.toString(),
      DataBits: this.channel.DataBits,
      StopBits: this.channel.StopBits,
      Parity: this.channel.Parity,
      PortNamePath: this.channel.PortNamePath,
      SupportSoftwareFlowControl: this.channel.SupportSoftwareFlowControl,
      FlowControlTimeIntervalInMs: this.channel.FlowControlTimeIntervalInMs,
      channelType: this.channel.channelType,
      TimeoutInMs: this.channel.TimeoutInMs,
      Retries: this.channel.Retries,
      PollRateInMs: this.channel.PollRateInMs,
      Protocol: this.channel.Protocol,
      SinglePollRateMode: this.channel.SinglePollRateMode,
      Purpose: this.channel.Purpose
    });
  }

  // Communication Settings - TCP/IP
  setTcpCommSettings() {
    this.isSerialProtocol = false;
    this.selectedProtocolId = this.channel.Protocol;
    this.serialChannel = null;
    this.tcpChannel = this.channel as TcpIpCommunicationChannelDataUIModel;
    this.IpAddressList = this.tcpChannel.IpAddress ? this.tcpChannel.IpAddress.split('.') : ["", "", "", ""];


    this.portNumber = this.tcpChannel.IpPortNumber;

    this.channel.Description = String.Format("{0}:{1}",
      this.tcpChannel?.IpAddress,
      this.tcpChannel?.IpPortNumber);

    this.tcpChannelSchema = dataSourceTcpIpChannelSchema;
    for (const property in this.tcpChannelSchema.properties) {
      let formControl = new FormControl('');
      let validationFn: ValidatorFn[] = [];
      if (this.tcpChannelSchema.required.includes(property))
        validationFn.push(Validators.required);

      if (this.tcpChannelSchema.properties.hasOwnProperty(property)) {
        let prop = this.tcpChannelSchema.properties[property];
        if (prop.minLength !== undefined)
          validationFn.push(Validators.minLength(prop.minLength));

        if (prop.maxLength !== undefined)
          validationFn.push(Validators.maxLength(prop.maxLength));

        if (prop.minimum !== undefined && prop.maximum !== undefined) {
          validationFn.push(RangeValidator.range(prop.minimum, prop.maximum));
        }
        else {
          if (prop.minimum !== undefined)
            validationFn.push(Validators.min(prop.minimum));

          if (prop.maximum !== undefined)
            validationFn.push(Validators.max(prop.maximum));
        }

        /*   if (prop.type !== undefined && prop.type === 'integer') {
            validationFn.push(this.validationService.ValidateInteger);
          } */
      }
      if (property === 'IpPortNumber') {
        validationFn.push(this.ipPortValidator());
      }
      formControl.setValidators(validationFn);

      this.communicationSettingsFormGroup.addControl(property, formControl);
    }
    let ipFormGroup = this.createIpAddressGroup(this.IpAddressList);
    ipFormGroup.setValidators([this.ipAddressGroupValidator()]);
    this.communicationSettingsFormGroup.addControl("IpAddressList", ipFormGroup);
    /*this.communicationSettingsFormGroup.controls.IpAddressList.patchValue({
      ipPartOne: this.IpAddressList[0] || "",
      ipPartTwo: this.IpAddressList[1] || "",
      ipPartThree: this.IpAddressList[2] || "",
      ipPartFour: this.IpAddressList[3] || ""
    }) */
    this.communicationSettingsFormGroup.patchValue({
      Id: this.channel.Id,
      IdCommConfig: this.channel.IdCommConfig,
      Description: this.channel.Description,
      IpAddress: this.tcpChannel.IpAddress,
      IpPortNumber: this.tcpChannel.IpPortNumber,
      channelType: this.tcpChannel.channelType,
      Protocol: this.tcpChannel.Protocol,
      TimeoutInMs: this.tcpChannel.TimeoutInMs,
      PollRateInMs: this.tcpChannel.PollRateInMs,
      SinglePollRateMode: this.tcpChannel.SinglePollRateMode,
    });
  }

  createIpAddressGroup(IpAddressList) {
    if (IpAddressList && IpAddressList.length > 0) {
      return this.formBuilder.group({
        ipPartOne: this.formBuilder.control(IpAddressList[0] ?? "", [Validators.required, Validators.min(0), Validators.max(255)]),
        ipPartTwo: this.formBuilder.control(IpAddressList[1] ?? "", [Validators.required, Validators.min(0), Validators.max(255)]),
        ipPartThree: this.formBuilder.control(IpAddressList[2] ?? "", [Validators.required, Validators.min(0), Validators.max(255)]),
        ipPartFour: this.formBuilder.control(IpAddressList[3] ?? "", [Validators.required, Validators.min(0), Validators.max(255)])
      });
    } else { return null; }
  }

  private loadChannel(): void {
    if (this.channel) {
      this.channel.channelType === CommunicationChannelType.SERIAL ?
        this.setSerialCommSettings() : this.setTcpCommSettings();
    }
    this.channelUpdatedEvent.emit(this.channel);
    this.isValidForm();
    this.hasChanges();
    this.initInputLabelMap();
    // to enable create/update button
    this.validateOnInit();
  }

  postCallGetModbusProtocols() {
    this.protocolList = this.modbusProtocols;
  }

  postCallGetPanelConfigurationCommon(): void {
    this.panelTypeId = this.panelConfigurationCommonState.panelConfigurationCommon.PanelTypeId;
  }

  private setPageRoute(panelTypeId, page, pageId) {
    let pageRoute = UICommon.getPanelType(panelTypeId, true);
    return pageRoute.name;
  }

  ngOnChanges() {
    this.createFormGroup();
    this.loadChannel();
    this.setUpSerialPorts();
    this.initInputLabelMap();
    this.validateOnInit();
  }

  ngOnDestroy(): void {
    this.validateOnInit();
    if (this.arrSubscriptions != null && this.arrSubscriptions.length > 0) {
      this.arrSubscriptions.forEach(subscription => {
        if (subscription != null)
          subscription.unsubscribe();
      });
    }
    this.arrSubscriptions = [];
    super.ngOnDestroy();
  }


  ngAfterViewInit(): void {

  }

  ngOnInit(): void {
    this.mapErrMessages.clear();
    // this.communicationSettingsFormGroup = this.formBuilder.group({});
    // this.serialChannelSchema = serialPortChannelSchema;

    this.createFormGroup();
    this.loadChannel();
    this.subscribeSerialSettings();
    this.initInputLabelMap();
    this.validateOnInit();
    this.isNewDataSource = this.channel.IdCommConfig < 0;


    this.initPanelConfigurationCommon();
    this.initModbusProtocols();
  }
}
