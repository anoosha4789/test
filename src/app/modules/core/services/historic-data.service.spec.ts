import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';

import { HistoricDataService } from './historic-data.service';

fdescribe('HistoricDataService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [HttpClientTestingModule],
      providers: [provideMockStore({})]
  }));

  it('should be created', () => {
    const service: HistoricDataService = TestBed.get(HistoricDataService);
    expect(service).toBeTruthy();
  });
});
