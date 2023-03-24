import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InforceMonitoringComponent } from './inforce-monitoring.component';
import { MatTableModule } from '@angular/material/table';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { provideMockStore } from '@ngrx/store/testing';
import { RouterTestingModule } from "@angular/router/testing";
import { GwGaugeLabelFormatterPipe } from '@shared/gateway-pipes/pipes/gw-gauge-label-formatter.pipe';
import { InforceMonitoringService } from '@features/inforce/services/inforce-monitoring.service';

fdescribe('InforceMonitoringComponent', () => {
  let component: InforceMonitoringComponent;
  let fixture: ComponentFixture<InforceMonitoringComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InforceMonitoringComponent,GwGaugeLabelFormatterPipe ],
      imports: [  MatTableModule,MatDialogModule,HttpClientTestingModule,RouterTestingModule  ],//ReactiveFormsModule, HttpClientModule, RouterTestingModule,
      providers: [{ provide: MAT_DIALOG_DATA, useValue: {} }, { provide: MatDialogRef, useValue:  {} }, provideMockStore({}),InforceMonitoringService],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InforceMonitoringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(false);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
