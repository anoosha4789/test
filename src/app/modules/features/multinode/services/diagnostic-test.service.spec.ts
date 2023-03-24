import { TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';

import { DiagnosticTestService } from './diagnostic-test.service';

fdescribe('DiagnosticTestService', () => {
  let service: DiagnosticTestService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers:[DiagnosticTestService,provideMockStore({})]
    });
    service = TestBed.inject(DiagnosticTestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
