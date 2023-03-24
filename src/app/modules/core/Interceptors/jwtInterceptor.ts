
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse, HttpErrorResponse } from "@angular/common/http";
import { Injectable, Injector } from "@angular/core";
import { Router } from "@angular/router";

import {Observable, throwError } from 'rxjs';
import {catchError} from 'rxjs/operators';


import { TokenStorageService } from '@core/services/tokenStorage.service';
import {Store} from '@ngrx/store';
import * as ACTIONS from '@store/actions/error.action';
import { IState } from '@store/state/IState';
import { UserService } from '@core/services/user.service';
import { UICommon } from '@core/data/UICommon';

const TOKEN_HEADER_KEY = 'Authorization';

@Injectable()
export class jwtInterceptor implements HttpInterceptor {

    router: Router;
    userService: UserService;

    constructor(private injector: Injector, private token: TokenStorageService, private store: Store<IState>) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
      //console.log(req.url);

      let authReq = req;
      let token = this.token.getToken();
      if (token != null) {
        authReq = req.clone({ headers: req.headers.set(TOKEN_HEADER_KEY, 'Bearer ' + token)});
      }
      if (req.headers.has('X-Skip-Interceptor'))
        return next.handle(authReq).pipe(catchError(x=>this.skipErrors(x)));
      return next.handle(authReq).pipe(catchError(x=>this.handleHttpErrors(x)));
    }   

    private handleHttpErrors(err: HttpErrorResponse): Observable<any> {
      //handle your auth error or rethrow
      if (err.status === 401 || err.status === 403) {
        this.router = this.injector.get(Router);
        this.userService = this.injector.get(UserService);
        this.userService.GetCurrentLoginUser().then(x=>{
          if (x && x.Name !=='Open'){ 
            // Fix an infinite loop bug when x = null
            this.userService.LogOut();
            this.router.navigate(["Home"]);
          }
        }); 
      }
      this.store.dispatch(ACTIONS.ADD_GLOBAL_ERROR({error: err}));
      
      if (err.error)  // If response has error message set - return error message
        return throwError(err.error);
      else            // return the errror response
        return throwError(err);
  }

  private skipErrors(err: HttpErrorResponse): Observable<any> {
    // rethrow
    return Observable.throw(err);
  }
  
}
