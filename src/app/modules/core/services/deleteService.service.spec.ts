import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';

import { DeleteServiceService } from './deleteService.service';

fdescribe('DeleteServiceService', () => {
  let service: DeleteServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [provideMockStore({})]
    });
    service = TestBed.inject(DeleteServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
