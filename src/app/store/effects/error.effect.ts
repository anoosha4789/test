import { Injectable } from '@angular/core';
import { HttpErrorResponse } from "@angular/common/http";

import { createEffect, Actions, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import * as ACTIONS from '@store/actions/error.action';
import { BhAlertService } from 'bh-theme';
import { BadLoginModel } from '@core/models/webModels/Login.model';


@Injectable()
export class ErrorEffects {

    constructor(private actions$: Actions, private bhAlertService: BhAlertService) { }

    loadError$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ACTIONS.ADD_GLOBAL_ERROR),
            mergeMap((res: HttpErrorResponse | any) => {
                
                this.bhAlertService.showAlert(
                    "error",
                    "top",
                    5000,
                    this.formatErorMsg(res.error)

                );
                // console.log("API Error -> " + this.formatErorMsg(res.error));
                // remap to noop Action if no state needs to be updated. 
                // or for example on 401 Errors dispach a re-login action etc. 
                return of({ type: 'noop' });
            })
        )
    );

    private checkIfInvalidUser(error: HttpErrorResponse): boolean {
        if (error.error && error.error.Delay != undefined && error.error.Error)
            return true;

        return false;
    }

    private formatErorMsg(error: HttpErrorResponse | any) {
        let errMsg: string;
        if (error instanceof HttpErrorResponse) {
            if (this.checkIfInvalidUser(error))
                return errMsg = `${error.error.Error??''} `;
            else {
                switch(error.status) {
                    case 400:
                        errMsg = "Bad Request. Please try again or contact Administrator.";
                        break;

                    case 401:
                        errMsg = "Unauthorized Access.";
                        break;

                    case 403:
                        errMsg = "Forbidden. Access denied.";
                        break;

                    case 404:
                        errMsg = "Resource not found. Please try again or contact Administrator.";
                        break;

                    case 500:
                        errMsg = "Internal Server Error. Please try again or contact Administrator.";
                        break;

                    case 502:
                        errMsg = "Bad Gateway. Please try again or contact Administrator";
                        break;

                    case 503:
                        errMsg = "Service Unavailable. Please try again or contact Administrator";
                        break;

                    case 504:
                        errMsg = "Gateway Timeout. Please try again or contact Administrator"
                        break;

                    default:
                        errMsg = "Something went wrong. Please contact Administrator."
                }
                return errMsg;
            }
        } else {
            return errMsg = error.message ? error.message : error.toString();
        }
    }
}