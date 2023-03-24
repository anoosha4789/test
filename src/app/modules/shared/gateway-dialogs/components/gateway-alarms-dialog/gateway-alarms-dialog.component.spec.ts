import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { provideMockStore } from '@ngrx/store/testing';
import { SatPopoverModule } from '@ncstate/sat-popover';

import { GatewayAlarmsDialogComponent } from './gateway-alarms-dialog.component';
import { RouterTestingModule } from '@angular/router/testing';

fdescribe('GatewayAlarmsDialogComponent', () => {
  let component: GatewayAlarmsDialogComponent;
  let fixture: ComponentFixture<GatewayAlarmsDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GatewayAlarmsDialogComponent ],
      imports:[HttpClientTestingModule, SatPopoverModule, RouterTestingModule],
      schemas:[CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: MatDialogRef, useValue: {} },provideMockStore({})]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GatewayAlarmsDialogComponent);
    component = fixture.componentInstance;
    fixture.componentInstance.ngOnInit();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
