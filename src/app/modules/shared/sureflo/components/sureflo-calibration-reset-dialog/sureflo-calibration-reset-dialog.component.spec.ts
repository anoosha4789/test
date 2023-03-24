import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { SurefloCalibrationResetDialogComponent } from './sureflo-calibration-reset-dialog.component';

fdescribe('SurefloCalibrationResetDialogComponent', () => {
  let component: SurefloCalibrationResetDialogComponent;
  let fixture: ComponentFixture<SurefloCalibrationResetDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SurefloCalibrationResetDialogComponent ],
      schemas:[CUSTOM_ELEMENTS_SCHEMA],
      providers:[{ provide: MatDialogRef, useValue: {} }]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SurefloCalibrationResetDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
