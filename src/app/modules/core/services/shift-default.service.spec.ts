import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';

import { ShiftDefaultService } from './shift-default.service';

fdescribe('ShiftDefaultService', () => {
  let service: ShiftDefaultService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [provideMockStore({})]
    });
    service = TestBed.inject(ShiftDefaultService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
