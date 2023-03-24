import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ValidationService } from '@core/services/validation.service';
import { provideMockStore } from '@ngrx/store/testing';

import { ZoneDialogComponent } from './zone-dialog.component';

fdescribe('ZoneDialogComponent', () => {
  let component: ZoneDialogComponent;
  let fixture: ComponentFixture<ZoneDialogComponent>;
  let data = {
    "zones": [],
    "selectedZone": {
        "ZoneId": -1,
        "ZoneName": "Zone 1",
        "ZoneTypeEnum": 1,
        "ZoneDeviceId": -1,
        "Tools": [],
        "MeasuredDepth": null
    },
    "modalEditMode": false
};

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ZoneDialogComponent ],
      schemas:[CUSTOM_ELEMENTS_SCHEMA],
      imports:[FormsModule,ReactiveFormsModule,MatTooltipModule,MatInputModule,MatFormFieldModule,BrowserAnimationsModule],
      providers:[{ provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: data },provideMockStore({}),ValidationService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ZoneDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
