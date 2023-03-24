import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { provideMockStore } from '@ngrx/store/testing';

import { ConfirmActuationComponent } from './confirm-actuation.component';

fdescribe('ConfirmActuationComponent', () => {
  let component: ConfirmActuationComponent;
  let fixture: ComponentFixture<ConfirmActuationComponent>;
  let data ={
    actuateZone:{
      isPositionValid :true,
    }
  }

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmActuationComponent ],
      schemas:[CUSTOM_ELEMENTS_SCHEMA],
      providers:[provideMockStore({}),
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: data },
      ],
      imports:[HttpClientTestingModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmActuationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
