import {catchError} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subscription } from 'rxjs';
import { environment } from '@env/environment';
import { GatewayBaseService } from './gatewayBase.service';
import { DownloadFileCriteriaModel } from '@core/models/webModels/DownloadFileCriteria.model';
import { DownloadFilePropertyModel } from '@core/models/webModels/DownloadFileProperty.model';

@Injectable({
    providedIn: 'root',
})

export class DownloadService  extends GatewayBaseService {

    private downloadBaseUrl = environment.webHostURL + 'api/';
    private cardFolderNamesURL = this.downloadBaseUrl + 'filedownload/gaugedatafolderlist';
    private downloadFileNamesFullPathBasedOnTimeRangeURL = this.downloadBaseUrl + 'filedownload/filedownloadrequest';
    private downloadFileDataURL = this.downloadBaseUrl + 'filedownload';
    private downloadLogFileDataURL = this.downloadBaseUrl + 'filedownload/tree';

    constructor(protected http: HttpClient) {
        super(http);
    }
   
    getcardFolderNames(): Observable<any> {
        let url = this.cardFolderNamesURL;
        return this.http.get(url, { headers: this.headerDict }).pipe(
            catchError(this.handleError));
    }

    getdownloadFileFullPathBasedOnTimeRange(downloadFileCriteriaModel:DownloadFileCriteriaModel): Observable<DownloadFilePropertyModel[]> {
            let options = ({ headers: this.headers });
            return this.http.post<DownloadFilePropertyModel[]>(this.downloadFileNamesFullPathBasedOnTimeRangeURL, downloadFileCriteriaModel, options).pipe(
                catchError(this.handleError));
    }

    getdownloadFileData(filepaths:string[]): Observable<any> {
        return this.http.post(this.downloadFileDataURL, filepaths, { headers: this.headers, responseType: 'text' }).pipe(
            catchError(this.handleError));
    }

    // Get Browse Log Files 
    getDownloadLogFilesData(): Observable<any> {
        return this.http.get(this.downloadLogFileDataURL).pipe(catchError(this.handleError));
    }
}
