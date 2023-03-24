import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';

import { GwNotifierDialogComponent } from './gw-notifier-dialog.component';

fdescribe('GwNotifierDialogComponent', () => {
  let component: GwNotifierDialogComponent;
  let fixture: ComponentFixture<GwNotifierDialogComponent>;
  let data =[
    {
        "path": "/multinode/general",
        "tabName": "General",
        "errors": [
            {
                "name": "SerialNumber",
                "value": "Serial Number : Required field."
            }
        ]
    }
]

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GwNotifierDialogComponent ],
      schemas:[CUSTOM_ELEMENTS_SCHEMA],
      imports:[RouterTestingModule],
      providers:[{ provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: data },]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GwNotifierDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
