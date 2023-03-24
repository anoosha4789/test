import { DebugElement } from '@angular/core';
import { async, ComponentFixture, ComponentFixtureAutoDetect, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IgxAvatarModule, IgxButtonModule, IgxCardModule, IgxChipsModule, IgxDialogModule, IgxDividerModule, IgxExpansionPanelModule, IgxGridComponent, IgxGridModule, IgxIconModule, IgxListModule, IgxRippleModule, IgxSliderModule, IgxTooltipModule } from '@infragistics/igniteui-angular';
import { provideMockStore } from '@ngrx/store/testing';
import { GatewayModalService } from '@shared/gateway-dialogs/services/gatewayModal.service';

import { DiagnosticsModbusTemplatePointsComponent } from './diagnostics-modbus-template-points.component';

fdescribe('DiagnosticsModbusTemplatePointsComponent', () => {
  let component: DiagnosticsModbusTemplatePointsComponent;
  let fixture: ComponentFixture<DiagnosticsModbusTemplatePointsComponent>;
  let el: DebugElement;
  
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MatDialogModule,
        IgxTooltipModule,
        IgxAvatarModule,
        IgxButtonModule,
        IgxIconModule,
        IgxCardModule,
        IgxDividerModule,
        IgxDialogModule,
        IgxRippleModule,
        IgxChipsModule,
        IgxSliderModule,
        IgxListModule,
        IgxExpansionPanelModule,
        IgxGridModule,
        BrowserAnimationsModule,
        MatIconModule
      ],
      providers: [provideMockStore({}), GatewayModalService, { provide: ComponentFixtureAutoDetect, useValue: true }],
      declarations: [DiagnosticsModbusTemplatePointsComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiagnosticsModbusTemplatePointsComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
    fixture.detectChanges();
    //const grid: IgxGridComponent = fixture.componentInstance.gridModbusDataPoints;
    //expect(grid).toBeDefined();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
