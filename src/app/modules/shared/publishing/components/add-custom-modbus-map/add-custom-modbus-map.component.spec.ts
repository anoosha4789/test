import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ValidationService } from '@core/services/validation.service';
import { provideMockStore } from '@ngrx/store/testing';

import { AddCustomModbusMapComponent } from './add-custom-modbus-map.component';

fdescribe('AddCustomModbusMapComponent', () => {
  let component: AddCustomModbusMapComponent;
  let fixture: ComponentFixture<AddCustomModbusMapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddCustomModbusMapComponent ],
      schemas:[CUSTOM_ELEMENTS_SCHEMA],
      imports:[FormsModule,ReactiveFormsModule,MatTooltipModule,MatSelectModule,MatInputModule,BrowserAnimationsModule],
      providers:[provideMockStore({}),{ provide: MatDialogRef, useValue: {} },ValidationService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddCustomModbusMapComponent);
    component = fixture.componentInstance;
    component.mapTemplateForm = new FormGroup({});
    component.mapTemplateForm.addControl('MapName', new FormControl(''));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
