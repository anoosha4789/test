import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModbusmapDialogComponent } from './modbusmap-dialog.component';

describe('ModbusmapDialogComponent', () => {
  let component: ModbusmapDialogComponent;
  let fixture: ComponentFixture<ModbusmapDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModbusmapDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModbusmapDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
