import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';

import { SurefloService } from './sureflo.service';

fdescribe('SurefloService', () => {
  let service: SurefloService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [provideMockStore({})]
    });
    service = TestBed.inject(SurefloService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
