import { Component, OnInit, ViewChild, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject, Subscription } from 'rxjs';
import { String } from 'typescript-string-operations';
import { IgxGridComponent, IgxDialogComponent } from 'igniteui-angular';

import { LoginModel, UserRoles } from '@core/models/webModels/Login.model';
import { IUsersState } from '@store/state/users.state';
import { StateUtilities } from '@store/state/IState';
import * as ACTIONS from '@store/actions/users.action';
import { UserService } from '@core/services/user.service';
import { GatewayModalService } from '@shared/gateway-dialogs/services/gatewayModal.service';
import { UserInfoComponent, UserInfoComponentData } from '../user-info/user-info.component';
import { ButtonActions } from '@shared/gateway-dialogs/components/gateway-advanced-dialog/gateway-advanced-dialog.component';
import { deleteUIModal } from '@core/data/UICommon';

@Component({
  selector: 'app-useraccounts',
  templateUrl: './useraccounts.component.html',
  styleUrls: ['./useraccounts.component.scss']
})
export class UserAccountsComponent implements OnInit, OnChanges {
  @Input()
  clearUsers: boolean;
  
  @ViewChild("gridUserAccounts", { static: true })
  public gridUserAccounts: IgxGridComponent;

  userRoles = UserRoles;
  arrUserRoles = null;

  usersModels$: Observable<IUsersState>;
  userAccounts: LoginModel[] = [];
  userAccount: LoginModel = new LoginModel();
  loggedInUserName: string = "";
  hide: boolean = true;

  private arrSubscriptions: Subscription[] = [];

  constructor(private store: Store<{ usersState: IUsersState }>, 
    private gatewayDialogService: GatewayModalService, private userService: UserService) {
    this.arrUserRoles = Object.keys(this.userRoles).map(Number).filter(f => !isNaN(Number(f)));
    this.usersModels$ = this.store.select<any>((state: any) => state.usersState);
  }

  private openUserDialog(bIsAdd: boolean): void {
    let userInfoComponentData: UserInfoComponentData = {
      userAccount: this.userAccount,
      modalEditMode : !bIsAdd
    }

    this.gatewayDialogService.openAdvancedDialog(
      bIsAdd ? 'New User' : 'Edit User',
      ButtonActions.None,
      UserInfoComponent,
      userInfoComponentData,
      () => {
        this.closeUserDialog();
      },
      '410px',
      null,
      null,
      null
    );
  }

  public addRow() {
    this.userAccount = {Id: -1, Name: "", Password: "", AccessLevel: UserRoles.Administrator };
    this.openUserDialog(true);
  }

  closeUserDialog() {
    this.userAccount = {Id: -1, Name: "", Password: "", AccessLevel: UserRoles.Administrator };
  }

  public editRowValues(rowID) {
    this.userAccount = this.userAccounts.find(u => u.Id === rowID);
    if (this.userAccount !== null) {
      this.openUserDialog(false);
    }
  }

  public deleteRow(rowIndex, rowID) {
    if (rowID === -1)
      this.gridUserAccounts.deleteRow(rowID);
    else {
      let userToDelete = this.gridUserAccounts.getRowByIndex(rowIndex).cells.find((cell) => cell.column.field === "Name").value;
      if (userToDelete !== undefined && userToDelete != null) {
        let user: string = userToDelete as string;
        if (this.loggedInUserName.toLowerCase() == user.toLowerCase()) {
          this.gatewayDialogService.openDialog(
            String.Format('{0} is logged in. Therefore, the user can’t be deleted.', userToDelete),
            () => this.gatewayDialogService.closeModal(),
            null,
            'Info',
            null,
            false,
            "Ok"
          );
        }
        else {
          this.gatewayDialogService.openDialog(
            `Do you want to delete user '${userToDelete}'?`,
            () => this.deleteUser(userToDelete),
            () => this.gatewayDialogService.closeModal(),
            deleteUIModal.title,
            null,
            true,
            deleteUIModal.primaryBtnText,
            deleteUIModal.secondaryBtnText
          );
        }
      }    
    }
  }

  deleteUser(userToDelete) {
    this.gatewayDialogService.closeModal();
    this.store.dispatch(ACTIONS.USERS_DELETE({user: userToDelete}));
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
  }

  ngOnChanges(changes: SimpleChanges): void {
    let index = this.userAccounts.findIndex(u => u.Id === -1);
    if (index > -1)
      this.userAccounts.splice(index, 1);
    this.gridUserAccounts.endEdit(false);
  }

  ngOnInit(): void {
    this.subscribeToUsers();

    this.userService.GetCurrentLoginUser().then(currentUser => {
      if (currentUser) {
        this.loggedInUserName = currentUser.Name;
      }
    });
  }

}
