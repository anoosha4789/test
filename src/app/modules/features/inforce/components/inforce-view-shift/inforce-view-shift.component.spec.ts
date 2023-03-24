import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InforceViewShiftComponent } from './inforce-view-shift.component';
import { MatTableModule } from '@angular/material/table';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { GwMinuteSecondsPipe } from '@shared/gateway-pipes/pipes/gw-minute-seconds.pipe';
import { GwGaugeLabelFormatterPipe } from '@shared/gateway-pipes/pipes/gw-gauge-label-formatter.pipe';
import { GwInforceShiftPipe } from '@features/inforce/pipes/gw-inforce-shift.pipe';
import { provideMockStore } from '@ngrx/store/testing';
import { InforceMonitoringService } from '@features/inforce/services/inforce-monitoring.service';

fdescribe('InforceViewShiftComponent', () => {
  let component: InforceViewShiftComponent;
  let fixture: ComponentFixture<InforceViewShiftComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InforceViewShiftComponent,GwMinuteSecondsPipe, GwGaugeLabelFormatterPipe,GwInforceShiftPipe ],
      imports: [  MatTableModule,MatDialogModule,HttpClientTestingModule,RouterTestingModule  ],//ReactiveFormsModule, HttpClientModule, RouterTestingModule,
      providers: [{ provide: MAT_DIALOG_DATA, useValue: {} }, { provide: MatDialogRef, useValue:  {} },provideMockStore({}),InforceMonitoringService],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InforceViewShiftComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
