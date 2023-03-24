import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ValidationService } from '@core/services/validation.service';

import { BackupContentComponent } from './backup-content.component';

fdescribe('BackupContentComponent', () => {
  let component: BackupContentComponent;
  let fixture: ComponentFixture<BackupContentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ MatFormFieldModule, HttpClientTestingModule, ReactiveFormsModule ],
      declarations: [ BackupContentComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [ValidationService],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BackupContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
