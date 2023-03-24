import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';

import { GwSideNavigationService } from './gw-side-navigation.service';

fdescribe('GwSideNavigationService', () => {
  let service: GwSideNavigationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [provideMockStore({})]
    });
    service = TestBed.inject(GwSideNavigationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
