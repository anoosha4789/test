import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { ValidationService } from '@core/services/validation.service';
import { provideMockStore } from '@ngrx/store/testing';

import { MultinodeManualModeComponent } from './multinode-manual-mode.component';

fdescribe('MultinodeManualModeComponent', () => {
  let component: MultinodeManualModeComponent;
  let fixture: ComponentFixture<MultinodeManualModeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MultinodeManualModeComponent ],
      schemas:[CUSTOM_ELEMENTS_SCHEMA],
      imports:[ReactiveFormsModule,
        MatFormFieldModule,MatRadioModule,MatInputModule,BrowserAnimationsModule,
        MatSelectModule,FormsModule,RouterTestingModule,HttpClientTestingModule],
      providers:[provideMockStore({}),ValidationService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultinodeManualModeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
