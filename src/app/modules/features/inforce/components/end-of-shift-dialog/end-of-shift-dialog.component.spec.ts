import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { EndOfShiftDialogComponent } from './end-of-shift-dialog.component';
  import { MatTableModule } from '@angular/material/table';
  import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
  import { HttpClientTestingModule } from '@angular/common/http/testing';
  import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
fdescribe('EndOfShiftDialogComponent', () => {
  let component: EndOfShiftDialogComponent;
  let fixture: ComponentFixture<EndOfShiftDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EndOfShiftDialogComponent ],
      imports: [  MatTableModule,MatDialogModule,HttpClientTestingModule  ],//ReactiveFormsModule, HttpClientModule, RouterTestingModule,
      providers: [{ provide: MAT_DIALOG_DATA, useValue: {} }, { provide: MatDialogRef, useValue:  {} }, provideMockStore({})],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EndOfShiftDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
