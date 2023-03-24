import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { provideMockStore } from '@ngrx/store/testing';

import { MultinodeAlarmsService } from './multinode-alarms.service';

fdescribe('MultinodeAlarmsService', () => {
  let service: MultinodeAlarmsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports:[HttpClientTestingModule,MatDialogModule],
      providers:[MultinodeAlarmsService,provideMockStore({})]
    });
    service = TestBed.inject(MultinodeAlarmsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
