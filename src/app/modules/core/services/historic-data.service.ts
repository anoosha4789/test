import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '@env/environment';


@Injectable({
  providedIn: 'root'
})

export class HistoricDataService {

  constructor(private http: HttpClient) { }

  private api = environment.webHostURL + 'api/InFluxDbTimeSeriesData';

  public getHistoricData(mode: string, deviceId: number, pointIndex: number,
                         year: number, month: number, day: number, hour?: number ): Observable<any> {

    const type = mode === 'day' ? 'QueryDataPointDataByDay' : 'QueryDataPointDataByHour';

    const url =  mode === 'day' ? `${this.api}/${type}/${deviceId}/${pointIndex}/${year}/${month}/${day}` :
                                `${this.api}/${type}/${deviceId}/${pointIndex}/${year}/${month}/${day}/${hour}`;

    return this.http.get<any>(url);
  }
}
