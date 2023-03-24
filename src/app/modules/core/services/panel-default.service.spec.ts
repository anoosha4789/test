import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';

import { PanelDefaultService } from './panel-default.service';

fdescribe('PanelDefaultService', () => {
  let service: PanelDefaultService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [provideMockStore({})]
    });
    service = TestBed.inject(PanelDefaultService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
