import { ComponentType } from '@angular/cdk/portal';
import { AfterViewInit, ChangeDetectorRef, Component, ComponentFactoryResolver, ComponentRef, Injectable, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { GatewayInsertionDirective } from '@shared/gateway-dialogs/directives/insertion.directive';
import { ButtonActions } from '../gateway-advanced-dialog/gateway-advanced-dialog.component';

@Component({
  selector: 'app-gateway-dialog-in-modal',
  templateUrl: './gateway-dialog-in-modal.component.html',
  styleUrls: ['./gateway-dialog-in-modal.component.scss']
})
export class GatewayDialogInModalComponent implements OnInit, AfterViewInit, OnDestroy {

  title: string;
  subtitle: string;
  content: string;
  actionType = ButtonActions.OKCancel;
  componentRef: ComponentRef<any>;
  componentData: any;
  childComponentType: ComponentType<any>;

  @ViewChild(GatewayInsertionDirective)
  insertionPoint: GatewayInsertionDirective;

  showActions: boolean = true;
  showCancelButton: boolean = true;

  constructor(
    public dialogRef: MatDialogRef<GatewayDialogInModalComponent>,
    private gwDialogInMaodalDataService: GatewayDialogInModalDataService,
    private componentFactoryResolver: ComponentFactoryResolver,
    private cd: ChangeDetectorRef
  ) {}

  OnCancel(): void {
    this.dialogRef.close();
  }

  OnOk(result?) {
    this.gwDialogInMaodalDataService.actionCallback(result);
  }

  loadChildComponent(componentType: ComponentType<any>) {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(
      componentType
    );

    const viewContainerRef = this.insertionPoint.viewContainerRef;
    viewContainerRef.clear();

    this.componentRef = viewContainerRef.createComponent(componentFactory);

    this.componentRef.instance.data = this.componentData;
  }

  ngOnDestroy(): void {
    if (this.componentRef) {
      this.componentRef.destroy();
    }
  }

  ngAfterViewInit(): void {
    this.loadChildComponent(this.childComponentType);
    this.cd.detectChanges();
  }

  ngOnInit(): void {
    this.title = this.gwDialogInMaodalDataService.title;
    this.actionType = this.gwDialogInMaodalDataService.actionType;
    this.childComponentType = this.gwDialogInMaodalDataService.componentType;
    this.componentData = this.gwDialogInMaodalDataService.componentData;
    
    // Actions buttons
    this.showActions = this.actionType != ButtonActions.None ? true : false;
    this.showCancelButton = this.actionType == ButtonActions.OKCancel ? true: false;

    if (!this.showActions) {  // No actions in gateway dialog - get callback from actual component
      this.dialogRef.afterClosed().subscribe(res => {
        this.OnOk(res);
      });
    }
  }

}

@Injectable({
  providedIn: 'platform',
})
export class GatewayDialogInModalDataService {
  content: string;
  title: string;
  subtitle: string;
  actionType: ButtonActions;
  actionCallback;
  componentType: ComponentType<any>;
  componentData: any;
}
