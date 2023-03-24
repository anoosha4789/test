import { ComponentType } from '@angular/cdk/portal';
import { AfterViewInit, ChangeDetectorRef, Component, ComponentFactoryResolver, ComponentRef, Injectable, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { GatewayInsertionDirective } from '@shared/gateway-dialogs/directives/insertion.directive';

@Injectable({
  providedIn: 'platform',
})
export class GatewayAdvancedDialogDataService {
  content: string;
  title: string;
  subtitle: string;
  actionType: ButtonActions;
  actionCallback;
  componentType: ComponentType<any>;
  componentData: any;
}

@Component({
  selector: 'app-gateway-advanced-dialog',
  templateUrl: './gateway-advanced-dialog.component.html',
  styleUrls: ['./gateway-advanced-dialog.component.scss']
})
export class GatewayAdvancedDialogComponent implements OnInit, AfterViewInit, OnDestroy {

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
    public dialogRef: MatDialogRef<GatewayAdvancedDialogComponent>,
    private gwModalAdvancedDataService: GatewayAdvancedDialogDataService,
    private componentFactoryResolver: ComponentFactoryResolver,
    private cd: ChangeDetectorRef
  ) {}

  OnCancel(): void {
    this.dialogRef.close();
  }

  OnOk(result?) {
    this.gwModalAdvancedDataService.actionCallback(result);
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
    this.title = this.gwModalAdvancedDataService.title;
    this.actionType = this.gwModalAdvancedDataService.actionType;
    this.childComponentType = this.gwModalAdvancedDataService.componentType;
    this.componentData = this.gwModalAdvancedDataService.componentData;
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

export enum ButtonActions {
  None = 1,
  OKCancel,
  Confirm
}
