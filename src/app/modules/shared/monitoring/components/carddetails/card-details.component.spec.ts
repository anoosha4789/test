import { DatePipe } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { GwToolStatusPipe } from '@shared/gateway-pipes/pipes/gw-tool-status.pipe';
import { GwTruncatePipe } from '@shared/gateway-pipes/pipes/gw-truncate.pipe';
import { SwampyFilterPipe } from '@shared/monitoring/pipes/swampyCard.filter';

import { CardDetailsComponent } from './card-details.component';

fdescribe('CardDetailsComponent', () => {
  let component: CardDetailsComponent;
  let fixture: ComponentFixture<CardDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CardDetailsComponent,SwampyFilterPipe,GwToolStatusPipe],
      schemas:[CUSTOM_ELEMENTS_SCHEMA],
      imports:[RouterTestingModule,HttpClientTestingModule,MatDialogModule],
      providers:[provideMockStore({}),DatePipe,GwTruncatePipe]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CardDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
