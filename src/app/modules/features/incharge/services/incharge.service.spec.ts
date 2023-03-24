import { TestBed } from '@angular/core/testing';

import { InchargeService } from './incharge.service';

describe('InchargeService', () => {
  let service: InchargeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InchargeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
