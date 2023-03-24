import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MonitoringWellComponent } from './monitoring-well.component';

describe('MonitoringWellComponent', () => {
  let component: MonitoringWellComponent;
  let fixture: ComponentFixture<MonitoringWellComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MonitoringWellComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MonitoringWellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
