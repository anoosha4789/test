import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DataBackupDetailsModel } from '@core/models/webModels/DataBackupDetailsModel';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { GatewayBaseService } from './gatewayBase.service';

@Injectable({
  providedIn: 'root'
})
export class MultinodeBackupService extends GatewayBaseService {
  private multinodeBaseUrl = this.baseUrl + 'api/multinode/';
  private downloadUrl = this.baseUrl + 'api/filedownload/downloadbackup';
  constructor(protected http: HttpClient) {
    super(http);
  }

  getDataBackupDetails(): Observable<DataBackupDetailsModel> {
    return this.http.get<DataBackupDetailsModel>(this.multinodeBaseUrl + "getdatabackupdetails").pipe(catchError(this.handleError));
  }

  dataBackup(fileName: string): Observable<any> {
    return this.http.post(this.multinodeBaseUrl + "databackup", {
      PackageName: fileName
    }).pipe(catchError(this.handleError));

  }

  downloadBackup(filePath: string): Observable<any> {
    return this.http.post(this.downloadUrl, JSON.stringify(filePath), {
      headers: this.headers, responseType: 'blob'
    }).pipe(catchError(this.handleError));
  }

}
