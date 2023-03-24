import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SuresensMonitoringCardComponent } from './suresens-monitoring-card.component';

describe('SuresensMonitoringCardComponent', () => {
  let component: SuresensMonitoringCardComponent;
  let fixture: ComponentFixture<SuresensMonitoringCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SuresensMonitoringCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SuresensMonitoringCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
