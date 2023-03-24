import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { SieModel } from '@core/models/webModels/Sie.model';
import { Observable } from 'rxjs';
import { HttpParams, HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { GatewayBaseService } from './gatewayBase.service';

@Injectable({
  providedIn: 'root',
})
export class SieService extends GatewayBaseService {
  public baseUrl: string = environment.webHostURL;
  public sieUrl: string = this.baseUrl + 'api/SIE'; // get all custom user accounts

  constructor(
    protected http: HttpClient,
  ) {
    super(http);
  }


  saveSies(sie: SieModel[]): Observable<SieModel[]> {
    return this.http
      .post<SieModel[]>(this.sieUrl, JSON.stringify(sie), {
        headers: this.headers,
      })
      .pipe(catchError(this.handleError));
  }

  UpdateSie(sie: SieModel): Observable<SieModel[]> {
    return this.http
      .post<SieModel[]>(this.sieUrl, JSON.stringify(sie), {
        headers: this.headers,
      })
      .pipe(catchError(this.handleError));
  }

  DeleteSie(sieId: number): Observable<SieModel[]> {
    const params = new HttpParams().set('id', sieId.toString());
    return this.http
      .post<SieModel[]>(
        this.sieUrl + "/delete",
        { params }
      )
      .pipe(catchError(this.handleError));
  }


  public GetSie(): Observable<SieModel[]> {
    return this.http.get<SieModel[]>(this.sieUrl, { headers: this.headers }).pipe(
      catchError(this.handleError));
  }

  // Get Sie
  getSieById(sieId: number): Observable<SieModel> {
    const results: Observable<SieModel> = this.http
      .get<SieModel>(this.sieUrl + "/" + sieId)
      .pipe(catchError(this.handleError));
    return results;
  }
}
