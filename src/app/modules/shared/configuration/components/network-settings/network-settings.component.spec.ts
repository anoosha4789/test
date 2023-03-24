import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockStore } from '@ngrx/store/testing';

import { NetworkSettingsComponent } from './network-settings.component';

fdescribe('NetworkSettingsComponent', () => {
  let component: NetworkSettingsComponent;
  let fixture: ComponentFixture<NetworkSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NetworkSettingsComponent ],
      schemas:[CUSTOM_ELEMENTS_SCHEMA],
      imports:[ReactiveFormsModule,MatDialogModule,HttpClientTestingModule,RouterTestingModule],
      providers:[provideMockStore({})]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NetworkSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
