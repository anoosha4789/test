import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterTestingModule } from '@angular/router/testing';
import { ValidationService } from '@core/services/validation.service';
import { provideMockStore } from '@ngrx/store/testing';

import { MultinodeSieComponent } from './multinode-sie.component';

fdescribe('MultinodeSieComponent', () => {
  let component: MultinodeSieComponent;
  let fixture: ComponentFixture<MultinodeSieComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MultinodeSieComponent ],
      imports:[ReactiveFormsModule,FormsModule,MatTooltipModule,RouterTestingModule,HttpClientTestingModule],
      schemas:[CUSTOM_ELEMENTS_SCHEMA],
      providers:[provideMockStore({}),ValidationService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultinodeSieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
