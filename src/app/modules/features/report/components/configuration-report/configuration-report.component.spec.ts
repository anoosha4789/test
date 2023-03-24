import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigurationReportComponent } from './configuration-report.component';

describe('ConfigurationReportComponent', () => {
  let component: ConfigurationReportComponent;
  let fixture: ComponentFixture<ConfigurationReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfigurationReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigurationReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
