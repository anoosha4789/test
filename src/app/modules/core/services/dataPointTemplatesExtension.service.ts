import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '@env/environment';
import { Observable, throwError, Subject } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { String } from 'typescript-string-operations';

import { GatewayBaseService } from './gatewayBase.service';
import { PointTemplatesExtensionUIModel } from '@core/models/webModels/PointTemplatesExtensionUIModel.model';

@Injectable({
  providedIn: 'root',
})
export class DataPointTemplatesExtensionService extends GatewayBaseService {
  private api = environment.webHostURL;

  private pointTemplatesByDeviceURL = this.baseUrl + 'api/pointtemplatesextension/{0}';
  private pointTemplatesForShifteURL = this.baseUrl + 'api/pointtemplatesextension/shift';

  constructor(protected http: HttpClient) {
    super(http);
  }

  // get Serial Port Communication Channels
  getPointTemplates(deviceTypeId: number): Observable<PointTemplatesExtensionUIModel[]> {
    const results: Observable<PointTemplatesExtensionUIModel[]> = this.http
      .get<PointTemplatesExtensionUIModel[]>(String.Format(this.pointTemplatesByDeviceURL, deviceTypeId), {
        headers: this.headerDict,
      })
      .pipe(catchError(this.handleError));

    return results;
  }

  getShiftPointTemplates(): Observable<PointTemplatesExtensionUIModel[]> {
    const results: Observable<PointTemplatesExtensionUIModel[]> = this.http
      .get<PointTemplatesExtensionUIModel[]>(String.Format(this.pointTemplatesForShifteURL), {
        headers: this.headerDict,
      })
      .pipe(catchError(this.handleError));

    return results;
  }
}
