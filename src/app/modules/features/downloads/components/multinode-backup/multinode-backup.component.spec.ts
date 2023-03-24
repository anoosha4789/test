import { DatePipe } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { RouterTestingModule } from '@angular/router/testing';
import { ValidationService } from '@core/services/validation.service';
import { provideMockStore } from '@ngrx/store/testing';

import { MultinodeBackupComponent } from './multinode-backup.component';

fdescribe('MultinodeBackupComponent', () => {
  let component: MultinodeBackupComponent;
  let fixture: ComponentFixture<MultinodeBackupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ MatFormFieldModule, HttpClientTestingModule, ReactiveFormsModule, RouterTestingModule ],
      declarations: [ MultinodeBackupComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [DatePipe, provideMockStore({}), ValidationService],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultinodeBackupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
