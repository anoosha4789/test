import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { RouterTestingModule } from '@angular/router/testing';
import { ConfigurationService } from '@core/services/configurationService.service';
import { GatewayPanelConfigurationService } from '@core/services/gateway-panel-configuration.service';
import { GwFooterService } from '@core/services/gw-footer-service.service';
import { SystemClockService } from '@core/services/system-clock.service';
import { provideMockStore } from '@ngrx/store/testing';
import { GatewayModalService } from '@shared/gateway-dialogs/services/gatewayModal.service';

import { GatewayFooterComponent } from './gateway-footer.component';

fdescribe('GatewayFooterComponent', () => {
  let component: GatewayFooterComponent;
  let fixture: ComponentFixture<GatewayFooterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GatewayFooterComponent ],
      imports: [HttpClientTestingModule, MatIconModule, MatDialogModule, RouterTestingModule],
      schemas:[CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        provideMockStore({}), GwFooterService, SystemClockService, GatewayPanelConfigurationService, ConfigurationService, GatewayModalService,
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: [] }
        ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GatewayFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
