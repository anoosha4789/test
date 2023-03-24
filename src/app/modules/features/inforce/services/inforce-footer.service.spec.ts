import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { GwFooterService } from '@core/services/gw-footer-service.service';
import { provideMockStore } from '@ngrx/store/testing';
import { InforceFooterService } from './inforce-footer.service';

describe('InforceFooterService', () => {
  let service: InforceFooterService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MatDialogModule, HttpClientTestingModule ],
      providers:[ provideMockStore({}), GwFooterService, InforceFooterService]
    });
    service = TestBed.inject(InforceFooterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
