import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { provideMockStore } from '@ngrx/store/testing';

import { ConfigurationResetDialogComponent } from './configuration-reset-dialog.component';

fdescribe('ConfigurationResetDialogComponent', () => {
  let component: ConfigurationResetDialogComponent;
  let fixture: ComponentFixture<ConfigurationResetDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfigurationResetDialogComponent ],
      imports:[MatDialogModule,HttpClientTestingModule],
      providers: [ provideMockStore({}),
        { provide: MatDialogRef, useValue: {} }],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigurationResetDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
