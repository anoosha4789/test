import { TestBed } from '@angular/core/testing';

import { ModbusDataPointsService } from './modbus-data-points.service';

fdescribe('ModbusDataPointsService', () => {
  let service: ModbusDataPointsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ModbusDataPointsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
