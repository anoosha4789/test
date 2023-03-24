import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';

import { MultinodeReportService } from './multinode-report.service';

fdescribe('MultinodeReportService', () => {
  let service: MultinodeReportService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [provideMockStore({})]
    });
    service = TestBed.inject(MultinodeReportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
