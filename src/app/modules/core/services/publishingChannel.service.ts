import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '@env/environment';
import { Observable, Subject } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { GatewayBaseService } from './gatewayBase.service';
import { ModbusProtocolModel } from '@core/models/UIModels/ModbusProtocol.model';
import { RegisteredModbusMap } from '@core/models/UIModels/RegisteredModbusMap.model';
import { ModbusConfigurationModelsUI, ModbusConfigurationModelUI2, PublishingDataUIModel } from '@core/models/UIModels/dataPublishing.model';
import { CommunicationChannelType, UICommon } from '@core/data/UICommon';
import { SerialPortCommunicationChannelDataUIModel } from '@core/models/webModels/SerialPortCommunicationChannelDataUIModel.model';
import { TcpIpCommunicationChannelDataUIModel } from '@core/models/webModels/TcpIpCommunicationChannelDataUIModel.model';
import { ModbusDeviceConfigurationModelUI } from '@core/models/webModels/ModbusDeviceConfigurationModelUI.model';
import { ModbusSlaveRegisterMapUI } from '@core/models/webModels/ModbusSlaveRegisterMapUI.model';
import { ModbusMapSaveModel, ModbusMapTemplateUIModel, RegisteredModbusMapTypeEnum } from '@core/models/UIModels/modbusTemplate.model';


@Injectable({
  providedIn: 'root',
})
export class PublishingChannelService extends GatewayBaseService {
  private api = environment.webHostURL;
  private _modbusDeviceMap = new Subject<any>();

  constructor(protected http: HttpClient) {
    super(http);
  }

  setModbusDeviceMap() {
    this._modbusDeviceMap.next();
  }

  getModbusDeviceMap(): Subject<any> {
    return this._modbusDeviceMap;
  }

  getmodbusprotocols(): Observable<ModbusProtocolModel[]> {
    const results: Observable<ModbusProtocolModel[]> = this.http
      .get<ModbusProtocolModel[]>(this.api + 'api/modbus/getmodbusprotocols', {
        headers: this.headerDict,
      })
      .pipe(catchError(this.handleError));

    return results;
  }

  getRegisteredMapTemplates(): Observable<RegisteredModbusMap[]> {
    const results: Observable<RegisteredModbusMap[]> = this.http
      .get<RegisteredModbusMap[]>(this.api + 'api/modbus/getallmodbusmapnames', {
        headers: this.headerDict,
      })
      .pipe(catchError(this.handleError));

    return results;
  }

  getRegisteredModbusTemplateDetailsById(modbusId: number): Observable<any> {
    return this.http.get<any>(this.api + 'api/modbus/getmodbusmap/' + modbusId, { headers: this.headerDict }).pipe(
      catchError(this.handleError));
  }

  saveModbusMaps(modbusMapTemplate: ModbusMapTemplateUIModel): Observable<any> {
    let modbusSaveMap: ModbusMapSaveModel = {
      Id: modbusMapTemplate.Id,
      Name: modbusMapTemplate.MapName,
      MapRecords: modbusMapTemplate.MapRecords,
      MapTypeId: modbusMapTemplate.MapTypeId//modbusMapTemplate.Id == UICommon.DIAGNOSTICMAP_ID ? RegisteredModbusMapTypeEnum.Diagnostic : RegisteredModbusMapTypeEnum.Custom
    };
    return this.http.post(this.api + 'api/modbus/savecustommodbusmap', JSON.stringify(modbusSaveMap, this.replacer), { headers: this.headers }).pipe(
      catchError(this.handleError));
  }

  deleteModbusMap(mapid: number): Observable<any> {
    return this.http
      .post(this.api + 'api/modbus/deletecustommodbusmap', JSON.stringify(mapid), { headers: this.headers }).pipe(
        catchError(this.handleError));
  }

  getPublishing_UIModel(modbusConfigurations: ModbusConfigurationModelsUI): PublishingDataUIModel[] {
    let publishingChannels: PublishingDataUIModel[] = [];
    if (modbusConfigurations != null && modbusConfigurations.Configurations != null) {

      for (var key in modbusConfigurations.Configurations) {

        let modbusConfigModel = modbusConfigurations.Configurations[key];
        if (isNaN(parseInt(modbusConfigModel.toString()))) {
          let publishingChannel: PublishingDataUIModel;

          if (modbusConfigModel.Channel.channelType == CommunicationChannelType.SERIAL) { // && modbusConfigModel.Channel.Protocol == 0

            publishingChannel = new PublishingDataUIModel();
            publishingChannel.Id = modbusConfigModel.ModbusConfigurationId;

            let serialChannel = new SerialPortCommunicationChannelDataUIModel();
            serialChannel.channelType = modbusConfigModel.Channel.channelType;
            serialChannel.BaudRate = (<SerialPortCommunicationChannelDataUIModel>modbusConfigModel.Channel).BaudRate;
            serialChannel.ComPort = (<SerialPortCommunicationChannelDataUIModel>modbusConfigModel.Channel).ComPort;
            serialChannel.PollRateInMs = (<SerialPortCommunicationChannelDataUIModel>modbusConfigModel.Channel).PollRateInMs;
            serialChannel.Parity = (<SerialPortCommunicationChannelDataUIModel>modbusConfigModel.Channel).Parity;
            serialChannel.DataBits = (<SerialPortCommunicationChannelDataUIModel>modbusConfigModel.Channel).DataBits;
            serialChannel.Protocol = modbusConfigModel.Channel.Protocol;//(<configDataModel.SerialPortCommunicationChannelDataModel>configurationData.SureSENSInterfaceCardData[m].Channel).Protocol;
            serialChannel.StopBits = (<SerialPortCommunicationChannelDataUIModel>modbusConfigModel.Channel).StopBits;
            serialChannel.SinglePollRateMode = (<SerialPortCommunicationChannelDataUIModel>modbusConfigModel.Channel).SinglePollRateMode; //Continues: true
            serialChannel.Parity = (<SerialPortCommunicationChannelDataUIModel>modbusConfigModel.Channel).Parity;
            serialChannel.DataBits = (<SerialPortCommunicationChannelDataUIModel>modbusConfigModel.Channel).DataBits;
            serialChannel.StopBits = (<SerialPortCommunicationChannelDataUIModel>modbusConfigModel.Channel).StopBits;
            serialChannel.BaudRate = (<SerialPortCommunicationChannelDataUIModel>modbusConfigModel.Channel).BaudRate;
            serialChannel.Protocol = (<SerialPortCommunicationChannelDataUIModel>modbusConfigModel.Channel).Protocol;
            serialChannel.ComPort = (<SerialPortCommunicationChannelDataUIModel>modbusConfigModel.Channel).ComPort;
            serialChannel.PortNamePath = (<SerialPortCommunicationChannelDataUIModel>modbusConfigModel.Channel).PortNamePath;
            serialChannel.Description = (<SerialPortCommunicationChannelDataUIModel>modbusConfigModel.Channel).Description;
            serialChannel.IdCommConfig = Number(key);

            publishingChannel.Name = serialChannel.PortNamePath;
            publishingChannel.Channel = serialChannel;
          }
          else {
            publishingChannel = new PublishingDataUIModel();
            publishingChannel.Id = modbusConfigModel.ModbusConfigurationId;

            let tcpChannel = new TcpIpCommunicationChannelDataUIModel();
            tcpChannel.IpPortNumber = (<TcpIpCommunicationChannelDataUIModel>modbusConfigModel.Channel).IpPortNumber;
            tcpChannel.Protocol = modbusConfigModel.Channel.Protocol;
            tcpChannel.channelType = modbusConfigModel.Channel.channelType;
            tcpChannel.IpAddress = (<TcpIpCommunicationChannelDataUIModel>modbusConfigModel.Channel).IpAddress;
            tcpChannel.Protocol = (<TcpIpCommunicationChannelDataUIModel>modbusConfigModel.Channel).Protocol;
            tcpChannel.IdCommConfig = Number(key);

            publishingChannel.Name = tcpChannel.IpAddress + ":" + tcpChannel.IpPortNumber;
            publishingChannel.Channel = tcpChannel;
          }
          //new properties
          publishingChannel.ConnectionTo = modbusConfigModel.ConnectionTo;
          publishingChannel.SlaveId = modbusConfigModel.SlaveId;
          publishingChannel.MapType = modbusConfigModel.MapType;
          publishingChannel.Endianness = modbusConfigModel.Endianness;
          publishingChannel.IsBytesSwapped = modbusConfigModel.IsBytesSwapped;
          publishingChannel.WordOrder = modbusConfigModel.Endianness == 2 ? UICommon.WordOrderTypes[0] : UICommon.WordOrderTypes[1];
          if (modbusConfigModel.Endianness == 2)//MSW-LSW
          {
            if (modbusConfigModel.IsBytesSwapped == 0)
              publishingChannel.ByteOrder = UICommon.ByteOrderTypes[0];//msb-lsb
            else
              publishingChannel.ByteOrder = UICommon.ByteOrderTypes[1];//lsb-msb
          }
          else//lsw-msw
          {
            if (modbusConfigModel.IsBytesSwapped == 0)
              publishingChannel.ByteOrder = UICommon.ByteOrderTypes[1];//lsb-msb
            else
              publishingChannel.ByteOrder = UICommon.ByteOrderTypes[0];//msb-lsb
          }
          // publishingChannel.ByteOrder=modbusConfigModel.IsBytesSwapped==0?UICommon.ByteOrderTypes[0]:UICommon.ByteOrderTypes[1];
          publishingChannel.RegisteredModbusMapId = modbusConfigModel.RegisteredModbusMapId;
          publishingChannel.ModbusConfigurationId = modbusConfigModel.ModbusConfigurationId;
          publishingChannel.IsForModbusMaster = modbusConfigModel.IsForModbusMaster;
          publishingChannel.UnitSystem = modbusConfigModel.UnitSystem;
          publishingChannel.ModbusDeviceMap = [];
          publishingChannel.IsValid = true;

          for (var key1 in modbusConfigModel.ModbusDeviceMap) {
            let modbusDevicemap = modbusConfigModel.ModbusDeviceMap[key1];//api dictionaly format.convert it to class format
            if (isNaN(parseInt(modbusDevicemap.toString()))) {
              let modbusDevicemapSlave = new ModbusDeviceConfigurationModelUI();
              //modbusDevicemapSlave.Id = parseInt(key1);
              modbusDevicemapSlave.SlaveId = modbusDevicemap.SlaveId;
              modbusDevicemapSlave.ModbusSlaveRegisterMap = new Array();
              //loop to get modbus register map
              for (var key2 in modbusDevicemap.ModbusSlaveRegisterMap) {
                let registerMaprecords = modbusDevicemap.ModbusSlaveRegisterMap[key2];//api dictionary format.convert it to class format
                if (isNaN(parseInt(registerMaprecords.toString()))) {
                  let registerMapUIRecord = new ModbusSlaveRegisterMapUI();
                  registerMapUIRecord.RegisterTableType = parseInt(key2);//input or holding register type
                  registerMapUIRecord.DataPoints = registerMaprecords;
                  modbusDevicemapSlave.ModbusSlaveRegisterMap.push(registerMapUIRecord)
                }
              }
              publishingChannel.ModbusDeviceMap.push(modbusDevicemapSlave);

            }
          }
          publishingChannels.push(publishingChannel);
        }

      }
    }

    return publishingChannels ?? [];
  }

  getPublishing_PostModel(publishingChannels: PublishingDataUIModel[]): ModbusConfigurationModelUI2[] {
    let postPublishings: ModbusConfigurationModelUI2[] = [];

    for (let j = 0; j < publishingChannels.length; j++) {
      let modbusConfigurationModelUI: ModbusConfigurationModelUI2 = new ModbusConfigurationModelUI2();
      modbusConfigurationModelUI.ModbusDeviceMap = [];
      if (publishingChannels[j].Channel.channelType == CommunicationChannelType.SERIAL) { // publishingChannels[j].Channel.Protocol == 0 &&
        let serialChannel = new SerialPortCommunicationChannelDataUIModel();
        serialChannel.channelType = publishingChannels[j].Channel.channelType;
        serialChannel.Protocol = publishingChannels[j].Channel.Protocol;
        serialChannel.TimeoutInMs = 1000;
        serialChannel.Retries = 3;
        serialChannel.ComPort = (publishingChannels[j].Channel as SerialPortCommunicationChannelDataUIModel).ComPort;
        serialChannel.BaudRate = (publishingChannels[j].Channel as SerialPortCommunicationChannelDataUIModel).BaudRate;
        serialChannel.Parity = (publishingChannels[j].Channel as SerialPortCommunicationChannelDataUIModel).Parity;
        serialChannel.DataBits = (publishingChannels[j].Channel as SerialPortCommunicationChannelDataUIModel).DataBits;
        serialChannel.StopBits = (publishingChannels[j].Channel as SerialPortCommunicationChannelDataUIModel).StopBits;
        serialChannel.PortNamePath = (publishingChannels[j].Channel as SerialPortCommunicationChannelDataUIModel).PortNamePath;
        serialChannel.Description = (publishingChannels[j].Channel as SerialPortCommunicationChannelDataUIModel).Description;
        modbusConfigurationModelUI.Channel = publishingChannels[j].Channel;
        modbusConfigurationModelUI.Serial = serialChannel;
      }
      else {
        let tcpChannel = new TcpIpCommunicationChannelDataUIModel();
        tcpChannel.channelType = publishingChannels[j].Channel.channelType;
        tcpChannel.Protocol = publishingChannels[j].Channel.Protocol;
        tcpChannel.TimeoutInMs = 1000;
        tcpChannel.Retries = 3;
        tcpChannel.IpPortNumber = (<TcpIpCommunicationChannelDataUIModel>publishingChannels[j].Channel).IpPortNumber;
        tcpChannel.IpAddress = (<TcpIpCommunicationChannelDataUIModel>publishingChannels[j].Channel).IpAddress;
        tcpChannel.IdCommConfig = (<TcpIpCommunicationChannelDataUIModel>publishingChannels[j].Channel).IdCommConfig;
        modbusConfigurationModelUI.Channel = publishingChannels[j].Channel;
        modbusConfigurationModelUI.Tcp = tcpChannel;
      }
      modbusConfigurationModelUI.IsForModbusMaster = false;
      modbusConfigurationModelUI.ConnectionTo = publishingChannels[j].ConnectionTo;
      modbusConfigurationModelUI.MapType = publishingChannels[j].MapType;
      modbusConfigurationModelUI.ModbusConfigurationId = publishingChannels[j].Id;

      // if (publishingChannels[j].RegisteredModbusMapId == 0 || publishingChannels[j].RegisteredModbusMapId == null) {
      //     //fill default Ids
      //     if (!this.isSmallApp())
      //         modbusConfigurationModelUI.RegisteredModbusMapId = 2;
      //     else
      //         modbusConfigurationModelUI.RegisteredModbusMapId = 1;
      // }
      // else
      modbusConfigurationModelUI.RegisteredModbusMapId = publishingChannels[j].RegisteredModbusMapId;
      modbusConfigurationModelUI.UnitSystem = "Default";
      modbusConfigurationModelUI.SlaveId = publishingChannels[j].SlaveId;
      modbusConfigurationModelUI.Endianness = publishingChannels[j].WordOrder == UICommon.WordOrderTypes[0] ? 2 : 1;
      let isBytesSwapped: boolean = false;
      if (modbusConfigurationModelUI.Endianness == 2)//MSW-LSW
      {
        if (publishingChannels[j].ByteOrder == UICommon.ByteOrderTypes[0])//MSB-LSB
          isBytesSwapped = false;
        else
          isBytesSwapped = true;
      }
      else //LSW-MSW
      {
        if (publishingChannels[j].ByteOrder == UICommon.ByteOrderTypes[0])//MSB-LSB
          isBytesSwapped = true;
        else
          isBytesSwapped = false;
      }
      modbusConfigurationModelUI.IsBytesSwapped = isBytesSwapped == true ? 1 : 0;
      modbusConfigurationModelUI.ModbusDeviceMap = [];
      // var map: { [slaveId: string]: configDataModel.ModbusConfigurationModelUI2; } = { };  

      // map["1"] =  modbusConfigurationModelUI;      

      postPublishings.push(modbusConfigurationModelUI);
      // console.log(configData.ModbusConfigurations2);

    }

    return postPublishings;
  }

  getPublishing(): Observable<ModbusConfigurationModelsUI> {
    const results: Observable<ModbusConfigurationModelsUI> = this.http
      .get<ModbusConfigurationModelsUI>(this.api + 'api/datapublishing', {
        headers: this.headerDict,
      })
      .pipe(catchError(this.handleError));

    return results;
  }

  savePublishing(publishings: ModbusConfigurationModelUI2[]): Observable<any> {
    return this.http
      .post<any>(this.api + 'api/datapublishing', JSON.stringify(publishings), {
        headers: this.headers,
      })
      .pipe(catchError(this.handleError));
  }

  deletePublishingChannel(idCommConfig: number): Observable<any> {
    const params = new HttpParams().set('idSerialCommConfig', idCommConfig.toString());
    return this.http
      .post<any>(this.api + 'api/datapublishing/delete',
        { headers: this.headerDict },
        { params }
      )
      .pipe(catchError(this.handleError));
  }

  private replacer(propName, value) {
    if (propName === 'RegisterTableType') {
      return value.toString();
    } else {
      return value;
    }
  };
}
