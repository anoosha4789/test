import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';

import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { PanelDefaultsDataModel } from '@core/models/UIModels/PanelDefaultsDataModel.model';
import { GatewayBaseService } from './gatewayBase.service';

@Injectable({
  providedIn: 'root'
})

export class PanelDefaultService extends GatewayBaseService {

  private api = environment.webHostURL;
  
  constructor(protected http: HttpClient) { 
    super(http);
  }

  // Get Panel Default
  getPanelDefault(): Observable<PanelDefaultsDataModel> {
    const results: Observable<PanelDefaultsDataModel> = this.http
      .get<PanelDefaultsDataModel>(this.api + 'api/PanelDefaults')
      .pipe(catchError(this.handleError));

    return results;
  }

  // Save Panel Default
  updatePanelDefault(data: PanelDefaultsDataModel): Observable<any> {
    return this.http
      .post<PanelDefaultsDataModel[]>(this.api + 'api/PanelDefaults', data)
      .pipe(catchError(this.handleError));
  }
}
