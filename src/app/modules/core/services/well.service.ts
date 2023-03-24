import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { WellModel } from '@core/models/webModels/Well.model';
import { WellDataUIModel } from '@core/models/webModels/WellDataUIModel.model';
import { IZoneValveType } from '@core/models/UIModels/ValveType.model';

import { GatewayBaseService } from './gatewayBase.service';


@Injectable({
    providedIn: 'root',
})

export class WellService extends GatewayBaseService {

    private api = environment.webHostURL;

    constructor(protected http: HttpClient) {
        super(http);
    }

    // Get Well Achitectures
    getWellArchitectureList(): Observable<IWellArchitecture[]> {
        const results: Observable<IWellArchitecture[]> = this.http
            .get<IWellArchitecture[]>(this.api + 'api/well/wellarchitectures')
            .pipe(catchError(this.handleError));

        return results;
    }

    // Get Zone Valve Types
    getZoneValveTypesList(): Observable<IZoneValveType[]> {
        const results: Observable<IZoneValveType[]> = this.http
            .get<IZoneValveType[]>(this.api + 'api/well/zonevalvetypes')
            .pipe(catchError(this.handleError));

        return results;
    }

    // Get Wells List
    getWellInfo(): Observable<WellModel[]> {
        const results: Observable<WellModel[]> = this.http
            .get<WellModel[]>(this.api + 'api/well/getall')
            .pipe(catchError(this.handleError));

        return results;
    }

    // Get Wells
    getWellList(): Observable<WellDataUIModel[]> {
        const results: Observable<WellDataUIModel[]> = this.http
            .get<WellDataUIModel[]>(this.api + 'api/well')
            .pipe(catchError(this.handleError));

        return results;
    }

    // Get Wells
    getWell(wellId: number): Observable<WellDataUIModel> {
        const results: Observable<WellDataUIModel> = this.http
            .get<WellDataUIModel>(this.api + 'api/well/' + wellId)
            .pipe(catchError(this.handleError));

        return results;
    }

    // Save Well
    saveWell(wells: WellDataUIModel[]): Observable<any> {
        return this.http
            .post<any>(this.api + 'api/well', wells)
            .pipe(catchError(this.handleError));
    }

    // Delete Well
    deleteWell(wellId: number): Observable<any> {
        const params = new HttpParams().set('wellId', wellId.toString());
        return this.http
            .post<any>(this.api + 'api/well/delete',
                { params }
            )
            .pipe(catchError(this.handleError));
    }

    // updateinforceWellandDevices
    updateInForceWellandDevices(): Observable<any> {
        return this.http
            .post(this.api + 'api/well/updateinforceWellandDevices', null)
            .pipe(catchError(this.handleError));
    }
}

export interface IWellArchitecture {
    Id:number,
    ArchitectureName: string
}

export enum INFORCE_WELL_ARCHITECTURE {
    SURESENS = 1,
    N_PlUS_ONE,
    TWO_N
}

export enum ZONE_VALVE_TYPE { 
    Monitoring = 0,
    HCM_A,
    HCM_Plus,
    HCM_S,
    eHCM_P
}
