import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';

import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { GatewayBaseService } from './gatewayBase.service';
import { PanelSensorModelNew } from '@core/models/webModels/PanelSensorModelNew.model';
import { DataPointLinearScaleConversionModel } from '@core/models/webModels/DataPointLinearScaleConversion.model';

@Injectable({
  providedIn: 'root'
})

export class SensorCalibrationService extends GatewayBaseService {

  private api = environment.webHostURL;

  constructor(protected http: HttpClient) { 
    super(http);
  }

  // Get Panel Sensors
  getPanelSensors(numberOfOutputs: number): Observable<PanelSensorModelNew[]> {
    const results: Observable<PanelSensorModelNew[]> = this.http
      .get<PanelSensorModelNew[]>(this.api + 'api/panelsensor/getpanelsensorlist/' + numberOfOutputs)
      .pipe(catchError(this.handleError));

    return results;
  }

  // Save Panel Sensors
  updatePanelSensors(data: DataPointLinearScaleConversionModel[]): Observable<any> {
    return this.http
      .post<DataPointLinearScaleConversionModel[]>(this.api + 'api/panelsensor/updatelist', data)
      .pipe(catchError(this.handleError));
  }
}
