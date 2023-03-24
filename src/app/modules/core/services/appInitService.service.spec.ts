import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';

import { AppInitService } from './appInitService.service';

fdescribe('AppInitServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [HttpClientTestingModule],
      providers: [provideMockStore({})]
  }));

  it('should be created', () => {
    const service: AppInitService = TestBed.get(AppInitService);
    expect(service).toBeTruthy();
  });
});
