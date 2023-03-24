import {throwError as observableThrowError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '@env/environment';

// Base service for all Gateway HTTP services
export class GatewayBaseService {

    public headers = new HttpHeaders(
    {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
    });
    
    public headersSkipError = new HttpHeaders(
    {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'X-Skip-Interceptor': 'true'
    });

    public headerDict = new HttpHeaders(
    {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
    });

    public baseUrl: string = environment.webHostURL;

    constructor(protected http: HttpClient) {}

    protected extractData(res: Response) {
        let data = res;
        //alert('in extraData - body = <' + body.toString() + '>');
        return data || {};
    }

    private static formatMessage(error: Response | any): string {
        let errMsg: string;
        if (error instanceof Response) {
            //const body = error.json() || '';
            const err = error;
            errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
        } else {
            errMsg = error.message ? error.message : error.toString();
        }
        return errMsg;
    }

    protected handleError(error: Response | any) {
        // In a real world app, you might use a remote logging infrastructure
        let errMssg: string = GatewayBaseService.formatMessage(error);
        return observableThrowError(errMssg);
    }

    protected handleLoginError(error: Response | any) {
        if (error.status === 400 && error.error != null) {
            return observableThrowError(error);
        }

        let errMssg: string = GatewayBaseService.formatMessage(error);
        return observableThrowError(errMssg);
    }
}