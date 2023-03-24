import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InforceValvePositionComponent } from './inforce-valve-position.component';
import { MatTableModule } from '@angular/material/table';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { GwInforceShiftPipe } from '@features/inforce/pipes/gw-inforce-shift.pipe';
import { GwToolStatusPipe } from '@shared/gateway-pipes/pipes/gw-tool-status.pipe';
import { MatTooltipModule } from '@angular/material/tooltip';
import { GwTruncatePipe } from '@shared/gateway-pipes/pipes/gw-truncate.pipe';
import { MatAccordion, MatExpansionModule, MAT_ACCORDION } from '@angular/material/expansion';
import { provideMockStore } from '@ngrx/store/testing';
fdescribe('InforceValvePositionComponent', () => {
  let component: InforceValvePositionComponent;
  let fixture: ComponentFixture<InforceValvePositionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InforceValvePositionComponent,GwInforceShiftPipe, GwToolStatusPipe,GwTruncatePipe ],
      imports: [  MatTableModule,MatDialogModule,HttpClientTestingModule,RouterTestingModule,MatTooltipModule,MatExpansionModule  ],//ReactiveFormsModule, HttpClientModule, RouterTestingModule,
      providers: [{ provide: MAT_DIALOG_DATA, useValue: {} }, { provide: MatDialogRef, useValue:  {} },provideMockStore({})],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InforceValvePositionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
