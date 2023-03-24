import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { BrowseFileDialogComponent, BrowseFileDialogComponentData } from '../components/browse-file-dialog/browse-file-dialog.component';
import { Observable } from 'rxjs';
import { take, map } from 'rxjs/operators';
import { ConfigurationResetDialogComponent } from '../components/configuration-reset-dialog/configuration-reset-dialog.component';
import { GatewayDialogComponent, GatewayDialogDataService } from '../components/gateway-dialog/gateway-dialog.component';
import { ComponentType } from '@angular/cdk/portal';
import { ButtonActions, GatewayAdvancedDialogComponent, GatewayAdvancedDialogDataService } from '../components/gateway-advanced-dialog/gateway-advanced-dialog.component';
import { GatewayDialogInModalComponent, GatewayDialogInModalDataService } from '../components/gateway-dialog-in-modal/gateway-dialog-in-modal.component';
import { DownloadConfirmDialogComponent } from '../components/download-confirm-dialog/download-confirm-dialog.component';
import { GatewayBrowseFileDialogComponent, GatewayBrowseFileDialogComponentData } from '../components/gateway-browse-file-dialog/gateway-browse-file-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class GatewayModalService {
  dialogRef;
  constructor(public dialog: MatDialog,
    private gatewayDialogDataService: GatewayDialogDataService,
    private gatewayAdvancedDataService: GatewayAdvancedDialogDataService,
    private gatewayDialogInModalDataService: GatewayDialogInModalDataService) { }

  openBrowseFileDialog(browseFileDialogComponentData: BrowseFileDialogComponentData): void {
    this.dialogRef = this.dialog.open(BrowseFileDialogComponent, {
      data: browseFileDialogComponentData,
      disableClose: true
    });
  }

  openGatewayBrowseFileDialog(browseFileDialogComponentData: GatewayBrowseFileDialogComponentData): void {
    this.dialogRef = this.dialog.open(GatewayBrowseFileDialogComponent, {
      data: browseFileDialogComponentData,
      disableClose: true
    });
  }

  openResetConfigurationDialog(): void {
    this.dialogRef = this.dialog.open(ConfigurationResetDialogComponent, { disableClose: true });
  }

  openDownloadConfirmDialog(): void {
    this.dialogRef = this.dialog.open(DownloadConfirmDialogComponent, { disableClose: true });
  }

  openDialog(content: string,
    actionCallback,
    closeCallback,
    title?: string,
    subtitle?: string,
    showCancelButton?: boolean,
    primaryBtnText?: string,
    secondaryBtnText?: string,
    width: string = '368px',
    panelClass?: string | string[]): void {
    this.gatewayDialogDataService.content = content;
    this.gatewayDialogDataService.title = title;
    this.gatewayDialogDataService.subtitle = subtitle;
    this.gatewayDialogDataService.showCancelButton = showCancelButton;
    this.gatewayDialogDataService.actionCallback = actionCallback;
    this.gatewayDialogDataService.primaryBtnText = primaryBtnText;
    this.gatewayDialogDataService.secondaryBtnText = secondaryBtnText;
    this.gatewayDialogDataService.closeCallback = closeCallback;

    this.dialogRef = this.dialog.open(GatewayDialogComponent, {
      width: width,
      disableClose: true,
      autoFocus: true,
      backdropClass: 'advanced-modal-overlay',
      panelClass: panelClass ?? null
    });
  }

  openAdvancedDialog(title: string,
    actionType: ButtonActions = ButtonActions.OKCancel,
    componentType: ComponentType<any>,
    componentData: any,
    actionCallback,
    width: string = '600px',
    maxWidth?: string,
    height?: string,
    maxHeight?: string,
    panelClass?: string | string[]): void {
    this.gatewayAdvancedDataService.title = title;
    this.gatewayAdvancedDataService.actionType = actionType;
    this.gatewayAdvancedDataService.actionCallback = actionCallback;
    this.gatewayAdvancedDataService.componentType = componentType;
    this.gatewayAdvancedDataService.componentData = componentData;

    this.dialogRef = this.dialog.open(GatewayAdvancedDialogComponent, {
      width: width,
      maxWidth: maxWidth,
      height: height,
      maxHeight: maxHeight,
      disableClose: true,
      autoFocus: false,
      backdropClass: 'advanced-modal-overlay',
      panelClass: panelClass ?? null
    });
  }

  openDialogInsideModal(title: string,
    actionType: ButtonActions = ButtonActions.OKCancel,
    componentType: ComponentType<any>,
    componentData: any,
    actionCallback,
    width: string = '600px',
    maxWidth?: string): MatDialogRef<any> {
    this.gatewayDialogInModalDataService.title = title;
    this.gatewayDialogInModalDataService.actionType = actionType;
    this.gatewayDialogInModalDataService.actionCallback = actionCallback;
    this.gatewayDialogInModalDataService.componentType = componentType;
    this.gatewayDialogInModalDataService.componentData = componentData;

    let dialogRef = this.dialog.open(GatewayDialogInModalComponent, {
      width: width,
      maxWidth: maxWidth,
      disableClose: true,
      autoFocus: false,
      backdropClass: 'advanced-modal-overlay'
    });

    return dialogRef;
  }

  public confirmed(): Observable<any> {
    return this.dialogRef.afterClosed().pipe(take(1), map(res => {
      return res;
    }
    ));
  }

  closeModal() {
    this.dialogRef.close();
  }
}
