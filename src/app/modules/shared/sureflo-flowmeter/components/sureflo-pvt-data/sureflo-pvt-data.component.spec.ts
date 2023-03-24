import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SurefloPvtDataComponent } from './sureflo-pvt-data.component';

describe('SurefloPvtDataComponent', () => {
  let component: SurefloPvtDataComponent;
  let fixture: ComponentFixture<SurefloPvtDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SurefloPvtDataComponent ],
      schemas:[CUSTOM_ELEMENTS_SCHEMA],
      providers:[FormsModule,ReactiveFormsModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SurefloPvtDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
