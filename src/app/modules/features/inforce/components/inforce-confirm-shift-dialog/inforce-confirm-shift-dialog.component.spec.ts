import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InforceConfirmShiftDialogComponent } from './inforce-confirm-shift-dialog.component';
import { MatTableModule } from '@angular/material/table';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { provideMockStore } from '@ngrx/store/testing';
import { RouterTestingModule } from "@angular/router/testing";

fdescribe('InforceConfirmShiftDialogComponent', () => {
  let component: InforceConfirmShiftDialogComponent;
  let fixture: ComponentFixture<InforceConfirmShiftDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InforceConfirmShiftDialogComponent ],
      imports: [  MatTableModule,MatDialogModule,HttpClientTestingModule,RouterTestingModule  ],//ReactiveFormsModule, HttpClientModule, RouterTestingModule,
      providers: [{ provide: MAT_DIALOG_DATA, useValue: {} }, { provide: MatDialogRef, useValue:  {} }, provideMockStore({})],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InforceConfirmShiftDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
