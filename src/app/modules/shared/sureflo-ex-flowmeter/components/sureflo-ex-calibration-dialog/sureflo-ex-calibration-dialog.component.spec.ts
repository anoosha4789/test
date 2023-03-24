import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { SurefloExCalibrationDialogComponent } from './sureflo-ex-calibration-dialog.component';

fdescribe('SurefloExCalibrationDialogComponent', () => {
  let component: SurefloExCalibrationDialogComponent;
  let fixture: ComponentFixture<SurefloExCalibrationDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SurefloExCalibrationDialogComponent ],
      schemas:[CUSTOM_ELEMENTS_SCHEMA],
      imports:[MatDialogModule,HttpClientTestingModule],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} },
          ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SurefloExCalibrationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
