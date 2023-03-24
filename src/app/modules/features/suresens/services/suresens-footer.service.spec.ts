import { TestBed } from '@angular/core/testing';

import { SureSENSFooterService } from './suresens-footer.service';

describe('SureSENSFooterService', () => {
  let service: SureSENSFooterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SureSENSFooterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
