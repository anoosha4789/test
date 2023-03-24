import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';

import { SystemClockService } from './system-clock.service';

fdescribe('SystemClockService', () => {
  let service: SystemClockService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [provideMockStore({})]
    });
    service = TestBed.inject(SystemClockService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
