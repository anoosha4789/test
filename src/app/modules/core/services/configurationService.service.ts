import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '@env/environment';
import { Observable, throwError, Subject } from 'rxjs';
import { DeviceModel } from '@core/models/webModels/DeviceInfo.model';
import { DataPointDefinitionModel } from '@core/models/webModels/DataPointDefinition.model';
import { catchError, timeout } from 'rxjs/operators';
import { UnitSystemModel } from '@core/models/webModels/UnitSystem.model';
import { UnitSystemUIModel } from '@core/models/UIModels/unit-system.model';
import { WriteToServerDataModel } from '@core/models/webModels/WriteToServerData.model';
import { GatewayBaseService } from './gatewayBase.service';
import { ErrorHandlingUIModel } from '@core/models/webModels/ErrorHandlingUI.model';
import { String } from 'typescript-string-operations';
import { LinuxDiskSpaceViewModel } from '@core/models/webModels/LinuxDiskSpaceView.model';
import { LinuxGatewayProcessInfoViewModel } from '@core/models/webModels/LinuxGatewayProcessInfoView.model';
import { LinuxGatewayMemoryInfoViewModel } from '@core/models/webModels/LinuxGatewayMemoryInfoView.model';
import { InforceWellShiftUIModel } from '@core/models/UIModels/inforce.well.shift.model';
import { ValveShiftTravelParamsDataModel } from '@core/models/webModels/ValveShiftTravelParamsData.model';
import { MultiNodePositionDefaultsDataUIModel } from '@core/models/UIModels/MultiNodePositionDefaultsDataUI.model';

@Injectable({
  providedIn: 'root',
})
export class ConfigurationService extends GatewayBaseService {
  private api = environment.webHostURL;

  public ShiftHierarchyApiUrl: string = `${this.api}api/shift/hierarchy`;
  public travePositionApiUrl: string = `${this.api}api/valve/totaltravelpositions`;

  constructor(protected http: HttpClient) {
    super(http);
  }

  /*
   * Call API to get configured devices
   */
  getDeviceListFromDB(): Observable<DeviceModel[]> {
    const results: Observable<DeviceModel[]> = this.http
      .get<DeviceModel[]>(this.api + 'api/devices/listwithdatasource', {
        headers: this.headerDict,
      })
      .pipe(catchError(this.handleError));

    // results.subscribe(x => {
    //   console.log('Results from getDeviceListFromDB(): Observable<DeviceModel[]>');
    //   console.log(x);
    // });

    return results;
  }
  /*
   * Call API to get defined data point definitions for defined device type
   */
  getallDataPointsfromDB(): Observable<DataPointDefinitionModel[]> {
    const results: Observable<DataPointDefinitionModel[]> = this.http
      .get<DataPointDefinitionModel[]>(this.api + 'api/datapointtemplates', {
        headers: this.headerDict,
      })
      .pipe(catchError(this.handleError));

    // results.subscribe(x => {
    //   console.log('Results from getallDataPointsfromDB(): Observable<DataPointDefinitionModel[]>');
    //   console.log(x);
    // });

    return results;
  }

  getaDataPointsfromDBForDevice(deviceId: number, pointsType: number): Observable<DataPointDefinitionModel[]> {
    const results: Observable<DataPointDefinitionModel[]> = this.http
      .get<DataPointDefinitionModel[]>(this.api + String.Format('api/datapointtemplates/inchargeTool/{0}/{1}', deviceId, pointsType), {
        headers: this.headerDict,
      })
      .pipe(catchError(this.handleError));

    // results.subscribe(x => {
    //   console.log('Results from getallDataPointsfromDB(): Observable<DataPointDefinitionModel[]>');
    //   console.log(x);
    // });

    return results;
  }

  // Get Unit System
  getPanelInfo(): Observable<any> {
    return this.http
      .get<any>(this.api + 'api/panelconfiguration/common')
      .pipe(catchError(this.handleError));
  }

  // Get Unit System
  getUnitSystem(): Observable<UnitSystemModel> {
    return this.http
      .get<UnitSystemModel>(this.api + 'api/unitsymbolconfiguration')
      .pipe(catchError(this.handleError));
  }

  // Save Unit System changes
  saveUnitSystem(unitSystem: UnitSystemUIModel[]): Observable<UnitSystemModel> {
    const results: Observable<UnitSystemModel> = this.http
      .post<UnitSystemModel>(
        this.api + 'api/unitsymbolconfiguration',
        unitSystem
      )
      .pipe(catchError(this.handleError));
    return results;
  }

  WriteToServer(
    writeVar: WriteToServerDataModel
  ): Observable<WriteToServerDataModel> {
    // console.log(this.api + 'api/configuration/writetoserver');
    // console.log(JSON.stringify(writeVar));
    return this.http
      .post<WriteToServerDataModel>(
        this.api + 'api/configuration/writetoserver',
        writeVar
      )
      .pipe(catchError(this.handleError));
  }

  getShiftTotalVentTime(): Observable<number> {
    return this.http
      .get<number>(this.api + 'api/shift/totalventtime/')
      .pipe(catchError(this.handleError));
  }

  setShiftTotalVentTime(shiftTotalVentTime: number) {
    return this.http
      .post(
        this.api + 'api/shift/totalventtime/',
        JSON.stringify(shiftTotalVentTime),
        { headers: this.headers }
      )
      .pipe(catchError(this.handleError));
  }

  getBuildNumber(): Observable<any> {
    return this.http
      .get(this.api + 'api/version/package')
      .pipe(catchError(this.handleError));
  }
  getBuildAndFirmwareversionNumber(): Observable<any> {
    return this.http
      .get(this.api + 'api/version/packageversions')
      .pipe(catchError(this.handleError));
  }

  getErrorHandlingSettings(): Observable<ErrorHandlingUIModel> {
    const results: Observable<ErrorHandlingUIModel> = this.http
      .get<ErrorHandlingUIModel>(this.api + 'api/ErrorHandling')
      .pipe(catchError(this.handleError));

    // results.subscribe((x) => {
    //   console.log(
    //     'getErrorHandlingSettings(): Observable<ErrorHandlingUIModel>'
    //   );
    //   console.log(x);
    // });

    return results;
  }

  // Update the error handling settings
  updateErrorHandlingSettings(
    errorHandlingSettings: ErrorHandlingUIModel
  ): Observable<ErrorHandlingUIModel> {
    return this.http
      .post<ErrorHandlingUIModel>(
        this.api + 'api/ErrorHandling',
        errorHandlingSettings
      )
      .pipe(catchError(this.handleError));
  }

  geteFCVPositionSettings(): Observable<MultiNodePositionDefaultsDataUIModel> {
    const results: Observable<MultiNodePositionDefaultsDataUIModel> = this.http
      .get<MultiNodePositionDefaultsDataUIModel>(this.api + 'api/MultiNodePositionDefaults')
      .pipe(catchError(this.handleError));
    return results;
  }

  // Update eFCV Position settings
  updateeFCVPositionSettings(
    errorHandlingSettings: MultiNodePositionDefaultsDataUIModel
  ): Observable<MultiNodePositionDefaultsDataUIModel> {
    return this.http
      .post<MultiNodePositionDefaultsDataUIModel>(
        this.api + 'api/MultiNodePositionDefaults',
        errorHandlingSettings
      )
      .pipe(catchError(this.handleError));
  }

  // JCNOTE:
  // because it is an observable, only when we subcribe it, it will be executed.
  // restartAcquisitionProcess().subscribe()
  //
  restartAcquisitionProcess(): Observable<any> {
    return this.http
      .post(this.api + 'api/configuration/restartacquisition', null)
      .pipe(catchError(this.handleError));
  }
  configurationReset(): Observable<any> {
    return this.http
      .post(this.api + 'api/configuration/configurationreset', null, { headers: this.headers })
      .pipe(catchError(this.handleError), timeout(300000));
  }
  manufactureReset(): Observable<any> {
    return this.http
      .post(this.api + 'api/configuration/manufacturereset', null)
      .pipe(catchError(this.handleError));
  }
  getDiscUtilization(): Observable<LinuxDiskSpaceViewModel[]> {
    return this.http.get<LinuxDiskSpaceViewModel[]>(this.api + 'api/system/df', { headers: this.headerDict }).pipe(
      catchError(this.handleError));
  }

  getProcessUtilization(): Observable<LinuxGatewayProcessInfoViewModel[]> {

    return this.http.get<LinuxGatewayProcessInfoViewModel[]>(this.api + 'api/system/ps', { headers: this.headerDict }).pipe(
      catchError(this.handleError));
  }

  getMemoryUtilization(): Observable<LinuxGatewayMemoryInfoViewModel> {
    return this.http.get<LinuxGatewayMemoryInfoViewModel>(this.api + 'api/system/memused', { headers: this.headerDict }).pipe(
      catchError(this.handleError));
  }

  // Inforce Auto Shift Well
  saveAutoShiftWellObject(well: InforceWellShiftUIModel): Observable<any> {
    return this.http.post(this.ShiftHierarchyApiUrl, well).pipe(catchError(this.handleError));
  }

  getAutoShiftWellObject(): Observable<InforceWellShiftUIModel> {
    return this.http.get<InforceWellShiftUIModel>(this.ShiftHierarchyApiUrl).pipe(catchError(this.handleError));
  }

  getTotalTravelPosition(param: ValveShiftTravelParamsDataModel): Observable<number[]> {
    return this.http.post<number[]>(this.travePositionApiUrl, param).pipe(catchError(this.handleError));
  }
}
