import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';

import { SuresensReportService } from './suresens-report.service';

fdescribe('SursensReportService', () => {
  let service: SuresensReportService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [provideMockStore({})]
    });
    service = TestBed.inject(SuresensReportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
