import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '@env/environment';
import { Observable, throwError, Subject } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { String } from 'typescript-string-operations';
import { GatewayBaseService } from './gatewayBase.service';
import { ToolConnectionUIModel } from '@core/models/UIModels/tool-connection.model';


@Injectable({
  providedIn: 'root',
})

export class ToolConnectionService extends GatewayBaseService {

  private api = environment.webHostURL;

  constructor(protected http: HttpClient) {
    super(http);
  }

  // Get All Tool Connections
  getPortingList(): Observable<any[]> {
    const results: Observable<any[]> = this.http.get<any[]>(this.api + 'api/toolconnection/connectportings').pipe(catchError(this.handleError));
    return results;
  }


  // Get All Tool Connections
  getToolConnectionList(): Observable<ToolConnectionUIModel[]> {
    const results: Observable<ToolConnectionUIModel[]> = this.http.get<ToolConnectionUIModel[]>(this.api + 'api/toolconnection').pipe(catchError(this.handleError));
    return results;
  }

  // Save or Update Tool Connection
  saveToolConnection(toolConnectionList: ToolConnectionUIModel[]): Observable<ToolConnectionUIModel[]> {
    return this.http.post<ToolConnectionUIModel[]>(this.api + 'api/toolconnection', toolConnectionList).pipe(catchError(this.handleError));
  }


}
