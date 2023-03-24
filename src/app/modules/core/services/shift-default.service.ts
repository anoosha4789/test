import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';

import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ShiftDefaultsDataModel } from '@core/models/webModels/ShiftDefaultsDataModel.model';
import { GatewayBaseService } from './gatewayBase.service';

@Injectable({
  providedIn: 'root'
})

export class ShiftDefaultService extends GatewayBaseService {

  private api = environment.webHostURL;
  
  constructor(protected http: HttpClient) { 
    super(http);
  }

   // Get Shift Default
   getShiftDefault(): Observable<ShiftDefaultsDataModel> {
    const results: Observable<ShiftDefaultsDataModel> = this.http
      .get<ShiftDefaultsDataModel>(this.api + 'api/shiftdefaults')
      .pipe(catchError(this.handleError));

    return results;
  }

   // Save Shift Default
   updateShiftDefault(data: ShiftDefaultsDataModel): Observable<any> {
    return this.http
      .post<ShiftDefaultsDataModel[]>(this.api + 'api/shiftdefaults', data)
      .pipe(catchError(this.handleError));
  }

}
