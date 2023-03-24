import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GwAlertComponent } from './gw-alert.component';

fdescribe('GwAlertComponent', () => {
  let component: GwAlertComponent;
  let fixture: ComponentFixture<GwAlertComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GwAlertComponent ],
      schemas:[ CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GwAlertComponent);
    component = fixture.componentInstance;
    component.data = {  Type: "error",
      IconType: "error",
      content: "test",
      cusomClass: false
    }

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
