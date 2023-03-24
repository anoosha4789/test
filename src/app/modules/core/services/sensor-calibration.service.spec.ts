import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';

import { SensorCalibrationService } from './sensor-calibration.service';

fdescribe('SensorCalibrationService', () => {
  let service: SensorCalibrationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [provideMockStore({})]
    });
    service = TestBed.inject(SensorCalibrationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
