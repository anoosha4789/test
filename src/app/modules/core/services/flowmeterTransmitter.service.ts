import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';

import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { GatewayBaseService } from './gatewayBase.service';
import { FlowmeterTransmitterTypesDataModel } from '@core/models/UIModels/PanelDefaultsDataModel.model';

@Injectable({
  providedIn: 'root'
})

export class FlowmeterTransmitterService extends GatewayBaseService {

  private api = environment.webHostURL;
  
  constructor(protected http: HttpClient) { 
    super(http);
  }

  // Get Flowmeter Transmitter Types
  getFlowmeterTransmitterTypes(): Observable<FlowmeterTransmitterTypesDataModel[]> {
    const results: Observable<FlowmeterTransmitterTypesDataModel[]> = this.http
      .get<FlowmeterTransmitterTypesDataModel[]>(this.api + 'api/PanelDefaults/inforceFlowMeterTransmitterTypes')
      .pipe(catchError(this.handleError));
    return results;
  }
}
