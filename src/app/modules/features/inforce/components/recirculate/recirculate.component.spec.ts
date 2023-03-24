import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecirculateComponent } from './recirculate.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GwMinuteSecondsPipe } from '@shared/gateway-pipes/pipes/gw-minute-seconds.pipe';
fdescribe('RecirculateComponent', () => {
  let component: RecirculateComponent;
  let fixture: ComponentFixture<RecirculateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecirculateComponent,GwMinuteSecondsPipe ],
      imports: [  MatTableModule,MatDialogModule,HttpClientTestingModule, RouterTestingModule],//ReactiveFormsModule, HttpClientModule, RouterTestingModule,
      providers: [{ provide: MAT_DIALOG_DATA, useValue: {} }, { provide: MatDialogRef, useValue:  {} },provideMockStore({})],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecirculateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
