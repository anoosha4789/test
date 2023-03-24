import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { ValidationService } from '@core/services/validation.service';
import { provideMockStore } from '@ngrx/store/testing';

import { AddEditDataLoggerDialogComponent } from './add-edit-data-logger-dialog.component';

fdescribe('AddEditDataLoggerDialogComponent', () => {
  let component: AddEditDataLoggerDialogComponent;
  let fixture: ComponentFixture<AddEditDataLoggerDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddEditDataLoggerDialogComponent ],
      schemas:[CUSTOM_ELEMENTS_SCHEMA],
      imports:[ReactiveFormsModule,RouterTestingModule,MatDialogModule,MatRadioModule,MatSelectModule,BrowserAnimationsModule,MatFormFieldModule,MatInputModule],
      providers:[provideMockStore({}),{ provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} },ValidationService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditDataLoggerDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
