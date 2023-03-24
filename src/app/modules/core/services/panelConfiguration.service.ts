import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '@env/environment';
import { Observable, throwError, Subject } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { PanelType } from '@core/models/UIModels/PanelType.model';
import { BhAlertService } from 'bh-theme';
import { GatewayBaseService } from './gatewayBase.service';
import { SerialChannelProperty } from '@core/models/UIModels/SerialChannel.model';
import { PanelConfigurationCommonModel, SureSENSPanelModel } from '@core/models/webModels/PanelConfigurationCommon.model';


@Injectable({
  providedIn: 'root',
})
export class PanelConfigurationService extends GatewayBaseService {
  private api = environment.webHostURL;

  constructor(protected http: HttpClient) {
    super(http);
  }

  getPanelTime(): Observable<any> {
    return this.http.get<any>(this.api + 'api/clock?rand=' + Date.now(), { headers: this.headerDict }).pipe(
      catchError(this.handleError), timeout(9000));
  }

  // get Panel Types
  getPanelTypes(): Observable<PanelType[]> {
    const results: Observable<PanelType[]> = this.http
      .get<PanelType[]>(this.api + 'api/paneltype', {
        headers: this.headerDict,
      })
      .pipe(catchError(this.handleError));

    return results;
  }

  getPanelConfigurationCommon(): Observable<PanelConfigurationCommonModel> {
    const results: Observable<PanelConfigurationCommonModel> = this.http
      .get<PanelConfigurationCommonModel>(this.api + 'api/panelconfiguration/common', {
        headers: this.headerDict,
      })
      .pipe(catchError(this.handleError));

    return results;
  }

  getHydraulicOutputOptions(): Observable<any> {
    const results: Observable<any> = this.http
      .get<any>(this.api + 'api/panelconfiguration/hydraulicOutputs', {
        headers: this.headerDict,
      })
      .pipe(catchError(this.handleError));

    return results;
  }

  updatePanelConfigurationCommon(
    panelconfiguration: PanelConfigurationCommonModel
  ): Observable<any> {
    return this.http
      .post(
        this.api + 'api/panelconfiguration/common',
        JSON.stringify(panelconfiguration),
        { headers: this.headers }
      )
      .pipe(catchError(this.handleError));
  }
}
