import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { provideMockStore } from '@ngrx/store/testing';
import { GwTruncatePipe } from '@shared/gateway-pipes/pipes/gw-truncate.pipe';

import { ViewActuationDialogComponent } from './view-actuation-dialog.component';

fdescribe('ViewActuationDialogComponent', () => {
  let component: ViewActuationDialogComponent;
  let fixture: ComponentFixture<ViewActuationDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewActuationDialogComponent ,GwTruncatePipe],
      schemas:[CUSTOM_ELEMENTS_SCHEMA],
      imports:[MatTooltipModule,MatDialogModule,HttpClientTestingModule],
      providers:[provideMockStore({}),{ provide: MatDialogRef, useValue: {} },{ provide: MAT_DIALOG_DATA, useValue: {} },]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewActuationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
