import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { SetServerValueComponent } from './setservervalue.component';

fdescribe('SetServerValueComponent', () => {
  let component: SetServerValueComponent;
  let fixture: ComponentFixture<SetServerValueComponent>;
  let data = {
    "fieldName": "Setpoint",
    "precision": 1,
    "device": {
        "DeviceId": 2,
        "DataPointIndex": 82,
        "UnitQuantityType": "",
        "UnitSymbol": " gal",
        "TagName": "TankVolumeInLiter",
        "DataType": 9,
        "ReadOnly": false,
        "Precision": 0,
        "RawValue": 10.6
    },
    "min": 0.1,
    "multiplicationFactor": 3.78541
}
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SetServerValueComponent ],
      schemas:[CUSTOM_ELEMENTS_SCHEMA],
      imports:[FormsModule,ReactiveFormsModule,HttpClientTestingModule],
      providers:[{ provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: data },]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetServerValueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
