import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { LoginModel, UserRoles } from '@core/models/webModels/Login.model';
import { throwError as observableThrowError, Observable, Subject } from 'rxjs';
import { HttpParams, HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, timeout } from 'rxjs/operators';
import { RealTimeDataSignalRService } from './realTimeDataSignalR.service';
import { UICommon } from '@core/data/UICommon';
import { sha512 } from 'js-sha512';
import { TokenStorageService } from './tokenStorage.service';
import { GatewayBaseService } from './gatewayBase.service';
import { NavigationService } from './navigation.service';

@Injectable({
  providedIn: 'root',
})
export class UserService extends GatewayBaseService {
  public baseUrl: string = environment.webHostURL;
  public validateLoginUrl: string = this.baseUrl + 'api/login/validate'; // Validate the login user account
  public LogOffUrl: string = this.baseUrl + 'api/login/logoff'; // Invalidate the server security token

  public getUserAccountUrl: string = this.baseUrl + 'api/login/get'; // get all custom user accounts
  public userAccountAddUrl: string = this.baseUrl + 'api/login/add'; // useraccount/add
  public userAccountDeleteUrl: string = this.baseUrl + 'api/login/delete'; // useraccount/delete
  public userAccountUpdateUrl: string = this.baseUrl + 'api/login/update'; // useraccount/update

  public loginGetUsersUrl: string = this.baseUrl + 'api/login/get';
  private updateoperationuserurl = this.baseUrl + 'api/appsettings/updateoperationuser/';

  private _logInLogOutSubject = new Subject<boolean>();

  constructor(
    protected http: HttpClient,
    private signalRService: RealTimeDataSignalRService,
    private tokenStorageService: TokenStorageService,
    private navigationService: NavigationService
  ) {
    super(http);
    this.CheckTokenValid();
  }

  // API Calls
  private validateLoginUser(user: LoginModel): Observable<any> {
    return this.http
      .post<any>(this.validateLoginUrl, JSON.stringify(user), {
        headers: this.headers,
      })
      .pipe(catchError(this.handleLoginError));
  }

  AddUserAccount(user: LoginModel): Observable<LoginModel[]> {
    return this.http
      .post<LoginModel[]>(this.userAccountAddUrl, JSON.stringify(user), {
        headers: this.headers,
      })
      .pipe(catchError(this.handleError));
  }

  UpdateUserAccount(user: LoginModel): Observable<LoginModel[]> {
    return this.http
      .post<LoginModel[]>(this.userAccountUpdateUrl, JSON.stringify(user), {
        headers: this.headers,
      })
      .pipe(catchError(this.handleError));
  }

  DeleteUserAccount(user: string): Observable<LoginModel[]> {
    const params = new HttpParams().set('name', user);
    return this.http
      .post<LoginModel[]>(
        this.userAccountDeleteUrl,
        { headers: this.headerDict },
        { params }
      )
      .pipe(catchError(this.handleError));
  }

  public GetLoginUsers(): Observable<LoginModel[]> {
    return this.http.get<LoginModel[]>(this.loginGetUsersUrl, { headers: this.headers }).pipe(
        catchError(this.handleError));
  }

  private Logoff(user: string): Observable<any> {
    const params = new HttpParams().set('name', user);
    return this.http
      .post<any>(this.LogOffUrl, { headers: this.headerDict }, { params })
      .pipe(catchError(this.handleError));
  }

  // Business logic methods
  private UpdateLoginLogoutStatus(bStatus: boolean) {
    this._logInLogOutSubject.next(bStatus);
  }

  public GetLoginLogoutStatus(): Subject<boolean> {
    return this._logInLogOutSubject;
  }

  private CheckTokenValid(): void {
    this.signalRService.IsUserTokenInvalidated().subscribe(isInValidated => {
      if (isInValidated)
        this.LoginOpenUser();
    });
  }

  isAdminUser(user: LoginModel): boolean {
    let bIsAdmin = false;
    if (user !== undefined && user != null) {
      if (user.AccessLevel !== undefined && user.AccessLevel != null)
        if (parseInt(user.AccessLevel.toString()) === UserRoles.Administrator)
          bIsAdmin = true;
    }
    return bIsAdmin;
  }

  isOperatorUser(user: LoginModel): boolean {
    let isOperator = false;
    if (user !== undefined && user != null) {
      if (user.AccessLevel !== undefined && user.AccessLevel != null)
        if (parseInt(user.AccessLevel.toString()) === UserRoles.Operator)
        isOperator = true;
    }
    return isOperator;
  }

  public IsManufacturingUser(user: LoginModel): boolean {
    let bResult = false;
    if (user !== undefined && user != null) {
      if (user.Name.toLowerCase() === 'manufacturing' && this.isAdminUser(user)) {
        bResult = true;
      }
    }
    return bResult;
  }

  GetCurrentLoginUser(): Promise<LoginModel> {
    let currentLoginUser: LoginModel = null;
    const token = this.tokenStorageService.getToken();
    if (token !== undefined && token != null) { 
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      if (tokenData !== undefined) {
        currentLoginUser = new LoginModel();
        currentLoginUser.AccessLevel = tokenData.role;
        currentLoginUser.Name = tokenData.unique_name;
      }
    }
    return Promise.resolve(currentLoginUser);
  }

  public inValidateUser(): Promise<boolean> {
    this.GetCurrentLoginUser().then(currentLoginUser => {
      if (currentLoginUser != null) {
        console.log(currentLoginUser.Name + ' invalidated as either the token is expired, configuration reset or user is not authorized...');
        this.tokenStorageService.removeToken();
        this.signalRService.stopConnection(); // Stop SignalR connection
        this.UpdateLoginLogoutStatus(false);

        return this.LoginOpenUser();  // Login Open User to start new session
      }
    },
    (error)=> {
      console.log('Error in logOut: ' + error);
      return Promise.resolve(false);
    });    
    return Promise.resolve(false);
  }

  private LogoutUser(user: string): Promise<boolean> {
    this.Logoff(user).subscribe(
      () => {
        console.log(user + ' logged off...');
        this.tokenStorageService.removeToken();
        this.signalRService.stopConnection(); // Stop SignalR connection
        this.UpdateLoginLogoutStatus(false);
        UICommon.deletedObjects = [];
        return Promise.resolve(true);
      },
      (error) => {
        console.log('Error in logOut ' + user + '...' + error);
      }
    );
    return Promise.resolve(false);
  }

  LogOut(): Promise<boolean> {
    this.GetCurrentLoginUser().then(currentLoginUser => {
      if (currentLoginUser != null) {
        this.LogoutUser(currentLoginUser.Name).then(() => {
          return this.LoginOpenUser();
        })
      }
    },
    (error)=> {
      console.log('Error in logOut: ' + error);
      return Promise.resolve(false);
    });    
    return Promise.resolve(false);
  }

  public LoginOpenUser(): void {
    console.log('Open User Login....');
    const user = new LoginModel();
    user.Name = 'Open';
    user.Password = UICommon.OPEN_USER_PWD;
    this.LoginAsNewUser(user).subscribe(loggedInUser => this.navigationService.setHeaderLinksByUserRoles(loggedInUser));
  }

  LoginAsNewUser(selectedUser: LoginModel): Observable<LoginModel> {
    const userLoggedIn: Observable<LoginModel> = new Observable((observer) => {
      if (selectedUser !== undefined) {
        var tempPass = selectedUser.Password;
        selectedUser.Password = sha512.hex(selectedUser.Password);
        this.validateLoginUser(selectedUser).subscribe(
          (result) => {
            // service returns the access level for the user
            if (result !== undefined) {
              this.tokenStorageService.saveToken(result.Token);
              this.signalRService.startConnection(); // Connect to SignalR connection and Streaming
              selectedUser.AccessLevel = result.AccessLevel;
              selectedUser.Password = tempPass;
              observer.next(selectedUser);
              this.UpdateLoginLogoutStatus(true);
            }
          },
          (error) => {
            selectedUser.Password = tempPass;
            observer.error(error);
            console.log('Error in logOut Open User...' + error);
          }
        );
      } else {
        observer.error('Login user failed' + selectedUser);
      }
    });
    return userLoggedIn;
  }  

  // For InflexDB Shift History Report
  updateShiftOperationUser(userName: string): Observable<any> {
    return this.http.post(`${this.updateoperationuserurl}${userName}`, 1).pipe(
      catchError(this.handleError));
  }
}
