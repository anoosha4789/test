import { UtilityService } from '@core/services/utility.service';
import { GwToolStatusPipe } from './gw-tool-status.pipe';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { provideMockStore } from '@ngrx/store/testing';

fdescribe('GwToolStatusPipe', () => {
  let service: UtilityService;

  beforeEach(() => {
    TestBed.configureTestingModule(
      { providers: [UtilityService,provideMockStore({})],
      imports:[HttpClientTestingModule] },
     );
    service = TestBed.inject(UtilityService);
  });

  it('create an instance', () => {
    const pipe = new GwToolStatusPipe(service);
    expect(pipe).toBeTruthy();
  });
});
