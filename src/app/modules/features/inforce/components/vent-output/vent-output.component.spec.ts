import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VentOutputComponent } from './vent-output.component';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { GwMinuteSecondsPipe } from '@shared/gateway-pipes/pipes/gw-minute-seconds.pipe';
import { MatTooltipModule } from '@angular/material/tooltip';


fdescribe('VentOutputComponent', () => {
  let component: VentOutputComponent;
  let fixture: ComponentFixture<VentOutputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VentOutputComponent,GwMinuteSecondsPipe ],
      imports: [ MatTableModule,MatDialogModule, HttpClientTestingModule,RouterTestingModule,MatTooltipModule],
      providers: [{ provide: MAT_DIALOG_DATA, useValue: {} }, { provide: MatDialogRef, useValue:  {} },provideMockStore({})],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VentOutputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
