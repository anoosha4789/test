import { TestBed } from '@angular/core/testing';

import { GwFooterService } from './gw-footer-service.service';

fdescribe('GwFooterService', () => {
  let service: GwFooterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GwFooterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
