import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReturnsBasedComponent } from './returns-based.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ValidationService } from '@core/services/validation.service';
import { provideMockStore } from '@ngrx/store/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';

fdescribe('ReturnsBasedComponent', () => {
  let component: ReturnsBasedComponent;
  let fixture: ComponentFixture<ReturnsBasedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReturnsBasedComponent ],
      imports: [  ReactiveFormsModule,HttpClientTestingModule,RouterTestingModule],//HttpClientTestingModule,RouterTestingModule,MatTooltipModule,MatExpansionModule,BrowserAnimationsModule  ],//ReactiveFormsModule, HttpClientModule, RouterTestingModule,
      providers: [{ provide: MAT_DIALOG_DATA, useValue: {} }, { provide: MatDialogRef, useValue:  {} }, provideMockStore({}),ValidationService],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReturnsBasedComponent);
    component = fixture.componentInstance;
    setTimeout(() => {
      // component.ngAfterViewInit();
      fixture.detectChanges();
    }, 500);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
