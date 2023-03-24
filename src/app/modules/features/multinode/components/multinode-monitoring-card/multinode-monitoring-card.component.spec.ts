import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { GwToolStatusPipe } from '@shared/gateway-pipes/pipes/gw-tool-status.pipe';
import { GwTruncatePipe } from '@shared/gateway-pipes/pipes/gw-truncate.pipe';
import { PaginatePipe, PaginationService } from 'ngx-pagination';

import { MultinodeMonitoringCardComponent } from './multinode-monitoring-card.component';

fdescribe('MultinodeMonitoringCardComponent', () => {
  let component: MultinodeMonitoringCardComponent;
  let fixture: ComponentFixture<MultinodeMonitoringCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MultinodeMonitoringCardComponent,PaginatePipe,GwTruncatePipe,GwToolStatusPipe],
      schemas:[CUSTOM_ELEMENTS_SCHEMA],
      imports:[MatTooltipModule,RouterTestingModule,HttpClientTestingModule],
      providers:[provideMockStore({}),PaginationService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultinodeMonitoringCardComponent);
    component = fixture.componentInstance;
    component.config ={
      "id": "gw-multinode-pagination",
      "itemsPerPage": 1,
      "currentPage": 1,
      "totalItems": 1
  };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
