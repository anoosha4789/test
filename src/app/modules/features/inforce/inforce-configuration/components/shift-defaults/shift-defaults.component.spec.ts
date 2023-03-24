import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShiftDefaultsComponent } from './shift-defaults.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ValidationService } from '@core/services/validation.service';
import { provideMockStore } from '@ngrx/store/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';

fdescribe('ShiftDefaultsComponent', () => {
  let component: ShiftDefaultsComponent;
  let fixture: ComponentFixture<ShiftDefaultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShiftDefaultsComponent ],
      imports: [  HttpClientTestingModule,RouterTestingModule],//HttpClientTestingModule,RouterTestingModule,MatTooltipModule,MatExpansionModule,BrowserAnimationsModule  ],//ReactiveFormsModule, HttpClientModule, RouterTestingModule,
      providers: [{ provide: MAT_DIALOG_DATA, useValue: {} }, { provide: MatDialogRef, useValue:  {} }, provideMockStore({}),ValidationService],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShiftDefaultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
