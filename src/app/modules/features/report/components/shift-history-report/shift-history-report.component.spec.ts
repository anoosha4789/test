import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShiftHistoryReportComponent } from './shift-history-report.component';

describe('ShiftHistoryReportComponent', () => {
  let component: ShiftHistoryReportComponent;
  let fixture: ComponentFixture<ShiftHistoryReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShiftHistoryReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShiftHistoryReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
