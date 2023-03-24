import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { ValidationService } from '@core/services/validation.service';
import { IgxTooltipModule } from '@infragistics/igniteui-angular';
import { provideMockStore } from '@ngrx/store/testing';

import { WellDetailsComponent } from './well-details.component';

fdescribe('WellDetailsComponent', () => {
  let component: WellDetailsComponent;
  let fixture: ComponentFixture<WellDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WellDetailsComponent ],
      schemas:[CUSTOM_ELEMENTS_SCHEMA],
      imports:[MatSelectModule,FormsModule,ReactiveFormsModule,MatTooltipModule,IgxTooltipModule,
        RouterTestingModule,MatDialogModule,BrowserAnimationsModule,MatFormFieldModule,MatInputModule],
      providers:[provideMockStore({}),ValidationService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WellDetailsComponent);
    component = fixture.componentInstance;
    component.wellSchema ={
      "definitions": {
          "BaseToolDataModel": {
              "type": [
                  "object",
                  "null"
              ],
              "properties": {
                  "ToolId": {
                      "type": "integer"
                  },
                  "ToolType": {
                      "type": "integer",
                      "enum": [
                          0,
                          1,
                          2
                      ]
                  }
              },
              "required": [
                  "ToolId",
                  "ToolType"
              ]
          },
          "BaseZoneDataModel": {
              "type": [
                  "object",
                  "null"
              ],
              "properties": {
                  "ZoneId": {
                      "type": "integer"
                  },
                  "ZoneName": {
                      "type": "string",
                      "minLength": 0,
                      "maxLength": 50,
                      "pattern": "^[A-Za-z0-9-_#]+[A-Za-z0-9-_# ]*$"
                  },
                  "MeasuredDepth": {
                      "type": "number",
                      "minimum": 1,
                      "maximum": 3.4028234663852886e+38
                  },
                  "ZoneType": {
                      "type": "integer",
                      "enum": [
                          1,
                          2
                      ]
                  },
                  "Tools": {
                      "type": [
                          "array",
                          "null"
                      ],
                      "items": {
                          "$ref": "#/definitions/BaseToolDataModel"
                      }
                  },
                  "ZoneDeviceId": {
                      "type": "integer"
                  }
              },
              "required": [
                  "ZoneId",
                  "ZoneName",
                  "MeasuredDepth",
                  "ZoneType",
                  "Tools",
                  "ZoneDeviceId"
              ]
          }
      },
      "type": "object",
      "properties": {
          "Zones": {
              "type": "array",
              "items": {
                  "$ref": "#/definitions/BaseZoneDataModel"
              }
          },
          "WellId": {
              "type": "integer"
          },
          "WellName": {
              "type": "string",
              "minLength": 0,
              "maxLength": 50,
              "pattern": "^[A-Za-z0-9-_#]+[A-Za-z0-9-_# ]*$"
          },
          "WellType": {
              "type": "integer",
              "enum": [
                  1,
                  2,
                  3
              ]
          },
          "WellDeviceId": {
              "type": "integer"
          }
      },
      "required": [
          "WellId",
          "WellName",
          "WellType",
          "WellDeviceId"
      ]
  };
    component.well ={
      "ShiftDefaultId" :1,
      "UserParentShiftDefault":true,
      "WellId": -1,
      "WellName": "Well 1",
      "currentWellName": "Well 1",
      "WellType": 1,
      "Zones": [
          {
              "ZoneId": -1,
              "ZoneName": "Zone 1",
              "ZoneTypeEnum": 1,
              "ZoneDeviceId": -1,
              "Tools": [],
              "MeasuredDepth": 98
          }
      ],
      "WellDeviceId": -1,
      "IsValid": true,
      "IsDirty": true,
      "Error": null
  };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
