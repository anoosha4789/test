import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockStore } from '@ngrx/store/testing';

import { LoggerDataPointsDialogComponent } from './logger-data-points-dialog.component';

fdescribe('LoggerDataPointsDialogComponent', () => {
  let component: LoggerDataPointsDialogComponent;
  let fixture: ComponentFixture<LoggerDataPointsDialogComponent>;
  let data = {
    "dataLogger": {
        "Id": -1,
        "DataLoggerType": 4,
        "IsDeleted": 0,
        "Name": "dsfsdfsd",
        "ScanRate": 1,
        "WellId": -1,
        "customDataLoggerDataPoints": []
    }
};

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoggerDataPointsDialogComponent ],
      schemas:[CUSTOM_ELEMENTS_SCHEMA],
      imports:[RouterTestingModule],
      providers:[provideMockStore({}),
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: data },
      ],
      
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoggerDataPointsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
