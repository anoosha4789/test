import { TestBed } from '@angular/core/testing';

import { TokenStorageService } from './tokenStorage.service';

fdescribe('TokenStorageService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TokenStorageService = TestBed.get(TokenStorageService);
    expect(service).toBeTruthy();
  });
});
