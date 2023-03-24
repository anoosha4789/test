import { TestBed } from '@angular/core/testing';

import { MultiNodelocalstorageService } from './multi-nodelocalstorage.service';

fdescribe('MultiNodelocalstorageService', () => {
  let service: MultiNodelocalstorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers:[MultiNodelocalstorageService]
    });
    service = TestBed.inject(MultiNodelocalstorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
