import { TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';

import { InforceConfigService } from './inforce-config.service';

fdescribe('InforceConfigService', () => {
  let service: InforceConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers:[InforceConfigService,provideMockStore({})]
    });
    service = TestBed.inject(InforceConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
