import { TestBed } from '@angular/core/testing';

import { StimulsoftReportService } from './stimulsoft-report.service';

fdescribe('StimulsoftReportService', () => {
  let service: StimulsoftReportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StimulsoftReportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
