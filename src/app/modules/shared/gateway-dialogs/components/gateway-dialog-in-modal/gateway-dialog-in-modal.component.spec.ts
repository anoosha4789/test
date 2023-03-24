import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';

import { GatewayDialogInModalComponent } from './gateway-dialog-in-modal.component';

xdescribe('GatewayDialogInModalComponent', () => {
  let component: GatewayDialogInModalComponent;
  let fixture: ComponentFixture<GatewayDialogInModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GatewayDialogInModalComponent ],
      providers: [
        { provide: MatDialogRef, useValue: {} },]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GatewayDialogInModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
