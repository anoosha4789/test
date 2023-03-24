import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SurefloWaterPvtDataComponent } from './sureflo-water-pvt-data.component';

describe('SurefloWaterPvtDataComponent', () => {
  let component: SurefloWaterPvtDataComponent;
  let fixture: ComponentFixture<SurefloWaterPvtDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SurefloWaterPvtDataComponent ],
      schemas:[CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SurefloWaterPvtDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
