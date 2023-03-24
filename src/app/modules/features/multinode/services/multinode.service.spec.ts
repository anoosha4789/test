import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { MultinodeService } from './multinode.service';

fdescribe('MultinodeService', () => {
  let service: MultinodeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports:[HttpClientTestingModule]
    });
    service = TestBed.inject(MultinodeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
