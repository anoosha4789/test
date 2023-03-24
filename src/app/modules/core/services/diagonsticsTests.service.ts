import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '@env/environment';

import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { GatewayBaseService } from './gatewayBase.service';
import { DiagnosticsTestTypesDataModel } from '@core/models/UIModels/diagnosticsTestTypes.model';

@Injectable({
  providedIn: 'root'
})

export class DiagonsticsTestsService extends GatewayBaseService {

  private api = environment.webHostURL;

  constructor(protected http: HttpClient) {
    super(http);
  }


  // Get Data Logger Types
  getDiagnosticsTestsTypes(): Observable<DiagnosticsTestTypesDataModel[]> {
    const results: Observable<DiagnosticsTestTypesDataModel[]> = this.http
      .get<DiagnosticsTestTypesDataModel[]>(this.api + 'api/MultiNode/getdiagnosticstests')
      .pipe(catchError(this.handleError));

    return results;
  }
}
