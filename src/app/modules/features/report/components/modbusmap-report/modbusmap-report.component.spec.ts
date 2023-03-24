import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModbusmapReportComponent } from './modbusmap-report.component';

describe('ModbusmapReportComponent', () => {
  let component: ModbusmapReportComponent;
  let fixture: ComponentFixture<ModbusmapReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModbusmapReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModbusmapReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
