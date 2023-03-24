import { ComponentFactoryResolver } from '@angular/core';
import { ComponentType, PortalModule } from '@angular/cdk/portal';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { GatewayAdvancedDialogComponent, GatewayAdvancedDialogDataService } from './gateway-advanced-dialog.component';
import { GatewayInsertionDirective } from '@shared/gateway-dialogs/directives/insertion.directive';
import { ElectricalParametersDialogComponent } from '@features/multinode/components/electrical-parameters-dialog/electrical-parameters-dialog.component';

fdescribe('GatewayAdvancedDialogComponent', () => {
  let component: GatewayAdvancedDialogComponent;
  let fixture: ComponentFixture<GatewayAdvancedDialogComponent>;
  let componentFactoryResolverSpy: jasmine.SpyObj<ComponentFactoryResolver>;
  component.childComponentType = null;//componentFactoryResolverSpy.resolveComponentFactory(ElectricalParametersDialogComponent)

  beforeEach(async(() => {
    componentFactoryResolverSpy = jasmine.createSpyObj<ComponentFactoryResolver>('ComponentFactoryResolver', ['resolveComponentFactory']);
 
    TestBed.configureTestingModule({
      declarations: [ GatewayAdvancedDialogComponent,GatewayInsertionDirective],
      imports:[PortalModule],
      providers: [
        { provide: MatDialogRef, useValue: GatewayAdvancedDialogComponent },
        { provide: ComponentFactoryResolver, useValue: componentFactoryResolverSpy }, ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GatewayAdvancedDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
