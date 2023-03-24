import { Component, OnInit, Input, Output, EventEmitter, OnChanges, OnDestroy } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
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
import { UICommon } from '@core/data/UICommon';
import { RangeValidator } from '@core/customValidators/rangeValidator.validator';
import { SerialPortCommunicationChannelDataUIModel } from '@core/models/webModels/SerialPortCommunicationChannelDataUIModel.model';
import { GatewayModalService } from '@shared/gateway-dialogs/services/gatewayModal.service';
import { ChannelErrorNotifierModel } from '@core/models/UIModels/error-notifier-model';

@Component({
  selector: 'gw-serialPort-channel',
  templateUrl: './serialPortChannel.component.html',
  styleUrls: ['./serialPortChannel.component.scss']
})
export class SerialPortChannelComponent implements OnInit, OnChanges, OnDestroy {

  @Input()
  channel: SerialPortCommunicationChannelDataUIModel;

  @Input()
  isDirty: boolean;

  @Output()
  isFormValidEvent = new EventEmitter();

  @Output()
  channelChangedEvent = new EventEmitter();

  @Output()
  channelFormInvalidEvent = new EventEmitter();

  serialChannelSchema: any;
  ModbusRTUOverSerial: any;
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

  constructor(private router: Router,
    private store: Store<{ serialChannelPropertiesState: ISerialChannelPropertiesState }>,
    private validationService: ValidationService,
    private gwModalService: GatewayModalService) {
    this.serialCannelProperties$ = this.store.select<any>((state: any) => state.serialChannelPropertiesState);
  }

  modelValue(value: number): string {
    return value.toString();
  }

  private isValidForm() {
    this.communicationSettingsFormGroup.statusChanges
      .pipe(filter(() => this.communicationSettingsFormGroup.valid)).subscribe(() => {
        this.isFormValidEvent.emit(true);
      });

    this.communicationSettingsFormGroup.statusChanges
      .pipe(filter(() => this.communicationSettingsFormGroup.invalid)).subscribe(() => {
        this.isFormValidEvent.emit(false);
      });
  }

  private hasChanges() {
    this.communicationSettingsFormGroup.valueChanges.subscribe((val) => {
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
  }

  deleteChannel() {
    this.gwModalService.openDialog(
      'Do you want to delete the communication channel?',
      () => {
        this.store.dispatch(DATASOURCES_ACTIONS.DATASOURCES_DELETE({ idComConfig: this.channel.Id }));
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
    if (ctrlId === "ComPort") {
      if (this.serialPorts.length > 0) {
        this.mapErrMessages.delete(ctrlId);
      } else {
        this.mapErrMessages.set(ctrlId, this.validationService.getValidationErrorMessage(ctrl.errors, this.inputLabelMap.get(ctrlId)));
      }
    } else if (ctrl) {
      if (ctrl.touched && ctrl.invalid) {
        this.mapErrMessages.set(ctrlId, this.validationService.getValidationErrorMessage(ctrl.errors, this.inputLabelMap.get(ctrlId)));
      } else
        this.mapErrMessages.delete(ctrlId);
    }
    this.setChannelErrorsList()
  }

  // GATE- 128 Data Source Error Notification
  setChannelErrorsList() {
    const errors = [...this.mapErrMessages].map(([name, value]) => ({ name, value }));
    if (errors && errors.length > 0) {
      const errorDetails: ChannelErrorNotifierModel[] = [{
        path: this.getChannelPath(),
        channelId: this.channel.IdCommConfig,
        tabName: this.channel.Description,
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

  createFormGroup() {
    this.communicationSettingsFormGroup = new FormGroup({});
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
      if (property === 'Protocol')
        formControl.disable();
      this.communicationSettingsFormGroup.addControl(property, formControl);
    }

    // This is required because all the properties are not loaded into the UI form and hence the form has missing values when bind to data object
    this.communicationSettingsFormGroup.setValue({
      Id: this.channel.Id,
      IdCommConfig: this.channel.IdCommConfig,
      Description: this.channel.Description,
      ComPort: this.channel.ComPort,
      BaudRate: this.channel.BaudRate,
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
      Purpose: 1
    });
  }

  private initInputLabelMap(): void {
    if (
      this.serialChannelSchema !== undefined &&
      this.serialChannelSchema !== null &&
      this.serialChannelSchema.properties !== undefined &&
      this.serialChannelSchema.properties !== null) {
      for (const property in this.serialChannelSchema.properties) {
        if (this.serialChannelSchema.properties.hasOwnProperty(property)) {
          const prop = this.serialChannelSchema.properties[property];
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
    }
    this.validateOnInit();
  }

  private subscribeSerialSettings() {
    let subscription = this.serialCannelProperties$.subscribe((state: ISerialChannelPropertiesState) => {
      if (state !== undefined && state != null) {
        if (state.isLoaded === false && !StateUtilities.hasErrors(state))   // Dispatch Action if not loaded
          this.store.dispatch(ACTIONS.SERIALCHANNELPROPERTIES_LOAD());
        else {
          this.serialChannelProperty = state.serialChannelProperties;
          this.setUpSerialPorts();
          this.ModbusRTUOverSerial = { Id: 1, Name: state.serialChannelProperties.Protocol[0] };
        }
      }
    });

    this.arrSubscriptions.push(subscription);
  }

  ngOnChanges() {
    this.setUpSerialPorts();
    this.validateOnInit();
  }

  ngOnDestroy(): void {
    if (this.arrSubscriptions != null && this.arrSubscriptions.length > 0) {
      this.arrSubscriptions.forEach(subscription => {
        if (subscription != null)
          subscription.unsubscribe();
      });
    }

    this.arrSubscriptions = [];
  }

  ngOnInit(): void {
    this.mapErrMessages.clear();
    this.serialChannelSchema = serialPortChannelSchema;
    this.createFormGroup();
    this.initInputLabelMap();
    this.subscribeSerialSettings();
    this.isValidForm();
    this.hasChanges();
    this.validateOnInit();
  }
}
