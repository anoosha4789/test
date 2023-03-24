import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';

import { GatewayDialogComponent, GatewayDialogDataService } from './gateway-dialog.component';

fdescribe('GatewayDialogComponent', () => {
  let component: GatewayDialogComponent;
  let fixture: ComponentFixture<GatewayDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GatewayDialogComponent ],
      providers: [
        { provide: MatDialogRef, useValue: {} },GatewayDialogDataService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GatewayDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
