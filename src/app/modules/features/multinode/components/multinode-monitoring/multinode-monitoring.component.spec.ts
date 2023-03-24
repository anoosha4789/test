import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterTestingModule } from '@angular/router/testing';
import { MultiNodelocalstorageService } from '@features/multinode/services/multi-nodelocalstorage.service';
import { MultinodeFooterService } from '@features/multinode/services/multinode-footer.service';
import { provideMockStore } from '@ngrx/store/testing';
import { GwTruncatePipe } from '@shared/gateway-pipes/pipes/gw-truncate.pipe';
import { PaginatePipe, PaginationControlsComponent, PaginationControlsDirective, PaginationService } from 'ngx-pagination';

import { MultinodeMonitoringComponent } from './multinode-monitoring.component';

fdescribe('MultinodeMonitoringComponent', () => {
  let component: MultinodeMonitoringComponent;
  let fixture: ComponentFixture<MultinodeMonitoringComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MultinodeMonitoringComponent,GwTruncatePipe,PaginatePipe,PaginationControlsDirective ],
      schemas:[CUSTOM_ELEMENTS_SCHEMA],
      imports:[MatTooltipModule,MatDialogModule,RouterTestingModule,HttpClientTestingModule],
      providers:[PaginationService,MultinodeFooterService,MultiNodelocalstorageService,
      provideMockStore({})]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultinodeMonitoringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
