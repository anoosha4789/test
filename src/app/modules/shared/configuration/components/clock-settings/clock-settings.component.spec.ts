import { DatePipe } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockStore } from '@ngrx/store/testing';

import { ClockSettingsComponent } from './clock-settings.component';

fdescribe('ClockSettingsComponent', () => {
  let component: ClockSettingsComponent;
  let fixture: ComponentFixture<ClockSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClockSettingsComponent ],
      schemas:[CUSTOM_ELEMENTS_SCHEMA],
      imports:[RouterTestingModule,MatDialogModule,HttpClientTestingModule],
      providers:[DatePipe,provideMockStore({})]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClockSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
