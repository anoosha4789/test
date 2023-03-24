import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { GwFooterService } from '@core/services/gw-footer-service.service';
import { RealTimeDataSignalRService } from '@core/services/realTimeDataSignalR.service';
import { UserService } from '@core/services/user.service';
import { provideMockStore } from '@ngrx/store/testing';
import { GatewayModalService } from '@shared/gateway-dialogs/services/gatewayModal.service';

import { MultinodeFooterService } from './multinode-footer.service';

fdescribe('MultinodeFooterService', () => {
  let service: MultinodeFooterService;
  let wellEntity =
    [{ id: 1, name: 'A' }, { id: 2, name: 'B' }];


  beforeEach(() => {
    TestBed.configureTestingModule({
      imports:[MatDialogModule,HttpClientTestingModule],
      providers:[MultinodeFooterService,provideMockStore({}),UserService,GwFooterService]
    });
    //service = new MultinodeFooterService(provideMockStore({}), RealTimeDataSignalRService,GatewayModalService,UserService);
    service = TestBed.inject(MultinodeFooterService);
    service.wellEntity;
    service.sies =[];
    service.devices =[];
    
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
