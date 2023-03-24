import { Injectable } from "@angular/core";
import { ModbusConfigurationModelUI2, PublishingDataUIModel } from "@core/models/UIModels/dataPublishing.model";
import { Store } from "@ngrx/store";
import { selectAllPublishings, selectPublishingState } from "@store/reducers/publishing.entity.reducer";
import { IPublishingEntityState } from "@store/state/publishing.state";
import { String } from 'typescript-string-operations';

import * as MODBUS_PROTOCOL_ACTIONS from '@store/actions/modbusProtocol.action';
import * as MAPTEMPLATE_DETAILS_ACTIONS from '@store/actions/mapTemplateDetails.action';
import * as PUBLISHING_ACTIONS from '@store/actions/publishing.entity.action';

import * as _ from "lodash";
import { BehaviorSubject, Observable, Subscription } from "rxjs";
import { IModbusProtocolState } from "@store/state/modbusProtocol.state";
import { StateUtilities } from "@store/state/IState";
import { ModbusProtocolModel } from "@core/models/UIModels/ModbusProtocol.model";
import { IRegisteredModbusMapState } from "@store/state/mapTemplateDetails.state";
import { ModbusMapTemplateUIModel } from "@core/models/UIModels/modbusTemplate.model";
import { SerialPortCommunicationChannelDataUIModel } from "@core/models/webModels/SerialPortCommunicationChannelDataUIModel.model";
import { TcpIpCommunicationChannelDataUIModel } from "@core/models/webModels/TcpIpCommunicationChannelDataUIModel.model";
import { CommunicationChannelType, PanelTypeList, SerialPortPurpose, UICommon } from "@core/data/UICommon";
import { Validator } from "jsonschema";
import { publishingDataModelSchema } from "@core/models/schemaModels/PublishingDataUIModel.schema";
import { modbusConfigurationSchema } from "@core/models/schemaModels/ModbusConfigurationUIModel.schema";
import { DeleteObjectTypesEnum } from "@core/models/webModels/DeleteObjectTypesEnum";
import { DeleteOrder } from "@core/models/UIModels/models.model";
import { AbstractControl, ValidatorFn } from "@angular/forms";

@Injectable({
  providedIn: 'root',
})
export class PublishingChannelFacade {
  // Store observables
  private modbusProtocols$: Observable<IModbusProtocolState>;
  private modbusTemplateDetails$: Observable<IRegisteredModbusMapState>;

  // State objects
  private modbusProtocols: ModbusProtocolModel[] = [];
  private modbusTemplateDetails: ModbusMapTemplateUIModel[] = [];

  // Store Entity objects
  private publishingEntity: PublishingDataUIModel[];
  private newDataPublishing: PublishingDataUIModel;

  // State Objects BehaviorSubject variables
  private modbusProtocolsSubject = new BehaviorSubject<ModbusProtocolModel[]>([]);
  private modbusTemplatesSubject = new BehaviorSubject<ModbusMapTemplateUIModel[]>([]);
  private dataPublishingSubject = new BehaviorSubject<PublishingDataUIModel[]>([]);
  private modbusTemplateDirtySubject = new BehaviorSubject<boolean>(false);

  // State Objects subscriptions variables
  private modbusProtocolSubscription: Subscription = null;
  private modbusTemplateSubscription: Subscription = null;
  private dataPublishingSubscription: Subscription = null;

  constructor(protected store: Store<any>) {
    this.modbusProtocols$ = this.store.select<any>((state: any) => state.modbusProtocolState);
    this.modbusTemplateDetails$ = this.store.select<any>((state: any) => state.mapTemplateDetailsState);
  }

  // setup subscriptions
  private subscribeToModbusProtocols(): void {
    if (this.modbusProtocolSubscription == null) {
      this.modbusProtocolSubscription = this.modbusProtocols$.subscribe((state: IModbusProtocolState) => {
        if (state !== undefined) {
          if (state.isLoaded === false && !StateUtilities.hasErrors(state))   // Dispatch Action if not loaded
            this.store.dispatch(MODBUS_PROTOCOL_ACTIONS.MODBUSPROTOCOL_LOAD());
          else {
            this.modbusProtocols = state.protocols;
            this.modbusProtocolsSubject.next(this.modbusProtocols);
          }
        }
      });
    }
  }

  private subscribeToMapTemplateDetails(): void {
    if (this.modbusTemplateSubscription == null || this.modbusTemplateDetails?.length == 0) {
      this.modbusTemplateSubscription = this.modbusTemplateDetails$.subscribe((state: IRegisteredModbusMapState) => {
        if (state !== undefined) {
          if (state.isLoaded === false && !StateUtilities.hasErrors(state))   // Dispatch Action if not loaded
            this.store.dispatch(MAPTEMPLATE_DETAILS_ACTIONS.MAPTEMPLATES_LOAD());
          else {
            this.modbusTemplateDetails = state.templates;
            this.modbusTemplatesSubject.next(this.modbusTemplateDetails);
            this.modbusTemplateDirtySubject.next(state.isDirty);
          }
        }
      });
    }
  }

  private subscribeToPublishingEntityStore() {
    if (this.dataPublishingSubscription == null) {
      this.dataPublishingSubscription = this.store.select<any>(selectPublishingState).subscribe((state: IPublishingEntityState) => {
        if (!state.isLoaded) {
          this.store.dispatch(PUBLISHING_ACTIONS.PUBLISHING_LOAD());
        }
        else {
          this.store.select<any>(selectAllPublishings).subscribe(publishings => {
            this.publishingEntity = _.cloneDeep(publishings);
            this.dataPublishingSubject.next(this.publishingEntity);
          });
        }
      });
    }
  }

  private getDefaultModbusMap(panelTypeId: number): DefaultModbusMap {
    let defaultMap: DefaultModbusMap = {
      MapId: 5,
      MapName: 'InCHARGE Default'
    };
    switch (panelTypeId) {
      case PanelTypeList.SURESENS:
        defaultMap = {
          MapId: 1,
          MapName: 'SureSENS Default'
        };
        break;

      case PanelTypeList.InCHARGE:
        defaultMap = {
          MapId: 5,
          MapName: 'InCHARGE Default'
        };
        break;

      case PanelTypeList.INFORCE:
        defaultMap = {
          MapId: 2,
          MapName: 'InFORCE Default'
        };
        break;

        case PanelTypeList.MultiNode:
        defaultMap = {
          MapId: 6,
          MapName: 'MultiNode Default'
        };
        break;
    }

    return defaultMap;
  }
  // Publishing common methods
  getNewDataPublishing(panelTypeId: number, Id: number, communicationType: number, protocolId?: number): PublishingDataUIModel {
    let defaultMap = this.getDefaultModbusMap(panelTypeId);
    if (communicationType === 0) {
      const channel: SerialPortCommunicationChannelDataUIModel = {
        Id: -Id,
        IdCommConfig: -Id,
        Description: '',
        ComPort: -1,
        BaudRate: 19200,
        DataBits: 8,
        StopBits: 1,
        Parity: 0,
        PortNamePath: '',
        SupportSoftwareFlowControl: false,
        FlowControlTimeIntervalInMs: 0,
        channelType: 0,
        TimeoutInMs: 2000,
        Retries: 3,
        PollRateInMs: 1000,
        Protocol: 1,                  // Modbus RTU Over Serial - Protocol = RTU
        SinglePollRateMode: false,
        Purpose: 2
      };

      this.newDataPublishing = {
        Id: -Id,
        Name: '',
        Channel: channel,
        SlaveId: 1,
        Serial: null,
        Tcp: null,
        ModbusDeviceMap: [],
        UnitSystem: 'English',
        IsForModbusMaster: false,
        Endianness: 2,
        WordOrder: 'MSW-LSW',
        ByteOrder: 'MSB-LSB',
        IsBytesSwapped: 0,
        RegisteredModbusMapId: defaultMap.MapId,
        ModbusConfigurationId: channel.Id,
        ConnectionTo: 'SCADA',
        MapType: defaultMap.MapName,
        IsValid: true,
        IsDirty: true
      };
    }
    else {
      const channel: TcpIpCommunicationChannelDataUIModel = {
        Id: -Id,
        IdCommConfig: -Id,
        IpAddress: '',
        IpPortNumber: 502,
        SupportSoftwareFlowControl: false,
        FlowControlTimeIntervalInMs: 0,
        Description: 'TCP publisher',
        PollRateInMs: 1000,
        Protocol: protocolId,
        Retries: 3,
        SinglePollRateMode: false,
        TimeoutInMs: 2000,
        channelType: 1,
        Purpose: 2
      };

      this.newDataPublishing = {
        Id: -Id,
        Name: '',
        Channel: channel,
        SlaveId: 1,
        Serial: null,
        Tcp: null,
        ModbusDeviceMap: [],
        UnitSystem: 'English',
        IsForModbusMaster: false,
        Endianness: 2,
        WordOrder: 'MSW-LSW',
        ByteOrder: 'MSB-LSB',
        IsBytesSwapped: 0,
        RegisteredModbusMapId: defaultMap.MapId,
        ModbusConfigurationId: channel.Id,
        ConnectionTo: 'SCADA',
        MapType: defaultMap.MapName,
        IsValid: true,
        IsDirty: true
      };
    }

    return this.newDataPublishing;
  }

  public getModbusProtocolName(protocolId: number, channelType: CommunicationChannelType) {
    let protocolName = "";
    if (this.modbusProtocols && this.modbusProtocols.length > 0) {
      if (channelType === CommunicationChannelType.SERIAL) {
        protocolName = this.modbusProtocols[0].Name;
      }
      else {
        let inxProtocol = this.modbusProtocols.findIndex(p => p.modbusProtocol === protocolId) ?? -1;
        if (inxProtocol != -1)
          protocolName = this.modbusProtocols[inxProtocol].Name;
      }
    }

    return protocolName;
  }

  getPublishingName(publishing: PublishingDataUIModel) {
    if (publishing.Channel.channelType == CommunicationChannelType.SERIAL) {
      return {
        Name: (publishing.Channel as SerialPortCommunicationChannelDataUIModel).Description,
        Protocol: this.getModbusProtocolName(publishing.Channel.Protocol, publishing.Channel.channelType),
        ConnectedTo: publishing.ConnectionTo
      }
    }
    else {
      publishing.Channel as TcpIpCommunicationChannelDataUIModel;
      return {
        Name: String.Format("{0}:{1}",
          (publishing.Channel as TcpIpCommunicationChannelDataUIModel).IpAddress,
          (publishing.Channel as TcpIpCommunicationChannelDataUIModel).IpPortNumber),
        Protocol: this.getModbusProtocolName(publishing.Channel.Protocol, publishing.Channel.channelType),
        ConnectedTo: publishing.ConnectionTo
      }
    }
  }

  saveDataPublishing(dataPublishing: PublishingDataUIModel): void {
    const action = {
      publishing: dataPublishing
    };

    if (this.newDataPublishing) {
      this.store.dispatch(PUBLISHING_ACTIONS.PUBLISHING_ADD(action));
    } else {
      this.store.dispatch(PUBLISHING_ACTIONS.PUBLISHING_UPDATE(action));
    }
    this.newDataPublishing = null;
  }

  deleteDataPublishing(publishingId: number, publishing: PublishingDataUIModel) {
    if (publishingId > -1) {
      UICommon.deletedObjects.push({
        deleteOrder: DeleteOrder.ModbusConfiguration,
        id: publishingId,
        name: publishing.Name,
        data: publishing,
        objectType: DeleteObjectTypesEnum.ModbusConfiguration
      });
    }
    this.store.dispatch(PUBLISHING_ACTIONS.PUBLISHING_DELETE({ idPublishing: publishingId }));
  }

  validatePublishingPortNumber(publishing: PublishingDataUIModel): boolean {
    let bIsValid = true;
    // if (this.publishingEntity && this.publishingEntity.length > 0) {
    //   for (let i = 0; i < this.publishingEntity.length; i++) {
    //     if (this.publishingEntity[i].Id == publishing.Id)
    //       continue;

    //     if (this.publishingEntity[i].Channel.channelType == CommunicationChannelType.TCPIP) {
    //       if ((this.publishingEntity[i].Channel as TcpIpCommunicationChannelDataUIModel).IpPortNumber == (publishing.Channel as TcpIpCommunicationChannelDataUIModel).IpPortNumber) {
    //         bIsValid = false;
    //         break;
    //       }
    //     }
    //   }
    // }
    let isIpAddressInUse = UICommon.ipAddressesInUse.find((data) => data.id !== (publishing.Channel as TcpIpCommunicationChannelDataUIModel).IdCommConfig && data.ipAddress === (publishing.Channel as TcpIpCommunicationChannelDataUIModel).IpAddress && data.portNumber === (publishing.Channel as TcpIpCommunicationChannelDataUIModel).IpPortNumber);

    if (isIpAddressInUse) {
      return false;
    }
    return bIsValid;
  }

  validateDataPublishing(dataPublishing: PublishingDataUIModel): string {
    let errMssg = null;
    const validator = new Validator();
    if (dataPublishing.Channel.channelType == CommunicationChannelType.SERIAL) {
      const result = validator.validate(dataPublishing.Channel, publishingDataModelSchema.definitions.SerialPortCommunicationChannelDataModel);
      if (!result.valid) {
        errMssg = String.Format('{0} - {1}', result.errors[0].property.replace('instance.', ''), result.errors[0].message);
        return errMssg;
      }

      if (dataPublishing.Error && dataPublishing.Error.length > 0) {
        for (let i = 0; i < dataPublishing.Error.length; i++) {
          const data = dataPublishing.Error[i];
          for (let j = 0; j < data.errors.length; j++) {
            const error = data.errors[j];
            if (error.name === "ComPort") {
              errMssg = error.value;
              return errMssg;
            }
          }
        }
      }
    }
    else {
      const result = validator.validate(dataPublishing.Channel, publishingDataModelSchema.definitions.TcpIpCommunicationChannelDataModel);
      if (!result.valid) {
        errMssg = String.Format('{0} - {1}', result.errors[0].property.replace('instance.', ''), result.errors[0].message);
        return errMssg;
      }

      if (!this.validatePublishingPortNumber(dataPublishing)) {
        //errMssg = String.Format('{0} - {1}', dataPublishing.Channel.Description, "Same IP Address and Port Number are already configured.");
        errMssg = 'Ip Address & Port are used.';
        return errMssg;
      }
    }

    const result = validator.validate(dataPublishing, modbusConfigurationSchema);
    if (!result.valid) {
      errMssg = String.Format('{0} - {1}', result.errors[0].property.replace('instance.', ''), result.errors[0].message);
      return errMssg;
    }

    return errMssg;
  }

  validateDataPublishings(dataPublishingList: PublishingDataUIModel[]): boolean {
    let bIsValid = true;
    for (let i = 0; i < dataPublishingList.length; i++) {
      if (this.validateDataPublishing(dataPublishingList[i]) != null) {
        bIsValid = false;
        break;
      }
    }

    return bIsValid;
  }

  public getModbusTemplateDirtyStatus(): BehaviorSubject<boolean> {
    return this.modbusTemplateDirtySubject;
  }

  // initialize subscription methods
  public initModbusProtocols(): BehaviorSubject<ModbusProtocolModel[]> {
    if (this.modbusProtocols == null || this.modbusProtocols.length == 0)
      this.subscribeToModbusProtocols();

    return this.modbusProtocolsSubject;
  }

  public initModbusMapTemplateDetails(): BehaviorSubject<ModbusMapTemplateUIModel[]> {
    if (this.modbusTemplateDetails == null || this.modbusTemplateDetails.length == 0)
      this.subscribeToMapTemplateDetails();

    return this.modbusTemplatesSubject;
  }

  public initDataPublishing(): BehaviorSubject<PublishingDataUIModel[]> {
    if (this.publishingEntity == null || this.publishingEntity.length == 0)
      this.subscribeToPublishingEntityStore();

    return this.dataPublishingSubject;
  }

  // Unsubscribe subscriptions/Reset subscriptions
  public unSubscribePublishingSubscription(): void {
    if (this.modbusProtocolSubscription != null) {
      this.modbusProtocolSubscription.unsubscribe();
      this.modbusProtocolSubscription = null;
    }

    if (this.modbusTemplateSubscription != null)
      this.modbusTemplateSubscription.unsubscribe();

    if (this.dataPublishingSubscription != null)
      this.dataPublishingSubscription.unsubscribe();

    // Reset state/entity objects here
    this.modbusProtocols = [];
    this.modbusTemplateDetails = [];
    this.publishingEntity = [];
    UICommon.ipAddressesInUse = [];
  }

  // Custom Form Validation functions
  public portIPPortsValidator(publishing: PublishingDataUIModel): ValidatorFn {
    return (c: AbstractControl): { [key: string]: any } | null => {
      if (c.value === undefined || c.value == null)
        return null;

      let isIpAddressInUse = UICommon.ipAddressesInUse.find((data) => data.id !== (publishing.Channel as TcpIpCommunicationChannelDataUIModel).IdCommConfig && data.ipAddress === (publishing.Channel as TcpIpCommunicationChannelDataUIModel).IpAddress && data.portNumber === c.value);

      if (isIpAddressInUse) {
        return { customError: "Ip Address & Port are used." };
      }      

      if (!this.validatePublishingPortNumber(publishing))
        return { customError: 'Ip Address & Port are used.' };

      return null;
    };
  }
}

class DefaultModbusMap {
  MapId: number;
  MapName: string;
}