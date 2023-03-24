import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';

import { RealTimeDataSignalRService } from './realTimeDataSignalR.service';

fdescribe('RealTimeDataSignalRService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [HttpClientTestingModule],
      providers: [provideMockStore({})]
  }));

  it('should be created', () => {
    const service: RealTimeDataSignalRService = TestBed.get(RealTimeDataSignalRService);
    expect(service).toBeTruthy();
  });
});
