import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HistorianDatapointsDialogComponent } from './historian-datapoints-dialog.component';

describe('HistorianDatapointsDialogComponent', () => {
  let component: HistorianDatapointsDialogComponent;
  let fixture: ComponentFixture<HistorianDatapointsDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HistorianDatapointsDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HistorianDatapointsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
