import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { DownloadConfirmDialogComponent } from './download-confirm-dialog.component';

fdescribe('DownloadConfirmDialogComponent', () => {
  let component: DownloadConfirmDialogComponent;
  let fixture: ComponentFixture<DownloadConfirmDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DownloadConfirmDialogComponent ],
      imports:[MatDialogModule],
      providers: [
        { provide: MatDialogRef, useValue: {} }],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DownloadConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
