import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';

import { SurefloDatapointDialogComponent } from './sureflo-datapoint-dialog.component';

fdescribe('SurefloDatapointDialogComponent', () => {
  let component: SurefloDatapointDialogComponent;
  let fixture: ComponentFixture<SurefloDatapointDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SurefloDatapointDialogComponent ],
      schemas:[CUSTOM_ELEMENTS_SCHEMA],
      imports:[MatRadioModule,FormsModule,ReactiveFormsModule],
      providers:[{ provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} },]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SurefloDatapointDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
