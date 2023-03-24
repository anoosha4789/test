import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { provideMockStore } from '@ngrx/store/testing';
import { GatewayModalService } from '@shared/gateway-dialogs/services/gatewayModal.service';
import { ConfigurationService } from './configurationService.service';
import { GatewayPanelConfigurationService } from './gateway-panel-configuration.service';
import { GwFooterService } from './gw-footer-service.service';
import { SystemClockService } from './system-clock.service';



fdescribe('GatewayPanelConfigurationService', () => {
  let service: GatewayPanelConfigurationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, MatDialogModule],
      providers: [
        provideMockStore({}),
        ConfigurationService, GatewayModalService, GatewayPanelConfigurationService
      ]
    });
    service = TestBed.inject(GatewayPanelConfigurationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
