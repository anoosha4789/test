import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '@env/environment';

import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { GatewayBaseService } from './gatewayBase.service';
import { CustomDataLoggerConfiguration } from '@core/models/webModels/DataLogger.model';
import { DataLoggerTypesDataModel } from '@core/models/UIModels/dataLoggerTypes.model';

@Injectable({
  providedIn: 'root'
})

export class DataLoggerService extends GatewayBaseService {

  private api = environment.webHostURL;

  constructor(protected http: HttpClient) {
    super(http);
  }

  // Get Data Logger
  getDataLogger(): Observable<CustomDataLoggerConfiguration[]> {
    const results: Observable<CustomDataLoggerConfiguration[]> = this.http
      .get<CustomDataLoggerConfiguration[]>(this.api + 'api/datalogger')
      .pipe(catchError(this.handleError));

    return results;
  }

  // Get Data Logger Types
  getDataLoggerTypes(): Observable<DataLoggerTypesDataModel[]> {
    const results: Observable<DataLoggerTypesDataModel[]> = this.http
      .get<DataLoggerTypesDataModel[]>(this.api + 'api/datalogger/loggerTypes')
      .pipe(catchError(this.handleError));

    return results;
  }

  // Save Data Logger
  saveDataLogger(data: CustomDataLoggerConfiguration[]): Observable<any> {
    return this.http
      .post<CustomDataLoggerConfiguration>(this.api + 'api/datalogger', data)
      .pipe(catchError(this.handleError));
  }

  // Delete Data Logger
  deleteDataLogger(Id: number): Observable<any> {
    const params = new HttpParams().set('id', Id.toString());
    return this.http
      .delete<any>(this.api + 'api/datalogger',
        { params }
      )
      .pipe(catchError(this.handleError));
  }
}
