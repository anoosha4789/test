import { Injectable } from "@angular/core";
import { DeleteOrder, GaugeTypeUIModel } from "@core/models/UIModels/models.model";
import { Store } from "@ngrx/store";
import { StateUtilities } from "@store/state/IState";
import { IToolTypeState } from "@store/state/toolType.state";
import { BehaviorSubject, Observable, Subscription } from "rxjs";

import * as TOOLTYPE_ACTIONS from '@store/actions/toolType.action';
import * as ACTIONS from '@store/actions/dataSources.entity.action';
import * as TOOL_CONNECTION_ACTIONS from '@store/actions/tool-connection.entity.action';

import { selectAllDataSources, selectDataSourcesState } from "@store/reducers/dataSources.entity.reducer";
import { IDataSourceEntityState } from "@store/state/dataSources.state";
import { DataSourceUIModel } from "@core/models/UIModels/dataSource.model";
import { CommunicationChannelType, PanelTypeList, UICommon } from "@core/data/UICommon";
import { SerialPortCommunicationChannelDataUIModel } from "@core/models/webModels/SerialPortCommunicationChannelDataUIModel.model";
import { SureSENSGaugeDataModel, SureSENSToolType, SureSENS_ESP_Type } from "@core/models/webModels/SureSENSGaugeData.model";
import { InterfaceCardDataUIModel } from "@core/models/webModels/InterfaceCardDataUIModell.model";
import { ErrorMessages } from "@core/data/ErrorMessages";
import { Validator } from "jsonschema";
import { serialPortChannelSchema } from "@core/models/schemaModels/SerialPortCommunicationChannelDataUIModel.schema";
import { interfaceCardSchema } from "@core/models/schemaModels/InterfaceCardDataUIModel.schema";
import { String } from 'typescript-string-operations';
import * as _ from "lodash";
import { DeleteObjectTypesEnum } from "@core/models/webModels/DeleteObjectTypesEnum";
import { ToolConnectionUIModel } from "@core/models/UIModels/tool-connection.model";
import { selectAllToolConnections, selectToolConnetionState } from "@store/reducers/tool-connection.entity.reducer";
import { IToolConnecionState } from "@store/state/tool-connection.state";
import { ToolConnectionModel } from "@core/models/webModels/ToolConnection.model";
import { take } from "rxjs/operators";
import { Update } from "@ngrx/entity";
import { AbstractControl, ValidatorFn } from "@angular/forms";
import { CardErrorNotifierModel, ChannelErrorNotifierModel } from "@core/models/UIModels/error-notifier-model";
import { SureSENSGaugeDataUIModel } from "@core/models/webModels/SureSENSGaugeDataUIModel.model";
import { SurefloFacade } from "./surefloFacade.service";
import { TcpIpCommunicationChannelDataUIModel } from "@core/models/webModels/TcpIpCommunicationChannelDataUIModel.model";
import { tcpChannelSchema } from "@core/models/schemaModels/TcpCommunicationChannelDataUIModel.schema";

@Injectable({
  providedIn: 'root',
})
export class DataSourceFacade {
  // Store Observables
  private toolTypesModel$: Observable<IToolTypeState>;

  // State objects
  toolTypesStore: GaugeTypeUIModel[] = [];

  // Store Entity objects
  dataSourcesEntity: DataSourceUIModel[];
  toolConnectionEntity: ToolConnectionUIModel[] = [];

  // State Objects BehaviorSubject variables
  private toolTypessSubject = new BehaviorSubject<GaugeTypeUIModel[]>([]);
  private dataSourceSubject = new BehaviorSubject<DataSourceUIModel[]>([]);
  private toolConnectionSubject = new BehaviorSubject<ToolConnectionUIModel[]>([]);

  private newDataSource: DataSourceUIModel;

  // State Objects subscriptions variables
  private toolTypeSubscription: Subscription = null;
  private dataSourceSubscription: Subscription = null;
  private toolConnectionSubscription: Subscription = null;

  constructor(protected store: Store<any>, protected sureFLOFacade: SurefloFacade) {
    this.toolTypesModel$ = this.store.select<any>((state: any) => state.toolTypesState);
  }

  // setup subscriptions
  private subscribeToToolTypes(): void {
    if (this.toolTypeSubscription == null) {
      this.toolTypeSubscription = this.toolTypesModel$.subscribe((state: IToolTypeState) => {
        if (state !== undefined) {
          if (state.isLoaded === false && !StateUtilities.hasErrors(state))   // Dispatch Action if not loaded
            this.store.dispatch(TOOLTYPE_ACTIONS.TOOLTYPES_LOAD());
          else {
            this.toolTypesStore = state.toolTypes;
            this.toolTypessSubject.next(this.toolTypesStore);
          }
        }
      });
    }
  }

  private subscribeToCommunicationChannelEntityStore() {
    if (this.dataSourceSubscription == null) {
      this.dataSourceSubscription = this.store.select<any>(selectDataSourcesState).subscribe((state: IDataSourceEntityState) => {
        if (!state.isLoaded) {
          this.store.dispatch(ACTIONS.DATASOURCES_LOAD());
        }
        else {
          this.store.select<any>(selectAllDataSources).subscribe(sources => {
            this.dataSourcesEntity = _.cloneDeep(sources);
            if (this.dataSourcesEntity.length > 0) {
              this.mapCardName();
            }
            this.dataSourceSubject.next(this.dataSourcesEntity);
          });
        }
      });
    }
  }

  // Hold Database Value of Card Description
  mapCardName() {
    this.dataSourcesEntity.forEach((dataSource) => {
      // map currentCardName
      if (dataSource.Cards.length > 0) {
        dataSource.Cards.forEach((card) => {
          let cardNameInvalid = false;
          if (dataSource.cardError && dataSource.cardError.length > 0) {
            const cardError: CardErrorNotifierModel = dataSource.cardError.find(error => error.deviceId === card.DeviceId);
            if (cardError) {
              cardNameInvalid = cardError.errors.findIndex(e => e.name === 'Description') == -1 ? false : true;
            }
          }
          card.currentCardName = cardNameInvalid || card.Description == '' ? card.currentCardName : card.Description
        });
      }
    });
    return this.dataSourcesEntity;
  }

  private subscribeToolConnections(): void {
    if (this.toolConnectionSubscription == null) {
      this.toolConnectionSubscription = this.store.select<any>(selectToolConnetionState).subscribe((state: IToolConnecionState) => {
        if (!state || !state.isLoaded) {
          this.store.dispatch(TOOL_CONNECTION_ACTIONS.TOOL_CONNECTIONS_LOAD());
        }
        else {
          this.store.select<any>(selectAllToolConnections).subscribe(toolConnections => {
            this.toolConnectionEntity = _.cloneDeep(toolConnections);
            this.toolConnectionSubject.next(this.toolConnectionEntity);
          });
        }
      });
    }
  }

  getNewDataSource(Id: number, communicationType: number = 0, protocolId?: number): DataSourceUIModel {
    if (communicationType === 0) {
      const channel: SerialPortCommunicationChannelDataUIModel = {
        Id: -Id,
        IdCommConfig: -Id,
        Description: '',
        ComPort: -1,
        BaudRate: 19200,
        DataBits: 0,
        StopBits: 0,
        Parity: 0,
        PortNamePath: '',
        SupportSoftwareFlowControl: false,
        FlowControlTimeIntervalInMs: 0,
        channelType: 0,
        TimeoutInMs: 2000,
        Retries: 3,
        PollRateInMs: 1000,
        Protocol: 1,
        SinglePollRateMode: false,
        Purpose: 1
      };

      this.newDataSource = {
        Channel: channel,
        Cards: [],
        IsValid: true,
        IsDirty: true,
        channelError: Array<ChannelErrorNotifierModel>(),
        cardError: Array<CardErrorNotifierModel>()
      };
    } else {
      const channel: TcpIpCommunicationChannelDataUIModel = {
        Id: -Id,
        IdCommConfig: -Id,
        IpAddress: '',
        // IpPortNumber: protocolId === 2 ? 502 : 17242,
        IpPortNumber: 17242,
        SupportSoftwareFlowControl: false,
        FlowControlTimeIntervalInMs: 0,
        Description: 'TCP/IP Communication Channel',
        PollRateInMs: 1000,
        Protocol: protocolId,
        Retries: 3,
        SinglePollRateMode: false,
        TimeoutInMs: 2000,
        channelType: 1,
        Purpose: 1
      };

      this.newDataSource = {
        Channel: channel,
        Cards: [],
        IsValid: true,
        IsDirty: true,
        channelError: Array<ChannelErrorNotifierModel>(),
        cardError: Array<CardErrorNotifierModel>()
      };
    }
    return this.newDataSource;
  }

  getToolGauge(commConfigId: number, cardDeviceId: number, toolGaugeId: number): SureSENSGaugeDataModel {
    let toolGauge: SureSENSGaugeDataModel = null;
    if (this.dataSourcesEntity) {
      let inxGauge = this.dataSourcesEntity.findIndex(d => d.Channel.IdCommConfig == commConfigId) ?? -1;
      if (inxGauge != -1) {
        let inxCard = this.dataSourcesEntity[inxGauge].Cards.findIndex(c => c.CommConfigId === commConfigId && c.DeviceId == cardDeviceId) ?? -1;
        if (inxCard != -1) {
          let inxTool = this.dataSourcesEntity[inxGauge].Cards[inxCard].Gauges.findIndex(g => g.DeviceId == toolGaugeId) ?? -1;
          if (inxTool != -1)
            toolGauge = this.dataSourcesEntity[inxGauge].Cards[inxCard].Gauges[inxTool];
        }
      }
    }

    return toolGauge;
  }

  isESPTool(toolGauge: any): boolean {
    let isESPGauge = false;
    if (toolGauge && toolGauge.GaugeType !== SureSENSToolType.ESP) {
      return false;
    }

    if (toolGauge && (toolGauge.EspGaugeType != null)) {
      isESPGauge = toolGauge.EspGaugeType !== SureSENS_ESP_Type.None;
    }
    return isESPGauge;
  }

  IsSupportInChargePowerSupplyModule(panelTypeId: number): boolean {
    return panelTypeId === PanelTypeList.InCHARGE ? true : false;
  }

  validateGauges(cardGauges: SureSENSGaugeDataModel[]): boolean {
    let gauges = cardGauges ?? [];

    if (gauges.length == 0)
      return false;

    for (let i = 0; i < gauges.length; i++) {
      if (gauges[i].SerialNumber == null || gauges[i].SerialNumber == "")
        return false;

      if (gauges[i].GaugeType != 5) {
        if (gauges[i].PressureCoefficientFileContent == null || gauges[i].PressureCoefficientFileContent.length == 0)
          return false;

        if (gauges[i].TemperatureCoefficientFileContent == null || gauges[i].TemperatureCoefficientFileContent.length == 0)
          return false;
      }
    }

    return true;
  }

  private validateCardName(selectedCard: InterfaceCardDataUIModel) {
    let errMssg = null;
    let defaultErrMssg = "{0} - Invalid data";

    let index = this.dataSourcesEntity.findIndex(s => s.Channel.IdCommConfig === selectedCard.CommConfigId);
    let dataSource = index == -1 ? this.newDataSource : this.dataSourcesEntity[index];
    let sourceName = index == -1 ? String.Format("Source {0}", this.dataSourcesEntity.length + 1) : String.Format("Source {0}", index + 1);

    for (let i = 0; i < dataSource.Cards.length; i++) {
      if (dataSource.Cards[i].DeviceId == selectedCard.DeviceId)
        continue;

      if (dataSource.Cards[i].Description.toLowerCase() === selectedCard.Description.toLowerCase()) {   // Check Card Name
        // errMssg = String.Format(defaultErrMssg, sourceName);  // default error message
        // let error = ErrorMessages.Errors.GetError(ErrorMessages.PageName.Cards, "Description", "duplicate");
        // if (error !== undefined && error != null)
        //   errMssg = String.Format(error.Message, dataSource.Cards[i].Description);
        errMssg = 'Name already exists.';

        return errMssg;
      }
    }

    return errMssg;
  }

  private validateCardAddress(selectedCard: InterfaceCardDataUIModel): string {
    let errMssg = null;
    let defaultErrMssg = "{0} - Invalid data";

    let index = this.dataSourcesEntity.findIndex(s => s.Channel.IdCommConfig === selectedCard.CommConfigId);
    let dataSource = index == -1 ? this.newDataSource : this.dataSourcesEntity[index];
    let sourceName = index == -1 ? String.Format("Source {0}", this.dataSourcesEntity.length + 1) : String.Format("Source {0}", index + 1);

    for (let i = 0; i < dataSource.Cards.length; i++) {
      if (dataSource.Cards[i].DeviceId == selectedCard.DeviceId)
        continue;

      if (dataSource.Cards[i].CardAddress === selectedCard.CardAddress) {   // Check Card Address
        // errMssg = String.Format(defaultErrMssg, sourceName);  // default error message
        // let error = ErrorMessages.Errors.GetError(ErrorMessages.PageName.Cards, "CardAddress", "duplicate");
        // if (error !== undefined && error != null)
        //   errMssg = String.Format(error.Message, dataSource.Cards[i].CardAddress);
        errMssg = 'Address already exists.';
        return errMssg;
      }
    }

    return errMssg;
  }

  private validateSelectedCard(selectedCard: InterfaceCardDataUIModel, bValidateGauges: boolean = false): string {
    let errMssg = this.validateCardName(selectedCard);
    if (errMssg != null)
      return errMssg;

    errMssg = this.validateCardAddress(selectedCard);
    if (errMssg != null)
      return errMssg;

    if (bValidateGauges && !this.validateGauges(selectedCard.Gauges)) {
      // errMssg = String.Format("{0} - Invalid data", selectedCard.Description);  // default error message
      // let error = ErrorMessages.Errors.GetError(ErrorMessages.PageName.Tools, "GaugeDetails", "required");
      // if (error !== undefined && error != null)
      //   errMssg = error.Message;
      errMssg = 'Required Field.';
      return errMssg;
    }

    return errMssg;
  }

  getDataSourceName(Channel) {
    if (Channel) {
      return Channel.channelType == CommunicationChannelType.SERIAL ? Channel.Description : String.Format("{0}:{1}",
        (Channel as TcpIpCommunicationChannelDataUIModel).IpAddress,
        (Channel as TcpIpCommunicationChannelDataUIModel).IpPortNumber)
    }
    return "";
  }

  validateDataSource(dataSource: DataSourceUIModel): string {
    let errMssg = null;

    let validator = new Validator();
    let schema = dataSource.Channel.channelType === CommunicationChannelType.SERIAL ? serialPortChannelSchema : tcpChannelSchema;
    let result = validator.validate(
      dataSource.Channel,
      schema
    );
    if (!result.valid) {
      errMssg = String.Format("{0} - {1}", result.errors[0].property.replace("instance.", ""), result.errors[0].message);
      return errMssg;
    }
    if (dataSource.channelError && dataSource.channelError.length > 0) {
      for (let i = 0; i < dataSource.channelError.length; i++) {
        const data = dataSource.channelError[i];
        for (let j = 0; j < data.errors.length; j++) {
          const error = data.errors[j];
          if (error.name === "ComPort") {
            errMssg = error.value;
            return errMssg;
          }
          if (error.name === "IpAddress" || error.name === "IpPortNumber") {
            errMssg = error.value;
            return errMssg;
          }
        }
      }
    }
    if (dataSource.Cards.length == 0) { // No Cards added yet
      errMssg = "No Cards added to the data source";
      return errMssg;
    }

    validator = new Validator();  // reinitialize
    for (let i = 0; i < dataSource.Cards.length; i++) {
      result = validator.validate(dataSource.Cards[i], interfaceCardSchema);
      if (!result.valid) {
        errMssg = String.Format("{0} - {1}", result.errors[0].property.replace("instance.", ""), result.errors[0].message);
        return errMssg;
      }

      errMssg = this.validateSelectedCard(dataSource.Cards[i], true);
      if (errMssg !== undefined && errMssg != null)
        return errMssg;
    }

    return errMssg;
  }

  validateDataSources(dataSources: DataSourceUIModel[]): boolean {
    let bIsValid = true;
    for (let i = 0; i < dataSources.length; i++) {
      if (this.validateDataSource(dataSources[i]) != null) {
        bIsValid = false;
        break;
      }
    }

    return bIsValid;
  }

  // Data Source common methods
  saveDataSource(dataSource: DataSourceUIModel): void {
    const action = { dataSource: dataSource };
    if (this.newDataSource) {
      this.store.dispatch(ACTIONS.DATASOURCES_ADD(action));
    } else {
      this.store.dispatch(ACTIONS.DATASOURCES_UPDATE(action));
      // GATE - 1254 Card or Tool Name update 
      if (dataSource) {
        const data = this.toolConnectionEntity.filter(tc => tc.ChannelId === dataSource.Channel.IdCommConfig);
        let toolConnectionList: Update<ToolConnectionModel>[] = [];
        if (dataSource) {
          dataSource.Cards.forEach(card => {
            if (data && data.length > 0) {
              data.forEach(tc => {
                if (card.DeviceId === tc.CardDeviceId) {
                  const gauge = card.Gauges.find(g => g.DeviceId === tc.DeviceId);
                  toolConnectionList.push(
                    {
                      id: tc.Id,
                      changes: {
                        CardDeviceName: card.Description,
                        ChannelName: dataSource.Channel.Description,
                        DeviceName: gauge.Description
                      }
                    }
                  );
                }
              });
            }
          });
        }
        this.store.dispatch(TOOL_CONNECTION_ACTIONS.TOOL_CONNECTIONS_UPDATE_CARD_TOOL_NAME({ toolConnection: toolConnectionList }));
        this.sureFLOFacade.updateSureFLOMeterPTMappings(this.toolConnectionEntity);
      }
    }
    this.newDataSource = null;
  }

  updateToolName(gauges, deviceId) {
    const gauge = gauges.find(g => g.DeviceId === deviceId);
    return gauge.Description;
  }

  deleteDataSource(idDevice: number, idCommConfig, deviceName: string): void {
    let index = this.dataSourcesEntity.findIndex(d => d.Channel.IdCommConfig === idCommConfig) ?? -1;
    if (index != -1) {
      let channelInfo = _.cloneDeep(this.dataSourcesEntity[index].Channel);
      this.store.dispatch(ACTIONS.DATASOURCES_DELETE({ idComConfig: idDevice }));
      if (idDevice > -1) { // push only if saved datasource
        let children = [];
        let deletedCards = UICommon.deletedObjects.filter(c => c.parentId === idCommConfig) ?? [];
        if (deletedCards.length > 0) {
          deletedCards.forEach(delCard => {
            let inx = UICommon.deletedObjects.findIndex(c => c.parentId === idCommConfig && c.id === delCard.id) ?? -1;
            if (inx != -1) {
              children.push(UICommon.deletedObjects[inx]);
              UICommon.deletedObjects.splice(inx, 1);
            }
          });
        }
        UICommon.deletedObjects.push({
          deleteOrder: DeleteOrder.Channel,
          id: idCommConfig,
          name: deviceName,
          data: channelInfo,
          objectType: DeleteObjectTypesEnum.Channel,
          children: children
        });
      }
    }
  }

  deleteCard(idDevice: number, idCard: number, cardName: string): void {
    let index = this.dataSourcesEntity.findIndex(d => d.Channel.IdCommConfig === idDevice) ?? -1;
    if (index != -1) {
      let cardIndex = this.dataSourcesEntity[index].Cards.findIndex(c => c.CommConfigId === idDevice && c.DeviceId == idCard) ?? -1;
      if (cardIndex != -1) {
        if (idCard > -1) {// push only if saved card
          let deleteCard = {
            deleteOrder: DeleteOrder.InterfaceCard,
            id: idCard,
            parentId: idDevice,
            name: cardName,
            data: _.cloneDeep(this.dataSourcesEntity[index].Cards[cardIndex]),
            objectType: DeleteObjectTypesEnum.InterfaceCard,
            children: []
          }

          // Delete already deleted gauges for the card being deleted.
          let deletedGauges = UICommon.deletedObjects.filter(z => z.parentId === idCard) ?? [];
          if (deletedGauges.length > 0) {
            deletedGauges.forEach(delGauge => {
              let inx = UICommon.deletedObjects.findIndex(g => g.parentId === idCard && g.id === delGauge.id) ?? -1;
              if (inx != -1)
                UICommon.deletedObjects.splice(inx, 1);
            });
          }

          // Add Gauges to deleted Card children to show in Configuration Summary dialog
          this.dataSourcesEntity[index].Cards[cardIndex].Gauges.forEach(delGauge => {
            deleteCard.children.push({
              deleteOrder: DeleteOrder.Gauge,
              id: delGauge.DeviceId,
              name: String.Format("{0} - {1}", cardName, delGauge.Description),
              data: delGauge,
              objectType: DeleteObjectTypesEnum.Gauge
            })
          });

          UICommon.deletedObjects.push(deleteCard);
        }
        this.dataSourcesEntity[index].Cards.splice(cardIndex, 1);
        const action = { dataSource: this.dataSourcesEntity[index] };
        this.store.dispatch(ACTIONS.DATASOURCES_UPDATE(action));
      }
    }
  }

  deleteGauge(gaugeId: number, cardDeviceId: number, gauge: SureSENSGaugeDataUIModel): void {
    if (gaugeId > -1) {// push only if saved gauge
      UICommon.deletedObjects.push({
        deleteOrder: DeleteOrder.Gauge,
        id: gaugeId,
        parentId: cardDeviceId,
        name: gauge.Description,
        data: gauge,
        objectType: DeleteObjectTypesEnum.Gauge
      });
    }
  }

  saveToolConnection(toolConnection: ToolConnectionUIModel): void {
    const action = { toolConnection: toolConnection };
    const toolConnIdx = this.toolConnectionEntity.length > 0 ?
      this.toolConnectionEntity.findIndex(tc => tc.Id === toolConnection.Id) : -1;
    if (toolConnIdx === -1) {
      this.store.dispatch(TOOL_CONNECTION_ACTIONS.TOOL_CONNECTIONS_CREATE(action));
    } else {
      this.store.dispatch(TOOL_CONNECTION_ACTIONS.TOOL_CONNECTIONS_UPDATE(action));
    }

  }

  deleteToolConnection(toolConnId: number, deviceId: number): void {
    let inxToolConn = this.toolConnectionEntity.findIndex(t => t.Id === toolConnId) ?? -1;
    if (inxToolConn != -1) {
      let toolConnection = _.cloneDeep(this.toolConnectionEntity[inxToolConn]);
      this.store.dispatch(TOOL_CONNECTION_ACTIONS.TOOL_CONNECTIONS_DELETE({ deviceId: toolConnId }));
      if (toolConnId > -1)
        UICommon.deletedObjects.push({ deleteOrder: DeleteOrder.ToolConnections, id: toolConnId, parentId: deviceId, name: "", data: toolConnection, objectType: DeleteObjectTypesEnum.ToolConnections });
    }
  }

  // initialize subscription methods
  public initToolTypes(): BehaviorSubject<GaugeTypeUIModel[]> {
    if (this.toolTypesStore == null || this.toolTypesStore.length == 0)
      this.subscribeToToolTypes();

    return this.toolTypessSubject;
  }

  public initDataSources(): BehaviorSubject<DataSourceUIModel[]> {
    if (this.dataSourcesEntity == null || this.dataSourcesEntity.length == 0)
      this.subscribeToCommunicationChannelEntityStore();

    return this.dataSourceSubject;
  }

  public initToolConnections(): BehaviorSubject<ToolConnectionUIModel[]> {
    if (this.toolConnectionEntity == null || this.toolConnectionEntity.length == 0)
      this.subscribeToolConnections();

    return this.toolConnectionSubject;
  }

  // Unsubscribe subscriptions/Reset subscriptions
  public unSubscribeDataSourceSubscription(): void {
    if (this.toolTypeSubscription != null)
      this.toolTypeSubscription.unsubscribe();

    if (this.dataSourceSubscription != null)
      this.dataSourceSubscription.unsubscribe();

    if (this.toolConnectionSubscription != null)
      this.toolConnectionSubscription.unsubscribe();

    // Reset state/entity objects here
    this.toolTypesStore = [];
    this.dataSourcesEntity = [];
    this.toolConnectionEntity = [];
    UICommon.ipAddressesInUse = [];
  }

  // Custom Form Validation functions
  validateCardNameValidator(selectedCard: InterfaceCardDataUIModel): ValidatorFn {
    return (c: AbstractControl): { [key: string]: any } | null => {
      if (c.value === undefined || c.value == null || c.value == '')
        return null;
      let card = Object.assign({}, selectedCard)
      card.Description = c.value;
      let errMssg = this.validateCardName(card);
      if (errMssg != null)
        return { customError: errMssg };

      return null;
    };
  }

  validateCardAddressValidator(selectedCard: InterfaceCardDataUIModel): ValidatorFn {
    return (c: AbstractControl): { [key: string]: any } | null => {
      if (c.value === undefined || c.value == null || c.value == '')
        return null;

      let errMssg = this.validateCardAddress(selectedCard);
      if (errMssg != null)
        return { customError: errMssg };

      return null;
    };
  }
}