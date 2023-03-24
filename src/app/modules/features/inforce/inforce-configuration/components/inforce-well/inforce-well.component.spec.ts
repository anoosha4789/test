import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InforceWellComponent } from './inforce-well.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { GwTruncatePipe } from '@shared/gateway-pipes/pipes/gw-truncate.pipe';
import { MatTooltipModule } from '@angular/material/tooltip';
import { GwValveTypeNamePipe } from '@shared/gateway-pipes/pipes/gw-valve-type-name.pipe';
import { IgxTooltipModule } from '@infragistics/igniteui-angular';
import { ValidationService } from '@core/services/validation.service';

fdescribe('InforceWellComponent', () => {
  let component: InforceWellComponent;
  let fixture: ComponentFixture<InforceWellComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InforceWellComponent,GwTruncatePipe,GwValveTypeNamePipe ],
      imports: [ IgxTooltipModule, MatTableModule,MatDialogModule,HttpClientTestingModule,RouterTestingModule ,ReactiveFormsModule,MatTooltipModule ],
      providers: [{ provide: MAT_DIALOG_DATA, useValue: {} }, { provide: MatDialogRef, useValue:  {} }, provideMockStore({}),ValidationService],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InforceWellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
