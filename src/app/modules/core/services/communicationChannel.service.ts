import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '@env/environment';
import { Observable, throwError, Subject } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { String } from 'typescript-string-operations';

import { GatewayBaseService } from './gatewayBase.service';
import { SerialChannelProperty } from '@core/models/UIModels/SerialChannel.model';
import { SerialPortCommunicationChannelDataUIModel } from '@core/models/webModels/SerialPortCommunicationChannelDataUIModel.model';
import { DataSourceDataUIModel } from '@core/models/webModels/DataSourceDataUIModel.model';
import { InterfaceCardDataUIModel } from '@core/models/webModels/InterfaceCardDataUIModell.model';
import { GaugeTypeUIModel } from '@core/models/UIModels/models.model';




@Injectable({
  providedIn: 'root',
})
export class CommunicationChannelService extends GatewayBaseService {
  private api = environment.webHostURL;

  private validatePressureCoeffUrl = this.baseUrl + 'api/coefficientfile/validate/pressure';
  private validateTemperatureCoeffUrl = this.baseUrl + 'api/coefficientfile/validate/temperature';

  constructor(protected http: HttpClient) {
    super(http);
  }

  saveSerialPortChannel(serialPortChannel: SerialPortCommunicationChannelDataUIModel): Observable<any> {
    return this.http
      .post<any>(this.api + 'api/CommChannel/serialconfig', JSON.stringify(serialPortChannel), {
        headers: this.headers,
      })
      .pipe(catchError(this.handleError));
  }

  deleteSerialPortChannel(idCommConfig: number) : Observable<any> {
    const params = new HttpParams().set('idSerialCommConfig', idCommConfig.toString());
    return this.http
      .post<any>(this.api + 'api/CommChannel/serialconfig/delete',
      { headers: this.headerDict },
      { params }
      )
      .pipe(catchError(this.handleError));
  }

  // get Serialsettings - Serial Ports and other settings
  getSerialsettings(): Observable<SerialChannelProperty> {
    const results: Observable<SerialChannelProperty> = this.http
      .get<SerialChannelProperty>(this.api + 'api/CommChannel/serialsettings', {
        headers: this.headerDict,
      })
      .pipe(catchError(this.handleError));

    return results;
  }

  getDataSources(): Observable<DataSourceDataUIModel[]> {
    const results: Observable<DataSourceDataUIModel[]> = this.http
    .get<DataSourceDataUIModel[]>(this.api + 'api/datasource', {
      headers: this.headerDict,
    })
    .pipe(catchError(this.handleError));

    return results;
  }

  getDataSourcesByCommId(commId: number): Observable<DataSourceDataUIModel> {
    const results: Observable<DataSourceDataUIModel> = this.http
    .get<DataSourceDataUIModel>(this.api + 'api/datasource/' + commId, {
      headers: this.headerDict,
    })
    .pipe(catchError(this.handleError));

    return results;
  }

  saveDataSource(dataSources: DataSourceDataUIModel[]): Observable<any> {
    return this.http
      .post<any>(this.api + 'api/datasource', JSON.stringify(dataSources), {
        headers: this.headers,
      })
      .pipe(catchError(this.handleError));
  }

  getInterfaceCards(idCommConfig: number): Observable<InterfaceCardDataUIModel[]> {
    const results: Observable<InterfaceCardDataUIModel[]> = this.http
      .get<InterfaceCardDataUIModel[]>(this.api + String.Format("api/interfacecard/{0}/cards", idCommConfig), {
        headers: this.headerDict,
      })
      .pipe(catchError(this.handleError));

    return results;
  }

  getGaugeToolTypes(): Observable<GaugeTypeUIModel[]> {
    const results: Observable<GaugeTypeUIModel[]> = this.http
    .get<GaugeTypeUIModel[]>(this.api + 'api/tool/tooltypes', {
      headers: this.headerDict,
    })
    .pipe(catchError(this.handleError));

    return results;
  }

  validatePressureCoefficient(coefficientData: string[]) : Observable<any> {
    return this.http
        .post(this.validatePressureCoeffUrl, JSON.stringify(coefficientData), { headers: this.headers }).pipe(
        catchError(this.handleError));
  }

  validateTemperatureCoefficient(coefficientData: string[]) : Observable<any> {
    return this.http
        .post(this.validateTemperatureCoeffUrl, JSON.stringify(coefficientData), { headers: this.headers }).pipe(
        catchError(this.handleError));
  }
}
