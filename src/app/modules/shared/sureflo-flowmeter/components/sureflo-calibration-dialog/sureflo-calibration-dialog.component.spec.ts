import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { SurefloCalibrationDialogComponent } from './sureflo-calibration-dialog.component';

fdescribe('SurefloCalibrationDialogComponent', () => {
  let component: SurefloCalibrationDialogComponent;
  let fixture: ComponentFixture<SurefloCalibrationDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SurefloCalibrationDialogComponent ],
      schemas:[CUSTOM_ELEMENTS_SCHEMA],
      imports:[MatDialogModule,HttpClientModule],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} },
          ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SurefloCalibrationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
