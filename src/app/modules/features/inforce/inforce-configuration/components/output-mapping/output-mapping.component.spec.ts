import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OutputMappingComponent } from './output-mapping.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { ValidationService } from '@core/services/validation.service';
import { provideMockStore } from '@ngrx/store/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
fdescribe('OutputMappingComponent', () => {
  let component: OutputMappingComponent;
  let fixture: ComponentFixture<OutputMappingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OutputMappingComponent ],
      imports: [  MatTableModule,MatDialogModule,ReactiveFormsModule,HttpClientTestingModule,RouterTestingModule],//HttpClientTestingModule,RouterTestingModule,MatTooltipModule,MatExpansionModule,BrowserAnimationsModule  ],//ReactiveFormsModule, HttpClientModule, RouterTestingModule,
      providers: [{ provide: MAT_DIALOG_DATA, useValue: {} }, { provide: MatDialogRef, useValue:  {} }, provideMockStore({}),ValidationService],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutputMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
