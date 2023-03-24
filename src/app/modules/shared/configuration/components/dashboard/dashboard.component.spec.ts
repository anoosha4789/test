import { TitleCasePipe } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { GatewayPanelConfigurationService } from '@core/services/gateway-panel-configuration.service';
import { GwFooterService } from '@core/services/gw-footer-service.service';
import { ValidationService } from '@core/services/validation.service';
import { SatPopoverModule } from '@ncstate/sat-popover';
import { provideMockStore } from '@ngrx/store/testing';
import { GwTruncatePipe } from '@shared/gateway-pipes/pipes/gw-truncate.pipe';
import { BhAlertDataService, BhAlertService } from 'bh-theme';

import { DashboardComponent } from './dashboard.component';

fdescribe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardComponent,GwTruncatePipe],
      schemas:[CUSTOM_ELEMENTS_SCHEMA],
      imports:[RouterTestingModule,SatPopoverModule,HttpClientTestingModule,MatDialogModule],
      providers:[provideMockStore({}),ValidationService,GatewayPanelConfigurationService,TitleCasePipe,
        MatSnackBar,BhAlertDataService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
