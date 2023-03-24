import { TestBed } from '@angular/core/testing';

import { InchargeFooterService } from './incharge-footer.service';

describe('InchargeFooterService', () => {
  let service: InchargeFooterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InchargeFooterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
