import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InChargeMonitoringComponent } from './incharge-monitoring.component';

describe('InChargeMonitoringComponent', () => {
  let component: InChargeMonitoringComponent;
  let fixture: ComponentFixture<InChargeMonitoringComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InChargeMonitoringComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InChargeMonitoringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
