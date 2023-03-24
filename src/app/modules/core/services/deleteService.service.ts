import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { GatewayBaseService } from './gatewayBase.service';

@Injectable({
  providedIn: 'root'
})
export class DeleteServiceService extends GatewayBaseService {
  public baseUrl: string = environment.webHostURL;
  public deleteConfigObjectURL: string = this.baseUrl + 'api/delete';

  constructor(
    protected http: HttpClient
  ) {
    super(http);
  }

  public deleteConfigurationObjects(delObjects: any): Observable<any> {
    return this.http
      .post<any>(this.deleteConfigObjectURL, delObjects, {
        headers: this.headers
      })
      .pipe(catchError(this.handleLoginError), timeout(40000)); // 40 seconds timeout
  }
}
