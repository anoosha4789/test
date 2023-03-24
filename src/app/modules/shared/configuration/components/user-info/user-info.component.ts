import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LoginModel, UserRoles } from '@core/models/webModels/Login.model';
import { ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { UsersEffects } from '@store/effects/users.effects';
import { IUsersState } from '@store/state/users.state';
import { Observable, Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import * as ACTIONS from '@store/actions/users.action';
import { StateUtilities } from '@store/state/IState';
import { sha512 } from 'js-sha512';
import { userSchema } from '@core/models/schemaModels/LoginModel.schema';
import { ValidationService } from '@core/services/validation.service';

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.scss']
})
export class UserInfoComponent implements OnInit {

  panelLoginForm: FormGroup;
  
  usersModels$: Observable<IUsersState>;
  userAccounts: LoginModel[] = [];
  userAccount: LoginModel = new LoginModel();

  userRoles = UserRoles;
  arrUserRoles = null;
  modalEditMode: boolean;
  hide: boolean = true;
  validationMssg: string = null;
  pwdErrorMsg: string = 'Required field.';

  private arrSubscriptions: Subscription[] = [];
  private unsubscribeUserActions$ = new Subject<void>();

  constructor(private store: Store<{ usersState: IUsersState }>,
    private userEffects: UsersEffects,
    private validationService: ValidationService,
    public dialogRef: MatDialogRef<UserInfoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserInfoComponentData) { 
      this.arrUserRoles = Object.keys(this.userRoles).map(Number).filter(f => !isNaN(Number(f)));
      this.usersModels$ = this.store.select<any>((state: any) => state.usersState);
  }

  get Name() {
    return this.panelLoginForm.get('Name');
  }

  get Password() {
    return this.panelLoginForm.get('Password');
  }

  validateUserName() {
    this.validationMssg = null;
    let ctrl = this.panelLoginForm.get('Name');
    if (ctrl && ctrl.invalid) {
      this.validationMssg = this.validationService.getValidationErrorMessage(ctrl.errors, "Username");
    }
  }

  addUser() {
    this.validationMssg = null;
    
    if (this.panelLoginForm.invalid === false) {
      let existUser = this.userAccounts.find(u => u.Name.trim().toLowerCase() == this.userAccount.Name.trim().toLowerCase());
      if (existUser !== undefined && existUser !== null && existUser.Id != this.userAccount.Id)  {
        this.validationMssg = 'Username already exists.';
        return;
      }

      let action = {
        user : { Id: this.userAccount.Id, Name: this.userAccount.Name.trim(), Password: this.userAccount.Password, AccessLevel: this.userAccount.AccessLevel }
      }

      if (this.userAccount.Id === -1) { // Add User
        action.user.Password = sha512.hex(action.user.Password);
        this.store.dispatch(ACTIONS.USERS_ADD(action));
      }
      else {
        if (action.user.Password !== null)  // if changing password
          action.user.Password = sha512.hex(action.user.Password);
        this.store.dispatch(ACTIONS.USERS_UPDATE(action));
      }
      //this.dialogRef.close(action.user);
    } 
    else {
      this.panelLoginForm.markAllAsTouched();
      this.validateUserName();
    }
  }

  OnCancel(): void {
    this.dialogRef.close();
  }

  OnOk() {
    this.addUser();
  }

  private createFormGroup(): void {
    this.panelLoginForm = new FormGroup({
      Name: new FormControl('', [Validators.required, Validators.maxLength(userSchema.properties.Name.maxLength)]),
      Password: new FormControl('', Validators.required),
      AccessLevel: new FormControl('', Validators.required)
    });
  }

  private subscribeToUserActions() {
    this.userEffects.addUser$.pipe(
      ofType(ACTIONS.USERS_ADD_FAILURE),
      takeUntil(this.unsubscribeUserActions$)
    ).subscribe((error) => {
      this.validationMssg = error.error;
    });

    this.userEffects.addUser$.pipe(
      ofType(ACTIONS.USERS_ADD_SUCCESS),
      takeUntil(this.unsubscribeUserActions$)
    ).subscribe(() => {
      this.dialogRef.close();
    });

    this.userEffects.updateUser$.pipe(
      ofType(ACTIONS.USERS_UPDATE_FAILURE),
      takeUntil(this.unsubscribeUserActions$)
    ).subscribe((error) => {
      this.validationMssg = error.error;
    });

    this.userEffects.updateUser$.pipe(
      ofType(ACTIONS.USERS_UPDATE_SUCCESS),
      takeUntil(this.unsubscribeUserActions$)
    ).subscribe(() => {
      this.dialogRef.close()
    });
  }

  private subscribeToUsers() {
    let subscription = this.usersModels$.subscribe((state: IUsersState) => {
      if (state !== undefined) {
        if (state.isLoaded === false && !StateUtilities.hasErrors(state))   // Dispatch Action if not loaded
          this.store.dispatch(ACTIONS.USERS_LOAD());
        else
          this.userAccounts = state.users.map(x => Object.assign({}, x));;
      }
    });

    this.arrSubscriptions.push(subscription);
  }

  ngOnDestroy(): void {
    if (this.arrSubscriptions != null && this.arrSubscriptions.length > 0) {
      this.arrSubscriptions.forEach(subscription => {
        if (subscription != null)
          subscription.unsubscribe();
      });
    }

    this.arrSubscriptions = [];
    this.unsubscribeUserActions$.next();
    this.unsubscribeUserActions$.complete();
  }
  
  ngOnInit(): void {
    this.subscribeToUsers();
    this.subscribeToUserActions();
    this.createFormGroup();

    if (this.data !== undefined && this.data !== null) {
      this.userAccount = this.data.userAccount;
      this.modalEditMode = this.data.modalEditMode;
    }
  }
}

export interface UserInfoComponentData {
  userAccount: LoginModel;
  modalEditMode: boolean;
}
