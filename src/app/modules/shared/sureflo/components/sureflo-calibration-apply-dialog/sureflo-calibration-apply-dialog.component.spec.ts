import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { SurefloCalibrationApplyDialogComponent } from './sureflo-calibration-apply-dialog.component';

fdescribe('SurefloCalibrationApplyDialogComponent', () => {
  let component: SurefloCalibrationApplyDialogComponent;
  let fixture: ComponentFixture<SurefloCalibrationApplyDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SurefloCalibrationApplyDialogComponent ],
      schemas:[CUSTOM_ELEMENTS_SCHEMA],
      providers:[{ provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} },]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SurefloCalibrationApplyDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
