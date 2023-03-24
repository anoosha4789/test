import { TitleCasePipe } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';

import { ConfigurationSummaryService } from './configuration-summary.service';

fdescribe('ConfigurationSummaryService', () => {
  let service: ConfigurationSummaryService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideMockStore({}),TitleCasePipe],
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(ConfigurationSummaryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
