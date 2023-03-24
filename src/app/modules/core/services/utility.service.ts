import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '@env/environment';

import { GatewayBaseService } from './gatewayBase.service';
import { TimeZoneModel } from '@core/models/webModels/TimeZone.model';
import { IPv4AddressModel } from '@core/models/webModels/IPv4Address.model';
import { NetworkAddressModel } from '@core/models/UIModels/network-address.model';
import { LoginModel } from '@core/models/webModels/Login.model';

import { NavigationService } from './navigation.service';
import { UserService } from './user.service';
import { stepperData } from '@shared/sureflo/components/sureflo-stepper/sureflo-stepper.component';
import { CommunicationChannelType, IpAddressInUse, IpPortsInUse, SerialPortInUse, SerialPortPurpose, UICommon } from '@core/data/UICommon';
import { SerialPortCommunicationChannelDataUIModel } from '@core/models/webModels/SerialPortCommunicationChannelDataUIModel.model';
import { TcpIpCommunicationChannelDataUIModel } from '@core/models/webModels/TcpIpCommunicationChannelDataUIModel.model';

@Injectable({
  providedIn: 'root',
})
export class UtilityService extends GatewayBaseService {

  private panelTimeZoneUrl: string = environment.webHostURL + 'api/timezone';
  public ipAddressApiUrl: string = environment.webHostURL + 'api/system/ipaddress';

  stepperEnabled$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  stepperForward$: BehaviorSubject<number> = new BehaviorSubject<number>(-1);
  sidenavEnabled$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  surefloStepper$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  configSaved$: BehaviorSubject<any> = new BehaviorSubject<any>(false);
  shiftStatus$: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  currentUser: LoginModel;

  constructor(protected http: HttpClient,
    private navigationService: NavigationService,
    private userService: UserService) {
    super(http);
  }

  setSurefloStepperData(data: stepperData) {
    this.surefloStepper$.next(data);
  }

  getSurefloStepperData() {
    return this.surefloStepper$;
  }

  setForwardStepper(index: number) {
    this.stepperForward$.next(index);
  }

  getForwardStepper() {
    return this.stepperForward$;
  }

  setSideNavStatus(showHide: boolean) {
    this.sidenavEnabled$.next(showHide);
  }

  getSideNavStatus() {
    return this.sidenavEnabled$;
  }

  isConfigSaved() {
    return this.configSaved$;
  }

  setShiftStatus(value: number) {
    this.shiftStatus$.next(value);
  }

  getShiftStatus() {
    return this.shiftStatus$;
  }

  getSystemIPAdress(): Observable<NetworkAddressModel[]> {
    return this.http
      .get<IPv4AddressModel[]>(this.ipAddressApiUrl)
      .pipe(catchError(this.handleError));
  }

  updateSystemIPAdress(ipaddress: IPv4AddressModel[]): Observable<HttpResponse<any>> {
    return this.http
      .post<any>(this.ipAddressApiUrl, ipaddress, { observe: 'response' }).pipe(
        catchError(this.handleError));
  }

  getTimeZoneArray(): Observable<TimeZoneModel[]> {
    return this.http
      .get<TimeZoneModel[]>(this.panelTimeZoneUrl)
      .pipe(catchError(this.handleError));
  }

  stdTimezoneOffset(): number {
    const jan = new Date(new Date().getFullYear(), 0, 1);
    const jul = new Date(new Date().getFullYear(), 6, 1);
    return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
  }

  // Check daylight savings is applied or not
  isDstObserved(): boolean {
    return new Date().getTimezoneOffset() < this.stdTimezoneOffset();
  }

  getHeaderLinks() {
    this.userService.GetCurrentLoginUser().then((user) => {
      if (user) {
        this.navigationService.setHeaderLinksByUserRoles(user);
      }
    });
  }

  setHeaderLinksByUser(configStatus: boolean) {
    if (configStatus) {
      const status = JSON.stringify(configStatus);
      window.sessionStorage.setItem('isConfigSaved', status);
      this.configSaved$.next(configStatus);
    } else {
      window.sessionStorage.removeItem('isConfigSaved');
      this.configSaved$.next(false);
    }
    this.getHeaderLinks();
  }

  getConfigStatus() {
    return JSON.parse(window.sessionStorage.getItem('isConfigSaved'));
  }

  getToolStatus(value: number) {
    const digit = value?.toString().length;
    const statusCode = digit === 5 ? value % 10000 : value;
    const invalidText = 'and a short circuit detected';
    let toolStatus = null;
    switch (statusCode) {
      case 2:
        toolStatus = `Code ${statusCode}:  Tool never reported data ${digit === 5 ? invalidText : ''}`;
        break;
      case 4:
        toolStatus = `Code ${statusCode}:  Tool no longer reporting data ${digit === 5 ? invalidText : ''}`;
        break;
      case 6:
        toolStatus = `Code ${statusCode}:  Data overflow ${digit === 5 ? invalidText : ''}`;
        break;
      case 8:
        toolStatus = `Code ${statusCode}:  Incomplete data packet ${digit === 5 ? invalidText : ''}`;
        break;
      case 10:
        toolStatus = `Code ${statusCode}:  Pressure data missing ${digit === 5 ? invalidText : ''}`;
        break;
      case 12:
        toolStatus = `Code ${statusCode}:  Temperature data missing ${digit === 5 ? invalidText : ''}`;
        break;
      case 14:
        toolStatus = `Code ${statusCode}:  Pressure and Temperature data missing ${digit === 5 ? invalidText : ''}`;
        break;
      case 16:
        toolStatus = `Code ${statusCode}:  Packet Preamble error ${digit === 5 ? invalidText : ''}`;
        break;
      case 18:
        toolStatus = `Code ${statusCode}:  Packet Preamble error ${digit === 5 ? invalidText : ''}`;
        break;
      case 20:
        toolStatus = `Code ${statusCode}:  Parity Error ${digit === 5 ? invalidText : ''}`;
        break;
      case 22:
        toolStatus = `Code ${statusCode}:  Reference counts out of range ${digit === 5 ? invalidText : ''}`;
        break;
      case -999:
        toolStatus = 'No Communication Started';
        break;
      default:
        toolStatus = `Code ${statusCode}`;
        break;        
    }
    return toolStatus;
  }

  public clearComPortsInUse(purpose: SerialPortPurpose) {
    let comPorts: SerialPortInUse[] = [];
    UICommon.comPortsInUse.forEach(comPort => {
      if (comPort.purpose !== purpose)
        comPorts.push(comPort);
    });
    UICommon.comPortsInUse = [];
    UICommon.comPortsInUse = comPorts;
  }

  public setComPortsInUse_DataSource(dataSources) {
    this.clearComPortsInUse(SerialPortPurpose.DATASOURCE);
    dataSources.forEach(item => {
      if (item.Channel.channelType === CommunicationChannelType.SERIAL) {
        const comPort = (item.Channel as SerialPortCommunicationChannelDataUIModel).ComPort;
        const index = UICommon.comPortsInUse.findIndex((port) => port.portNumber === comPort);
        if (index === -1) {
          UICommon.comPortsInUse.push({
            portNumber: (item.Channel as SerialPortCommunicationChannelDataUIModel).ComPort,
            purpose: SerialPortPurpose.DATASOURCE
          });
        }
      }
    });
  }

  public setComPortsInUse_Publishing(publishing) {
    this.clearComPortsInUse(SerialPortPurpose.PUBLISHING);
    publishing.forEach(item => {
      if (item.Channel.channelType === CommunicationChannelType.SERIAL) {
        const comPort = (item.Channel as SerialPortCommunicationChannelDataUIModel).ComPort;
        const index = UICommon.comPortsInUse.findIndex((port) => port.portNumber === comPort);
        if (index === -1) {
          UICommon.comPortsInUse.push({
            portNumber: (item.Channel as SerialPortCommunicationChannelDataUIModel).ComPort,
            purpose: SerialPortPurpose.PUBLISHING
          });
        }
      }
    });
  }


  public clearIpAddressInUse(purpose: SerialPortPurpose) {
    let ipAddresses: IpAddressInUse[] = [];
    UICommon.ipAddressesInUse.forEach(ipAddressInUse => {
      if (ipAddressInUse.purpose !== purpose)
        ipAddresses.push(ipAddressInUse);
    });
    UICommon.ipAddressesInUse = [];
    UICommon.ipAddressesInUse = ipAddresses;
  }

  public setIpAddressInUse_DataSource(dataSources) {
    this.clearIpAddressInUse(SerialPortPurpose.DATASOURCE);
    dataSources.forEach(item => {
      if (item.Channel.channelType === CommunicationChannelType.TCPIP) {
        const channel = (item.Channel as TcpIpCommunicationChannelDataUIModel);
        const ipAddress = channel.IpAddress;
        const index = UICommon.ipAddressesInUse.findIndex((ipAddressInUse) => ipAddressInUse.ipAddress === ipAddress && ipAddressInUse.portNumber === channel.IpPortNumber);
        if (index === -1) {
          UICommon.ipAddressesInUse.push({
            ipAddress: channel.IpAddress,
            portNumber: channel.IpPortNumber,
            purpose: SerialPortPurpose.DATASOURCE,
            channelType: channel.channelType,
            protocol: channel.Protocol,
            id: channel.IdCommConfig
          });
        }
      }
    });
  }

  public setIpAddressInUse_Publishing(publishing) {
    this.clearIpAddressInUse(SerialPortPurpose.PUBLISHING);
    publishing.forEach(item => {
      if (item.Channel.channelType === CommunicationChannelType.TCPIP) {
        const channel = (item.Channel as TcpIpCommunicationChannelDataUIModel);
        const ipAddress = channel.IpAddress;
        const index = UICommon.ipAddressesInUse.findIndex((ipAddressInUse) => ipAddressInUse.ipAddress === ipAddress && ipAddressInUse.portNumber === channel.IpPortNumber);
        if (index === -1) {
          UICommon.ipAddressesInUse.push({
            ipAddress: channel.IpAddress,
            portNumber: channel.IpPortNumber,
            purpose: SerialPortPurpose.PUBLISHING,
            channelType: channel.channelType,
            protocol: channel.Protocol,
            id: channel.IdCommConfig
          });
        }
      }
    });
  }

  public clearIpPortsInUse(purpose: SerialPortPurpose) {
    let ipPorts: IpPortsInUse[] = [];
    UICommon.ipPortsInUse.forEach(ipPortsInUse => {
      if (ipPortsInUse.purpose !== purpose)
        ipPorts.push(ipPortsInUse);
    });
    UICommon.ipPortsInUse = [];
    UICommon.ipPortsInUse = ipPorts;
  }

  public setIpPortsInUse_DataSource(dataSources) {
    this.clearIpPortsInUse(SerialPortPurpose.DATASOURCE);
    dataSources.forEach(item => {
      if (item.Channel.channelType === CommunicationChannelType.TCPIP) {
        const channel = (item.Channel as TcpIpCommunicationChannelDataUIModel);
        const portNumber = channel.IpPortNumber;
        const index = UICommon.ipPortsInUse.findIndex((ipPortsInUse) => ipPortsInUse.portNumber === portNumber);
        if (index === -1) {
          UICommon.ipPortsInUse.push({
            portNumber: channel.IpPortNumber,
            purpose: SerialPortPurpose.DATASOURCE,
            channelType: channel.channelType,
            protocol: channel.Protocol,
            id: channel.IdCommConfig
          });
        }
      }
    });
  }

  public setIpPortsInUse_Publishing(publishing) {
    this.clearIpPortsInUse(SerialPortPurpose.PUBLISHING);
    publishing.forEach(item => {
      if (item.Channel.channelType === CommunicationChannelType.TCPIP) {
        const channel = (item.Channel as TcpIpCommunicationChannelDataUIModel);
        const portNumber = channel.IpPortNumber;
        const index = UICommon.ipPortsInUse.findIndex((ipPortsInUse) => ipPortsInUse.portNumber === portNumber);
        if (index === -1) {
          UICommon.ipPortsInUse.push({
            portNumber: channel.IpPortNumber,
            purpose: SerialPortPurpose.PUBLISHING,
            channelType: channel.channelType,
            protocol: channel.Protocol,
            id: channel.Id
          });
        }
      }
    });
  }
}
