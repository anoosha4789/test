import { TestBed } from '@angular/core/testing';

import { GwFeatureModuleService } from './gw-feature-module.service';

fdescribe('GwFeatureModuleService', () => {
  let service: GwFeatureModuleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GwFeatureModuleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
