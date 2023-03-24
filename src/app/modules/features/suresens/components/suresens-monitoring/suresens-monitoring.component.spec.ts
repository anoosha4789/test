import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SuresensMonitoringComponent } from './suresens-monitoring.component';

describe('SuresensMonitoringComponent', () => {
  let component: SuresensMonitoringComponent;
  let fixture: ComponentFixture<SuresensMonitoringComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SuresensMonitoringComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SuresensMonitoringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
