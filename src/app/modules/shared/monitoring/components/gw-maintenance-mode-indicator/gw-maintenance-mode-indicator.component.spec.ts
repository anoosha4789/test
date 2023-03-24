import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';

import { GwMaintenanceModeIndicatorComponent } from './gw-maintenance-mode-indicator.component';

fdescribe('GwMaintenanceModeIndicatorComponent', () => {
  let component: GwMaintenanceModeIndicatorComponent;
  let fixture: ComponentFixture<GwMaintenanceModeIndicatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GwMaintenanceModeIndicatorComponent ],
      providers:[provideMockStore({})]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GwMaintenanceModeIndicatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
