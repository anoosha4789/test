import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';

import { MultinodeBackupService } from './multinode-backup.service';

fdescribe('MultinodeBackupService', () => {
  let service: MultinodeBackupService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [provideMockStore({})]
    });
    service = TestBed.inject(MultinodeBackupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
