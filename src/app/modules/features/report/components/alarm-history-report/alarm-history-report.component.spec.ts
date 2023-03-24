import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AlarmHistoryReportComponent } from './alarm-history-report.component';

describe('AlarmHistoryReportComponent', () => {
  let component: AlarmHistoryReportComponent;
  let fixture: ComponentFixture<AlarmHistoryReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AlarmHistoryReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlarmHistoryReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
